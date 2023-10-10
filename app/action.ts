"use server";

import prisma from "@/prisma/db";

export type DockData = {
  countsAsStartDock: { month: number, year: number, count: number }[],
  countsAsEndDock: { month: number, year: number, count: number }[],
};

export async function getDockData(dockId: number) {
  const queryResultAsStartDock = await prisma.trip.groupBy({
    where: {
      startDockId: dockId,
    },
    by: ['month', 'year'],
    _count: {
      month: true,
    },
  });

  const queryResultAsEndDock = await prisma.trip.groupBy({
    where: {
      endDockId: dockId,
    },
    by: ['month', 'year'],
    _count: {
      month: true,
    },
  });

  const countsAsStartDock = queryResultAsStartDock.map(r => ({
    count: r._count.month,
    month: r.month,
    year: r.year,
  }));

  const countsAsEndDock = queryResultAsEndDock.map(r => ({
    count: r._count.month,
    month: r.month,
    year: r.year,
  }));

  return { countsAsStartDock, countsAsEndDock };
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}
