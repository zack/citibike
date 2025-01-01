import DataContainer from './DataContainer';
import React from 'react';
import Topline from './Topline';
import { useQueryState } from 'nuqs';
import { Borough, Timeframe } from './types';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { isBorough, timeframeFetcher } from './utils';

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

    if (isBorough(borough)) {
      timeframeFetcher(
        timeframe,
        'borough',
        borough,
        ignore,
        setLoading,
        setTimeframe,
      );
    }

    return () => {
      ignore = true;
    };
  }, [borough, timeframe]);

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
              maxDate={timeframe?.lastDate}
              minDate={timeframe?.firstDate}
              parentLoading={isLoading}
              userSelection={borough}
              type='borough'
            />
          </Box>
        </>
      )}
    </>
  );
}
