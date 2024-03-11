'use client';

import Chart from './Chart';
import ChartControls from './ChartControls';
import ChartLoadingContainer from './ChartLoadingContainer';
import { Granularity } from './Main';
import React from 'react';

import { DockData, getDockData } from './action';
import {
  format as formatDate,
  max as laterDate,
  sub as subDate,
} from 'date-fns';

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

export interface ChartData {
  acoustic: number;
  day: number | undefined;
  electric: number;
  month: number;
  name: string;
  year: number;
}

export default function ChartContainer({
  dockId,
  maxDate,
  minDate,
}: {
  dockId: number | undefined;
  maxDate: Date | undefined;
  minDate: Date | undefined;
}) {
  const [dockData, setDockData] = React.useState<DockData | undefined>(
    undefined,
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(maxDate);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    if (minDate && maxDate) {
      return laterDate([minDate, subDate(maxDate, { years: 1 })]);
    } else {
      return undefined;
    }
  });
  const [granularity, setGranularity] = React.useState<Granularity>(
    Granularity.Monthly,
  );
  const daily = granularity === Granularity.Daily;

  React.useEffect(() => {
    if (dockId !== undefined && startDate && endDate) {
      setIsLoading(true);
      getDockData(dockId, daily, startDate, endDate).then((newDockData) => {
        setDockData(newDockData);
        setIsLoading(false);
      });
    }
  }, [daily, dockId, endDate, startDate]);

  if (dockData === undefined) {
    return null;
  }

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
    <>
      {minDate && maxDate && startDate && endDate && (
        <ChartControls
          endDate={endDate}
          granularity={granularity}
          maxDate={maxDate}
          minDate={minDate}
          setEndDate={setEndDate}
          setGranularity={setGranularity}
          setStartDate={setStartDate}
          startDate={startDate}
        />
      )}
      <ChartLoadingContainer isLoading={isLoading}>
        <Chart daily={daily} chartData={chartData} />
      </ChartLoadingContainer>
    </>
  );
}
