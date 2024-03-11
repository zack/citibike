'use client';

import Chart from './Chart';
import { ChartData } from './DataContainer';
import ChartLoadingContainer from './ChartLoadingContainer';
import { DockData } from './action';
import React from 'react';
import { format as formatDate } from 'date-fns';

function pad(num: number | undefined) {
  if (num === undefined) {
    return '';
  } else if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}

function getDataLabel(day: number | undefined, month: number, year: number) {
  if (day === undefined) {
    return formatDate(new Date(year, month - 1, 1), "MMM ''yy");
  } else {
    return formatDate(new Date(year, month - 1, day), "MMM d ''yy");
  }
}

export default function ChartContainer({
  isLoading,
  daily,
  dockData,
}: {
  isLoading: boolean;
  daily: boolean;
  dockData: DockData;
}) {
  const chartData: ChartData[] = dockData
    ?.map((data) => ({
      acoustic: data.acoustic,
      day: data.day,
      electric: data.electric,
      month: data.month,
      name: getDataLabel(data.day, data.month, data.year),
      year: data.year,
    }))
    .sort((a, b) =>
      `${a.year}${pad(a.month)}${pad(a.day)}` >
      `${b.year}${pad(b.month)}${pad(b.day)}`
        ? 1
        : -1,
    );

  return (
    <ChartLoadingContainer isLoading={isLoading}>
      <Chart daily={daily} chartData={chartData} />
    </ChartLoadingContainer>
  );
}
