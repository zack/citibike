import { max as laterDate } from 'date-fns';
import { NextResponse } from 'next/server';

import { DateRange } from './constants';
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

// Use the 15th of each month to avoid edge cases around month boundaries with
// timezone nonsense
export function getMonthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 15, 12));
}

export function getRangeStart(
  range: DateRange,
  minDate: Date,
  maxDate: Date,
): Date {
  const year = maxDate.getUTCFullYear();
  const month = maxDate.getUTCMonth();

  if (range === DateRange.OneMonth) {
    return maxDate;
  } else if (range === DateRange.ThreeMonths) {
    return laterDate([minDate, getMonthDate(year, month - 2)]);
  } else if (range === DateRange.TwelveMonths) {
    return laterDate([minDate, getMonthDate(year, month - 11)]);
  } else {
    return minDate;
  }
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
