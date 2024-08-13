'use client';

import { ChartData } from './action';
import DataContainer from './DataContainer';
import { Granularity } from './constants';
import LoadingSpinner from './LoadingSpinner';
import Topline from './Topline';
import { isBorough } from './utils';
import {
  Borough,
  Timeframe,
  getChartData,
  getTimeframeData,
  getToplineData,
} from './action';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React, { memo } from 'react';

export type BoroughDataFetcherFunction = (
  borough: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

export default memo(function BoroughData() {
  const [borough, setBorough] = React.useState<Borough | ''>('');
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  function handleBoroughChange(event: SelectChangeEvent<Borough>) {
    const value = event.target.value;
    if (isBorough(value)) {
      setBorough(value);
    }
  }

  React.useEffect(() => {
    let ignore = false;

    if (borough) {
      setIsLoading(true);
      setTimeframe(undefined);
      getTimeframeData({ station: { borough } }).then((newData) => {
        if (!ignore) {
          setTimeframe(newData);
          setIsLoading(false);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [borough]);

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
            value={borough}
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

      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LoadingSpinner />
        </Box>
      )}

      {!isLoading && !borough && (
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

      {!isLoading && borough && timeframe !== undefined && (
        <Topline
          borough={borough}
          dataFetcherFunc={() => getToplineData({ station: { borough } })}
          maxDate={timeframe.lastDate}
          minDate={timeframe.firstDate}
        />
      )}

      {timeframe !== undefined && borough && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            userSelection={borough}
          />
        </Box>
      )}
    </>
  );
});
