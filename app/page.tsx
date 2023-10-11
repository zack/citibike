import Main from './Main';
import React from 'react';
import { exoFontFamily } from './ThemeProvider';
import { getDocks } from './action';

import {
  Grid,
  Typography,
} from "@mui/material";

export default async function Home() {
  const docks = await getDocks();

  return (
    <main>
      <Grid container justifyContent="center" columns={{ xs: 6, sm: 8, md: 8, lg: 12 }} height='90vh' >
        <Grid item xs={6} sx={{ height: '100%', display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
            Select a Dock
          </Typography>

          <Main docks={docks}/>
        </Grid>
      </Grid>
    </main>
  );
}
