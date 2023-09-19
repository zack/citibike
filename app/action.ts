"use server";

import prisma from "@/prisma/db";

export type DockData = {
  countsAsStartDock: { month: number, count: number }[],
  countsAsEndDock: { month: number, count: number }[],
};

export async function getDockData(dockId: number) {
  const queryResultAsStartDock = await prisma.trip.groupBy({
    where: {
      startDockId: dockId,
    },
    by: ['month'],
    _count: {
      month: true,
    },
  });

  const queryResultAsEndDock = await prisma.trip.groupBy({
    where: {
      endDockId: dockId,
    },
    by: ['month'],
    _count: {
      month: true,
    },
  });

  const countsAsStartDock = queryResultAsStartDock.map(r => ({
    month: r.month,
    count: r._count.month,
  }));

  const countsAsEndDock = queryResultAsEndDock.map(r => ({
    month: r.month,
    count: r._count.month,
  }));

  return { countsAsStartDock, countsAsEndDock };
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}
