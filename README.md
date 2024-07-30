# Citi Bike Station Data

A website to allow users to look up usage for their favorite Citi Bike stations.
Also has views by borough, community district, and council district.

# Frequently Asked Questions

## Where does the data come from?

Citi Bike publishes monthly data to an s3 bucket here. I pull down this data, format it to fit in a database, and then store it there. A program checks for new data each morning.
Why isn't the most recent month available?

Sometimes Citi Bike is slow in uploading new data, so it might be that. Otherwise, if you see the data available at the link above but it's been more than a day and it's still not here, there might have been a bug in my code. Hopefully I'll see it soon. Feel free to open an issue on GitHub or email me about it at zack@citibikedata.nyc.

## Where can I find the code?

Here.

## What are you counting?

I'm counting each stationing and unstationing as an individual use. That means most trips generate two uses, and usually at two different stations. I consider this the most valuable number because it shows how many times a station is providing value to someone in a day/month. If you are looking for data about trips taken, you will have to find that elsewhere, sorry.

## How far back does the data go?

Citi Bike publishes data as far back as June 2013. All of that data is available here.

## I found a bug or I have a feature request or suggestion

Feel free to open an issue on GitHub or email me about it at zack@citibikedata.nyc.

## I think I found a missing station, or something else looks weird

I'll be blunt: Citi Bike's data is pretty messy. Sometimes they move stations and/or change names, which makes the data look kind of weird, but there's not really anything I can do about that. I also sometimes have to drop trips (a tiny fraction of a percent of trips) because the row is malformed. If you think you've found something really wrong, or you're just not sure, feel free to open an issue on GitHub or send me an email at zack@citibikedata.nyc.

Oh, and I don't include stations in New Jersey or Canada.

# Local Setup

## Database

1. Install postgres
1. Create a user
   1. `$ sudo -u postgres psql`
   1. `postgres=# CREATE USER citibike WITH PASSWORD 'citibike'`
1. Create a database and a shadow database
   1. `postgres=# CREATE DATABASE stationdata;`
   1. `postgres=# CREATE DATABASE stationdatashadow;`
1. Set permissions in psql to allow Prisma to perform actions
   1. `postgres=# \c stationdata`
   1. `stationdata=# GRANT ALL ON SCHEMA public TO citibike;`
   1. `postgres=# \c stationdatashadow`
   1. `stationdata=# GRANT ALL ON SCHEMA public TO citibike;`
1. Set your environment variables to reference these databases in `.env`
   1. `DATABASE_URL='postgresql://citibike:citibike@localhost/stationdata'`
   1. `SHADOW_DATABASE_URL='postgresql://citbike:citibike@localhost/stationdatashadow'`

# Development Commands

- Start the web server
  - `npm run dev`
- Start the prisma studio, allowing interactive access to the database via a web GUI
  - `npx prisma studio`
- Further Prisma CLI commands can be found on [their
  website](https://www.prisma.io/docs/orm/tools/prisma-cli)

# Special Thanks
A huge thanks to the following people who helped make this possible:

- [Aileen Zhou](https://ayleinee.com/)
- [Carly Jones](https://github.com/carly-jones)
- [Catt Small](https://cattsmall.com/)
- [Em Friedenberg](https://x.com/emfriedenberg)
- All the fine folks at [Transportation Alternatives](https://transalt.org/)
