'use client';

import { ChartData } from './action';
import DataContainer from './DataContainer';
import { Granularity } from './constants';
import LoadingSpinner from './LoadingSpinner';
import Topline from './Topline';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React, { memo } from 'react';
import {
  Timeframe,
  getChartData,
  getTimeframeData,
  getToplineData,
} from './action';

export type BoroughDataFetcherFunction = (
  borough: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

export default memo(function BoroughData() {
  const [borough, setBorough] = React.useState<string>('Brooklyn');
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (borough !== '') {
      setIsLoading(true);
      setTimeframe(undefined);
      getTimeframeData({ dock: { borough } }).then((newData) => {
        setTimeframe(newData);
        setIsLoading(false);
      });
    }
  }, [borough]);

  const dataFetcherFunc: BoroughDataFetcherFunction = (
    borough: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData({ dock: { borough } }, daily, startDate, endDate);
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
            onChange={(e) => setBorough(e.target.value)}
          >
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

      {!isLoading && timeframe !== undefined && (
        <Topline
          borough={borough}
          dataFetcherFunc={() => getToplineData({ dock: { borough } })}
          maxDate={timeframe.lastDate}
          minDate={timeframe.firstDate}
        />
      )}

      {timeframe !== undefined && (
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
