'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import FAQ from './FAQ';
import HelpIcon from '@mui/icons-material/Help';
import ViewPicker from './ViewPicker';

import { exoFontFamily } from './ThemeProvider';

import styled from '@emotion/styled';

import { Box, Grid, Typography } from '@mui/material';

import React, { memo } from 'react';

export default memo(function Home() {
  const [faq, setFaq] = React.useState(false);

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
              {faq ? (
                <StyledButton onClick={() => setFaq(false)}>
                  <CancelIcon /> <Typography> Back </Typography>
                </StyledButton>
              ) : (
                <StyledButton onClick={() => setFaq(true)}>
                  <HelpIcon /> <Typography> FAQ </Typography>
                </StyledButton>
              )}
            </Box>
          </div>

          {faq && <FAQ />}

          {/* Don't lose state when FAQ is opened */}
          <Box sx={{ display: faq ? 'none' : 'block', height: '100%' }}>
            <ViewPicker />
          </Box>
        </Grid>
      </Grid>
    </main>
  );
});

const StyledButton = styled.button`
  background: white;
  border: 0;
  cursor: pointer;
  width: 70px;

  &:hover {
    border-radius: 5px;
    outline: 3px solid #0150b4;
    p {
      font-weight: bold;
    }
  }
`;
