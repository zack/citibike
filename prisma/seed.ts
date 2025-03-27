/* eslint-disable no-console */

import { PrismaClient } from '@prisma/client';
import { ProgressBar } from 'ascii-progress';
import { exec } from 'child_process';
import { finished } from 'stream/promises';
import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import util from 'node:util';

const prisma = new PrismaClient();
const TMP_DIR = process.env.TMP_DIR;
const ENV = process.env.ENVIRONMENT;

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function cleanStationName(stationName: string): string {
  return (
    stationName
      // normalize all of the code points
      .normalize('NFKC')
      // I believe that any of these modifiers on station names can be safely removed
      // and the data associated with that station can be safely merged with the
      // original.
      .replace('\t', ' ')
      .replace('\\t', ' ')
      .replace('[temporarily removed]', '')
      .replace(/ +/, ' ')
      .replace('_old', '')
      .replace('_new', '')
      .replace('[old]', '')
      .replace('[new]', '')
      .replace(/_[0-9]/, '')
      .trim()
  );
}

async function getMostRecentData(): Promise<{
  mostRecentMonth: number;
  mostRecentYear: number;
}> {
  const mostRecentDay = await prisma.stationDay.findFirst({
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

  // Seed stations and generate data for days
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
      await seedStations(file, dateStr, files[file]);
      await seedDays(dateStr, file, files[file]);
    }
  }
}

// Iterates over a file, gets all of the station names, and inserts them into the
// database. Will skip inserting any stations that already are present in the
// database (based on the unique station name).
async function seedStations(file: string, dateStr: string, length: number) {
  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Stations].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  const stations: Record<string, { latitude: string; longitude: string }> = {};

  parser.on('readable', async () => {
    let record;

    while ((record = parser.read()) !== null) {
      if (
        record.ride_id === 'ride_id'
        || record.tripduration === 'tripduration'
        || record.starttime === 'starttime'
        || record['Start Time'] === 'Start Time'
      ) {
        // There are extra header rows left over because of the way we
        // concatenated the files in the downloader script. Skip those.
        // Use a different check for the different formats we see in different
        // files.
        continue;
      }

      // old data name vs new data name
      const start_station_name =
        record.start_station_name
        ?? record['start station name']
        ?? record['Start Station Name'];
      const start_station_latitude =
        record['start station latitude']
        ?? record['Start Station Latitude']
        ?? record.start_lat;
      const start_station_longitude =
        record['start station longitude']
        ?? record['Start Station Longitude']
        ?? record.start_lng;

      if (
        // There are a few different substrings we can find in station names that
        // indicate stations that we don't want to include in our dataset
        !start_station_name.includes('Lab - NYC')
        && !start_station_name.includes('TEMP')
        // Sometimes there are just malformed lines with missing station names
        && start_station_name !== undefined
        && start_station_name !== ''
        && start_station_name !== 'NULL'
        // Sometimes stations have lats or lons or 0.0. I don't know why, but we
        // don't want them
        && start_station_latitude !== '0.0'
        && start_station_longitude !== '0.0'
      ) {
        stations[cleanStationName(start_station_name)] = {
          latitude: start_station_latitude,
          longitude: start_station_longitude,
        };
      }

      const end_station_name =
        record.end_station_name
        ?? record['end station name']
        ?? record['End Station Name'];
      const end_station_latitude =
        record['end station latitude']
        ?? record['End Station Latitude']
        ?? record.end_lat;
      const end_station_longitude =
        record['end station longitude']
        ?? record['End Station Longitude']
        ?? record.end_lng;

      if (
        // There are a few different stations that include this string in the data
        // that we don't want to include. It's test data and somtimes
        // malformed anyway.
        !end_station_name.includes('Lab - NYC')
        && !end_station_name.includes('TEMP')
        // Sometimes there are just malformed lines with missing station names
        && end_station_name !== undefined
        && end_station_name !== ''
        && end_station_name !== 'NULL'
        // Sometimes stations have lats or lons or 0.0. I don't know why, but we
        // don't want them
        && end_station_latitude !== '0.0'
        && end_station_longitude !== '0.0'
      ) {
        stations[cleanStationName(end_station_name)] = {
          latitude: end_station_latitude,
          longitude: end_station_longitude,
        };
      }

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    // Some lines in the CSV are missing station names and this results in a station
    // with an empty string for a name being recorded. Delete this. Elsewhere
    // in the code we'll prevent trip data for the empty station from being
    // entered.
    delete stations[''];
    await prisma.station.createMany({
      data: Object.keys(stations).map((stationName) => ({
        latitude: stations[stationName].latitude,
        longitude: stations[stationName].longitude,
        name: stationName,
      })),
      skipDuplicates: true,
    });
  });
}

