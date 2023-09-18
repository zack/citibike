import { PrismaClient } from '@prisma/client'
import { ProgressBar } from 'ascii-progress';
import fs from 'fs';
import { parse } from 'csv-parse';
import { finished } from 'stream/promises';

const SEED_FILE = 'prisma/seeds/seeds.csv';
const DATA_LENGTH = 15520;

const prisma = new PrismaClient()

function randomColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

async function main() {
  console.log('Clearing database...');
  await prisma.trip.deleteMany({});
  await prisma.dock.deleteMany({});

  console.log('Seeding database...');
  const docks : Set<string> = new Set();
  await seedTrips(docks);
  await seedDocks(docks);
}

async function seedTrips(docks: Set<string>) {
  console.log('Seeding trips...');
  const parser = fs
    .createReadStream(SEED_FILE)
    .pipe(parse({ columns: true, trim: true }));

  const pendingTrips : { startDockName: string, endDockName: string, startedAt: Date, endedAt: Date }[] = [];
  const batchSize = 100;
  let current = 0;

  const progressBar = new ProgressBar({
    schema: `[Trips].bold[:bar.gradient(${randomColor()},${randomColor()})][:current/:total][:percent].bold`,
    total: DATA_LENGTH,
  });

  parser.on('readable', async function(){
    let record;
    while ((record = parser.read()) !== null) {
      current++;
      pendingTrips.push({
        endDockName: record.end_station_name,
        endedAt: new Date(record.ended_at),
        startDockName: record.start_station_name,
        startedAt: new Date(record.started_at),
      });

      docks.add(record.end_station_name);
      docks.add(record.start_station_name);

      if (pendingTrips.length >= batchSize || current === DATA_LENGTH) {
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

async function seedDocks(docks: Set<string>) {
  console.log('seeding docks');
  await prisma.dock.createMany({
    data: [...docks].map(name => ({ name })),
  });
}

main()
.then(async () => {
  console.log('disconnecting');
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
});
