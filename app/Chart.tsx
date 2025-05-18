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
  chartConfig,
  chartData,
}: {
  daily: boolean;
  chartConfig: {type: boolean, direction: boolean};
  chartData: NamedChartData[];
}) {
  const getMaxValueInData = React.useCallback(() => {
    return chartData.reduce((memo, val) => {
      return val.total > memo ? val.total : memo;
    }, -1);
  }, [chartData]);

  const maxValueInData = getMaxValueInData();

  const generateTicks = React.useCallback(() => {
    const powersOfTen = [
      10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000,
    ];

    const powerOfTen = powersOfTen.reduce((memo, power) => {
      if (memo === 0 && maxValueInData < power * 1.5) {
        return power;
      } else {
        return memo;
      }
    }, 0);

    const tickValue = powerOfTen / 10;

    return Array.from(
      { length: (maxValueInData + tickValue) / tickValue + 1 },
      (_value, index) => index * tickValue,
    );
  }, [maxValueInData]);

  const ticks = generateTicks();

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
          There is no data for this station in this time period.
        </Typography>
      </Box>
    );
  }

  const getBarChartLeftMargin = () => {
    const widestTickLength = maxValueInData.toLocaleString('en-US').length;
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
        <YAxis
          tickFormatter={(tick) => tick.toLocaleString('en-US')}
          ticks={ticks}
          domain={[0, ...ticks.slice(-1)]}
        />

        <Tooltip
          cursor={{ fill: '#EEE' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const total = payload.reduce((memo, val) => memo + parseInt(`${val.value}`, 10), 0);

              return (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography
                    variant='h6'
                    component='div'
                    sx={{ fontFamily: exoFontFamily }}
                  >
                    {label}
                  </Typography>

                  { payload.length > 1 && payload.map((p, index) => (
                    <div key={index}style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography style={{ paddingRight: '36px' }}>{p.name}:</Typography>
                        <Typography>{p.value?.toLocaleString('en-US')}</Typography>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography style={{ paddingRight: '36px' }}>
                      <b>Total:</b>
                    </Typography>
                    <Typography>
                      <b>{total.toLocaleString('en-US')}</b>
                    </Typography>
                  </div>
                </Paper>
              );
          }
          }}
          />

        <Legend
          height={36}
          formatter={(value) => (
            <span style={{ fontSize: '1.5rem', color: '#000' }}> {value} </span>
          )}
        />

        {/* An unfortunately messy solution, but react fragments break the chart,
        so using a helper function doesn't work */}

        {/* Break up bars by both type & direction */}
        {chartConfig.type && chartConfig.direction &&
          <Bar name="Acoustic Arrivals" dataKey='acousticArrive' stackId='a' fill='#0150B4' isAnimationActive={false} />
        }
        {chartConfig.type && chartConfig.direction &&
          <Bar name="Acoustic Departures" dataKey='acousticDepart' stackId='a' fill='#01285A' isAnimationActive={false} />
        }
        {chartConfig.type && chartConfig.direction &&
          <Bar name="Electric Departures" dataKey='electricDepart' stackId='a' fill='#61605E' isAnimationActive={false} />
        }
        {chartConfig.type && chartConfig.direction &&
          <Bar name="Electric Arrivals" dataKey='electricArrive' stackId='a' fill='#C1BFBB' isAnimationActive={false} />
        }

        {/* Break up bars by only type */}
        {chartConfig.type && !chartConfig.direction &&
          <Bar name="Acoustic" dataKey='acoustic' stackId='a' fill='#0150B4' isAnimationActive={false} />
        }
        {chartConfig.type && !chartConfig.direction &&
          <Bar name="Electric" dataKey='electric' stackId='a' fill='#C1BFBB' isAnimationActive={false} />
        }

        {/* Break up bars by only direction */}
        {!chartConfig.type && chartConfig.direction &&
          <Bar name="Arrivals" dataKey='arrive' stackId='a' fill='#309898' isAnimationActive={false} />
        }
        {!chartConfig.type && chartConfig.direction &&
          <Bar name="Departures" dataKey='depart' stackId='a' fill='#F4631E' isAnimationActive={false} />
        }

        {/* Don't break up bars at all */}
        {!chartConfig.type && !chartConfig.direction &&
          <Bar name="Total uses" dataKey="total" stackId='a' fill='#0150B4' isAnimationActive={false} />
        }

        </BarChart>
      </ResponsiveContainer>
  );
}
