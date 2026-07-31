# Migrating to trip-level data

# What this changes

Today the database stores one row per station per day, with four counters on
it. The seeder builds those counters in memory while it reads the CSVs, then
throws the trips away. Every question you can ever ask is fixed at seed time.

After this migration the database stores one row per trip. The counters still
exist, but the loader derives them from the trips. If you want a new view, you
write a new query against the trips and build a new counter table. You do not
re-download 13 years of CSVs to answer a new question.

The site looks the same when this is done. The work is under it.

The plan keeps you on Neon and on Vercel. You add one Postgres extension, one
small library, and about 300 million rows. You remove Redis. Step 1 is a spike
that confirms Neon can carry the load before you build anything on top of it.

# What you will need to learn

First, the thing that trips people up. TimescaleDB is not a second database. It
is a Postgres extension, the same kind of thing as `postgis` or `pgvector`. You
run `CREATE EXTENSION timescaledb;` inside your existing Neon database, and
that database can then use hypertables. One server, one connection string, one
driver. Nothing about your connection code changes.

The list below is the whole curriculum. Every term in this document that is not
already somewhere in your codebase has an entry in the definitions section near
the end.

- **Hypertables and chunks.** The next section teaches both. It is one concept
  and one function call.
- **`COPY`.** This is the bulk load path. Prisma hid it behind `createMany`.
  You need the text format, its escaping rules, and how streaming into it
  interacts with Node backpressure.
- **`timestamptz` against `timestamp`.** You have stored year, month, and day
  as separate integers until now. This is new ground: what the database stores,
  what the driver gives back, and how one hour each fall is ambiguous.
- **`INSERT ... SELECT ... GROUP BY`.** Prisma has no equivalent, so you have
  probably never written one. It is the core of the new loader. It is not hard.
- **Composite primary keys.** A small step from Prisma's `@@unique`.

That is it. You do not learn server administration, because you are not running
a server. If the spike sends you to a rented box instead, read the appendix at
the end, which is a much longer list.

If you switch query layers you learn that too. Prisma costs you nothing new.
Drizzle is a real investment. See the open decision below.

# TimescaleDB in ten minutes

## Hypertables

A hypertable looks like a normal table. You `INSERT` into it and `SELECT` from
it exactly as you do now. Behind it, Postgres splits the rows across many
physical child tables called chunks, divided by time.

You choose the time span of a chunk. This plan uses one month. So all trips
from March 2019 live in one chunk, and all trips from April 2019 live in the
next one.

This buys two things:

- A query with a date filter reads only the chunks in that date range. A query
  for one month does not touch the other 154 months. This is why the loader
  needs almost no indexes.
- Dropping a month is a `DROP TABLE` on one chunk. It is instant. It does not
  scan or delete 2 million rows.

The second point matters most. Citi Bike republishes corrected data. You decided
that a re-ingest of a month deletes that month and reloads it. Month-sized
chunks make that a metadata operation.

You create a hypertable with one line, after the table exists:

```sql
SELECT create_hypertable('trip', by_range('started_at', INTERVAL '1 month'));
```

That is the whole concept. Nothing else about the table changes.

## What TimescaleDB is doing for you here, honestly

On Neon you get the Apache-2 licensed build. That gives you hypertables, chunk
management, and `time_bucket`. It does not give you compression, continuous
aggregates, retention policies, or job automation. Those need the Timescale
License, which Neon does not run.

So on this path TimescaleDB does one job: it creates and manages chunks for you
automatically. Native Postgres partitioning could give you the same shape, but
you would create every monthly partition by hand for 155 months and then keep
creating them forever. The extension is free on Neon and removes that chore.

That is a smaller claim than the title of an earlier draft implied. It is still
worth having, and it is honest.

## Compression, and why you do not get it

TimescaleDB can rewrite an old chunk into a columnar format, which shrinks trip
data by roughly five times. That feature is licensed, and Neon does not offer
it.

