import { CommunityDistrictsContext } from './CommunityDistrictsProvider';
import DataContainer from './DataContainer';
import Topline from './Topline';
import { useQueryState } from 'nuqs';
import { Borough, Timeframe } from './types';
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React, { useContext } from 'react';
import { getQueryString, isBorough } from './utils';

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
  const [isLoading, setLoading] = React.useState(false);

  const communityDistricts = useContext(CommunityDistrictsContext);

  function handleDistrictChange(event: SelectChangeEvent<string>) {
    const newDistrict = parseInt(event.target.value);
    const newBorough =
      communityDistricts.find((cd) => cd.communityDistrict === newDistrict)
        ?.borough ?? '';
    if (isBorough(newBorough)) {
      setBorough(newBorough);
    }
    setCommunityDistrict(newDistrict);
    setTimeframe(undefined);
  }

  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      // Wait for timeframe to be undefined to make sure Topline has an undefined
      // timeframe, otherwise it will try to immediately call the data fetcher
      // function, which prevents getTimeframeData from executing
      // ...for some reason.
      if (communityDistrict !== '' && timeframe === undefined) {
        setLoading(true);
        const queryString = getQueryString({
          type: 'community-district',
          specifier: `${communityDistrict}`,
        });
        const response = await fetch(`/api/timeframe?${queryString}`);
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
  }, [communityDistrict, timeframe]);

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
            value={`${communityDistrict}`}
            label='community district'
            onChange={handleDistrictChange}
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
          dataSpecifier={`type=community-district&specifier=${communityDistrict}`}
          maxDate={timeframe?.lastDate}
          minDate={timeframe?.firstDate}
          parentLoading={isLoading}
        />
      )}

      {communityDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            type='community-district'
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
