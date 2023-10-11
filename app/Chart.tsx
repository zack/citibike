import { DockData } from './action';
import Image from 'next/image';
import React from 'react';

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

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import { exoFontFamily, ubuntuMonoFontFamily } from './ThemeProvider';

function getMonthName(monthNumber: number) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', {
    month: 'short',
  });
}

function pad(num: number) {
  if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}

export default function Chart({
  dockData,
  isLoading
} : {
  dockData: DockData|undefined,
  isLoading: boolean
}) {
  const chartData =
    dockData?.countsAsStartDock.map(
      data => ({
        ends: dockData.countsAsEndDock.find(d => d.month === data.month)?.count ?? 0,
        month: data.month,
        name: `${getMonthName(data.month)} '${`${data.year}`.slice(2,)}`,
        starts: data.count,
        year: data.year,
      })
  ).sort((a,b) => `${a.year}${pad(a.month)}` > `${b.year}${pad(b.month)}` ? 1 : -1);

  return (
    <Box sx={{
      alignItems: 'center',
      aspectRatio: '1',
      backgroundImage: `${isLoading ? 'url(/citibike-blank-chart.png)' : ''}`,
      backgroundSize: '100% 100%',
      display: 'flex',
      justifyContent: 'center',
      ml: -1,
      pt: 2,
      width: '100%',
      }}
    >

      {isLoading ? (
        <Image alt='loading spinner' src='/citibike-loader.gif' width={200} height={111} />
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
        top: 0,
        right: 10,
        left: 0,
        bottom: 0,
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
        <Bar dataKey='starts' stackId='a' fill='#26C485' />
        <Bar dataKey='ends' stackId='a' fill='#32908F' />
        </BarChart>
        </ResponsiveContainer>
        : null}
    </Box>
  );
}