Compression only ever saved you disk, and disk on Neon costs $0.35 per GB per
month. So the feature is worth about $10 a month to you. The cost-control
section below covers cheaper ways to get most of that back. If storage ever
becomes the problem, compression is the main reason to move to a rented server,
and the appendix explains that path.

## Continuous aggregates, and why this plan does not use them

A continuous aggregate is a materialized view that refreshes itself
incrementally. When new rows land, TimescaleDB recomputes only the affected
time buckets. People shorten the name to "cagg."

I recommended them in an earlier draft. They are gone, for three reasons.

First, a continuous aggregate must bucket on the hypertable's own time column.
This table partitions on `started_at`. You chose to count arrivals by
`ended_at`. So arrivals could never use one.

Second, a continuous aggregate that joins to the `station` table does not
notice changes to `station`. The Python script assigns boroughs and districts
after stations exist. Those assignments would not propagate.

Third, they are licensed, so Neon cannot run them anyway.

Arrivals needed a plain rollup regardless. So the loader computes every rollup
with ordinary `INSERT ... SELECT ... GROUP BY`. You already know how to read
that. Your data lands once a night, so incremental refresh buys you nothing.

# Where this runs

## Neon, which is where you already are

Keep the app on Vercel and the database on Neon. This removes three problems
that a rented server would create:

- No `pg_hba.conf`, no TLS certificates, no firewall, no memory tuning, and no
  Postgres version upgrades.
- No connection pooling work. Neon pools for you, which matters because Vercel
  runs serverless functions.
- No backups to build. Neon does point-in-time recovery already.

The one open decision about how Vercel reaches the database disappears
completely. So does the one about backups.

## What it costs

Neon Launch is metered with no monthly minimum: $0.35 per GB-month of storage
and $0.106 per compute-hour. Your current 2 GB and few compute hours cost you
somewhere near $1.50 a month.

Trip-level data is about 16 GB of rows. The rollup tables add well under 1 GB.
At 500 page views a month, with a nightly ingest, compute stays small.

So the target is roughly **$7 to $10 a month**, up from about $1.50. The spike
in step 1 replaces that estimate with a measurement.

## Keeping the cost inside reasonable limits

Four levers, in the order you should reach for them.

1. **Set a spending limit on the Neon project.** Do this first, before you load
   anything. It is a hard guardrail against a mistake in a loader that runs for
   days.
2. **Put no indexes on the `trip` table.** This is the big one. Two indexes
   would add about 20 GB, more than doubling your bill. You do not need them.
   The site never reads `trip`, and the loader only ever scans one month at a
   time, which chunk exclusion already handles. Create the hypertable with
   `create_default_indexes => false` and add an index only when a real query
   proves it needs one.
3. **Watch the growth rate.** Citi Bike adds roughly 45 million trips a year,
   which is about 2.5 GB, or about $0.90 a month more each year. That is slow,
   but it does not stop.
4. **If it ever bites, drop old raw trips.** The site reads only the rollup
   tables, and the rollups are tiny and permanent. Raw trips exist so you can
   build new views later. If cost becomes a real problem, drop chunks older
   than some cutoff and keep the CSV archive in object storage. The site does
   not notice. You can reload any year you need.

That last point is worth sitting with. It means the storage bill has a ceiling
you control, and losing raw data is recoverable rather than fatal.

## If Neon does not work out

Two things could still fail in the spike: the backfill could be too slow across
the public internet, or Neon's storage billing could behave badly during a bulk
load. If either happens, the fallback is a rented server, and the appendix at
the end covers it.

Do not build for the fallback now. Measure first.

# Tools you keep, add, and remove

Add:

- TimescaleDB, as an extension inside your existing Neon database.
- `pg-copy-streams`, a small library that streams rows into Postgres with
  `COPY`. This replaces `createMany` in the loader.

Remove:

- Redis, and the `redis` package.
- `app/redis.js`.
- `app/api/revalidate/route.ts`.
- The three `JSONIsValid` cache-validation functions in the API routes.

Keep:

- Neon.
- Vercel.
- `@aws-sdk/client-s3`, already in the project. Backblaze B2 and Cloudflare R2
  both speak the S3 API, so archiving the CSVs needs no new client.
