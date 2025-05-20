import { ToplineData } from '../../types';
import cache from '../../redis';
import { getWhereSpecifier } from '../../utils';
import prisma from '@/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

function JSONIsValid(json: unknown) {
  if (typeof json !== 'object' || json === null) {
    return false;
  }

  const obj = json as Record<string, unknown>;

  const keys = Object.keys(obj);
  if (
    keys.length !== 2
    || !keys.includes('trips')
    || !keys.includes('tripsSinceFirstElectric')
  ) {
    return false;
  }

  if (
    typeof obj.trips !== 'object'
    || typeof obj.tripsSinceFirstElectric !== 'number'
  ) {
    return false;
  }

  const innerObj = obj.trips as Record<string, unknown>;
  const innerKeys = Object.keys(innerObj);
  if (
    innerKeys.length !== 2
    || !innerKeys.includes('acoustic')
    || !innerKeys.includes('electric')
  ) {
    return false;
  }

  return (
    typeof innerObj.acoustic === 'number'
    && typeof innerObj.electric === 'number'
  );
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ToplineData | { error: string }>> {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const specifier = searchParams.get('specifier');
  const cacheKey = `topline:${type}:${specifier}`;

  const cacheResult = await cache.get(cacheKey);

  if (cacheResult) {
    try {
      const cacheJSON = JSON.parse(cacheResult);
      if (JSONIsValid(cacheJSON)) {
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
    // error
    return where;
  }

  const firstElectric = await prisma.stationDay.findFirst({
    where: {
      ...where,
      OR: [
        { electricArrive: { gt: 0 }},
        { electricDepart: { gt: 0 }},
      ],
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { day: 'asc' }],
  });

  const trips = await prisma.stationDay.aggregate({
    where,
    _sum: { acousticArrive: true, acousticDepart: true, electricArrive: true, electricDepart: true },
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
      _sum: { acousticArrive: true, acousticDepart: true, electricArrive: true, electricDepart: true },
      })
    : { _sum: { electricArrive: 0, electricDepart: 0, acousticArrive: 0, acousticDepart: 0 } };

  const json = {
    trips: {
      acoustic: (trips._sum.acousticArrive ?? 0) + (trips._sum.acousticDepart ?? 0),
      electric: (trips._sum.electricArrive ?? 0) + (trips._sum.electricDepart ?? 0),
    },
    tripsSinceFirstElectric:
      (tripsSinceFirstElectric._sum.electricArrive ?? 0)
      + (tripsSinceFirstElectric._sum.acousticArrive ?? 0)
      + (tripsSinceFirstElectric._sum.acousticDepart ?? 0)
      + (tripsSinceFirstElectric._sum.electricDepart ?? 0),
  };

  cache.set(cacheKey, JSON.stringify(json));
  return NextResponse.json(json);
}
