import { CouncilDistrictsContext } from './CouncilDistrictsProvider';
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
import { isBorough, timeframeFetcher } from './utils';

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
  const [isLoading, setLoading] = React.useState(false);

  const councilDistricts = useContext(CouncilDistrictsContext);

  function handleDistrictChange(event: SelectChangeEvent<string>) {
    const newDistrict = parseInt(event.target.value);
    const newBorough =
      councilDistricts.find((cd) => cd.councilDistrict === newDistrict)?.borough
      ?? '';
    if (isBorough(newBorough)) {
      setBorough(newBorough);
    }
    setCouncilDistrict(newDistrict);
    setTimeframe(undefined);
  }

  React.useEffect(() => {
    let ignore = false;

    if (councilDistrict !== '') {
      timeframeFetcher(
        timeframe,
        'council-district',
        councilDistrict,
        ignore,
        setLoading,
        setTimeframe,
      );
    }

    return () => {
      ignore = true;
    };
  }, [councilDistrict, timeframe]);

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
            value={`${councilDistrict}`}
            label='council district'
            onChange={handleDistrictChange}
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
          dataSpecifier={`type=council-district&specifier=${councilDistrict}`}
          maxDate={timeframe?.lastDate}
          minDate={timeframe?.firstDate}
          parentLoading={isLoading}
        />
      )}

      {councilDistrict && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            type='council-district'
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
