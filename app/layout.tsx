import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import CommunityDistrictsProvider from './CommunityDistrictsProvider';
import CouncilDistrictsProvider from './CouncilDistrictsProvider';
import type { Metadata } from 'next';
import React from 'react';
import StationsProvider from './StationsProvider';
import ThemeProvider from './ThemeProvider';

import { getCommunityDistricts, getCouncilDistricts, getDocks } from './action';

export const metadata: Metadata = {
  title: 'Citi Bike Dock Data',
  description: 'Explore trip data for your favorite Citi Bike docks',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const stations = await getDocks();
  const councilDistricts = await getCouncilDistricts();
  const communityDistricts = await getCommunityDistricts();

  return (
    <html lang='en'>
      <body>
        <StationsProvider stations={stations}>
          <CouncilDistrictsProvider councilDistricts={councilDistricts}>
            <CommunityDistrictsProvider communityDistricts={communityDistricts}>
              <ThemeProvider>
                {children}
                <Analytics />
              </ThemeProvider>
            </CommunityDistrictsProvider>
          </CouncilDistrictsProvider>
        </StationsProvider>
      </body>
    </html>
  );
}
