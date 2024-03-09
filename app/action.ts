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
  firstDate: Date;
  firstElectricDate: Date | undefined;
  lastDate: Date;
  trips: {
    acoustic: number;
    electric: number;
  };
  tripsSinceFirstElectric: number;
}

export async function getToplineData(
  dockId: number,
): Promise<ToplineData | undefined> {
  const first = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const last = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  const firstElectric = await prisma.dockDay.findFirst({
    where: {
      dockId,
      electric: {
        gt: 0,
      },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.dockDay.aggregate({
    where: { dockId },
    _sum: { acoustic: true, electric: true },
  });

  const tripsSinceFirstElectric = firstElectric
    ? await prisma.dockDay.aggregate({
        where: {
          dockId,
          year: { gte: firstElectric.year },
          month: { gte: firstElectric.month - 1 },
        },
        _sum: { acoustic: true, electric: true },
      })
    : { _sum: { electric: 0, acoustic: 0 } };

  if (first && last && trips) {
    const firstDate = new Date(first.year, first.month - 1, first.day);
    const lastDate = new Date(last.year, last.month - 1, last.day);
    const firstElectricDate = firstElectric
      ? new Date(firstElectric.year, firstElectric.month - 1, firstElectric.day)
      : undefined;

    return {
      firstDate,
      firstElectricDate,
      lastDate,
      trips: {
        acoustic: trips._sum.acoustic ?? 0,
        electric: trips._sum.electric ?? 0,
      },
      tripsSinceFirstElectric:
        (tripsSinceFirstElectric._sum.electric ?? 0) +
        (tripsSinceFirstElectric._sum.acoustic ?? 0),
    };
  } else {
    return undefined;
  }
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
