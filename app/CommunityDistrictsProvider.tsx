'use client';

import React from 'react';
import { createContext } from 'react';

import { CommunityDistrict } from './types';

export const CommunityDistrictsContext = createContext<CommunityDistrict[]>([]);

export default function CommunityDistrictsProvider({
  communityDistricts,
  children,
}: {
  communityDistricts: CommunityDistrict[];
  children: React.ReactNode;
}) {
  return (
    <CommunityDistrictsContext.Provider value={communityDistricts}>
      {children}
    </CommunityDistrictsContext.Provider>
  );
}
