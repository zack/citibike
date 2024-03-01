import { DockData } from './action';
import React from 'react';

import { Box, Container, Paper } from '@mui/material';

export enum Granularity {
  Daily,
  Monthly,
}

export default function Data({
  dockData,
  granularity,
}: {
  dockData: DockData | undefined;
  granularity: Granularity;
}) {
  if (dockData === undefined) {
    // This is for Typescript
    return null;
  }

  const totalTrips = dockData.reduce((memo, month) => {
    return month.acoustic + month.electric + memo;
  }, 0);

  const totalElectric = dockData.reduce((memo, month) => {
    return month.electric + memo;
  }, 0);

  const granularityString =
    granularity === Granularity.Daily ? 'daily' : 'monthly';

  return (
    <Container>
      <Paper>
        <Box>Total trips: {totalTrips}</Box>

        <Box>Total% electric = {totalElectric / totalTrips}%</Box>

        <Box>Granularity: {granularityString}</Box>

        <Box>Trips per: {totalTrips / dockData.length}</Box>

        <Box>Electric Trips per (avg): {totalElectric / dockData.length}</Box>
      </Paper>
    </Container>
  );
}
