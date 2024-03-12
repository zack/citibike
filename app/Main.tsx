'use client';

import DataContainer from './DataContainer';
import LoadingSpinner from './LoadingSpinner';
import Topline from './Topline';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
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

export default function Main({ docks }: { docks: Dock[] }) {
  const [dock, setDock] = React.useState<Dock>({ name: '', id: 0 });
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
      <Autocomplete
        sx={{ width: '100%', marginTop: 4 }}
        id='player'
        options={['', ...dockNames]}
        value={dock.name}
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

      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '700px',
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
          <Typography> Select a dock to see some data. </Typography>
        </Box>
      )}

      {!isLoading && dock.name !== '' && dockTimeframe !== undefined && (
        <Topline
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
