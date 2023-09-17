import './globals.css'

import type { Metadata } from 'next'

import React from 'react';

import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'CitiBike Dock Data',
  description: 'Explore trip data for your favorite Citibike docks',
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
