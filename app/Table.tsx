'use client';

import { Box } from '@mui/material';
import { DockData } from './action';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';

import { DataGrid, GridColDef } from '@mui/x-data-grid';

export default function Table({
  dockData,
  isLoading,
}: {
  dockData: DockData;
  isLoading: boolean;
}) {
  const daily = dockData[0].day !== undefined;

  const columns: GridColDef[] = [
    {
      field: daily ? 'date' : 'month',
      headerName: daily ? 'Date' : 'Month',
      flex: 1,
    },
    {
      field: 'acoustic',
      headerName: 'Trips (acoustic)',
      flex: 1,
    },
    {
      field: 'electric',
      headerName: 'Trips (Electric)',
      flex: 1,
    },
    {
      field: 'total',
      headerName: 'Trips (Total)',
      flex: 1,
    },
  ];

  const tableData = dockData.map((row) => {
    const base = {
      acoustic: row.acoustic,
      electric: row.electric,
      total: row.acoustic + row.electric,
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
          height: '100%',
        }}
      >
        <LoadingSpinner />
      </Box>
      {isLoading ? null : (
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
