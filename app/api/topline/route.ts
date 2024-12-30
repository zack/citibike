import { isBorough } from '../../utils';
import prisma from '@/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export type Borough = 'Bronx' | 'Brooklyn' | 'Manhattan' | 'Queens';

type WhereSpecifier =
  | BoroughSpecifier
  | CommunityDistrictSpecifier
  | CouncilDistrictSpecifier
  | StationSpecifier
  | Record<string, never>;

export interface Timeframe {
  firstDate: Date;
  lastDate: Date;
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

export interface ToplineData {
  trips: {
    acoustic: number;
    electric: number;
  };
  tripsSinceFirstElectric: number;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ToplineData | { error: string }>> {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const specifier = searchParams.get('specifier');

  if (!type || !specifier) {
    return NextResponse.json(
      { error: 'Missing type or specifier' },
      { status: 400 },
    );
  }

  let where: WhereSpecifier = {};

  if (type === 'station') {
    where = { stationId: parseInt(specifier) };
  } else if (type === 'borough' && isBorough(specifier)) {
    where = { station: { borough: specifier } };
  } else if (type === 'community-district') {
    where = { station: { communityDistrict: parseInt(specifier) } };
  } else if (type === 'council-district') {
    where = { station: { councilDistrict: parseInt(specifier) } };
  } else {
    return NextResponse.json(
      { error: 'Invalid type or specifier' },
      { status: 400 },
    );
  }

  const firstElectric = await prisma.stationDay.findFirst({
    where: {
      ...where,
      electric: { gt: 0 },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.stationDay.aggregate({
    where,
    _sum: { acoustic: true, electric: true },
  });

  const tripsSinceFirstElectric = firstElectric
    ? await prisma.stationDay.aggregate({
        where: {
          ...where,
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

  return NextResponse.json({
    trips: {
      acoustic: trips._sum.acoustic ?? 0,
      electric: trips._sum.electric ?? 0,
    },
    tripsSinceFirstElectric:
      (tripsSinceFirstElectric._sum.electric ?? 0)
      + (tripsSinceFirstElectric._sum.acoustic ?? 0),
  });
}
