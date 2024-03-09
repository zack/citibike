import { Box } from '@mui/material';
import Image from 'next/image';
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
        <Box sx={{ paddingY: 3 }}>
          <Image
            className='swing'
            alt='loading spinner'
            src='/citibike-loader.png'
            width={200}
            height={111}
          />
        </Box>
      </Box>
      {isLoading ? null : children}
    </>
  );
}
