import { Timeframe } from '../../types';
import { getWhereSpecifier } from '../../utils';
import prisma from '@/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<Timeframe | { error: string }>> {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const specifier = searchParams.get('specifier');

  const where = getWhereSpecifier(type, specifier);
  if (where instanceof NextResponse) {
    // error
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
