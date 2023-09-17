import DockSelector from './DockSelector';
import React from 'react';
import { exoFontFamily } from './ThemeProvider';
import { getDocks } from './action';

import {
  Box,
  Container,
  Typography,
} from "@mui/material";

export default async function Home() {
  const docks = await getDocks();

  return (
    <main>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
          Select a Dock
        </Typography>

        <Box sx={{ display: 'flex', pb: 2 }}>
          <DockSelector docks={docks}/>
        </Box>
      </Container>
    </main>
  );
}
