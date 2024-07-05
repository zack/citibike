import { NamedChartData } from './DataContainer';
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
  chartData: NamedChartData[];
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

  const getBarChartLeftMargin = () => {
    const maxValue = chartData.reduce((memo, val) => {
      const valSum = val.acoustic + val.electric;
      return valSum > memo ? valSum : memo;
    }, -1);

    const widestTickLength = maxValue.toLocaleString('en-US').length;
    if (widestTickLength < 7) {
      return 0;
    } else if (widestTickLength < 9) {
      return 10;
    } else {
      return 20;
    }
  };

  return (
    <ResponsiveContainer height={570}>
      <BarChart
        style={{
          fontFamily: ubuntuMonoFontFamily,
        }}
        barCategoryGap={daily ? '1%' : '10%'}
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: getBarChartLeftMargin(),
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='name'
          angle={-45}
          tickMargin={daily ? 29 : 22}
          dx={daily ? -26 : -23}
          height={70}
        />
        <YAxis tickFormatter={(tick) => tick.toLocaleString('en-US')} />
        <Tooltip
          cursor={{ fill: '#EEE' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const total =
                parseInt(`${payload[0].value}` ?? '', 10)
                + parseInt(`${payload[1].value}`, 10);

              return (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography
                    variant='h6'
                    component='div'
                    sx={{ fontFamily: exoFontFamily }}
                  >
                    {label}
                  </Typography>
                  <Typography>
                    total: {total.toLocaleString('en-US')}
                  </Typography>
                  <Typography>
                    {payload[1].name}:{' '}
                    {payload[1].value?.toLocaleString('en-US')}
                  </Typography>
                  <Typography>
                    {payload[0].name}:{' '}
                    {payload[0].value?.toLocaleString('en-US')}
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
