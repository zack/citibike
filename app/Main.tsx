'use client';

import DataContainer from './DataContainer';
import Topline from './Topline';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import React, { SyntheticEvent } from 'react';

export enum Granularity {
  Daily,
  Monthly,
}

interface Dock {
  id: number;
  name: string;
}

export default function Main({
  docks,
  maxDate,
  minDate,
}: {
  docks: Dock[];
  minDate: Date;
  maxDate: Date;
}) {
  const [dock, setDock] = React.useState<{
    name: string;
    id: number | undefined;
  }>({ name: '', id: undefined });
  const dockNames = docks.map((d) => d.name).sort((a, b) => (a > b ? 1 : -1));

  function handleDockChange(event: SyntheticEvent, value: string | null) {
    setDock({
      name: value ?? '',
      id: docks.find((d) => d.name === value)?.id,
    });
  }

  return (
    <>
      <Autocomplete
        sx={{ width: '100%' }}
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

      {dock.name === '' ? (
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
      ) : (
        <>
          <Topline dockId={dock.id} dockName={dock.name} />
          <DataContainer minDate={minDate} maxDate={maxDate} dockId={dock.id} />
        </>
      )}
    </>
  );
}
