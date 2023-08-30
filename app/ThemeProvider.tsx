'use client';

import React from 'react';

import { Ubuntu_Mono } from 'next/font/google'

import { ThemeProvider as TP, createTheme } from '@mui/material/styles';

const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"], weight: "400" })

export const ubuntuMonoClassName = ubuntuMono.className;

const theme = createTheme({
  typography: {
    fontFamily: ubuntuMono.style.fontFamily,
    fontSize: 18,
  },
});

type ThemeProviderProps = {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <TP theme={theme}>
      {children}
    </TP>
  );
}
