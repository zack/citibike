"use server";

import prisma from "@/prisma/db";

export type DockData = {
  day: number|undefined,
  ended: number,
  month: number,
  started: number,
  year: number,
}[];

export async function getDockData(
  dockId: number, daily: boolean, startDate: Date | null, endDate: Date | null
) : Promise<DockData> {
  const endMonth = (endDate?.getUTCMonth() ?? 6) + 1; // month is 0-indexed in getUTCMonth
  const endYear = endDate?.getUTCFullYear() || 2023;

  const startMonth = (startDate?.getUTCMonth() ?? 7) + 1; // month is 0-indexed in getUTCMonth
  const startYear = startDate?.getUTCFullYear() || 2022;

  const queryResult = await prisma.dockDay.groupBy({
    where: {
      AND: [
        { dockId },
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
      _sum: {
        started: true,
        ended: true,
      },
  });

  return queryResult.map(r => ({
    day: r.day,
    ended: r._sum.ended || 0,
    month: r.month,
    started: r._sum.started || 0,
    year: r.year,
  }));
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}

export async function getDateBounds() {
  const end = await prisma.dockDay.findFirst({orderBy: [ { year: 'desc' }, { month: 'desc' }, { day: 'desc' } ] });
  const start = await prisma.dockDay.findFirst({orderBy: [ { year: 'asc' }, { month: 'asc' }, { day: 'asc' } ] });

  if (end === null || start === null) {
    throw 'something went wrong';
  }

  const maxDate = new Date(`${end.year}-${end.month}-${end.day}`);
  const minDate = new Date(`${start.year}-${start.month}-${start.day}`);

  return({
    maxDate,
    minDate,
  });
}
