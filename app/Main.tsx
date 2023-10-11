'use client';

import Chart from './Chart';
import Inputs from './Inputs';
import React from 'react';

import { DockData, getDockData } from './action';

const MIN_DATE = new Date('2022-08-31');
const MAX_DATE = new Date('2023-07-31');

export default function DockSelector({ docks } : { docks: { id: number, name: string }[] }) {
  const [dockData, setDockData] = React.useState<DockData|undefined>(undefined);
  const [dockName, setDockName] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<Date>(MAX_DATE);
  const [isLoading, setIsLoading] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date>(MIN_DATE);

  React.useEffect(() => {
    const func = async () => {
      setDockData(undefined);

      if (dockName !== '') {
        setIsLoading(true);
        const newDock = docks.find(d => d.name === dockName);

        if (newDock !== undefined) {
          const newDockData = await getDockData(newDock.id, startDate, endDate);
          setDockData(newDockData);
          setIsLoading(false);
        }
      }
    }

    func();
  }, [docks, dockName, endDate, startDate]);

  return (
    <>
      <Inputs
        dockName={dockName}
        dockNames={docks.map(d => d.name).sort((a,b) => a > b ? 1 : -1)}
        endDate={endDate}
        maxDate={MAX_DATE}
        minDate={MIN_DATE}
        setDockName={setDockName}
        setEndDate={setEndDate}
        setStartDate={setStartDate}
        startDate={startDate}
      />

      <Chart
        dockData={dockData}
        isLoading={isLoading}
      />
    </>
  );
}
