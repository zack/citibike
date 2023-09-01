"use server";

import prisma from "@/prisma/db";

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

export async function getFactIdsOfFalseGuessesForPlayer(playerId: PlayerId) {
  const facts = await prisma.guess.findMany({
    where: {
      playerId,
      guess: false,
    },
    select: {
      factId: true,
    },
  });

  return facts.map(f => f.factId);
}

export async function submitGuesses(playerId: PlayerId, guesses: { factId: FactId, guess: boolean }[]) {
  await clearGuesses(playerId);

  const guessObjects = guesses.map((guess) => ({
    factId: guess.factId,
    playerId,
    guess: guess.guess,
  }));

  const ret = await prisma.guess.createMany({ data: guessObjects });
  return ret;
}

export async function clearGuesses(playerId: PlayerId) {
  const ret = await prisma.guess.deleteMany({
    where: { playerId }
  });

  return ret;
}