- `scripts/embellishStationData.py`, unchanged.
- `cleanStationName`, unchanged.
- The S3 walk and the file-naming logic in `scripts/downloader.mjs`.
- Prisma, unless you decide otherwise. See the open decision.

You finish this migration with fewer moving parts than you have now.

# The data model

The tables below use `snake_case`. Your current tables use Prisma's naming. Pick
one and apply it everywhere. If you stay on Prisma, matching the existing style
is less work.

## station

Same shape as today.

```sql
CREATE TABLE station (
  id                 serial PRIMARY KEY,
  name               text NOT NULL UNIQUE,
  latitude           text NOT NULL,
  longitude          text NOT NULL,
  borough            text,
  community_district integer,
  council_district   integer
);
```

Identity stays the cleaned name. Coordinates stay last-write-wins.

## trip

```sql
CREATE TABLE trip (
  started_at       timestamptz NOT NULL,
  ended_at         timestamptz NOT NULL,
  start_station_id integer NOT NULL,
  end_station_id   integer NOT NULL,
  rideable_type    text NOT NULL
);

SELECT create_hypertable(
  'trip',
  by_range('started_at', INTERVAL '1 month'),
  create_default_indexes => false
);
```

Notes on the columns:

- The CSVs publish local New York wall-clock time with no offset. The loader
  converts to `timestamptz` as `America/New_York`. The one hour that repeats
  each fall is ambiguous. A few trips per year land in the wrong hour. This is
  acceptable.
- `rideable_type` stays text rather than a boolean. It keeps what Citi Bike
  actually published, and the cost of the extra bytes is small.
- No indexes, on purpose. See the cost-control section above.

## What an area is

"Area" is a new word in this plan, so here is what it means.

An area is whatever the user has selected to look at. Your app offers four
kinds: a station, a borough, a community district, and a council district.
Every view answers the same questions about whichever one the user picked.

Two columns describe it. `area_type` says which of the four kinds it is, using
the same four strings `getWhereSpecifier` already handles: `station`,
`borough`, `community-district`, and `council-district`. `area_key` identifies
the specific one. That is a station id, a borough name, or a district number,
stored as text so one column holds all three.

This is what collapses four query paths into one. Today `getWhereSpecifier`
returns a structurally different Prisma `where` for each kind, and a borough
query sums across hundreds of stations while the user waits. With these two
columns, all four kinds have one row shape and one lookup.

**The name needs a decision, and it is a small one.** "Area" is a poor fit for a
station, which is a point rather than an area. You already have vocabulary for
this concept: `getWhereSpecifier(type, specifier)`, and `userSelection` in
`DataContainer`. Three options:

- `type` and `specifier`, matching your existing function exactly. Tables become
  `specifier_day` and `specifier_total`. A reader translates nothing.
- `place_type` and `place_key`, which fits all four values honestly. Tables
  become `place_day` and `place_total`.
- Keep `area`.

Recommendation: the first. Your own vocabulary outranks a word I invented. The
rest of this document says `area` only because it was written that way. Rename
it in step 3 and the change costs nothing.

## area_day

This is the table the site reads. It replaces the current `StationDay`.

```sql
CREATE TABLE area_day (
  area_type       text    NOT NULL,
  area_key        text    NOT NULL,
  day             date    NOT NULL,
  acoustic_arrive integer NOT NULL DEFAULT 0,
  acoustic_depart integer NOT NULL DEFAULT 0,
  electric_arrive integer NOT NULL DEFAULT 0,
  electric_depart integer NOT NULL DEFAULT 0,
  PRIMARY KEY (area_type, area_key, day)
);
```

The grain is one row per area per day. A station's uses on a given day is one
row here. `getWhereSpecifier` stops returning a query fragment and starts
returning a pair of strings.

Size is about 10 million rows, mostly the per-station rows. That is small.

## area_total

This is what makes topline instant.

