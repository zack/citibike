import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';

import {
  getCommunityDistricts,
  getCouncilDistricts,
  getStations,
} from './action';
import CommunityDistrictsProvider from './CommunityDistrictsProvider';
import CouncilDistrictsProvider from './CouncilDistrictsProvider';
import StationsProvider from './StationsProvider';
import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'Citi Bike Station Data',
  description: 'Explore trip data for your favorite Citi Bike stations',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const stationsPromise = getStations();
  const councilDistrictsPromise = getCouncilDistricts();
  const communityDistrictsPromise = getCommunityDistricts();

  const [stations, councilDistricts, communityDistricts] = await Promise.all([
    stationsPromise,
    councilDistrictsPromise,
    communityDistrictsPromise,
  ]);

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
