import { NextResponse } from 'next/server';
import { Borough, Timeframe, WhereSpecifier } from './types';

export function isBorough(value: string): value is Borough {
  return ['Bronx', 'Brooklyn', 'Manhattan', 'Queens'].includes(
    value as Borough,
  );
}

export function isTimeframe(input: unknown): input is Timeframe {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const obj = input as Record<string, unknown>;

  const keys = Object.keys(obj);
  if (
    keys.length !== 2
    || !keys.includes('firstDate')
    || !keys.includes('lastDate')
  ) {
    return false;
  }

  return obj.firstDate instanceof Date && obj.lastDate instanceof Date;
}

export function getQueryString(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export function getWhereSpecifier(
  type: string | null,
  specifier: string | null,
): NextResponse<{ error: string }> | WhereSpecifier {
  if (!type || !specifier) {
    return NextResponse.json(
      { error: 'Missing type or specifier' },
      { status: 400 },
    );
  }

  if (type === 'station') {
    return { stationId: parseInt(specifier) };
  } else if (type === 'borough' && isBorough(specifier)) {
    return { station: { borough: specifier } };
  } else if (type === 'community-district') {
    return { station: { communityDistrict: parseInt(specifier) } };
  } else if (type === 'council-district') {
    return { station: { councilDistrict: parseInt(specifier) } };
  } else {
    return NextResponse.json(
      { error: 'Invalid type or specifier' },
      { status: 400 },
    );
  }
}
