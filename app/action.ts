"use server";

import prisma from "@/prisma/db";

export type DockData = {
  countsAsStartDock: { day: number|undefined, month: number, year: number, count: number }[],
  countsAsEndDock: { day: number|undefined, month: number, year: number, count: number }[],
};

export async function getDockData(dockId: number, daily: boolean, startDate: Date | null, endDate: Date | null) {
  const endMonth = endDate?.getUTCMonth() ?? 6; // returns a 0-indexed month
  const endYear = endDate?.getUTCFullYear() || 2023;
  const startMonth = startDate?.getUTCMonth() ?? 7; // returns a 0-indexed month
  const startYear = startDate?.getUTCFullYear() || 2022;

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
      by: (daily ? ['month', 'year', 'day'] : ['month', 'year']),
      _count: {
        month: true,
        day: true,
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
      by: (daily ? ['month', 'year', 'day'] : ['month', 'year']),
      _count: {
        month: true, // also works for daily. i should figure out what's happening here.
      },
  });

  const countsAsStartDock = queryResultAsStartDock.map(r => ({
    count: r._count.month,
    day: r.day, // undefined with monthly granularity
    month: r.month + 1, // months are currently 0-indexed in the db
    year: r.year,
  }));

  const countsAsEndDock = queryResultAsEndDock.map(r => ({
    count: r._count.month,
    day: r.day, // undefined with monthly granularity
    month: r.month + 1, // months are currently 0-indexed in the db
    year: r.year,
  }));

  return { countsAsStartDock, countsAsEndDock };
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}
