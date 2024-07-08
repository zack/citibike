'use server';

import prisma from '@/prisma/db';

interface BoroughSpecifier {
  dock: {
    borough: string;
  };
}

interface DockSpecifier {
  dockId: number;
}

interface CommunityDistrictSpecifier {
  dock: {
    communityDistrict: number;
  };
}

interface CouncilDistrictSpecifier {
  dock: {
    councilDistrict: number;
  };
}

type WhereSpecifier =
  | BoroughSpecifier
  | CommunityDistrictSpecifier
  | CouncilDistrictSpecifier
  | DockSpecifier;

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

export async function getTimeframeData(
  specifier: WhereSpecifier,
): Promise<Timeframe | undefined> {
  const first = await prisma.dockDay.findFirst({
    where: specifier,
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const last = await prisma.dockDay.findFirst({
    where: specifier,
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

export async function getToplineData(
  specifier: WhereSpecifier,
): Promise<ToplineData | undefined> {
  const firstElectric = await prisma.dockDay.findFirst({
    where: {
      ...specifier,
      electric: { gt: 0 },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.dockDay.aggregate({
    where: specifier,
    _sum: { acoustic: true, electric: true },
  });

  const tripsSinceFirstElectric = firstElectric
    ? await prisma.dockDay.aggregate({
        where: {
          ...specifier,
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

export async function getChartData(
  specifier: WhereSpecifier,
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
        specifier,
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

// This function is extremely messy because for some reason prisma does not
// correct generate the type for the results where we specified councilDistict
// is not null. This is a known issue.
export async function getCouncilDistricts() {
  interface CouncilDistrictResult {
    councilDistrict: number | null;
    borough: string | null;
  }

  interface ValidCouncilDistrict {
    councilDistrict: number;
    borough: string;
  }

  function isValidCouncilDistrict(
    obj: CouncilDistrictResult,
  ): obj is ValidCouncilDistrict {
    return obj.councilDistrict !== null && obj.borough !== null;
  }

  const queryResults = await prisma.dock.findMany({
    select: { councilDistrict: true, borough: true },
    where: { councilDistrict: { not: null }, borough: { not: null } },
    distinct: ['councilDistrict'],
  });

  // For some reason prisma does not correctly generate the type for the results
  // where we specified councilDistict is not null. This is a known issue.
  // Further, typescript can't figure out the correct type from a simple
  // filter, so we need to use the special filtering function and interfaces
  // from above to get this to work.
  return queryResults
    .filter(isValidCouncilDistrict)
    .sort((a, b) => (a.councilDistrict > b.councilDistrict ? 1 : -1));
}

// This function is extremely messy because for some reason prisma does not
// correct generate the type for the results where we specified communityDistict
// is not null. This is a known issue.
export async function getCommunityDistricts() {
  interface CommunityDistrictResult {
    communityDistrict: number | null;
    borough: string | null;
  }

  interface ValidCommunityDistrict {
    communityDistrict: number;
    borough: string;
  }

  function isValidCommunityDistrict(
    obj: CommunityDistrictResult,
  ): obj is ValidCommunityDistrict {
    return obj.communityDistrict !== null && obj.borough !== null;
  }

  const queryResults = await prisma.dock.findMany({
    select: { communityDistrict: true, borough: true },
    where: { communityDistrict: { not: null }, borough: { not: null } },
    distinct: ['communityDistrict'],
  });

  // For some reason prisma does not correctly generate the type for the results
  // where we specified communityDistict is not null. This is a known issue.
  // Further, typescript can't figure out the correct type from a simple
  // filter, so we need to use the special filtering function and interfaces
  // from above to get this to work.
  return queryResults
    .filter(isValidCommunityDistrict)
    .sort((a, b) => (a.communityDistrict > b.communityDistrict ? 1 : -1));
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
