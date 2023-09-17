import { PrismaClient } from '@prisma/client'
import { ProgressBar } from 'ascii-progress';
import fs from 'fs';
import { parse } from 'csv-parse';

const SEED_FILE = 'prisma/seeds/seeds.csv';

const prisma = new PrismaClient()

function randomColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function createProgressBarSchema(title: string) {
  const paddedTitle = `${title}`.padEnd(7, ' ');
  return(
    `[${paddedTitle}].bold:bar.gradient(${randomColor()},${randomColor()})[:current/:total].bold`
  );
}

async function main() {
  console.log('Clearing database...');
  await prisma.trip.deleteMany({});
  await prisma.dock.deleteMany({});

  console.log('Seeding database...');
  fs.readFile(SEED_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      const progressBar = new ProgressBar({
        schema: createProgressBarSchema('Trips'),
        total: rows.length,
      });

      rows.forEach(async ({
        end_station_name,
        ended_at,
        start_station_name,
        started_at,
      } : {
        [index: string]: string
      }) => {
        let success = false;

        while (!success) {
          // connectOrCreate in an async loop can error out due to race
          // conditions, so we need to keep retrying it until it passes.
          success = true;

          try {
            await prisma.trip.create({
              data: {
                startedAt: new Date(started_at),
                endedAt: new Date(ended_at),
                startDock: {
                  connectOrCreate: {
                    where: {
                      name: start_station_name
                    },
                    create: {
                      name: start_station_name,
                    },
                  },
                },
                endDock: {
                  connectOrCreate: {
                    where: {
                      name: end_station_name
                    },
                    create: {
                      name: end_station_name,
                    },
                  },
                },
              },
            })
          } catch (e) {
            success = false;
          }
        }

        progressBar.tick();
      });
    });
  });

}

main()
.then(async () => {
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
