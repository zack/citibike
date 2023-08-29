"use server";

import prisma from "@/lib/db";

export async function createPlayer(name: string) {
  const ret = await prisma.player.create({
    data: { name },
  });

  return ret;
}

export async function getPlayers() {
  const players = await prisma.player.findMany();
  return players;
}

export async function deletePlayer(id: number) {
  const ret = await prisma.player.delete({
    where: { id },
  });

  return ret;
}