```sql
CREATE TABLE area_total (
  area_type                  text    NOT NULL,
  area_key                   text    NOT NULL,
  acoustic                   bigint  NOT NULL,
  electric                   bigint  NOT NULL,
  trips_since_first_electric bigint  NOT NULL,
  first_date                 date    NOT NULL,
  last_date                  date    NOT NULL,
  PRIMARY KEY (area_type, area_key)
);
```

One row per selectable thing. About 2,100 rows in total: roughly 2,000
stations, 4 boroughs, and the districts.

`/api/topline` and `/api/timeframe` both become a single-row primary key
lookup. That is faster than a Redis round trip, because Redis is a network hop
too.

# The read path

## Why the site still feels slow without a second change

`Topline.tsx` fetches on mount. The browser loads the HTML, boots React,
hydrates, and only then starts the request. A backend that answers in zero
milliseconds still shows a spinner, because the request has not begun yet.

Redis never fixed this. It saved a few hundred milliseconds on a step that
starts several hundred milliseconds into the page load.

The fix is to render the first view on the server. The selection lives in the
URL through nuqs, so the server already knows what to render on first load.
Only later selection changes need a client fetch.

This is the one part of the front end that changes.

## Which table serves which view

Nothing in the site reads `trip`. This table is why the plan puts no indexes on
it.

| View | Reads | Query |
| --- | --- | --- |
| Chart, daily, any of the four area types | `area_day` | Primary key lookup on `(area_type, area_key)`, filtered by a `day` range. One row per day. |
| Chart, monthly, any of the four area types | `area_day` | The same read, with `GROUP BY` on the month. |
| Topline | `area_total` | One row, by primary key. |
| Timeframe | `area_total` | The same row. `first_date` and `last_date`. |
| Most recent date | `area_total` | `max(last_date)`. |
| Station and district pickers | `station` | Unchanged from today. |

The borough, community district, and council district rows in `area_day` are
precomputed by step 4 of the rollup. So a borough chart is the same single
filtered read as a station chart. It does not sum across stations at request
time, which is what it does today.

The heaviest query on the site is a daily station chart across a full year. That
is 365 rows, read through the primary key.

`trip` gets one reader: the loader, once per month, right after that month
loads. If you ever add a view that queries `trip` directly, revisit the
no-index decision at the same time.

## Route by route

- `/api/mostrecentdate` — becomes `SELECT max(last_date) FROM area_total`.
  Better, move it to the server component and delete the route.
- `/api/timeframe` — one row from `area_total`. Serve the first one from the
  server. Keep the route for selection changes.
- `/api/topline` — one row from `area_total`. Same treatment.
- `/api/chart` — a filtered read of `area_day`. For the monthly view, group by
  month in SQL. For the daily view, return the rows.
- `/api/revalidate` — delete it. It only flushed Redis.

Response shapes are free to change, so `ChartData` can carry a real `date`
instead of separate `year`, `month`, and `day` integers. That removes the
awkward year-and-month range logic in the current chart route.

`app/action.ts` keeps doing what it does.

# Ingestion

## The loader

`prisma/seed.ts` stops aggregating. Its new job is to get rows into `trip` as
fast as possible. `createMany` cannot do this. At 300 million rows it would run
for days.

The path is `COPY`, through `pg-copy-streams`. The shape is:

1. Read the CSV with the existing `csv-parse` stream.
2. Transform each row and write it to a `COPY` stream.
3. Let Postgres write it straight into the hypertable.

Keep the existing station pass. Keep the progress bars.

Row rejection changes. Today bad rows vanish. Now the loader counts them by
reason and prints a summary per month. Citi Bike has changed their format at
least twice. A count that jumps tells you before the charts do.

## Building the rollups

After a month loads, the loader rebuilds that month's rollups:

1. Delete rows in `area_day` for that month.
2. Insert per-station departures, grouped by `start_station_id` and the date of
   `started_at`.
3. Insert per-station arrivals, grouped by `end_station_id` and the date of
   `ended_at`.
4. Insert the borough, community district, and council district rows by joining
   the per-station rows to `station`.
5. Rebuild `area_total` completely. It is 2,100 rows, so a full rebuild costs
   nothing.

