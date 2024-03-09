'use server';

import prisma from '@/prisma/db';

export type DockData = {
  acoustic: number;
  day: number | undefined;
  electric: number;
  month: number;
  year: number;
}[];

export interface ToplineData {
  firstDate: Date | undefined;
  lastDate: Date | undefined;
  trips: number;
}

export async function getToplineData(dockId: number): Promise<ToplineData> {
  const first = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });
  const firstDate = first
    ? new Date(first.year, first.month - 1, first.day)
    : undefined;

  const last = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });
  const lastDate = last
    ? new Date(last.year, last.month - 1, last.day)
    : undefined;

  const trips = await prisma.dockDay.aggregate({
    where: { dockId },
    _sum: { acoustic: true, electric: true },
  });

  return {
    firstDate,
    lastDate,
    trips: (trips._sum.acoustic ?? 0) + (trips._sum.electric ?? 0),
  };
}

export async function getDockData(
  dockId: number,
  daily: boolean,
  startDate: Date | null,
  endDate: Date | null,
): Promise<DockData> {
  const endMonth = (endDate?.getUTCMonth() ?? 6) + 1; // month is 0-indexed in getUTCMonth
  const endYear = endDate?.getUTCFullYear() || 2023;

  const startMonth = (startDate?.getUTCMonth() ?? 7) + 1; // month is 0-indexed in getUTCMonth
  const startYear = startDate?.getUTCFullYear() || 2022;

  const queryResult = await prisma.dockDay.groupBy({
    where: {
      AND: [
        { dockId },
        {
          OR: [
            { year: { gt: startYear } },
            {
              AND: [
                { year: { gte: startYear } },
                { month: { gte: startMonth } },
              ],
            },
          ],
        },
        {
          OR: [
            { year: { lt: endYear } },
            { AND: [{ year: { lte: endYear } }, { month: { lte: endMonth } }] },
          ],
        },
      ],
    },
    by: daily ? ['month', 'year', 'day'] : ['month', 'year'],
    _sum: {
      acoustic: true,
      electric: true,
    },
  });

  return queryResult.map((r) => ({
    acoustic: r._sum.acoustic || 0,
    day: r.day,
    electric: r._sum.electric || 0,
    month: r.month,
    year: r.year,
  }));
}

export async function getDocks() {
  const queryResults = await prisma.dock.findMany({});
  return queryResults;
}

export async function getDateBounds() {
  const end = await prisma.dockDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });
  const start = await prisma.dockDay.findFirst({
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  if (end === null || start === null) {
    throw 'something went wrong';
  }

  const maxDate = new Date(`${end.year}-${end.month}-${end.day}`);
  const minDate = new Date(`${start.year}-${start.month}-${start.day}`);

  return {
    maxDate,
    minDate,
  };
}
