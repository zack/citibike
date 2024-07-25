import FAQButton from './FAQButton';
import FAQContainer from './FAQContainer';

import { exoFontFamily } from './ThemeProvider';

import { Box, Grid, Typography } from '@mui/material';

import React, { memo } from 'react';

export default memo(function Home() {
  return (
    <main>
      <Grid
        container
        justifyContent='center'
        columns={{ xs: 6, sm: 8, md: 8, lg: 12 }}
        height='90vh'
      >
        <Grid
          item
          xs={6}
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 2,
            }}
          >
            <Typography
              variant='h4'
              component='h1'
              sx={{
                fontFamily: exoFontFamily,
                display: 'flex-item',
              }}
            >
              Citi Bike Station Data
            </Typography>

            <Box sx={{ display: 'flex-item', mb: 1 }}>
              <FAQButton />
            </Box>
          </div>

          <FAQContainer />
        </Grid>
      </Grid>
    </main>
  );
});
