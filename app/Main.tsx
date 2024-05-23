'use client';

import DataContainer from './DataContainer';
import LoadingSpinner from './LoadingSpinner';
import Topline from './Topline';
import { getDocks } from './action';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DockTimeframe, getDockTimeframe } from './action';
import React, { SyntheticEvent } from 'react';

export enum Granularity {
  Daily,
  Monthly,
}

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

export default function Main() {
  const [borough, setBorough] = React.useState<string>('Brooklyn');
  const [docks, setDocks] = React.useState<Dock[]>([]);
  const [dock, setDock] = React.useState<Dock>({ name: '', id: 0 });
  const [docksLoading, setDocksLoading] = React.useState<boolean>(true);
  const [dockTimeframe, setDockTimeframe] = React.useState<
    DockTimeframe | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const dockNames = docks.map((d) => d.name).sort((a, b) => (a > b ? 1 : -1));

  function handleDockChange(event: SyntheticEvent, value: string | null) {
    if (value === null || value === '') {
      // use cleared the input
      setDock({ name: '', id: 0 });
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
    setDocksLoading(true);
    setDock({ name: '', id: 0 });
    async function fn() {
      const newDocks = await getDocks(borough);
      setDocks([...newDocks]);
      setDocksLoading(false);
    }
    fn();
  }, [borough]);

  React.useEffect(() => {
    if (dock.name !== '') {
      setIsLoading(true);
      setDockTimeframe(undefined);
      getDockTimeframe(dock.id).then((newData) => {
        setDockTimeframe(newData);
        setIsLoading(false);
      });
    }
  }, [dock]);

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
              onChange={(e) => setBorough(e.target.value)}
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
          disabled={docksLoading}
          options={['', ...dockNames]}
          value={dock.name}
          onChange={handleDockChange}
          renderInput={(p) => (
            <TextField
              {...p}
              label='Dock'
              InputLabelProps={{ shrink: true }}
              InputProps={{
                ...p.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {docksLoading ? (
                      <CircularProgress color='inherit' size={20} />
                    ) : (
                      p.InputProps.endAdornment
                    )}
                  </React.Fragment>
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

      {!isLoading && (dock.name === '' || dockTimeframe === undefined) && (
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
              Select a <Bold>{borough}</Bold> dock to see some data.
            </>
          </Typography>
        </Box>
      )}

      {!isLoading && dock.name !== '' && dockTimeframe !== undefined && (
        <Topline
          borough={borough}
          dockId={dock.id}
          dockName={dock.name}
          minDate={dockTimeframe.firstDate}
          maxDate={dockTimeframe.lastDate}
        />
      )}

      {dock.name && (
        <Box sx={{ paddingBottom: 5 }}>
          <DataContainer
            minDate={dockTimeframe?.firstDate}
            maxDate={dockTimeframe?.lastDate}
            dockId={dock.id}
          />
        </Box>
      )}
    </>
  );
}
