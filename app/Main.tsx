'use client';

import Chart from './Chart';
import Data from './Data';
import Image from 'next/image';
import Inputs from './Inputs';
import PropTypes from 'prop-types';
import React from 'react';
import Warnings from './Warnings';
import { sub as subDate } from 'date-fns';
import { Box, Typography } from '@mui/material';

import { DockData, getDockData } from './action';

export enum Granularity {
  Daily,
  Monthly,
}

interface Dock {
  id: number;
  name: string;
}

export default function DockSelector({
  docks,
  minDate,
  maxDate,
}: {
  docks: Dock[];
  minDate: Date;
  maxDate: Date;
}) {
  const [dockData, setDockData] = React.useState<DockData | undefined>(
    undefined,
  );
  const [dockName, setDockName] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<Date>(maxDate);
  const [isLoading, setIsLoading] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date>(
    subDate(maxDate, { months: 6 }),
  );
  const [granularity, setGranularity] = React.useState<Granularity>(
    Granularity.Monthly,
  );

  function metaHandler(func: () => void, name?: string) {
    if (!isLoading) {
      if (name !== undefined || (name === undefined && dockName !== '')) {
        setIsLoading(true);
      }
      setDockData(undefined);
      func();
    }
  }

  function handleDockNameChange(name: string) {
    metaHandler(() => setDockName(name), name);
  }

  function handleGranularityChange(granularity: Granularity) {
    metaHandler(() => setGranularity(granularity));
  }

  function handleStartDateChange(date: Date) {
    metaHandler(() => setStartDate(date));
  }

  function handleEndDateChange(date: Date) {
    metaHandler(() => setEndDate(date));
  }

  if (dockName !== '' && dockData === undefined) {
    const newDock = docks.find((d) => d.name === dockName);

    if (newDock !== undefined) {
      const daily = granularity === Granularity.Daily;
      getDockData(newDock.id, daily, startDate, endDate).then((newDockData) => {
        setDockData(newDockData);
        setIsLoading(false);
      });
    }
  }

  const LoadingContainer = ({
    isLoading,
    children,
  }: {
    isLoading: boolean;
    children: JSX.Element;
  }) => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Image
            alt='loading spinner'
            src='/citibike-loader.gif'
            width={200}
            height={111}
          />
        </Box>
      );
    } else {
      return children;
    }
  };

  LoadingContainer.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  const NoDockContainer = ({
    dockData,
    children,
  }: {
    dockData: DockData | undefined;
    children: JSX.Element;
  }) => {
    if (dockData === undefined) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography> Select a dock to see some data. </Typography>
        </Box>
      );
    } else {
      return children;
    }
  };

  NoDockContainer.propTypes = {
    dockData: PropTypes.array,
    children: PropTypes.node.isRequired,
  };

  const EmptyDataContainer = ({
    dockData,
    children,
  }: {
    dockData: DockData | undefined;
    children: JSX.Element[];
  }) => {
    if (dockData === undefined || dockData.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography> No data for that time period. </Typography>
        </Box>
      );
    } else {
      return children;
    }
  };

  EmptyDataContainer.propTypes = {
    dockData: PropTypes.array,
    children: PropTypes.node.isRequired,
  };

  return (
    <>
      <Inputs
        dockName={dockName}
        dockNames={docks.map((d) => d.name).sort((a, b) => (a > b ? 1 : -1))}
        endDate={endDate}
        granularity={granularity}
        maxDate={maxDate}
        minDate={minDate}
        setDockName={handleDockNameChange}
        setEndDate={handleEndDateChange}
        setGranularity={handleGranularityChange}
        setStartDate={handleStartDateChange}
        startDate={startDate}
      />

      <LoadingContainer isLoading={isLoading}>
        <NoDockContainer dockData={dockData}>
          <EmptyDataContainer dockData={dockData}>
            <Warnings
              dockData={dockData}
              startDate={startDate}
              endDate={endDate}
            />

            <Data dockData={dockData} granularity={granularity} />

            <Chart
              daily={granularity === Granularity.Daily}
              dockData={dockData}
            />
          </EmptyDataContainer>
        </NoDockContainer>
      </LoadingContainer>
    </>
  );
}
