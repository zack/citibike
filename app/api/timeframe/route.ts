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

export async function GET(
  request: NextRequest,
): Promise<NextResponse<Timeframe | { error: string }>> {
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

  const first = await prisma.stationDay.findFirst({
    where,
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const last = await prisma.stationDay.findFirst({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  if (first && last) {
    const firstDate = new Date(first.year, first.month - 1, first.day);
    const lastDate = new Date(last.year, last.month - 1, last.day);

    return NextResponse.json({
      firstDate,
      lastDate,
    });
  } else {
    return NextResponse.json(
      { error: 'Internal service error' },
      { status: 500 },
    );
  }
}
