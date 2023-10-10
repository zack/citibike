import DockSelector from './DockSelector';
import React from 'react';
import { exoFontFamily } from './ThemeProvider';
import { getDocks } from './action';

import {
  Box,
  Grid,
  Typography,
} from "@mui/material";

export default async function Home() {
  const docks = await getDocks();

  return (
    <main>
      <Grid container justifyContent="center" columns={{ xs: 6, sm: 8, md: 12 }}>
        <Grid item xs={6}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
            Select a Dock
          </Typography>

          <Box sx={{ display: 'flex', p: 0 }}>
            <DockSelector docks={docks}/>
          </Box>
        </Grid>
      </Grid>
    </main>
  );
}
