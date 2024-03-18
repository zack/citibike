import React from 'react';

import { Box, Container, Paper } from '@mui/material';

export default function Data({ isLoading }: { isLoading: boolean }) {
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
        Loading...
      </Box>
    );
  }

  return (
    <Container>
      <Paper>
        <Box>This is where the data goes</Box>
      </Paper>
    </Container>
  );
}
