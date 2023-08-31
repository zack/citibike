import { LoremIpsum } from "lorem-ipsum";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const lorem = new LoremIpsum({
  wordsPerSentence: {
    min: 10,
    max: 20
  },
});

function pickNRandomElements(array: number[], n: number) {
  const localArray = [...array];
  if (n >= array.length) {
    return array;
  }

  const picked = new Set();

  while (picked.size < n) {
    const randInt = Math.floor(Math.random() * (n-1));
    localArray.splice(randInt, 1);
    picked.add(localArray[randInt]);
  }

  return Array.from(picked);
}

async function main() {
  console.log('Clearing database...');
  // Clears everything from the database, as all relevant records necessarily
  // cascade from the player model
  await prisma.player.deleteMany({});

  const players = [ "Bashful", "Doc", "Dopey", "Grumpy", "Happy", "Sleepy", "Sneezy" ];

  // We will collect these as we create them to use later to seed guesses
  const factIds: number[] = [];
  const playerIds: number[] = [];

  console.log('Creating players...');
  const playerPromises = players.map((name) => {
    return prisma.player.create({
      data: {
        name,
        facts: {
          create: [
            { content: lorem.generateSentences(1), real: true },
            { content: lorem.generateSentences(1), real: true },
            { content: lorem.generateSentences(1), real: false },
          ],
        }
      },
      include: { facts: true },
    }).then(ret => {
      // Add the newly created fact ids to our array
      factIds.push(...ret.facts.map(f => f.id));
      playerIds.push(ret.id);
      return ret;
    }).then(ret => {
      // Let the user know what's going on
      console.log(`  ...created ${ret.name}`);
    });
  });

  await Promise.all(playerPromises);

  console.log('Creating guesses...');
  const guessPromises = playerIds.map((playerId) => {
    const falseGuesses = pickNRandomElements(factIds, factIds.length / 3);

    return prisma.guess.createMany({
      data: factIds.map(factId => ({
        factId,
        playerId,
        real: !falseGuesses.includes(factId),
      })),
    });
  });

  await Promise.all(guessPromises);
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
