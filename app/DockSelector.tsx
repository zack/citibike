'use client';

import React from 'react';
import { getDockTrips } from './action';
import {
  Autocomplete,
  Box,
  Chip,
  Container,
  TextField,
} from "@mui/material";


export default function DockSelector({ docks } : { docks: Dock[] }) {
  const [dock, setDock] = React.useState<Dock|undefined>(undefined);
  const [dockTrips, setDockTrips] = React.useState(0);
  const dockNames = docks.map((d: Dock) => d.name);

  const handleDockChange = async (_event: unknown, newValue: string | null) => {
    if (newValue !== null) {
      const newDock = docks.find(d => d.name === newValue);
      if (newDock !== undefined) {
        setDock(newDock);
        const trips = await getDockTrips(newDock.id);
        setDockTrips(trips);
      }
    } else {
      setDock(undefined);
    }
  }

  return (
    <Container>
      <Box>
        <Autocomplete
          sx={{ flexGrow: 2, pr: 2 }}
          id="player"
          options={dockNames}
          value={dock?.name || ''}
          onChange={handleDockChange}
          renderInput={(p) => <TextField {...p} label="Dock" />}
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
      </Box>

      {dock !== undefined ?
        <Box> Trips: {dockTrips} </Box>
        : null
      }
    </Container>
  );
}
