'use client';

import React from 'react';
import { createContext } from 'react';

import { CouncilDistrict } from './types';

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
