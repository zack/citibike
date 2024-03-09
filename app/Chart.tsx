import { DockData } from './action';
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

import { Paper, Typography } from '@mui/material';

import { exoFontFamily, ubuntuMonoFontFamily } from './ThemeProvider';

function pad(num: number | undefined) {
  if (num === undefined) {
    return '';
  } else if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}

function getDataLabel(day: number | undefined, month: number, year: number) {
  if (day === undefined) {
    return format(new Date(year, month - 1, 1), "MMM ''yy");
  } else {
    return format(new Date(year, month - 1, day), "MMM d ''yy");
  }
}

export default function Chart({
  daily,
  dockData,
}: {
  daily: boolean;
  dockData: DockData | undefined;
}) {
  const chartData = dockData
    ?.map((data) => ({
      acoustic: data.acoustic,
      day: data.day,
      electric: data.electric,
      month: data.month,
      name: getDataLabel(data.day, data.month, data.year),
      year: data.year,
    }))
    .sort((a, b) =>
      `${a.year}${pad(a.month)}${pad(a.day)}` >
      `${b.year}${pad(b.month)}${pad(b.day)}`
        ? 1
        : -1,
    );

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
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip
          cursor={{ fill: '#EEE' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const total =
                parseInt(`${payload[0].value}` ?? '', 10) +
                parseInt(`${payload[1].value}`, 10);

              return (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography
                    variant='h6'
                    component='div'
                    sx={{ fontFamily: exoFontFamily }}
                  >
                    {label}
                  </Typography>
                  <Typography>total: {total}</Typography>
                  <Typography>
                    {payload[1].name}: {payload[1].value}
                  </Typography>
                  <Typography>
                    {payload[0].name}: {payload[0].value}
                  </Typography>
                </Paper>
              );
            }
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '1.5rem', color: '#000' }}> {value} </span>
          )}
        />
        <Bar dataKey='acoustic' stackId='a' fill='#0150B4' />
        <Bar dataKey='electric' stackId='a' fill='#C1BFBB' />
      </BarChart>
    </ResponsiveContainer>
  );
}
