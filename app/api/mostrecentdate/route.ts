import { NextResponse } from 'next/server';
import cache from '../../redis';
import prisma from '@/prisma/db';

function JSONIsValid(json: unknown) {
  if (typeof json !== 'object' || json === null) {
    return false;
  }

  const obj = json as Record<string, number>;

  const keys = Object.keys(obj);
  if (keys.length !== 2 || !keys.includes('year') || !keys.includes('month')) {
    return false;
  }

  return typeof obj.year === 'number' && typeof obj.month === 'number';
}

export async function GET() {
  const cacheKey = 'mostrecentdate';
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

  const queryResults = await prisma.stationDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  const json = {
    year: queryResults?.year || 0,
    month: queryResults?.month || 0,
  };

  cache.set(cacheKey, JSON.stringify(json));
  return NextResponse.json(json);
}
