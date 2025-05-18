import Chart from './Chart';
import { ChartData } from './types';
import LoadingSpinner from './LoadingSpinner';
import { NamedChartData } from './DataContainer';
import React from 'react';
import { format as formatDate } from 'date-fns';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

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
  data,
}: {
  isLoading: boolean;
  daily: boolean;
  data?: ChartData[];
}) {
  const [splitByType, setSplitByType] = React.useState(true);
  const [splitByDirection, setSplitByDirection] = React.useState(true);

  const chartData: NamedChartData[] | undefined = data
    ?.map((data) => ({
      acoustic: data.acoustic,
      acousticArrive: data.acousticArrive,
      acousticDepart: data.acousticDepart,
      arrive: data.arrive,
      day: data.day,
      depart: data.depart,
      electric: data.electric,
      electricArrive: data.electricArrive,
      electricDepart: data.electricDepart,
      month: data.month,
      name: getDataLabel(data.day, data.month, data.year),
      total: data.total,
      year: data.year,
    }))
    .sort((a, b) =>
      `${a.year}${pad(a.month)}${pad(a.day)}`
      > `${b.year}${pad(b.month)}${pad(b.day)}`
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
          height: '500px',
        }}
      >
        <LoadingSpinner />
      </Box>
      {isLoading || !chartData ? null : (
        <>
          <FormControlLabel control={
          <Checkbox checked={splitByType} onChange={() => setSplitByType(!splitByType)} />
            } label="Split by type" />
          <FormControlLabel control={
          <Checkbox checked={splitByDirection} onChange={() => setSplitByDirection(!splitByDirection)} />
            } label="Split by direction" />
          <Chart daily={daily} chartData={chartData} chartConfig={{type: splitByType, direction: splitByDirection}} />
        </>
      )}
    </>
  );
}
