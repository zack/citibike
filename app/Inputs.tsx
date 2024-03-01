import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { Granularity } from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import React from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

export default function Inputs({
  dockName,
  granularity,
  setGranularity,
  dockNames,
  endDate,
  maxDate,
  minDate,
  setDockName,
  setEndDate,
  setStartDate,
  startDate,
}: {
  dockName: string;
  dockNames: string[];
  endDate: Date;
  granularity: Granularity;
  maxDate: Date;
  minDate: Date;
  setDockName: (name: string) => void;
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

  const handleDockChange = async (_event: unknown, newValue: string | null) => {
    const newDockName = newValue ?? '';

    setDockName(newDockName);
  };

  return (
    <Box display='block' width={'100%'}>
      <Autocomplete
        sx={{ width: '100%' }}
        id='player'
        options={['', ...dockNames]}
        value={dockName}
        onChange={handleDockChange}
        renderInput={(p) => (
          <TextField {...p} label='Dock' InputLabelProps={{ shrink: true }} />
        )}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option}>
              {option}
            </li>
          );
        }}
        renderTags={(tagValue, getTagProps) => {
          return tagValue.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option} label={option} />
          ));
        }}
      />

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          pt: 1,
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

        <FormControl fullWidth>
          <InputLabel id='granularity-options-label'> Granularity </InputLabel>
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
  );
}