async function seedDays(fileDateStr: string, file: string, length: number) {
  const stations = await prisma.station.findMany({});
  const stationMap: Record<string, number> = {};
  stations.forEach((station) => {
    stationMap[station.name] = station.id;
  });

  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${fileDateStr}][Trips   ].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
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

      // Both the start and end stations for each trip will be associated with
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

      const electric =
        record.rideable_type && record.rideable_type === 'electric_bike';

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
        // will be missing a station name. In that case, we will still record the
        // side of the trip that we know, but we'll drop the other one since we
        // don't have a station with which to associate that end.
        if (
          stationName !== ''
          && stationName !== 'NULL'
          && stationName !== undefined
        ) {
          const stationId = stationMap[stationName];

          // Get rid of trips without an associated station. This happens when
          // there is the occasional trip associated with a fake or temporary
          // station. These stations didn't have latitude or longitude. I don't know
          // why Citi Bike's data is so gross.
          //
          // Sorry to my freshman Comp Sci Fundamentals professor about all the
          // nested `if` statements.
          if (stationId) {
            if (processedData[stationId] && processedData[stationId][dateStr]) {
              if (electric) {
                processedData[stationId][dateStr].electric += 1;
              } else {
                processedData[stationId][dateStr].acoustic += 1;
              }
            } else if (processedData[stationId]) {
              if (electric) {
                processedData[stationId][dateStr] = {
                  electric: 1,
                  acoustic: 0,
                };
              } else {
                processedData[stationId][dateStr] = {
                  electric: 0,
                  acoustic: 1,
                };
              }
            } else {
              if (electric) {
                processedData[stationId] = {
                  [dateStr]: { electric: 1, acoustic: 0 },
                };
              } else {
                processedData[stationId] = {
                  [dateStr]: { electric: 0, acoustic: 1 },
                };
              }
            }
          }
        }
      });

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    for (const stationId of Object.keys(processedData)) {
      const stationData = processedData[stationId];
      const dates: string[] = Object.keys(stationData);

      await prisma.stationDay.createMany({
        data: dates.map((date: string) => ({
          acoustic: stationData[date].acoustic,
          day: parseInt(date.slice(8, 10)),
          stationId: parseInt(stationId),
          electric: stationData[date].electric,
          month: parseInt(date.slice(5, 7)),
          year: parseInt(date.slice(0, 4)),
        })),
      });
    }
  });
}

// Add borough, community district, and council district to the stations. Makes
// use of an external python script.
async function updateStationExtras() {
  console.log('Updating station extras...');

  const stations = await prisma.station.findMany({});

  const columns = ['name', 'latitude', 'longitude'];
  const filename = `${TMP_DIR}/stations.csv`;
  const writableStream = fs.createWriteStream(filename);
  const stringifier = stringify({ header: true, columns: columns });

  stations.forEach((station) => {
    stringifier.write({
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
    });
  });

  stringifier.pipe(writableStream);

  const execPromise = util.promisify(exec);
  await execPromise('python3 scripts/embellishStationData.py');

  const parser = fs
    .createReadStream(`${TMP_DIR}/stations_completed.csv`)
    .pipe(parse({ columns: true, trim: true }));

  parser.on('readable', async () => {
    let record;

    while ((record = parser.read()) !== null) {
      await prisma.station.update({
        where: { name: record.name },
        data: {
          borough: record.borough,
          communityDistrict: parseInt(record.communityDistrict),
          councilDistrict: parseInt(record.councilDistrict),
        },
      });
    }
  });
}

exec(`wc -l ${TMP_DIR}/*`, (error, stdout) => {
  const lines = stdout
    .split('\n')
    .map((l) => l.trim().split(' '))
    .filter((l) => {
      return (
        l.length === 2
        && l[1] !== 'total'
        && l[1].match(new RegExp(`${TMP_DIR}/\\d+\\.csv$`)) !== null
      );
    });

  if (lines.length > 0) {
    const files: Record<string, number> = {};

    lines.forEach((line) => {
      files[line[1]] = parseInt(line[0]);
    });
    processFiles(files)
      .then(async () => {
        await updateStationExtras();
      })
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
          await fetch(
            `https://citibikedata.nyc/api/revalidate?pass=${process.env.PASS}`,
          );
          exec(`rm -rf ${TMP_DIR}`);
        }
      });
  } else {
    exec(`rm -rf ${TMP_DIR}`);
    console.log('No files found. Skipping seed.');
  }
});
