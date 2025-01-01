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

export async function timeframeFetcher(
  timeframe: Timeframe | undefined,
  type: string,
  specifier: string | number,
  ignore: boolean,
  setLoading: (arg0: boolean) => void,
  setTimeframe: (arg0: Timeframe) => void,
) {
  // Wait for timeframe to be undefined to make sure Topline has an undefined
  // timeframe, otherwise it will try to immediately call the data fetcher
  // function, which prevents getTimeframeData from executing
  // ...for some reason.
  if (timeframe === undefined) {
    setLoading(true);
    const queryString = getQueryString({
      type,
      specifier: `${specifier}`,
    });
    const response = await fetch(`/api/timeframe?${queryString}`);
    if (!ignore) {
      const data = await response.json();
      setLoading(false);
      setTimeframe({
        firstDate: new Date(data.firstDate),
        lastDate: new Date(data.lastDate),
      });
    }
  }
}