One detail on step 3. A trip that starts on the last night of the month can end
on the first day of the next month. Scan `started_at` across the month plus one
day on each side, then filter on `ended_at`. Otherwise you lose those arrivals.

## Archiving

As each monthly archive downloads and loads, push the original zip to B2 or R2
with the S3 client already in the project. About 100 GB costs one to two
dollars a month. A future rebuild then takes hours instead of days, and you are
insulated if Citi Bike reorganizes their bucket again. They have done it once.

This archive is also what makes the "drop old raw trips" cost lever safe.

# The backfill

This runs once. Multi-day is fine.

Run it from a machine in a data center, not from your laptop. Your home upload
speed would become the bottleneck, and it would tell you nothing about how the
real nightly job performs. Use the existing droplet, or rent a small box for
the month it takes.

Work month by month, oldest first. For each month: download, load, roll up,
archive, delete the CSVs.

Make it resumable. It will fail partway at least once over 155 months. Track
which months are complete in a small table. On restart, skip them.

Verify per month by comparing the trip count against the CSV line count minus
the rejected rows. Log both. You are not gating the cutover on parity, but a
month that silently loses half its trips should be visible in a log.

# The one open decision

Staying on Neon resolved the hosting question and the backup question. The
query layer is the only thing left.

You lean Drizzle. All three options work. None of them removes the small amount
of one-time DDL above, because no tool models hypertables.

- **Prisma.** Least churn. You already know it. Every table in this plan is an
  ordinary Postgres table, so Prisma models all of them normally. Only the
  `create_hypertable` call needs a hand-edited `--create-only` migration.
- **Drizzle.** Schema in TypeScript. `drizzle-kit generate --custom` holds the
  extra DDL alongside generated migrations, which is a supported path rather
  than a workaround. Costs a rewrite of `action.ts` and every route.
- **Kysely.** Types generated from the real database. Most SQL-shaped, least
  magic, no schema management.

Worth saying plainly: the rollup-table design removed the pressure that made me
suggest leaving Prisma. There is now exactly one line of SQL that Prisma cannot
express. Staying put is a defensible answer, and it is the one that adds no new
tool to a project you work on in evenings.

Decide this after step 1, when you have written real SQL against the new shape.

# Order of work

Each item is a branch off `timescaledb` and a squash merge into it. The site
keeps serving the old data until step 8.

1. **The spike.** See the runbook below. It answers whether Neon can carry this.
2. **Decide the query layer.**
3. **Schema and migrations.** All the DDL above.
4. **Loader rewrite.** `COPY` path, rejection counting, station pass,
   per-month rollup rebuild, archive upload.
5. **Resumable backfill runner.** The completed-months table and the restart
   logic.
6. **Run the backfill.** Days. Nothing else is blocked by it, so do step 7 in
   parallel.
7. **Read path.** Rewrite the four routes against `area_day` and `area_total`.
   Move topline, timeframe, and most-recent-date to the server. Delete
   `revalidate`, `app/redis.js`, and the Redis dependency.
8. **Cutover.** Point the app at the new tables. Watch one nightly run succeed.
9. **Regenerate the Cypress fixtures.** The response shapes changed, so the
   three JSON files under `cypress/fixtures/borough` are stale. The suite mocks
   the API, so it will not catch data problems either way. It only proves the
   components still render.
10. **Delete.** The old `StationDay` table and its migrations, the Redis
    instance, and the Redis environment variables. Update the README setup
    section and `.env.sample`.

# Step 1 runbook: the Neon spike

The goal is one number: how long a full backfill takes, and what it costs. Do
not write production code here. Throwaway scripts are correct.

Budget half a day.

## Set the guardrails

1. Open the Neon console.
2. Set a spending limit on the project. Choose an amount you are willing to lose
   to a runaway loader.
3. Shorten the history window to its minimum. A bulk load fills it, and Neon
   bills it at $0.20 per GB-month. Set it back when the backfill finishes.
4. Create a new Neon branch for the spike. Do not use the branch the site reads.
5. Copy the connection string for the new branch.

