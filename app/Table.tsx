import { Box } from '@mui/material';
import { ChartData } from './types';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';

import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface ChartDataRowBase {
  acousticArrive: string;
  acousticDepart: string;
  electricArrive: string;
  electricDepart: string;
  id: number;
  total: string;
}

interface ChartDataRowDaily extends ChartDataRowBase {
  date: string;
  month?: never;
}

interface ChartDataRowMonthly extends ChartDataRowBase {
  date?: never;
  month: string;
}

type ChartDataRow = ChartDataRowMonthly | ChartDataRowDaily;

export default function Table({
  data,
  isLoading,
}: {
  data?: ChartData[];
  isLoading: boolean;
}) {
  const daily = data ? data[0].day !== undefined : true;

  const columns: GridColDef[] = [
    {
      field: daily ? 'date' : 'month',
      headerName: daily ? 'Date' : 'Month',
      flex: 1,
    },
    {
      field: 'acousticArrive',
      headerName: 'Trips Arriving (acoustic)',
      flex: 1,
    },
    {
      field: 'acousticDepart',
      headerName: 'Trips Departing (acoustic)',
      flex: 1,
    },
    {
      field: 'electricArrive',
      headerName: 'Trips Arriving (electric)',
      flex: 1,
    },
    {
      field: 'electricDepart',
      headerName: 'Trips Departing (electric)',
      flex: 1,
    },
    {
      field: 'total',
      headerName: 'Trips (total)',
      flex: 1,
    },
  ];

  const tableData = data?.map((row): ChartDataRow => {
    const base = {
      acousticArrive: row.acousticArrive.toLocaleString('en-US'),
      acousticDepart: row.acousticDepart.toLocaleString('en-US'),
      electricArrive: row.electricArrive.toLocaleString('en-US'),
      electricDepart: row.electricDepart.toLocaleString('en-US'),
      total: (row.acousticArrive + row.acousticDepart + row.electricArrive + row.electricDepart).toLocaleString('en-US'),
    };

    if (daily) {
      return {
        ...base,
        id: new Date(row.year, row.month - 1, row.day).getTime(),
        date: new Date(row.year, row.month - 1, row.day)
          .toISOString()
          .slice(0, 10),
      };
    } else {
      return {
        ...base,
        id: new Date(row.year, row.month - 1, 1).getTime(),
        month: new Date(row.year, row.month - 1, 1).toISOString().slice(0, 7),
      };
    }
  });

  tableData?.sort((a, b) => {
    if (a.date && b.date) {
      return b.date.localeCompare(a.date);
    } else if (a.month && b.month) {
      return b.month.localeCompare(a.month);
    } else {
      // this should never happen
      return 0;
    }
  });

  return (
    // I know this looks like a really weird and stupid way to handle an
    // if/else for display, but it solves the issue of the spinner component
    // taking a long time to load when the user switches granularity from
    // 'Monthly' to 'Daily' on a massive dataset. This approach makes the
    // loader show up much more quickly since it's already rendered.
    <>
      <Box
        sx={{
          display: isLoading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          height: '850px',
        }}
      >
        <LoadingSpinner />
      </Box>
      {isLoading || !tableData ? null : (
        <DataGrid
          columns={columns}
          rows={tableData}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      )}
    </>
  );
}
