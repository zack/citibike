import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import CommunityDistrictsProvider from './CommunityDistrictsProvider';
import CouncilDistrictsProvider from './CouncilDistrictsProvider';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import StationsProvider from './StationsProvider';
import ThemeProvider from './ThemeProvider';

import {
  getCommunityDistricts,
  getCouncilDistricts,
  getStations,
} from './action';

export const metadata: Metadata = {
  title: 'Citi Bike Station Data',
  description: 'Explore trip data for your favorite Citi Bike stations',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const stations = await getStations();
  const councilDistricts = await getCouncilDistricts();
  const communityDistricts = await getCommunityDistricts();

  return (
    <html lang='en'>
      <body>
        <StationsProvider stations={stations}>
          <CouncilDistrictsProvider councilDistricts={councilDistricts}>
            <CommunityDistrictsProvider communityDistricts={communityDistricts}>
              <ThemeProvider>
                <NuqsAdapter>
                  {children}
                  <Analytics />
                </NuqsAdapter>
              </ThemeProvider>
            </CommunityDistrictsProvider>
          </CouncilDistrictsProvider>
        </StationsProvider>
      </body>
    </html>
  );
}
