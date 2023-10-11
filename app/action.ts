"use server";

import prisma from "@/prisma/db";

export type DockData = {
  countsAsStartDock: { month: number, year: number, count: number }[],
  countsAsEndDock: { month: number, year: number, count: number }[],
};

export async function getDockData(dockId: number, startDate: Date | null, endDate: Date | null) {
  const endMonth = endDate?.getUTCMonth() ?? 6; // returns a 0-indexed month
  const endYear = endDate?.getUTCFullYear() || 2023;
  const startMonth = startDate?.getUTCMonth() ?? 7; // returns a 0-indexed month
  const startYear = startDate?.getUTCFullYear() || 2022;

  console.log({ endMonth, endYear, startMonth, startYear });

  const queryResultAsStartDock = await prisma.trip.groupBy({
    where: {
      AND: [
        { startDockId: dockId },
        { OR: [
          { year: { gt: startYear }},
          { AND: [
            { year: { gte: startYear }},
            { month: { gte: startMonth }},
          ]},
        ]},
        { OR: [
          { year: { lt: endYear }},
          { AND: [
            { year: { lte: endYear }},
            { month: { lte: endMonth }},
          ]},
        ]},
      ]},
      by: ['month', 'year'],
      _count: {
        month: true,
      },
  });

  const queryResultAsEndDock = await prisma.trip.groupBy({
    where: {
      AND: [
        { endDockId: dockId },
        { OR: [
          { year: { gt: startYear }},
          { AND: [
            { year: { gte: startYear }},
            { month: { gte: startMonth }},
          ]},
        ]},
        { OR: [
          { year: { lt: endYear }},
          { AND: [
            { year: { lte: endYear }},
            { month: { lte: endMonth }},
          ]},
        ]},
      ]},
      by: ['month', 'year'],
      _count: {
        month: true,
      },
  });

  const countsAsStartDock = queryResultAsStartDock.map(r => ({
    count: r._count.month,
    month: r.month + 1, // months are currently 0-indexed in the db
    year: r.year,
  }));

  const countsAsEndDock = queryResultAsEndDock.map(r => ({
    count: r._count.month,
    month: r.month + 1, // months are currently 0-indexed in the db
    year: r.year,
  }));

  return { countsAsStartDock, countsAsEndDock };
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}
