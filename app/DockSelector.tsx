'use client';

import Image from 'next/image';
import React from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DockData, getDockData } from './action';
import { exoFontFamily, ubuntuMonoFontFamily } from './ThemeProvider';

function getMonthName(monthNumber: number) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', {
    month: 'short',
  });
}

export default function DockSelector({ docks } : { docks: { id: number, name: string }[] }) {
  const [dockName, setDockName] = React.useState<string>('');
  const [dockData, setDockData] = React.useState<DockData|undefined>(undefined);
  const dockNames = docks.map(d => d.name).sort((a,b) => a > b ? 1 : -1);

  const handleDockChange = async (_event: unknown, newValue: string | null) => {
    const newDockName = newValue ?? '';

    setDockName(newDockName);
    setDockData(undefined);

    if (newDockName !== '') {
      const newDock = docks.find(d => d.name === newDockName);
      if (newDock !== undefined) {
        const newDockData = await getDockData(newDock.id);
        setDockData(newDockData);
      }
    }
  }

  let chartData;
  if (dockData !== undefined) {
    chartData = dockData.countsAsStartDock.map(data => ({
      name: getMonthName(data.month),
      monthIdx: data.month,
      starts: data.count,
      ends: dockData.countsAsEndDock.find(d => d.month === data.month)?.count ?? 0,
    })).sort((a,b) => a.monthIdx > b.monthIdx ? 1 : -1);
  }

  return (
    <Container>
      <Box>
        <Autocomplete
          sx={{ flexGrow: 2, pr: 2 }}
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
      </Box>


      <Box sx={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {(dockName !== '' && dockData == undefined) ? (
          <Box sx={{ width: '100%', height: '100%', backgroundImage: 'url(/citibike-blank-chart.png)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image alt='loading spinner' src='/citibike-loader.gif' width={200} height={111} />
          </Box>
        ): null}
        {dockData !== undefined ?
          <ResponsiveContainer>
            <BarChart
              style={{
                fontFamily: ubuntuMonoFontFamily,
              }}
              width={800}
              height={500}
              data={chartData}
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
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = parseInt(`${payload[0].value}` ?? '', 10) + parseInt(`${payload[1].value}`, 10)

                    return (
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" component="div" sx={{ fontFamily: exoFontFamily }}>
                          {label}
                        </Typography>
                        <Typography>total: {total}</Typography>
                        <Typography>{payload[0].name}: {payload[0].value}</Typography>
                        <Typography>{payload[1].name}: {payload[1].value}</Typography>
                      </Paper>
                    );
                  }
                }}
              />
              <Legend />
              <Bar dataKey='starts' stackId='a' fill='#FB3692' />
              <Bar dataKey='ends' stackId='a' fill='#FB9F36' />
            </BarChart>
          </ResponsiveContainer>
          : null
        }
      </Box>
    </Container>
  );
}
