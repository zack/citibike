import { PrismaClient } from '@prisma/client'
import { ProgressBar } from 'ascii-progress';
import { exec } from 'child_process';
import { finished } from 'stream/promises';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const seededDocks : Set<string> = new Set();

function randomColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

async function processFiles(files: { [index: string]: number }) {
  console.log('Seeding database...');

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

    await seedDocks(file, dateStr, files[file]).then(async (docks) => {
      const dockMap: { [index: string]: number } = {};
      docks.forEach(dock => {
        dockMap[dock.name] = dock.id;
      });

      await seedDays(dateStr, file, dockMap, files[file]);
    });
  }
}

async function seedDocks(file: string, dateStr: string, length: number) {
  const docks : Set<string> = new Set();

  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, trim: true }));

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Docks].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  parser.on('readable', async function(){
    let record;
    while ((record = parser.read()) !== null) {
      if (!seededDocks.has(record.end_station_name)) {
        docks.add(record.end_station_name);
        seededDocks.add(record.end_station_name);
      }

      if (!seededDocks.has(record.start_station_name)) {
        docks.add(record.start_station_name);
        seededDocks.add(record.start_station_name);
      }

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    await prisma.dock.createMany({
      data: [...docks].map(dock => (({ name: dock }))),
    });
  });

  return await prisma.dock.findMany({});
}

async function seedDays(
  dateStr: string,
  file: string,
  docks: { [index:string]: number },
  length: number
) {
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
        ended: number,
        started: number,
      },
    },
  } = {} ;

  // Iterate over one entire file
  parser.on('readable', async function(){
    let record;

    while ((record = parser.read()) !== null) {
      const dateStr = record.started_at.split(' ')[0];

      const startDockId = docks[record.start_station_name];
      const endDockId = docks[record.end_station_name];

      if (processedData[startDockId] && processedData[startDockId][dateStr]) {
        processedData[startDockId][dateStr].started += 1;
      } else if (processedData[startDockId]) {
        processedData[startDockId][dateStr] = { started: 1, ended: 0 };
      } else {
        processedData[startDockId] = {[dateStr]: { started: 1, ended: 0}};
      }

      if (processedData[endDockId] && processedData[endDockId][dateStr]) {
        processedData[endDockId][dateStr].ended += 1;
      } else if (processedData[endDockId]) {
        processedData[endDockId][dateStr] = { started: 0, ended: 1 };
      } else {
        processedData[endDockId] = {[dateStr]: { started: 0, ended: 1 }};
      }

      progressBar.tick();
    }
  });

  await finished(parser).then(async () => {
    Object.keys(processedData).forEach(async dockId => {
      const dockData = processedData[dockId];
      const dates: string[] = Object.keys(dockData);

      const rows = dates.map((date: string) => ({
        day: parseInt(date.slice(8,10)),
        month: parseInt(date.slice(5,7)),
        year: parseInt(date.slice(0,4)),
        dockId: parseInt(dockId),
        started: dockData[date].started,
        ended: dockData[date].ended,
      }));

      await prisma.dockDay.createMany({
        data: rows,
      });
    });
  });
}

exec('wc -l ./prisma/seeds/*', (error, stdout) => {
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
  });
});
