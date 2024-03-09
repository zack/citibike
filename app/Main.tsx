'use client';

import ChartContainer from './ChartContainer';
import PropTypes from 'prop-types';
import React from 'react';

import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

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
  const [dockName, setDockName] = React.useState<string>('');
  const dockNames = docks.map((d) => d.name).sort((a, b) => (a > b ? 1 : -1));

  const NoDockContainer = ({
    dockName,
    children,
  }: {
    dockName: string;
    children: JSX.Element;
  }) => {
    if (dockName === '') {
      return (
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
      );
    } else {
      return children;
    }
  };

  NoDockContainer.propTypes = {
    dockData: PropTypes.object,
    children: PropTypes.node.isRequired,
  };

  return (
    <>
      <Autocomplete
        sx={{ width: '100%' }}
        id='player'
        options={['', ...dockNames]}
        value={dockName}
        onChange={(e, v) => setDockName(v ?? '')}
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
      <NoDockContainer dockName={dockName}>
        <ChartContainer
          dockId={docks.find((d) => d.name === dockName)?.id}
          maxDate={maxDate}
          minDate={minDate}
        />
      </NoDockContainer>
    </>
  );
}
