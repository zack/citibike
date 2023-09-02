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

export async function createBonusPoints(playerId: PlayerId, reason: BonusPointReason, points: BonusPointPoints) {
  const ret = await prisma.bonusPoint.create({
    data: {
      playerId,
      reason,
      points,
    },
  });

  return ret;
}

export async function getBonusPoints() {
  const bonusPoints = await prisma.bonusPoint.findMany({
    orderBy: {
      player: {
        name: 'asc',
      },
    },
    include: {
      player: {
        select: {
          name: true,
        },
      },
    },
  });

  return bonusPoints;
}
