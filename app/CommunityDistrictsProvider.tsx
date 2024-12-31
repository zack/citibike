'use client';

import { CommunityDistrict } from './types';

import React from 'react';

import { createContext } from 'react';

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
