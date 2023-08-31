"use server";

import prisma from "@/lib/db";

export async function getPlayers() {
  const players = await prisma.player.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return players;
}

export async function getFinishedPlayers() {
  const finishedPlayers = await prisma.guess.groupBy({
    by: ['playerId'],
  });

  return finishedPlayers.map(p => p.playerId);
}

export async function getFacts() {
  const facts = await prisma.fact.findMany({
    orderBy: {
      content: 'asc',
    },
  });

  return facts;
}

export async function getFactIdsOfFalseGuessesForPlayer(playerId) {
  const facts = await prisma.guess.findMany({
    where: {
      playerId,
      real: false,
    },
    select: {
      factId: true,
    },
  });

  console.log({ facts });

  return facts.map(f => f.factId);
}

export async function submitGuesses(playerId, guesses) {
  console.log('submitGuesses');
  await clearGuesses(playerId);

  const guessObjects = guesses.map((guess) => ({
    factId: guess.factId,
    playerId,
    real: guess.real,
  }));

  console.log({ guessObjects });

  const ret = await prisma.guess.createMany({ data: guessObjects });
  return ret;
}

export async function clearGuesses(playerId) {
  const ret = await prisma.guess.deleteMany({
    where: { playerId }
  });

  return ret;
}
