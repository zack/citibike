'use server';

import prisma from '@/prisma/db';

export interface ChartData {
  acoustic: number;
  day: number | undefined;
  electric: number;
  month: number;
  year: number;
}

export interface Timeframe {
  firstDate: Date;
  lastDate: Date;
}

export async function getDockTimeframe(
  dockId: number,
): Promise<Timeframe | undefined> {
  const first = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const last = await prisma.dockDay.findFirst({
    where: { dockId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  if (first && last) {
    const firstDate = new Date(first.year, first.month - 1, first.day);
    const lastDate = new Date(last.year, last.month - 1, last.day);

    return {
      firstDate,
      lastDate,
    };
  } else {
    return undefined;
  }
}

export async function getBoroughTimeframe(
  borough: string,
): Promise<Timeframe | undefined> {
  const first = await prisma.dockDay.findFirst({
    where: { dock: { borough } },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const last = await prisma.dockDay.findFirst({
    where: { dock: { borough } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  if (first && last) {
    const firstDate = new Date(first.year, first.month - 1, first.day);
    const lastDate = new Date(last.year, last.month - 1, last.day);

    return {
      firstDate,
      lastDate,
    };
  } else {
    return undefined;
  }
}

export interface ToplineData {
  trips: {
    acoustic: number;
    electric: number;
  };
  tripsSinceFirstElectric: number;
}

export async function getToplineBoroughData(
  borough: string,
): Promise<ToplineData | undefined> {
  const firstElectric = await prisma.dockDay.findFirst({
    where: {
      electric: { gt: 0 },
      dock: { borough },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.dockDay.aggregate({
    where: { dock: { borough } },
    _sum: { acoustic: true, electric: true },
  });

  const tripsSinceFirstElectric = firstElectric
    ? await prisma.dockDay.aggregate({
        where: {
          dock: { borough },
          OR: [
            { year: { gte: firstElectric.year } },
            {
              AND: [
                { year: { gte: firstElectric.year } },
                { month: { gte: firstElectric.month - 1 } },
              ],
            },
          ],
        },
        _sum: { acoustic: true, electric: true },
      })
    : { _sum: { electric: 0, acoustic: 0 } };

  return {
    trips: {
      acoustic: trips._sum.acoustic ?? 0,
      electric: trips._sum.electric ?? 0,
    },
    tripsSinceFirstElectric:
      (tripsSinceFirstElectric._sum.electric ?? 0)
      + (tripsSinceFirstElectric._sum.acoustic ?? 0),
  };
}

export async function getToplineDockData(
  dockId: number,
): Promise<ToplineData | undefined> {
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
          OR: [
            { year: { gte: firstElectric.year } },
            {
              AND: [
                { year: { gte: firstElectric.year } },
                { month: { gte: firstElectric.month - 1 } },
              ],
            },
          ],
        },
        _sum: { acoustic: true, electric: true },
      })
    : { _sum: { electric: 0, acoustic: 0 } };

  return {
    trips: {
      acoustic: trips._sum.acoustic ?? 0,
      electric: trips._sum.electric ?? 0,
    },
    tripsSinceFirstElectric:
      (tripsSinceFirstElectric._sum.electric ?? 0)
      + (tripsSinceFirstElectric._sum.acoustic ?? 0),
  };
}

export async function getBoroughData(
  borough: string,
  daily: boolean,
  startDate: Date | null,
  endDate: Date | null,
): Promise<ChartData[]> {
  const endMonth = (endDate?.getUTCMonth() ?? 6) + 1; // month is 0-indexed in getUTCMonth
  const endYear = endDate?.getUTCFullYear() || 2023;

  const startMonth = (startDate?.getUTCMonth() ?? 7) + 1; // month is 0-indexed in getUTCMonth
  const startYear = startDate?.getUTCFullYear() || 2022;

  const queryResult = await prisma.dockDay.groupBy({
    where: {
      AND: [
        { dock: { borough } },
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

export async function getDockData(
  dockId: number,
  daily: boolean,
  startDate: Date | null,
  endDate: Date | null,
): Promise<ChartData[]> {
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

export async function getDocks(borough: string) {
  const queryResults = await prisma.dock.findMany({ where: { borough } });
  return queryResults;
}

export async function getMostRecentDateInDatabase() {
  const queryResults = await prisma.dockDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  return {
    year: queryResults?.year || 0,
    month: queryResults?.month || 0,
  };
}
