'use server';

import { isBorough } from './utils';
import prisma from '@/prisma/db';

export type Borough = 'Bronx' | 'Brooklyn' | 'Manhattan' | 'Queens';

export interface Station {
  borough: Borough;
  id: number;
  name: string;
}

export interface Stations {
  Bronx: Station[];
  Brooklyn: Station[];
  Manhattan: Station[];
  Queens: Station[];
}

export interface CommunityDistrict {
  communityDistrict: number;
  borough: Borough;
}

export interface CouncilDistrict {
  councilDistrict: number;
  borough: Borough;
}

interface BoroughSpecifier {
  station: {
    borough: Borough;
  };
}

interface StationSpecifier {
  stationId: number;
}

interface CommunityDistrictSpecifier {
  station: {
    communityDistrict: number;
  };
}

interface CouncilDistrictSpecifier {
  station: {
    councilDistrict: number;
  };
}

type WhereSpecifier =
  | BoroughSpecifier
  | CommunityDistrictSpecifier
  | CouncilDistrictSpecifier
  | StationSpecifier;

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
  const firstElectric = await prisma.stationDay.findFirst({
    where: {
      ...specifier,
      electric: { gt: 0 },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.stationDay.aggregate({
    where: specifier,
    _sum: { acoustic: true, electric: true },
  });

  const tripsSinceFirstElectric = firstElectric
    ? await prisma.stationDay.aggregate({
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

  const queryResult = await prisma.stationDay.groupBy({
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

export async function getStations(): Promise<Stations> {
  const stations: Stations = {
    Bronx: [],
    Brooklyn: [],
    Manhattan: [],
    Queens: [],
  };

  interface StationResult {
    name: string;
    borough: string | null;
    id: number;
  }

  function isValidStation(obj: StationResult): obj is Station {
    return obj.borough !== null && isBorough(obj.borough);
  }

  const queryResults = await prisma.station.findMany({
    where: { NOT: { borough: null } },
    select: { id: true, name: true, borough: true },
  });

  const validStations = queryResults.filter(isValidStation);

  validStations.forEach((station) => {
    stations[station.borough].push(station);
  });

  return stations;
}

// This function is extremely messy because for some reason prisma does not
// correct generate the type for the results where we specified councilDistict
// is not null. This is a known issue.
export async function getCouncilDistricts() {
  interface CouncilDistrictResult {
    councilDistrict: number | null;
    borough: string | null;
  }

  function isValidCouncilDistrict(
    obj: CouncilDistrictResult,
  ): obj is CouncilDistrict {
    return obj.councilDistrict !== null && obj.borough !== null;
  }

  const queryResults = await prisma.station.findMany({
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

  function isValidCommunityDistrict(
    obj: CommunityDistrictResult,
  ): obj is CommunityDistrict {
    return obj.communityDistrict !== null && obj.borough !== null;
  }

  const queryResults = await prisma.station.findMany({
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
