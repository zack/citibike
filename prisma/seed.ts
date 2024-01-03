import { PrismaClient } from '@prisma/client'
import { ProgressBar } from 'ascii-progress';
import { exec } from 'child_process';
import { finished } from 'stream/promises';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const TMP_DIR = process.env.TMP_DIR;
const ENV = process.env.ENVIRONMENT;

function randomColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

async function processFiles(files: { [index: string]: number }) {
  console.log('Processing files...');

  // Seed docks and generate data for days
  for (const file of Object.keys(files)) {
    const dateMatch = /\d{6}/.exec(file);
    if (dateMatch === null) {
      throw Error('Filename malformed.');
    }
    const date = dateMatch[0];
    const year = date.slice(0,4);
    const month = date.slice(4,6);
    const dateStr = `${year}-${month}`;

    await seedDocks(file, dateStr, files[file]);
    await seedDays(dateStr, file, files[file]);
  }
}

// Iterates over a file, gets all of the dock names, and inserts them into the
// database. Will skip inserting any docks that already are present in the
// database (based on the unique dock name). Returns all of the docks in the
// database after the insert.
async function seedDocks(file: string, dateStr: string, length: number) {
  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Docks].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  const docks : Set<string> = new Set();
  parser.on('readable', async () => {
    let record;
    while ((record = parser.read()) !== null) {
      docks.add(record.end_station_name);
      docks.add(record.start_station_name);
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
      data: [...docks].map(dock => (({ name: dock }))),
      skipDuplicates: true,
    });
  });
}

async function seedDays(
  dateStr: string,
  file: string,
  length: number
) {
  const docks = await prisma.dock.findMany({});
  const dockMap: { [index: string]: number } = {};
  docks.forEach(dock => {
    dockMap[dock.name] = dock.id;
  });

  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Trips].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  const processedData : {
    [index: string]: { // dockId
      [index: string]: { // yyyy-mm-dd formatted date
        acoustic: number,
        electric: number,
      },
    },
  } = {} ;

  // Iterate over one entire file
  parser.on('readable', async function(){
    let record;

    while ((record = parser.read()) !== null) {
      const dateStr = record.started_at.split(' ')[0];
      const electric = record.rideable_type === 'electric_bike';

      [record.start_station_name, record.end_station_name].forEach(stationName => {
        // Sometimes there's bad data in the CSVs and one or both sides of a trip
        // will be missing a dock name. In that case, we will still record the
        // side of the trip that we know, but we'll drop the other one since we
        // don't have a dock with which to associate that end.
        //
        if (stationName !== '') {
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
              processedData[dockId] = {[dateStr]: { electric: 1, acoustic: 0}};
            } else {
              processedData[dockId] = {[dateStr]: { electric: 1, acoustic: 0}};
            }
          }
        }
      });

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    Object.keys(processedData).forEach(async dockId => {
      const dockData = processedData[dockId];
      const dates: string[] = Object.keys(dockData);

      const rows = dates.map((date: string) => ({
        acoustic: dockData[date].acoustic,
        day: parseInt(date.slice(8,10)),
        dockId: parseInt(dockId),
        electric: dockData[date].electric,
        month: parseInt(date.slice(5,7)),
        year: parseInt(date.slice(0,4)),
      }));

      await prisma.dockDay.createMany({
        data: rows,
      });
    });
  });
}

exec(`wc -l ${TMP_DIR}/*`, (error, stdout) => {
  const lines = stdout.split('\n').map(l => l.trim().split(' ')).filter(l => {
    return (l.length === 2 && l[1] !== 'total');
  });

  const files: { [index: string]: number } = {};
  lines.forEach(line => files[line[1]] = parseInt(line[0]));

  // processFiles(oneFile)
  processFiles(files)
  .then(async () => {
    console.log('disconnecting');
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    if (ENV === 'production') {
      exec(`rm -rf ${TMP_DIR}`);
    }
  });
});
