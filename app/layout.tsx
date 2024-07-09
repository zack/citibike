import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import React from 'react';
import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'Citi Bike Dock Data',
  description: 'Explore trip data for your favorite Citi Bike docks',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en'>
      <body>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
