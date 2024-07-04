'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import FAQ from './FAQ';
import HelpIcon from '@mui/icons-material/Help';
import Main from './Main';
import React from 'react';

import { exoFontFamily } from './ThemeProvider';

import styled from '@emotion/styled';

import { Grid, Typography } from '@mui/material';

export default function Home() {
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
              CitiBike Dock Data
            </Typography>

            <div style={{ display: 'flex-item' }}>
              {faq ? (
                <StyledButton onClick={() => setFaq(false)}>
                  <CancelIcon /> <Typography> Back </Typography>
                </StyledButton>
              ) : (
                <StyledButton onClick={() => setFaq(true)}>
                  <HelpIcon /> <Typography> FAQ </Typography>
                </StyledButton>
              )}
            </div>
          </div>

          {faq ? <FAQ /> : <Main />}
        </Grid>
      </Grid>
    </main>
  );
}

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
