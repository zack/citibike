"use server";

import prisma from "@/prisma/db";

export async function createPlayer(name: string) {
  const ret = await prisma.player.create({
    data: {
      name,
      facts: {
        create: [
          { content: '', answer: true },
          { content: '', answer: true },
          { content: '', answer: false },
        ],
      }
    },
    include: { facts: true },
  });

  return ret;
}

export async function getPlayers() {
  const players = await prisma.player.findMany({
    include: {
      facts: true,
    },
  });

  return players;
}

export async function deletePlayer(id: number) {
  const ret = await prisma.player.delete({
    where: { id },
    include: {
      facts: true,
    },
  });

  return ret;
}

export async function updateFactContent(id: number, content: string) {
  const ret = await prisma.fact.update({
    where: { id },
    data: { content },
  });

  return ret;
}
