'use client';

import DataContainer from './DataContainer';
import { Granularity } from './constants';
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
import { Borough, ChartData } from './action';
import React, { SyntheticEvent, useContext } from 'react';
import { Timeframe, getChartData, getToplineData } from './action';
import { parseAsString, useQueryState } from 'nuqs';

export type StationDataFetcherFunction = (
  stationId: string,
  granularity: Granularity,
  startDate: Date,
  endDate: Date,
) => Promise<ChartData[]>;

function Bold({ children }: { children: string }) {
  return (
    <Box component='span' fontWeight='bold'>
      {children}
    </Box>
  );
}

function parseBorough(input: string): Borough {
  if (isBorough(input)) {
    return input;
  } else {
    return 'Brooklyn';
  }
}

function parseStationId(input: string): number {
  return !isNaN(parseInt(input)) ? parseInt(input) : 0;
}

export default function StationData() {
  const [borough, setBorough] = useQueryState('borough', {
    parse: parseBorough,
    defaultValue: 'Brooklyn',
    clearOnDefault: true,
  });
  const [stationName, setStationName] = useQueryState(
    'name',
    parseAsString.withDefault(''),
  );
  const [stationId, setStationId] = useQueryState('id', {
    parse: parseStationId,
    defaultValue: 0,
    clearOnDefault: true,
  });
  const [isLoading, setLoading] = React.useState(false);
  const [mostRecentMonth, setMostRecentMonth] = React.useState<number>(0);
  const [mostRecentYear, setMostRecentYear] = React.useState<number>(0);
  const [timeframe, setTimeframe] = React.useState<Timeframe | undefined>(
    undefined,
  );

  function clearStation() {
    setStationName('');
    setStationId(0);
  }

  if (!isBorough(borough)) {
    throw 'Borough is incorrectly defined';
  }

  const stations = useContext(StationsContext)[borough];

  const stationNames = stations
    .map((d) => d.name)
    .sort((a, b) => (a > b ? 1 : -1));

  function handleBoroughChange(event: SelectChangeEvent) {
    setTimeframe(undefined);
    const value = event.target.value;

    if (isBorough(value)) {
      setBorough(value);
      clearStation();
    }
  }

  function handleStationChange(event: SyntheticEvent, value: string | null) {
    setTimeframe(undefined);
    if (value === null || value === '') {
      clearStation();
    } else {
      const id = stations.find((d) => d.name === value)?.id;
      if (id !== undefined) {
        setStationName(value);
        setStationId(id);
      }
    }
  }

  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      const response = await fetch('/api/mostrecentdate');
      if (!ignore) {
        const { month, year } = await response.json();
        setMostRecentMonth(month);
        setMostRecentYear(year);
      }
    }
    cb();

    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      // Wait for timeframe to be undefined to make sure Topline has an undefined
      // timeframe, otherwise it will try to immediately call the data fetcher
      // function, which prevents getTimeframeData from executing
      // ...for some reason.
      if (stationName !== '' && timeframe === undefined) {
        setLoading(true);
        const response = await fetch(
          `/api/timeframe?type=station&specifier=${stationId}`,
        );
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
  }, [stationId, stationName, timeframe]);

  const dataFetcherFunc: StationDataFetcherFunction = (
    stationId: string,
    granularity: Granularity,
    startDate: Date,
    endDate: Date,
  ) => {
    const daily = granularity === Granularity.Daily;
    return getChartData(
      { stationId: parseInt(stationId) },
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
          options={['', ...stationNames]}
          value={stationName}
          blurOnSelect='touch'
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
          onChange={handleStationChange}
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

      {!isLoading && stationName === '' && (
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

      {stationName !== '' && (
        <Topline
          borough={borough}
          dataFetcherFunc={() => getToplineData({ stationId })}
          maxDate={timeframe?.lastDate}
          minDate={timeframe?.firstDate}
          outOfDate={dataIsNotUpToDate}
          parentLoading={isLoading}
          stationName={stationName}
        />
      )}

      {stationName !== '' && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            dataFetcherFunc={dataFetcherFunc}
            maxDate={timeframe?.lastDate}
            minDate={timeframe?.firstDate}
            parentLoading={isLoading}
            userSelection={`${stationId}`}
          />
        </Box>
      )}
    </>
  );
}
