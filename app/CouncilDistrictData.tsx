'use client';

import { ChartData } from './action';
import { CouncilDistrictsContext } from './CouncilDistrictsProvider';
import DataContainer from './DataContainer';
import { Granularity } from './constants';
import LoadingSpinner from './LoadingSpinner';
import Topline from './Topline';
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { memo, useContext } from 'react';
import {
  Timeframe,
  getChartData,
  getTimeframeData,
  getToplineData,
} from './action';

export type CouncilDistrictDataFetcherFunction = (
  councilDistrict: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

export default memo(function CouncilDistrictData() {
  const [borough, setBorough] = React.useState<string | undefined>(undefined);
  const [councilDistrict, setCouncilDistrict] = React.useState<
    number | undefined
  >(undefined);
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const councilDistricts = useContext(CouncilDistrictsContext);

  React.useEffect(() => {
    let ignore = false;

    if (councilDistrict !== undefined) {
      setIsLoading(true);
      setTimeframe(undefined);
      getTimeframeData({ station: { councilDistrict } }).then((newData) => {
        if (!ignore) {
          setTimeframe(newData);
          setIsLoading(false);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [councilDistrict]);

  const dataFetcherFunc: CouncilDistrictDataFetcherFunction = (
    councilDistrict: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData(
      { station: { councilDistrict: parseInt(councilDistrict) } },
      daily,
      startDate,
      endDate,
    );
  };

  const generateGroupedMenuItems = (
    councilDistricts: { borough: string; councilDistrict: number }[],
  ) => {
    let currentBorough = '';
    const output: { borough?: string; councilDistrict?: number }[] = [];

    councilDistricts.forEach((cd) => {
      if (cd.borough !== currentBorough) {
        currentBorough = cd.borough;
        output.push({
          borough: cd.borough === 'Bronx' ? 'The Bronx' : cd.borough,
        });
      }

      output.push({ councilDistrict: cd.councilDistrict });
    });

    return output;
  };
  const groupedMenuItems = generateGroupedMenuItems(councilDistricts);

  return (
    <>
      <Box sx={{ marginTop: 4, paddingTop: 1 }}>
        <FormControl fullWidth>
          <InputLabel id='council-district-options-label'>
            Council District
          </InputLabel>
          <Select
            labelId='council-district-options-label'
            id='council-district-options'
            value={councilDistrict}
            label='council district'
            onChange={(e) => {
              setBorough(
                councilDistricts.find(
                  (cd) => cd.councilDistrict === e.target.value,
                )?.borough,
              );
              setCouncilDistrict(parseInt(`${e.target.value}`) ?? undefined);
            }}
          >
            {groupedMenuItems.map(({ borough, councilDistrict }) => {
              if (borough) {
                return <ListSubheader key={borough}>{borough}</ListSubheader>;
              } else {
                return (
                  <MenuItem key={councilDistrict} value={councilDistrict}>
                    {councilDistrict}
                  </MenuItem>
                );
              }
            })}
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

      {!isLoading && councilDistrict === undefined && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography>
            <>Select a council district to see some data.</>
          </Typography>
        </Box>
      )}

      {!isLoading && councilDistrict && timeframe !== undefined && (
        <Topline
          borough={borough}
          councilDistrict={councilDistrict}
          dataFetcherFunc={() =>
            getToplineData({ station: { councilDistrict } })
          }
          maxDate={timeframe.lastDate}
          minDate={timeframe.firstDate}
        />
      )}

      {councilDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            userSelection={`${councilDistrict}`}
          />
        </Box>
      )}
    </>
  );
});
