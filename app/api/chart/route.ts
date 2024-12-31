import { isBorough } from '../../utils';
import prisma from '@/prisma/db';
import { ChartData, WhereSpecifier } from '../../types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ChartData[] | { error: string }>> {
  const searchParams = request.nextUrl.searchParams;
  const daily = searchParams.get('daily') ?? '';
  const endDate = new Date(searchParams.get('end') ?? '');
  const specifier = searchParams.get('specifier') ?? '';
  const startDate = new Date(searchParams.get('start') ?? '');
  const type = searchParams.get('type');

  if (daily !== 'true' && daily !== 'false') {
    return NextResponse.json(
      { error: 'Specify daily parameter' },
      { status: 400 },
    );
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date or dates' },
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

  const endMonth = (endDate?.getUTCMonth() ?? 6) + 1; // month is 0-indexed in getUTCMonth
  const endYear = endDate?.getUTCFullYear() || 2023;

  const startMonth = (startDate?.getUTCMonth() ?? 7) + 1; // month is 0-indexed in getUTCMonth
  const startYear = startDate?.getUTCFullYear() || 2022;

  const queryResult = await prisma.stationDay.groupBy({
    where: {
      AND: [
        where,
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
    by: daily === 'true' ? ['month', 'year', 'day'] : ['month', 'year'],
    _sum: {
      acoustic: true,
      electric: true,
    },
  });

  return NextResponse.json(
    queryResult.map((r) => ({
      acoustic: r._sum.acoustic || 0,
      day: r.day,
      electric: r._sum.electric || 0,
      month: r.month,
      year: r.year,
    })),
  );
}
