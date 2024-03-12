'use client';

import { Box } from '@mui/material';
import Chart from './Chart';
import { ChartData } from './DataContainer';
import { DockData } from './action';
import LoadingSpinner from './LoadingSpinner';
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
    // I know this looks like a really weird and stupid way to handle an
    // if/else for display, but it solves the issue of the spinner component
    // taking a long time to load when the user switches granularity from
    // 'Monthly' to 'Daily' on a massive dataset. This approach makes the
    // loader show up much more quickly since it's already rendered.
    <>
      <Box
        sx={{
          display: isLoading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <LoadingSpinner />
      </Box>
      {isLoading ? null : <Chart daily={daily} chartData={chartData} />}
    </>
  );
}
