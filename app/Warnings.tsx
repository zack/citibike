import { Alert } from '@mui/material';
import { DockData } from './action';
import React from 'react';

export default function Warnings({
  dockData,
  endDate,
  startDate,
}: {
  dockData: DockData | undefined;
  endDate: Date;
  startDate: Date;
}) {
  if (dockData === undefined) {
    // This is for Typescript
    return null;
  }

  const startMonth = startDate.getUTCMonth() + 1;
  const startYear = startDate.getUTCFullYear();

  const endMonth = endDate.getUTCMonth() + 1;
  const endYear = endDate.getUTCFullYear();

  const firstData = dockData[0];
  const firstDataMonth = firstData.month;
  const firstDataYear = firstData.year;

  const lastData = dockData[dockData.length - 1];
  const lastDataMonth = lastData.month;
  const lastDataYear = lastData.year;

  const noEarlyData =
    startYear < firstDataYear ||
    (startYear === firstDataYear && startMonth < firstDataMonth);

  const noRecentData =
    endYear > lastDataYear ||
    (endYear === lastDataYear && endMonth > lastDataMonth);

  if (!noEarlyData && !noRecentData) {
    return null;
  }

  return (
    <>
      {noEarlyData && (
        <Alert
          sx={{ marginY: 1, border: '1px solid #ed6c02' }}
          severity='warning'
        >
          There is no data about this dock at the <b>start</b> of your selected
          range. This dock may be new.
        </Alert>
      )}

      {noRecentData && (
        <Alert
          sx={{ marginY: 1, border: '1px solid #ed6c02' }}
          severity='warning'
        >
          There is no data about this dock at the <b>end</b> of your selected
          range. This dock may have been removed.
        </Alert>
      )}
    </>
  );
}
