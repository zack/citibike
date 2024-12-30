'use client';
import { ChartData } from './action';
import DataContainer from './DataContainer';
import { Granularity } from './constants';
import React from 'react';
import Topline from './Topline';
import { isBorough } from './utils';
import { useQueryState } from 'nuqs';
import { Borough, Timeframe, getChartData } from './action';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

export type BoroughDataFetcherFunction = (
  borough: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

function parseBorough(input: string): Borough | '' {
  if (isBorough(input)) {
    return input;
  } else {
    return '';
  }
}

export default function BoroughData() {
  const [borough, setBorough] = useQueryState('borough', {
    parse: parseBorough,
    defaultValue: '',
    clearOnDefault: true,
  });
  const [isLoading, setLoading] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );

  function handleBoroughChange(event: SelectChangeEvent<Borough>) {
    const value = event.target.value;
    if (isBorough(value)) {
      setBorough(value);
      setTimeframe(undefined);
    }
  }

  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      // Wait for timeframe to be undefined to make sure Topline has an undefined
      // timeframe, otherwise it will try to immediately call the data fetcher
      // function, which prevents getTimeframeData from executing
      // ...for some reason.
      if (isBorough(borough) && timeframe === undefined) {
        setLoading(true);
        const response = await fetch(
          `/api/timeframe?type=borough&specifier=${borough}`,
        );
        const data = await response.json();
        if (!ignore) {
          setLoading(false);
          setTimeframe({
            firstDate: new Date(data.firstDate),
            lastDate: new Date(data.lastDate),
          });
        }
      }
    }
    cb();

    return () => {
      ignore = true;
    };
  }, [borough, timeframe]);

  const dataFetcherFunc: BoroughDataFetcherFunction = (
    borough: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;

    // Unfortunately due to how the function is used, we cannot require the
    // borough parameter is Borough
    if (isBorough(borough)) {
      return getChartData({ station: { borough } }, daily, startDate, endDate);
    } else {
      return getChartData(
        { station: { borough: 'Brooklyn' } },
        daily,
        startDate,
        endDate,
      );
    }
  };

  return (
    <>
      <Box sx={{ marginTop: 4, paddingTop: 1 }}>
        <FormControl fullWidth>
          <InputLabel id='borough-options-label'>Borough</InputLabel>
          <Select
            labelId='borough-options-label'
            id='borough-options'
            value={isBorough(borough) ? borough : ''}
            label='borough'
            onChange={handleBoroughChange}
          >
            <MenuItem value={''}></MenuItem>
            <MenuItem value={'Bronx'}> The Bronx </MenuItem>
            <MenuItem value={'Brooklyn'}> Brooklyn </MenuItem>
            <MenuItem value={'Manhattan'}> Manhattan </MenuItem>
            <MenuItem value={'Queens'}> Queens </MenuItem>
          </Select>
        </FormControl>
      </Box>
      {!isBorough(borough) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography>
            <>Select a borough to see some data.</>
          </Typography>
        </Box>
      )}
      {isBorough(borough) && (
        <>
          <Topline
            borough={borough}
            dataSpecifier={`type=borough&specifier=${borough}`}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            parentLoading={isLoading}
          />

          <Box sx={{ paddingBottom: 5 }}>
            <DataContainer
              dataFetcherFunc={dataFetcherFunc}
              maxDate={timeframe?.lastDate}
              minDate={timeframe?.firstDate}
              parentLoading={isLoading}
              userSelection={borough}
            />
          </Box>
        </>
      )}
    </>
  );
}
