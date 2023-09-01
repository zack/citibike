import { PrismaClient } from '@prisma/client'
import { ProgressBar } from 'ascii-progress';
import fs from 'fs';
import { parse } from 'csv-parse';

const FACTS_FILE = 'prisma/seeds/facts.csv';
const GUESSES_FILE = 'prisma/seeds/guesses.csv';
const PLAYERS_FILE = 'prisma/seeds/players.csv';

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


// All of the data for the seeds comes from the first facts party. Please take
// up any quetsions of voracity with the original players. Thanks, players!

async function main() {
  console.log('Clearing database...');
  // It isn't usually necessary to delete all of the models independently, but
  // sometimes if things get in a weird state while testing it might be. The
  // order here is important too, as it's in reverse-dependent order.
  await prisma.guess.deleteMany({});
  await prisma.fact.deleteMany({});
  await prisma.player.deleteMany({});

  console.log('Seeding database...');
  fs.readFile(PLAYERS_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      const progressBar = new ProgressBar({
        schema: createProgressBarSchema('Players'),
        total: rows.length,
      });

      rows.forEach(async ({id, name} : { id: string, name: string }) => {
        await prisma.player.create({
          data: {
            id: parseInt(id, 10),
            name,
          },
        });

        progressBar.tick();
      });
    });
  });

  fs.readFile(FACTS_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      const progressBar = new ProgressBar({
        schema: createProgressBarSchema('Facts'),
        total: rows.length,
      });

      rows.forEach(async ({id, player_id, content, answer} : { id: string, player_id: string, content: string, answer: string }) => {
        await prisma.fact.create({
          data: {
            answer: answer === '1' ? true : false,
            id: parseInt(id, 10),
            playerId: parseInt(player_id, 10),
            content,
          },
        });

        progressBar.tick();
      });
    });
  });

  fs.readFile(GUESSES_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      const progressBar = new ProgressBar({
        schema: createProgressBarSchema('Guesses'),
        total: rows.length,
      });

      rows.forEach(async ({player_id, fact_id, guess} : { player_id: string, fact_id: string, guess: string }) => {
        await prisma.guess.create({
          data: {
            playerId: parseInt(player_id, 10),
            factId: parseInt(fact_id, 10),
            guess: guess === '1' ? true : false,
          },
        });

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
