import { ChartData } from './DataContainer';
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

import { Box, Paper, Typography } from '@mui/material';

import { exoFontFamily, ubuntuMonoFontFamily } from './ThemeProvider';

export default function Chart({
  daily,
  chartData,
}: {
  daily: boolean;
  chartData: ChartData[];
}) {
  if (chartData.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          marginY: '200px',
        }}
      >
        <Typography>
          There is no data for this dock in this time period.
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer height={500}>
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
