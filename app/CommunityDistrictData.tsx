'use client';

import { ChartData } from './action';
import { CommunityDistrictsContext } from './CommunityDistrictsProvider';
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

export type CommunityDistrictDataFetcherFunction = (
  communityDistrict: string,
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

function parseCommunityDistrict(input: string): number | '' {
  if (!isNaN(parseInt(input))) {
    return parseInt(input);
  } else {
    return '';
  }
}

export default function CommunityDistrictData() {
  const [borough, setBorough] = useQueryState('borough', {
    parse: parseBorough,
    defaultValue: '',
    clearOnDefault: true,
  });
  const [communityDistrict, setCommunityDistrict] = useQueryState('district', {
    parse: parseCommunityDistrict,
    defaultValue: '',
    clearOnDefault: true,
  });
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const communityDistricts = useContext(CommunityDistrictsContext);

  React.useEffect(() => {
    let ignore = false;

    // Wait for timeframe to be undefined to make sure Topline has an undefined
    // timeframe, otherwise it will try to immediately call the data fetcher
    // function, which prevents getTimeframeData from executing
    // ...for some reason.
    if (communityDistrict !== '' && timeframe === undefined) {
      getTimeframeData({ station: { communityDistrict } }).then((newData) => {
        if (!ignore) {
          setIsLoading(false);
          setTimeframe(newData);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [communityDistrict, timeframe]);

  const dataFetcherFunc: CommunityDistrictDataFetcherFunction = (
    communityDistrict: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData(
      { station: { communityDistrict: parseInt(communityDistrict) } },
      daily,
      startDate,
      endDate,
    );
  };

  const generateGroupedMenuItems = (
    communityDistricts: { borough: string; communityDistrict: number }[],
  ) => {
    let currentBorough = '';
    const output: { borough?: string; communityDistrict?: number }[] = [];

    communityDistricts.forEach((cd) => {
      if (cd.borough !== currentBorough) {
        currentBorough = cd.borough;
        output.push({
          borough: cd.borough === 'Bronx' ? 'The Bronx' : cd.borough,
        });
      }

      output.push({ communityDistrict: cd.communityDistrict });
    });

    return output;
  };
  const groupedMenuItems = generateGroupedMenuItems(communityDistricts);

  return (
    <>
      <Box sx={{ marginTop: 4, paddingTop: 1 }}>
        <FormControl fullWidth>
          <InputLabel id='community-district-options-label'>
            Community District
          </InputLabel>
          <Select
            labelId='community-district-options-label'
            id='community-district-options'
            value={communityDistrict}
            label='community district'
            onChange={(e) => {
              const newBorough = communityDistricts.find(
                (cd) => cd.communityDistrict === e.target.value,
              )?.borough;
              if (isBorough(newBorough ?? '') && newBorough !== undefined) {
                setBorough(newBorough);
              }
              setCommunityDistrict(parseInt(`${e.target.value}`) ?? undefined);
              setTimeframe(undefined);
              setIsLoading(true);
            }}
          >
            {groupedMenuItems.map(({ borough, communityDistrict }) => {
              if (borough) {
                return <ListSubheader key={borough}>{borough}</ListSubheader>;
              } else {
                return (
                  <MenuItem key={communityDistrict} value={communityDistrict}>
                    {communityDistrict}
                  </MenuItem>
                );
              }
            })}
          </Select>
        </FormControl>
      </Box>

      {!isLoading && communityDistrict === undefined && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography>
            <>Select a community district to see some data.</>
          </Typography>
        </Box>
      )}

      {communityDistrict && (
        <Topline
          borough={borough}
          communityDistrict={communityDistrict}
          dataFetcherFunc={() =>
            getToplineData({ station: { communityDistrict } })
          }
          maxDate={timeframe?.lastDate}
          minDate={timeframe?.firstDate}
          parentLoading={isLoading}
        />
      )}

      {communityDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            parentLoading={isLoading}
            userSelection={`${communityDistrict}`}
          />
        </Box>
      )}
    </>
  );
}
