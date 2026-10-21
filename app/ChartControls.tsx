import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';

import { DateRange, Granularity } from './constants';
import { getMonthDate, getRangeStart } from './utils';

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
  const [range, setRange] = React.useState(DateRange.TwelveMonths);

  const [pendingStart, setPendingStart] = React.useState<Date | null>(
    startDate,
  );
  const [pendingStartIsValid, setPendingStartIsValid] = React.useState(true);
  const [pendingEnd, setPendingEnd] = React.useState<Date | null>(endDate);
  const [pendingEndIsValid, setPendingEndIsValid] = React.useState(true);

  const usableStart =
    pendingStartIsValid && pendingStart ? pendingStart : startDate;
  const usableEnd = pendingEndIsValid && pendingEnd ? pendingEnd : endDate;

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

  function handleRangeChange(value: DateRange) {
    setRange(value);
    setIsError(false);

    if (value !== DateRange.Custom) {
      const newStart = getRangeStart(value, minDate, maxDate);
      setStartDate(newStart);
      setEndDate(maxDate);
      setPendingStart(newStart);
      setPendingStartIsValid(true);
      setPendingEnd(maxDate);
      setPendingEndIsValid(true);
    }
  }

  function handleDateChange({
    newStart,
    newEnd,
  }: {
    newStart: Date;
    newEnd: Date;
  }) {
    // The pickers show the month in local time, so that's the month we keep
    const start = getMonthDate(newStart.getFullYear(), newStart.getMonth());
    const end = getMonthDate(newEnd.getFullYear(), newEnd.getMonth());

    if (start <= end) {
      setStartDate(start);
      setEndDate(end);
      setIsError(false);
    } else {
      setIsError(true);
    }
  }

  return (
    <Box sx={{ display: 'block', width: '100%' }}>
      {isError && (
        <Alert severity='error'>Start date cannot be after end date.</Alert>
      )}

      <Box
        sx={{
          columnGap: 1,
          display: 'flex',
          flexWrap: 'wrap',
          pt: 1,
          rowGap: 2,
          width: '100%',
        }}
      >
        <FormControl sx={{ flex: '2 1 150px' }}>
          <InputLabel id='range-options-label'>Date range</InputLabel>
          <Select
            labelId='range-options-label'
            id='range-options'
            value={range}
            label='Date range'
            onChange={(e) => handleRangeChange(e.target.value)}
          >
            <MenuItem value={DateRange.OneMonth}>1 month</MenuItem>
            <MenuItem value={DateRange.ThreeMonths}>3 months</MenuItem>
            <MenuItem value={DateRange.TwelveMonths}>12 months</MenuItem>
            <MenuItem value={DateRange.AllTime}>All time</MenuItem>
            <MenuItem value={DateRange.Custom}>Custom</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ flex: '1 0 130px' }}>
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

      {range === DateRange.Custom && (
        <Box
          sx={{
            columnGap: 1,
            display: 'flex',
            flexWrap: 'wrap',
            pt: 2,
            rowGap: 2,
            width: '100%',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              format='MMM yyyy'
              label='Start'
              maxDate={maxDate}
              minDate={minDate}
              onAccept={(v, context) => {
                if (v && !context.validationError) {
                  handleDateChange({ newStart: v, newEnd: usableEnd });
                }
              }}
              onChange={(v, context) => {
                setPendingStart(v);
                setPendingStartIsValid(v !== null && !context.validationError);
              }}
              sx={{ flex: '1 1 170px' }}
              value={pendingStart}
              views={['month', 'year']}
              slotProps={{
                textField: {
                  // undefined lets the picker show its own errors, like a
                  // typed date that's out of range
                  error: isError || undefined,
                },
              }}
            />

            <DatePicker
              format='MMM yyyy'
              label='End'
              maxDate={maxDate}
              minDate={minDate}
              onAccept={(v, context) => {
                if (v && !context.validationError) {
                  handleDateChange({ newStart: usableStart, newEnd: v });
                }
              }}
              onChange={(v, context) => {
                setPendingEnd(v);
                setPendingEndIsValid(v !== null && !context.validationError);
              }}
              sx={{ flex: '1 1 170px' }}
              value={pendingEnd}
              views={['month', 'year']}
              slotProps={{
                textField: {
                  error: isError || undefined,
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
}
