import { Box } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';

export default function ChartLoadingContainer({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: JSX.Element;
}) {
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
      {isLoading ? null : children}
    </>
  );
}