## Set up the database

1. Connect with `psql`.
2. Run `CREATE EXTENSION IF NOT EXISTS timescaledb;`.
3. Run `SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';`.
4. Write the version down. The syntax in the docs changes between versions.
5. Create the `station` and `trip` tables from the data model section.
6. Create the hypertable with `create_default_indexes => false`.

## Confirm the license limits

You expect these two to fail. Run them anyway, and record the exact error text.
This is how you know the plan's reasoning holds.

1. Try to enable compression on `trip`. Expect a license error.
2. Try to create a continuous aggregate that buckets on `ended_at`. Expect an
   error about the time column, a license error, or both.
3. If either one succeeds, stop and tell me. Several decisions in this plan
   change.

## Load one month

1. Choose a recent month with a lot of trips. Use 2024, not 2014. Recent months
   are about five times larger, and a 2014 measurement would flatter the result.
2. Run the existing downloader for that month only.
3. Seed the stations for that month with the existing station pass.
4. Write a throwaway script that streams the CSV into `COPY` with
   `pg-copy-streams`.
5. Run it from a data center machine, not from your laptop.
6. Record the wall-clock time and the rows per second.

## Build the rollups

1. Write the `INSERT ... SELECT ... GROUP BY` statements for departures and
   arrivals.
2. Run them. Record the time.
3. Confirm the arrival scan picks up trips that start on the last night of the
   month.
4. Build `area_total` for the areas that month covers.

## Measure what matters

1. Read the storage figure in the Neon console before and after the load.
2. Multiply the row count and storage by 155 months, then reduce for the fact
   that early years are much smaller. A factor near 60 to 80 full-size months is
   a reasonable estimate for the whole history.
3. Multiply the load time the same way. This is your backfill estimate.
4. Watch the storage figure over the next day. Neon bills history as well as
   current data, and a bulk load writes a lot of it. Confirm it settles back
   down.
5. Deploy a Vercel preview that reads `area_day` and `area_total`. Measure the
   query latency from the preview, not from your laptop.

## Decide

1. If the extrapolated backfill runs longer than about two weeks, consider the
   appendix.
2. If the projected steady-state storage cost goes over about $20 a month,
   consider the appendix.
3. If neither happens, stay on Neon and continue to step 2.
4. Write the numbers into this document, replacing the estimates.

# Risks

**The backfill is slower than one month of measurement predicts.** Later years
are five times larger than early years. Measure a 2024 month, not a 2014 one.
The runbook says this twice on purpose.

**Neon's history billing spikes during the bulk load.** Neon bills history
separately from current data, at $0.20 per GB-month. Loading 16 GB writes a
large write-ahead log, and all of it lands in history. Shorten the history
window to its minimum before you start the backfill, then set it back
afterwards. Step 1 watches the number either way.

**Citi Bike's older CSVs break the loader in a new way.** The current seeder has
survived them, but it reads columns you are now dropping and skips columns you
now need. Expect rework. The per-month rejection counts are how you find this.

**Station identity drifts across 13 years.** `cleanStationName` merges renamed
stations today, and it will keep doing so. Trip-level data does not fix this and
does not make it worse.

**Arrival attribution shifts the numbers.** Counting arrivals by `ended_at`
rather than by trip start date changes overnight trips. The effect should be
well under one percent. Look at it once after the backfill, so a surprise does
not arrive later.

# Definitions

Words this document uses that are not already in your codebase or your README.
Each entry links to a primary source. Four terms are industry jargon with no
canonical definition, and those say so.

