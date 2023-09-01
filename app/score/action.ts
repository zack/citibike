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

export async function getFacts() {
  const facts = await prisma.fact.findMany({
    orderBy: {
      content: 'asc',
    },
  });

  return facts;
}

export async function getGuesses() {
  const guesses = await prisma.guess.findMany({});

  return guesses;
}
