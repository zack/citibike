import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { Granularity } from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function Inputs({
  granularity,
  setGranularity,
  endDate,
  maxDate,
  minDate,
  setEndDate,
  setStartDate,
  startDate,
}: {
  endDate: Date;
  granularity: Granularity;
  maxDate: Date;
  minDate: Date;
  setEndDate: (date: Date) => void;
  setGranularity: (granularity: Granularity) => void;
  setStartDate: (date: Date) => void;
  startDate: Date;
}) {
  const handleGranularityChange = (value: Granularity | string) => {
    if (typeof value === 'string') {
      // This is for the typescript
      setGranularity(Granularity.Daily);
      // eslint-disable-next-line no-console
      console.error('Something went wrong with the granularity select');
    }

    if (value === Granularity.Daily) {
      setGranularity(Granularity.Daily);
    } else {
      setGranularity(Granularity.Monthly);
    }
  };

  return (
    <Box display='block' width={'100%'}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          pt: 1,
          width: '100%',
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='Start'
            maxDate={maxDate}
            minDate={minDate}
            onAccept={(newValue) => setStartDate(newValue || minDate)}
            sx={{ width: '100%' }}
            value={startDate}
            views={['year', 'month']}
          />

          <DatePicker
            label='End'
            maxDate={maxDate}
            minDate={minDate}
            onAccept={(newValue) => setEndDate(newValue || maxDate)}
            sx={{ width: '100%' }}
            value={endDate}
            views={['year', 'month']}
          />
        </LocalizationProvider>

        <Box width={'270px'}>
          <FormControl fullWidth>
            <InputLabel id='granularity-options-label'>Granularity</InputLabel>
            <Select
              labelId='granularity-options-label'
              id='granularity-options'
              value={granularity}
              label='Granularity'
              onChange={(e) => handleGranularityChange(e.target.value)}
            >
              <MenuItem value={Granularity.Daily}> Daily </MenuItem>
              <MenuItem value={Granularity.Monthly}> Monthly </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}
