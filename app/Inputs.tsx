import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers';
import { Granularity } from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import React from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

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
  dockName: string,
  dockNames: Array<string>,
  endDate: Date,
  granularity: Granularity,
  maxDate: Date,
  minDate: Date,
  setDockName: Dispatch<SetStateAction<string>>,
  setEndDate: Dispatch<SetStateAction<Date>>
  setGranularity: Dispatch<SetStateAction<Granularity>>,
  setStartDate: Dispatch<SetStateAction<Date>>,
  startDate: Date,
})
{

  const handleGranularityChange = (value: string) => {
    if (value === 'daily') {
      setGranularity(Granularity.Daily);
    } else {
      setGranularity(Granularity.Monthly);
    }
  }

  const handleDockChange = async (_event: unknown, newValue: string | null) => {
    const newDockName = newValue ?? '';

    setDockName(newDockName);
  };

  return (
    <Box display='block' width={'100%'} >
      <Autocomplete
        sx={{ width: '100%' }}
        id="player"
        options={dockNames}
        value={dockName}
        onChange={handleDockChange}
        renderInput={(p) => <TextField {...p} label="Dock" InputLabelProps={{ shrink: true}} />}
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
          ))
        }}
      />

      <Box sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        pt: 1,
        }}>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start"
            maxDate={maxDate}
            minDate={minDate}
            onAccept={newValue => setStartDate(newValue || minDate)}
            sx={{ width: '100%' }}
            value={startDate}
            views={['year', 'month']}
          />

          <DatePicker
            label="End"
            maxDate={maxDate}
            minDate={minDate}
            onAccept={newValue => setEndDate(newValue || maxDate)}
            sx={{ width: '100%' }}
            value={endDate}
            views={['year', 'month']}
          />
        </LocalizationProvider>
      </Box>

      <Box>
        <FormControl>
          <FormLabel id="granularity-options-label"> Granularity </FormLabel>
          <RadioGroup
            aria-labelledby="granularity-options-label"
            defaultValue="monthly"
            name="radio-buttons-group"
            onChange={(e, v) => handleGranularityChange(v)}
            row
            value={granularity === Granularity.Daily ? 'daily' : 'monthly'}
          >
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="daily" control={<Radio />} label="Daily" />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
}
