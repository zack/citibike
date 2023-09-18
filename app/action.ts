"use server";

import prisma from "@/prisma/db";

export async function getDockData(dockName: string) {
  console.log('called');
  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { startDockName: dockName },
        { endDockName: dockName },
      ],
    },
    select: {
      startedAt: true,
      startDockName: true,
    },
  });

  const cleanedTrips = trips.map(trip => ({
    startedAt: trip.startedAt,
    isStartDock: trip.startDockName === dockName,
  }));

  return cleanedTrips;
}

export async function getDocks() {
  const docks = await prisma.dock.findMany({});
  return docks.map(({name}) => name).sort((a,b) => a > b ? 1 : -1);
}
