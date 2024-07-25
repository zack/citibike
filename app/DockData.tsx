'use client';

import DataContainer from './DataContainer';
import { Granularity } from './constants';
import LoadingSpinner from './LoadingSpinner';
import { StationsContext } from './StationsProvider';
import Topline from './Topline';
import { isBorough } from './utils';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { Borough, ChartData, getMostRecentDateInDatabase } from './action';
import React, { SyntheticEvent, memo, useContext } from 'react';
import {
  Timeframe,
  getChartData,
  getTimeframeData,
  getToplineData,
} from './action';

export type DockDataFetcherFunction = (
  dockId: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

interface Dock {
  id: number;
  name: string;
}

function Bold({ children }: { children: string }) {
  return (
    <Box component='span' fontWeight='bold'>
      {children}
    </Box>
  );
}

export default memo(function DockData() {
  const [borough, setBorough] = React.useState<Borough>('Brooklyn');
  const [dock, setDock] = React.useState<Dock>({ name: '', id: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [mostRecentMonth, setMostRecentMonth] = React.useState<number>(0);
  const [mostRecentYear, setMostRecentYear] = React.useState<number>(0);
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );

  function clearDock() {
    setDock({ name: '', id: 0 });
  }

  const docks = useContext(StationsContext)[borough];

  const dockNames = docks.map((d) => d.name).sort((a, b) => (a > b ? 1 : -1));

  function handleBoroughChange(event: SelectChangeEvent) {
    const value = event.target.value;

    if (isBorough(value)) {
      setBorough(borough);
      clearDock();
    }
  }

  function handleDockChange(event: SyntheticEvent, value: string | null) {
    if (value === null || value === '') {
      clearDock();
    } else {
      const id = docks.find((d) => d.name === value)?.id;
      if (id !== undefined) {
        setDock({
          name: value,
          id,
        });
      }
    }
  }

  React.useEffect(() => {
    const updateMostRecentMonthAndYear = async () => {
      const { month, year } = await getMostRecentDateInDatabase();
      setMostRecentMonth(month);
      setMostRecentYear(year);
    };

    updateMostRecentMonthAndYear();
  }, []);

  React.useEffect(() => {
    if (dock.name !== '') {
      setIsLoading(true);
      setTimeframe(undefined);
      getTimeframeData({ dockId: dock.id }).then((newData) => {
        setTimeframe(newData);
        setIsLoading(false);
      });
    }
  }, [dock]);

  const dataFetcherFunc: DockDataFetcherFunction = (
    dockId: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData(
      { dockId: parseInt(dockId) },
      daily,
      startDate,
      endDate,
    );
  };

  const dataIsNotUpToDate = !!(
    timeframe
    && mostRecentYear
    && mostRecentMonth
    && (mostRecentMonth !== timeframe.lastDate.getMonth() + 1
      || mostRecentYear !== timeframe.lastDate.getFullYear())
  );

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          pt: 1,
          width: '100%',
          marginTop: 4,
        }}
      >
        <Box>
          <FormControl fullWidth>
            <InputLabel id='borough-options-label'>Borough</InputLabel>
            <Select
              labelId='borough-options-label'
              id='borough-options'
              value={borough}
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

        <Autocomplete
          sx={{ width: '100%' }}
          id='player'
          options={['', ...dockNames]}
          value={dock.name}
          filterOptions={(stations, { inputValue }) => {
            const inputTokens = inputValue
              .split(' ')
              .map((v) => v.trim().toLowerCase())
              .filter((t) => t !== '&');

            return stations.filter((station) => {
              const lowercaseStation = station.toLowerCase();

              if (lowercaseStation.includes('&')) {
                const [firstPart, secondPart] = lowercaseStation
                  .split('&')
                  .map((p) => p.trim());

                return inputTokens.every(
                  (v) => firstPart.includes(v) || secondPart.includes(v),
                );
              } else {
                return inputTokens.every((v) => lowercaseStation.includes(v));
              }
            });
          }}
          onChange={handleDockChange}
          renderInput={(p) => (
            <TextField
              {...p}
              label='Station'
              InputProps={{
                ...p.InputProps,
                endAdornment: (
                  <React.Fragment>{p.InputProps.endAdornment}</React.Fragment>
                ),
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => {
            const matches = match(option, inputValue, {
              insideWords: true,
            });
            const parts = parse(option, matches);

            return (
              <li {...props} key={option}>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      whiteSpace: 'pre',
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}
              </li>
            );
          }}
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => (
              <Chip {...getTagProps({ index })} key={option} label={option} />
            ));
          }}
        />
      </Box>

      {dataIsNotUpToDate && (
        <Alert severity='warning' sx={{ mt: 3 }}>
          <b>Warning:</b> There is no recent data for this station. It may have
          been moved, removed, renamed, or perhaps destroyed in a{' '}
          <a href='https://crashnotaccident.com/'>car crash</a>.
        </Alert>
      )}

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

      {!isLoading && (dock.name === '' || timeframe === undefined) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography>
            <>
              Select a <Bold>{borough}</Bold> station to see some data.
            </>
          </Typography>
        </Box>
      )}

      {!isLoading && dock.name !== '' && timeframe !== undefined && (
        <Topline
          borough={borough}
          dataFetcherFunc={() => getToplineData({ dockId: dock.id })}
          dockName={dock.name}
          maxDate={timeframe.lastDate}
          minDate={timeframe.firstDate}
          outOfDate={dataIsNotUpToDate}
        />
      )}

      {dock.name && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            userSelection={`${dock.id}`}
          />
        </Box>
      )}
    </>
  );
});
