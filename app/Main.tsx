'use client';

import Chart from './Chart';
import Inputs from './Inputs';
import React from 'react';

import { DockData, getDockData } from './action';

export enum Granularity {
  Daily,
  Monthly,
}

export default function DockSelector({ docks, minDate, maxDate } : { docks: { id: number, name: string }[], minDate: Date, maxDate: Date }) {
  const [dockData, setDockData] = React.useState<DockData|undefined>(undefined);
  const [dockName, setDockName] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<Date>(maxDate);
  const [isLoading, setIsLoading] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date>(minDate);
  const [granularity, setGranularity] = React.useState<Granularity>(Granularity.Monthly)

  React.useEffect(() => {
    const func = async () => {
      setDockData(undefined);

      if (dockName !== '') {
        setIsLoading(true);
        const newDock = docks.find(d => d.name === dockName);

        if (newDock !== undefined) {
          const daily = granularity === Granularity.Daily;
          const newDockData = await getDockData(newDock.id, daily, startDate, endDate);
          setDockData(newDockData);
          setIsLoading(false);
        }
      }
    }

    func();
  }, [docks, dockName, endDate, granularity, startDate]);

  return (
    <>
      <Inputs
        dockName={dockName}
        dockNames={docks.map(d => d.name).sort((a,b) => a > b ? 1 : -1)}
        endDate={endDate}
        granularity={granularity}
        maxDate={maxDate}
        minDate={minDate}
        setDockName={setDockName}
        setEndDate={setEndDate}
        setGranularity={setGranularity}
        setStartDate={setStartDate}
        startDate={startDate}
      />

      <Chart
        daily={granularity === Granularity.Daily}
        dockData={dockData}
        isLoading={isLoading}
      />
    </>
  );
}
