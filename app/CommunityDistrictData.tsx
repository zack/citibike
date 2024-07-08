'use client';

import { ChartData } from './action';
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
} from '@mui/material';
import React, { memo } from 'react';
import {
  Timeframe,
  getChartData,
  getCommunityDistricts,
  getTimeframeData,
  getToplineData,
} from './action';

export type CommunityDistrictDataFetcherFunction = (
  communityDistrict: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

export default memo(function BoroughData() {
  const [borough, setBorough] = React.useState<string | undefined>(undefined);
  const [communityDistricts, setCommunityDistricts] = React.useState<
    { communityDistrict: number; borough: string }[]
  >([]);
  const [communityDistrict, setCommunityDistrict] = React.useState<
    number | undefined
  >(undefined);
  const [communityDistrictsLoading, setCommunityDistrictsLoading] =
    React.useState(false);
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setCommunityDistrictsLoading(true);
    async function fn() {
      const communityDistricts = await getCommunityDistricts();
      setCommunityDistricts([...communityDistricts]);
      setCommunityDistrictsLoading(false);
    }
    fn();
  }, []);

  React.useEffect(() => {
    if (communityDistrict !== undefined) {
      setIsLoading(true);
      setTimeframe(undefined);
      getTimeframeData({ dock: { communityDistrict } }).then((newData) => {
        setTimeframe(newData);
        setIsLoading(false);
      });
    }
  }, [communityDistrict]);

  const dataFetcherFunc: CommunityDistrictDataFetcherFunction = (
    communityDistrict: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData(
      { dock: { communityDistrict: parseInt(communityDistrict) } },
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
            disabled={communityDistrictsLoading}
            labelId='community-district-options-label'
            id='community-district-options'
            value={communityDistrict}
            label='community district'
            onChange={(e) => {
              setBorough(
                communityDistricts.find(
                  (cd) => cd.communityDistrict === e.target.value,
                )?.borough,
              );
              setCommunityDistrict(parseInt(`${e.target.value}`) ?? undefined);
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

      {!isLoading && communityDistrict && timeframe !== undefined && (
        <Topline
          borough={borough}
          communityDistrict={communityDistrict}
          dataFetcherFunc={() =>
            getToplineData({ dock: { communityDistrict } })
          }
          maxDate={timeframe.lastDate}
          minDate={timeframe.firstDate}
        />
      )}

      {communityDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            userSelection={`${communityDistrict}`}
          />
        </Box>
      )}
    </>
  );
});
