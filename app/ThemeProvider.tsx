'use client';

import React from 'react';

import { Exo, Ubuntu_Mono } from 'next/font/google';

import { ThemeProvider as TP, createTheme } from '@mui/material/styles';

const ubuntuMono = Ubuntu_Mono({ subsets: ['latin'], weight: '400' });
const exo = Exo({ subsets: ['latin'], weight: '700' });

export const ubuntuMonoFontFamily = ubuntuMono.style.fontFamily;
export const ubuntuMonoClassName = ubuntuMono.className;
export const exoFontFamily = exo.style.fontFamily;

const theme = createTheme({
  typography: {
    fontFamily: ubuntuMono.style.fontFamily,
    fontSize: 18,
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return <TP theme={theme}>{children}</TP>;
}
