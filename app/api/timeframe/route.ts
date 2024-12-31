import { Timeframe } from '../../types';
import cache from '../../redis';
import prisma from '@/prisma/db';
import { NextRequest, NextResponse } from 'next/server';
import { getWhereSpecifier, isTimeframe } from '../../utils';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<Timeframe | { error: string }>> {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const specifier = searchParams.get('specifier');
  const cacheKey = `timeframe:${type}:${specifier}`;

  const cacheResult = await cache.get(cacheKey);

  if (cacheResult) {
    try {
      const cacheJSON = JSON.parse(cacheResult);
      Object.keys(cacheJSON).forEach((key) => {
        cacheJSON[key] = new Date(cacheJSON[key]);
      });

      if (isTimeframe(cacheJSON)) {
        return NextResponse.json(cacheJSON);
      } else {
        cache.del(cacheKey);
      }
    } catch {
      cache.del(cacheKey);
    }
  }

  const where = getWhereSpecifier(type, specifier);
  if (where instanceof NextResponse) {
    // getWhereSpecifier returned an error, just pass it up.
    return where;
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

    const result = { firstDate, lastDate };
    cache.set(cacheKey, JSON.stringify(result));
    return NextResponse.json(result);
  } else {
    return NextResponse.json(
      { error: 'Internal service error' },
      { status: 500 },
    );
  }
}
