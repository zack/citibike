import './globals.css'

import type { Metadata } from 'next'

import React from 'react';

import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'Facts Party',
  description: 'An application for running a Facts Party',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
