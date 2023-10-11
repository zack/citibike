import { DockData } from './action';
import Image from 'next/image';
import React from 'react';
import { format } from 'date-fns';

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

function pad(num: number|undefined) {
  if (num === undefined) {
    return '';
  } else if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}

function getDataLabel(day: number|undefined, month: number, year: number) {
  if (day === undefined) {
    return format(new Date(year, month-1, 1), "MMM ''yy");
  } else {
    return format(new Date(year, month-1, day), "MMM d ''yy");
  }
}

export default function Chart({
  daily,
  isLoading,
  dockData,
} : {
  daily: boolean,
  dockData: DockData|undefined,
  isLoading: boolean
}) {
  const chartData =
    dockData?.countsAsStartDock.map(
      data => ({
        ends: dockData.countsAsEndDock.find(d => d.month === data.month)?.count ?? 0,
        month: data.month,
        day: data.day,
        name: getDataLabel(data.day, data.month, data.year),
        starts: data.count,
        year: data.year,
      })
  ).sort((a,b) => `${a.year}${pad(a.month)}${pad(a.day)}` > `${b.year}${pad(b.month)}${pad(b.day)}` ? 1 : -1);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Image alt='loading spinner' src='/citibike-loader.gif' width={200} height={111} />
      </Box>
    );
  }

  // No dock selected
  if (dockData === undefined) {
    return null;
  }

  if (dockData.countsAsStartDock.length + dockData.countsAsEndDock.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography> No data for that time preiod. </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer>
      <BarChart
        style={{
          fontFamily: ubuntuMonoFontFamily,
        }}
        width={800}
        height={500}
        barCategoryGap={daily ? '1%' : '10%'}
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: -15,
          bottom: 10,
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
        <Bar dataKey='starts' stackId='a' fill='#32908F' />
        <Bar dataKey='ends' stackId='a' fill='#26C485' />
      </BarChart>
    </ResponsiveContainer>
  );
}
