/* eslint-disable no-console */

import { PrismaClient } from '@prisma/client';
import { ProgressBar } from 'ascii-progress';
import { exec } from 'child_process';
import { finished } from 'stream/promises';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const TMP_DIR = process.env.TMP_DIR;
const ENV = process.env.ENVIRONMENT;

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

async function getMostRecentData(): Promise<{
  mostRecentMonth: number;
  mostRecentYear: number;
}> {
  const mostRecentDay = await prisma.dockDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  return {
    mostRecentMonth: Number(
      mostRecentDay?.month ?? process.env.START_MONTH ?? 0,
    ),
    mostRecentYear: Number(mostRecentDay?.year ?? process.env.START_YEAR ?? 0),
  };
}

async function processFiles(files: Record<string, number>) {
  console.log('Processing files...');
  const { mostRecentMonth, mostRecentYear } = await getMostRecentData();
  console.log(`Most recent data from ${mostRecentYear}-${mostRecentMonth}`);

  // Seed docks and generate data for days
  for (const file of Object.keys(files)) {
    const dateMatch = /\d{6}/.exec(file);
    if (dateMatch === null) {
      throw Error('Filename malformed.');
    }
    const date = dateMatch[0];
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const dateStr = `${year}-${month}`;

    if (
      parseInt(year) > mostRecentYear
      || (parseInt(year) === mostRecentYear
        && parseInt(month) > mostRecentMonth)
    ) {
      await seedDocks(file, dateStr, files[file]);
      await seedDays(dateStr, file, files[file]);
    }
  }
}

// Iterates over a file, gets all of the dock names, and inserts them into the
// database. Will skip inserting any docks that already are present in the
// database (based on the unique dock name).
async function seedDocks(file: string, dateStr: string, length: number) {
  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Docks].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  const docks = new Set<string>();
  parser.on('readable', async () => {
    let record;

    while ((record = parser.read()) !== null) {
      // There are extra header rows left over because of the way we
      // concatenated the files in the downloader script. Skip those.
      if (
        record.ride_id !== 'ride_id'
        || record.starttime === 'starttime'
        || record['Start Time'] === 'Start Time'
      ) {
        // old data name vs new data name
        const start_station_name =
          record.start_station_name
          ?? record['start station name']
          ?? record['Start Station Name'];
        const end_station_name =
          record.end_station_name
          ?? record['end station name']
          ?? record['End Station Name'];

        if (
          start_station_name !== undefined
          && start_station_name !== ''
          && start_station_name !== 'NULL'
        ) {
          docks.add(start_station_name.normalize('NFKC'));
        }

        if (
          end_station_name !== undefined
          && end_station_name !== ''
          && end_station_name !== 'NULL'
        ) {
          docks.add(end_station_name.normalize('NFKC'));
        }
      }
      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    // Some lines in the CSV are missing dock names and this results in a dock
    // with an empty string for a name being recorded. Delete this. Elsewhere
    // in the code we'll prevent trip data for the empty dock from being
    // entered.
    docks.delete('');
    await prisma.dock.createMany({
      data: [...docks].map((dock) => ({ name: dock })),
      skipDuplicates: true,
    });
  });
}

async function seedDays(fileDateStr: string, file: string, length: number) {
  const docks = await prisma.dock.findMany({});
  const dockMap: Record<string, number> = {};
  docks.forEach((dock) => {
    dockMap[dock.name] = dock.id;
  });

  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${fileDateStr}][Trips].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  const processedData: Record<
    string,
    Record<
      string,
      {
        // yyyy-mm-dd formatted date
        acoustic: number;
        electric: number;
      }
    >
  > = {};

  // Iterate over one entire file
  parser.on('readable', async function () {
    let record;

    while ((record = parser.read()) !== null) {
      if (
        record.ride_id === 'ride_id'
        || record.starttime === 'starttime'
        || record['Start Time'] === 'Start Time'
      ) {
        // There are extra header rows left over because of the way we
        // concatenated the files in the downloader script. Skip those.
        continue;
      }

      // Both the start and end docks for each trip will be associated with
      // the start date of the trip. This is relevant in the case where a trip
      // starts on one day and ends on the next.
      const dateStr = new Date(
        (record.started_at ?? record.starttime ?? record['Start Time']).split(
          ' ',
        )[0],
      )
        .toISOString()
        .slice(0, 10);

      if (dateStr.slice(0, 7) !== fileDateStr) {
        // This csv has lines for a different month and while it would be great
        // if we could include it, doing so would break stuff unless I wrote a
        // lot of extra code that I do not want to write. Shouldn't be more
        // than 1 or 2 trips per month, at most.
        continue;
      }

      const electric = record.rideable_type === 'electric_bike';

      const start_station_name = (
        record.start_station_name
        ?? record['start station name']
        ?? record['Start Station Name']
      ).normalize('NFKC');
      const end_station_name = (
        record.end_station_name
        ?? record['end station name']
        ?? record['End Station Name']
      ).normalize('NFKC');

      [start_station_name, end_station_name].forEach((stationName) => {
        // Sometimes there's bad data in the CSVs and one or both sides of a trip
        // will be missing a dock name. In that case, we will still record the
        // side of the trip that we know, but we'll drop the other one since we
        // don't have a dock with which to associate that end.
        if (
          stationName !== ''
          && stationName !== 'NULL'
          && stationName !== undefined
        ) {
          const dockId = dockMap[stationName];

          if (processedData[dockId] && processedData[dockId][dateStr]) {
            if (electric) {
              processedData[dockId][dateStr].electric += 1;
            } else {
              processedData[dockId][dateStr].acoustic += 1;
            }
          } else if (processedData[dockId]) {
            if (electric) {
              processedData[dockId][dateStr] = { electric: 1, acoustic: 0 };
            } else {
              processedData[dockId][dateStr] = { electric: 0, acoustic: 1 };
            }
          } else {
            if (electric) {
              processedData[dockId] = {
                [dateStr]: { electric: 1, acoustic: 0 },
              };
            } else {
              processedData[dockId] = {
                [dateStr]: { electric: 0, acoustic: 1 },
              };
            }
          }
        }
      });

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    for (const dockId of Object.keys(processedData)) {
      const dockData = processedData[dockId];
      const dates: string[] = Object.keys(dockData);

      const rows = dates.map((date: string) => {
        // TODO: ZACK PUT THIS BACK

        return {
          acoustic: dockData[date].acoustic,
          day: parseInt(date.slice(8, 10)),
          dockId: parseInt(dockId),
          electric: dockData[date].electric,
          month: parseInt(date.slice(5, 7)),
          year: parseInt(date.slice(0, 4)),
        };
      });

      await prisma.dockDay.createMany({
        data: rows,
      });
    }
  });
}

exec(`wc -l ${TMP_DIR}/*`, (error, stdout) => {
  const lines = stdout
    .split('\n')
    .map((l) => l.trim().split(' '))
    .filter((l) => {
      return l.length === 2 && l[1] !== 'total';
    });

  const files: Record<string, number> = {};
  lines.forEach((line) => {
    files[line[1]] = parseInt(line[0]);
  });

  processFiles(files)
    .then(async () => {
      console.log('disconnecting');
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      if (ENV === 'production') {
        exec(`rm -rf ${TMP_DIR}`);
      }
    });
});
