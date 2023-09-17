"use server";

import prisma from "@/prisma/db";

export async function getDockTrips(startDockId: Dock['id']) {
  const tripCount = await prisma.trip.count({
    where: {
      startDockId,
    },
  });

  return tripCount;
}

export async function getDocks() {
  const docks = await prisma.dock.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return docks;
}
