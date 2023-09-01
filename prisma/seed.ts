import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import { parse } from 'csv-parse';

const FACTS_FILE = 'prisma/seeds/facts.csv';
const GUESSES_FILE = 'prisma/seeds/guesses.csv';
const PLAYERS_FILE = 'prisma/seeds/players.csv';

const prisma = new PrismaClient()

// All of the data for the seeds comes from the first facts party. Please take
// up any quetsions of voracity with the original players. Thanks, players!

async function main() {
  console.log('Clearing database...');
  // Clears everything from the database, as all relevant records necessarily
  // cascade from the player model
  await prisma.player.deleteMany({});

  console.log('Seeding players...');
  fs.readFile(PLAYERS_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      rows.forEach(async ({id, name} : { id: string, name: string }) => {
        await prisma.player.create({
          data: {
            id: parseInt(id, 10),
            name,
          },
        });
      });
    });
  });

  console.log('Seeding facts...');
  fs.readFile(FACTS_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      if (err) { console.log(err); }
      rows.forEach(async ({id, player_id, content, answer} : { id: string, player_id: string, content: string, answer: string }) => {
        await prisma.fact.create({
          data: {
            answer: answer === '1' ? true : false,
            id: parseInt(id, 10),
            playerId: parseInt(player_id, 10),
            content,
          },
        });
      });
    });
  });

  console.log('Seeding guesses...');
  fs.readFile(GUESSES_FILE, (err, fileData) => {
    parse(fileData, { columns: true, trim: true }, (err, rows) => {
      if (err) { console.log(err); }
      rows.forEach(async ({player_id, fact_id, guess} : { player_id: string, fact_id: string, guess: string }) => {
        await prisma.guess.create({
          data: {
            playerId: parseInt(player_id, 10),
            factId: parseInt(fact_id, 10),
            guess: guess === '1' ? true : false,
          },
        });
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
