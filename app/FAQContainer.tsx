'use client';

import FAQ from './FAQ';
import Image from 'next/image';
import React from 'react';

import { exoFontFamily } from './ThemeProvider';
import { useQueryState } from 'nuqs';

import { Box, Typography } from '@mui/material';

export default function FAQContainer() {
  const [faqOpen, _] = useQueryState('faq');

  return (
    <>
      {faqOpen && <FAQ />}

      {/* Don't lose state when FAQ is opened */}
      <Box sx={{ display: faqOpen ? 'none' : 'block', height: '100%' }}>
        <Typography
          component='h1'
          variant='h4'
          sx={{ fontFamily: exoFontFamily }}
        >
          Fixing the data...
        </Typography>
        <Typography>
          Fixing some stuff! Should be back up in the morning :)
        </Typography>
        <Image
          alt='animated 90s style construction equipment'
          src='/construction.gif'
          width={200}
          height={111}
        />
      </Box>
    </>
  );
}
