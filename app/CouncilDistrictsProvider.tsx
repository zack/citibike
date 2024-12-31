'use client';

import { CouncilDistrict } from './types';

import React from 'react';

import { createContext } from 'react';

export const CouncilDistrictsContext = createContext<CouncilDistrict[]>([]);

export default function CouncilDistrictsProvider({
  councilDistricts,
  children,
}: {
  councilDistricts: CouncilDistrict[];
  children: React.ReactNode;
}) {
  return (
    <CouncilDistrictsContext.Provider value={councilDistricts}>
      {children}
    </CouncilDistrictsContext.Provider>
  );
}