**Apache-2 build** — TimescaleDB ships under two licenses. The Apache-2 build
gives you hypertables, chunks, and `time_bucket`. The Timescale License adds
compression, continuous aggregates, retention policies, and job automation. Neon
runs the Apache-2 build only, which is why this plan uses no compression.
[TimescaleDB editions](https://www.tigerdata.com/docs/about/latest/timescaledb-editions)
· [extensions available on Neon](https://neon.com/docs/extensions/pg-extensions)

**backfill** — The one-time job that loads all 13 years of history. Separate
from the nightly job, which loads one new month. No canonical source. This is a
working definition.

**backpressure** — When a fast reader feeds a slower writer, Node pauses the
reader so memory does not fill up. It matters here because `csv-parse` produces
rows faster than Postgres accepts them.
[Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams)

**chunk** — One of the physical child tables that a hypertable splits into. In
this plan each chunk holds one month of trips.
[Understand hypertables](https://www.tigerdata.com/docs/use-timescale/latest/hypertables/)

**chunk exclusion** — Postgres skipping any chunk whose time range cannot match
a query's date filter. This is why the loader scans one month without an index.
The same idea in plain Postgres is called partition pruning.
[Understand hypertables](https://www.tigerdata.com/docs/use-timescale/latest/hypertables/)
· [Partition pruning](https://www.postgresql.org/docs/current/ddl-partitioning.html)

**columnar storage** — Storing all the values of one column together, instead of
storing whole rows together. Repeated values then compress well. TimescaleDB
uses this for compressed chunks. Not available on Neon.
[Understand hypercore](https://www.tigerdata.com/docs/use-timescale/latest/hypercore/)

**composite primary key** — A primary key made of more than one column.
`area_day` uses `(area_type, area_key, day)`. Prisma spells this `@@id`.
[Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

**compute-hour, or CU-hour** — Neon's billing unit for processing time. One
compute unit is about 4 GB of RAM, and one CU running for one hour is one
CU-hour. Neon charges $0.106 for one.
[Neon plans and usage metrics](https://neon.com/docs/introduction/usage-metrics)

**connection pooling** — Reusing a small set of database connections across many
requests. Serverless functions open connections constantly, which can exhaust a
database. Neon runs PgBouncer for you. You would run it yourself if you left.
[Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
· [PgBouncer](https://www.pgbouncer.org/)

**continuous aggregate, or cagg** — A materialized view that refreshes itself
incrementally when new rows land. Licensed, so Neon cannot run it. This plan
does not use one. See the section above for why.
[About continuous aggregates](https://www.tigerdata.com/docs/use-timescale/latest/continuous-aggregates/about-continuous-aggregates)

**COPY** — Postgres's bulk load command. It is far faster than `INSERT` at
volume, because it avoids per-statement overhead. Prisma hides it behind
`createMany`, which is not fast enough here.
[COPY](https://www.postgresql.org/docs/current/sql-copy.html)

**cutover** — The moment the live site starts reading the new tables. No
canonical source. This is a working definition.

**DDL** — Data Definition Language. The SQL that creates and changes tables,
indexes, and extensions, as opposed to the SQL that reads and writes rows. Your
Prisma migration files are DDL.
[Data Definition](https://www.postgresql.org/docs/current/ddl.html)

**extension** — A package that adds features to a Postgres server. It is not a
separate database. `postgis`, `pgvector`, and `timescaledb` are all extensions.
[CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html)

**grain** — What one row represents. Your current `StationDay` has station-day
grain. The new `trip` table has trip grain. Finer grain means more rows, and
more questions you can answer later. The term comes from dimensional modeling.
[Kimball dimensional modeling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)

**history, in Neon's billing** — Neon keeps recent past versions of your data so
it can restore to an earlier moment. It bills this separately from current data,
at $0.20 per GB-month, and you choose how far back the window reaches. Paid
plans default to one day. A bulk load creates a lot of history, so shortening
the window during the backfill is a cost lever.
[Neon plans and usage metrics](https://neon.com/docs/introduction/usage-metrics)

**hypertable** — A table that Postgres automatically splits into time-based
chunks. It behaves like a normal table.
[Understand hypertables](https://www.tigerdata.com/docs/use-timescale/latest/hypertables/)

**idempotent** — Running a job twice gives the same result as running it once.
The loader is idempotent per month, because it drops that month before
reloading it.
[MDN: Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)

**index** — A separate structure Postgres maintains so it can find rows without
reading the whole table. It costs disk space and slows writes. Your schema has
one today, `@@index([stationId])`. This plan puts none on `trip`, on purpose.
[Indexes](https://www.postgresql.org/docs/current/indexes.html)

**materialized view** — A query whose results are stored on disk like a table.
It goes stale until something refreshes it.
[CREATE MATERIALIZED VIEW](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)

**point-in-time recovery, or PITR** — Restoring the database to how it looked at
a chosen past moment, rather than only to the last backup. Neon does this for
you, within your history window.
[Neon branching and restore](https://neon.com/docs/introduction/point-in-time-restore)

**rollup table** — A table holding precomputed summaries of a larger table.
`area_day` and `area_total` are rollup tables. Your current `StationDay` is one
too, except that it is the only copy of the data, so nothing can rebuild it. No
canonical source. This is a working definition.

**spike** — A short piece of throwaway work whose only purpose is to answer a
question before you commit to a design. Step 1 is a spike. The term comes from
Extreme Programming. No canonical source. This is a working definition.

**time_bucket** — A TimescaleDB function that rounds a timestamp down to a fixed
interval, such as an hour or a day. This plan groups by `date` instead, so it
does not need it.
[time_bucket()](https://www.tigerdata.com/docs/api/latest/hyperfunctions/time_bucket/)

**timestamptz** — A Postgres timestamp that records an absolute moment in time.
Plain `timestamp` stores wall-clock numbers with no time zone attached, so it
cannot tell you when something actually happened. This plan uses `timestamptz`.
[Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

**TLS and sslmode** — TLS encrypts the connection to the database. `sslmode` is
the client setting that says how hard to verify the server on the other end.
Only `verify-full` confirms you reached the right server. Neon handles all of
this for you.
[SSL Support](https://www.postgresql.org/docs/current/libpq-ssl.html)

**write-ahead log, or WAL** — Postgres writes every change into a log before
applying it, so a crash cannot lose committed work. Bulk loads produce a lot of
WAL, which is why Neon's history number moves during a backfill.
[Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)

# Appendix: if you have to leave Neon

Only read this if step 1 fails. It exists so the fallback is written down, not
because you should plan for it.

The fallback is one rented server running Postgres, TimescaleDB, and the nightly
cron. A 4 vCPU, 8 GB, 80 GB machine costs about $10 a month at Hetzner.
DigitalOcean charges roughly five times that for the same shape.

What you gain:

- Compression. Trip data drops from about 16 GB to a few GB. You can afford
  indexes again.
- A local `COPY` path, which makes the backfill several times faster.

What you take on, permanently:

- Installing and configuring Postgres: `postgresql.conf`, `pg_hba.conf`,
  listening addresses, roles, and the `systemd` service.
- Memory tuning: `shared_buffers`, `work_mem`, and `maintenance_work_mem`. The
  defaults assume a very small machine and will slow the backfill down.
- TLS, because the app stays on Vercel. This means a server certificate and
  `sslmode=verify-full` on the client. Weaker `sslmode` values give you almost
  nothing, so do not stop at `require`.
- Connection pooling, eventually. At 500 page views a month you can skip
  PgBouncer, but you should know the symptom.
- Server hardening: SSH keys, a firewall, and a non-root user.
- Backups. `pg_dump` after each nightly ingest, pushed to the same bucket that
  holds the CSV archives.
- Postgres major version upgrades, forever.

Two settings matter if you get here, because compression is the whole reason you
moved. `compress_segmentby` picks a column whose value is identical across a
batch of up to 1,000 rows, so it gets stored once instead of 1,000 times. Choose
a column with moderate distinct values. `start_station_id` has about 2,000,
which is reasonable. A column that is unique per row is the worst possible
choice, because every batch would hold one row. `compress_orderby` sets the row
order inside a batch, and sorting by time stores well as small differences.
Measure two or three options before committing, because a bad `segmentby` can
cost several times the disk.

# Not in this plan

The views do not change. No hourly view, no origin-destination view, no trip
duration view. The model supports all three, and each becomes a query plus a
rollup table when you want it. That is the point of the migration, but it is not
part of it.
