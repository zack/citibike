'use client';

import React from 'react';
import { getDockData } from './action';
import {
  Autocomplete,
  Box,
  Chip,
  Container,
  TextField,
} from "@mui/material";

{/*
  * import {
  *   Bar,
  *   BarChart,
  *   CartesianGrid,
  *   Legend,
  *   Tooltip,
  *   XAxis,
  *   YAxis,
  * } from 'recharts';
  */}

export default function DockSelector({ docks } : { docks: string[] }) {
  const [dock, setDock] = React.useState<string>('');
  const [_dockData, setDockData] = React.useState<{ isStartDock: boolean }[]|undefined>(undefined);
  console.log(docks);

  const handleDockChange = async (_event: unknown, newValue: string | null) => {
    const newDockName = newValue ?? '';
    setDock(newDockName);
    if (newDockName !== '') {
      const newDockData = await getDockData(newDockName);
      setDockData(newDockData);
    }
  }

  return (
    <Container>
      <Box>
        <Autocomplete
          sx={{ flexGrow: 2, pr: 2 }}
          id="player"
          options={docks}
          value={dock}
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

      {/*dock !== undefined ?
        <Box>
          <BarChart
            width={500}
            height={300}
            data={dockData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='start' stackId='a' fill='#8884D8' />
            <Bar dataKey='end' stackId='a' fill='#82CA9d' />
          </BarChart>
        </Box>
        : null
        */}
    </Container>
  );
}
