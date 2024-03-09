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
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Image
          alt='loading spinner'
          src='/citibike-loader.gif'
          width={200}
          height={111}
        />
      </Box>
    );
  } else {
    return children;
  }
}
