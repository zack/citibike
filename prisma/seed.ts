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
  for (const file of Object.keys(files)) {
    const dateMatch = /\d{6}/.exec(file);
    if (dateMatch === null) {
      throw Error('Filename malformed.');
    }
    const date = dateMatch[0];
    const year= date.slice(0,4);
    const month = date.slice(4,6);
    const dateStr = `${year}-${month}`;

    await seedDocks(file, dateStr, files[file]).then(async (docks) => {
      const dockMap: { [index: string]: number } = {};
      docks.forEach(dock => {
        dockMap[dock.name] = dock.id;
      });

      await seedTrips(dateStr, file, dockMap, files[file]);
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

async function seedTrips(dateStr: string, file: string, docks: { [index:string]: number }, length: number) {
  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, trim: true }));

  const pendingTrips : {
    day: number,
    endDockId: number,
    month: number,
    startDockId: number,
    year: number,
  }[] = [];

  const batchSize = 3000;
  let current = 0;

  const progressBar = new ProgressBar({
    schema: `[${dateStr}][Trips].bold[:bar.gradient(${randomColor()},${randomColor()})][:percent].bold`,
    total: length,
  });

  parser.on('readable', async function(){
    let record;
    while ((record = parser.read()) !== null) {
      current++;
      const startedAt = new Date(record.started_at);
      pendingTrips.push({
        day: startedAt.getDate(),
        endDockId: docks[record.end_station_name],
        month: startedAt.getMonth(),
        startDockId: docks[record.start_station_name],
        year: startedAt.getFullYear(),
      });

      if (pendingTrips.length >= batchSize || current === length) {
        const data = pendingTrips.splice(0,999);
        await prisma.trip.createMany({
          data,
        });
        progressBar.tick(data.length);
      }
    }
  });

  await finished(parser);
}

exec('wc -l ./prisma/seeds/*', (error, stdout) => {
  const lines = stdout.split('\n').map(l => l.trim().split(' ')).filter(l => {
    return (l.length === 2 && l[1] !== 'total');
  });

  const files: { [index: string]: number } = {};
  lines.forEach(line => files[line[1]] = parseInt(line[0]));

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
