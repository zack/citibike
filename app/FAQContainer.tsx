'use client';

import { Box } from '@mui/material';
import FAQ from './FAQ';
import React from 'react';
import ViewPicker from './ViewPicker';

import { useQueryState } from 'nuqs';

export default function FAQContainer() {
  const [faqOpen, _] = useQueryState('faq');

  return (
    <>
      {faqOpen && <FAQ />}

      {/* Don't lose state when FAQ is opened */}
      <Box sx={{ display: faqOpen ? 'none' : 'block', height: '100%' }}>
        <React.Suspense>
          <ViewPicker />
        </React.Suspense>
      </Box>
    </>
  );
}
