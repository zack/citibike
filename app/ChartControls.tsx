import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { Granularity } from './constants';
import { LocalizationProvider } from '@mui/x-date-pickers';
import React from 'react';
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

export default function ChartControls({
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
  const [isError, setIsError] = React.useState(false);

  function handleGranularityChange(value: Granularity | string) {
    if (typeof value === 'string') {
      // This is for the typescript
      setGranularity(Granularity.Monthly);
      // eslint-disable-next-line no-console
      console.error('Something went wrong with the granularity select');
    }

    if (value === Granularity.Daily) {
      setGranularity(Granularity.Daily);
    } else {
      setGranularity(Granularity.Monthly);
    }
  }

  function handleDateChange({
    newStart,
    newEnd,
  }: {
    newStart: Date;
    newEnd: Date;
  }) {
    if (newStart <= newEnd) {
      setStartDate(newStart);
      setEndDate(newEnd);
      setIsError(false);
    } else {
      setIsError(true);
    }
  }

  return (
    <Box display='block' width={'100%'}>
      {isError && (
        <Alert severity='error'>Start date cannot be after end date.</Alert>
      )}

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
            onAccept={(v) =>
              handleDateChange({ newStart: v || minDate, newEnd: endDate })
            }
            sx={{ width: '100%' }}
            value={startDate}
            views={['month', 'year']}
            slotProps={{
              textField: {
                error: isError,
              },
            }}
          />

          <DatePicker
            label='End'
            maxDate={maxDate}
            minDate={minDate}
            onAccept={(v) =>
              handleDateChange({ newStart: startDate, newEnd: v || maxDate })
            }
            sx={{ width: '100%' }}
            value={endDate}
            views={['month', 'year']}
            slotProps={{
              textField: {
                error: isError,
              },
            }}
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
