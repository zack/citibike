import { Box } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export default function LoadingSpinner() {
  return (
    <Box sx={{ paddingY: 3 }}>
      <Image
        className='swing'
        alt='loading spinner'
        src='/citibike-loader.png'
        width={200}
        height={111}
      />
    </Box>
  );
}
