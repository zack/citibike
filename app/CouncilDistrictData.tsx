'use client';

import { ChartData } from './action';
import { CouncilDistrictsContext } from './CouncilDistrictsProvider';
import DataContainer from './DataContainer';
import { Granularity } from './constants';
import Topline from './Topline';
import { isBorough } from './utils';
import { useQueryState } from 'nuqs';
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
  ListSubheader,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { useContext } from 'react';

export type CouncilDistrictDataFetcherFunction = (
  councilDistrict: string,
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

function parseCouncilDistrict(input: string): number | '' {
  if (!isNaN(parseInt(input))) {
    return parseInt(input);
  } else {
    return '';
  }
}

export default function CouncilDistrictData() {
  const [borough, setBorough] = useQueryState('borough', {
    parse: parseBorough,
    defaultValue: '',
    clearOnDefault: true,
  });
  const [councilDistrict, setCouncilDistrict] = useQueryState('district', {
    parse: parseCouncilDistrict,
    defaultValue: '',
    clearOnDefault: true,
  });
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const councilDistricts = useContext(CouncilDistrictsContext);

  React.useEffect(() => {
    let ignore = false;

    // Wait for timeframe to be undefined to make sure Topline has an undefined
    // timeframe, otherwise it will try to immediately call the data fetcher
    // function, which prevents getTimeframeData from executing
    // ...for some reason.
    if (councilDistrict !== '' && timeframe === undefined) {
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
  }, [councilDistrict, timeframe]);

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
              const newBorough = councilDistricts.find(
                (cd) => cd.councilDistrict === e.target.value,
              )?.borough;
              if (isBorough(newBorough ?? '') && newBorough !== undefined) {
                setBorough(newBorough);
              }
              setCouncilDistrict(parseInt(`${e.target.value}`) ?? undefined);
              setTimeframe(undefined);
              setIsLoading(true);
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

      {councilDistrict && (
        <Topline
          borough={borough}
          councilDistrict={councilDistrict}
          dataFetcherFunc={() =>
            getToplineData({ station: { councilDistrict } })
          }
          maxDate={timeframe?.lastDate}
          minDate={timeframe?.firstDate}
          parentLoading={isLoading}
        />
      )}

      {councilDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            parentLoading={isLoading}
            userSelection={`${councilDistrict}`}
          />
        </Box>
      )}
    </>
  );
}
