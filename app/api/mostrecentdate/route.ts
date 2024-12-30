import { NextResponse } from 'next/server';
import prisma from '@/prisma/db';

export async function GET() {
  const queryResults = await prisma.stationDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  return NextResponse.json({
    year: queryResults?.year || 0,
    month: queryResults?.month || 0,
  });
}
