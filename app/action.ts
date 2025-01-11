'use server';

import { isBorough } from './utils';
import prisma from '@/prisma/db';
import { CommunityDistrict, CouncilDistrict, Station, Stations } from './types';

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

  // All of the filtering is to convince typescript that this is safe
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
