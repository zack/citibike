'use client';

import React from 'react';

import { createContext } from 'react';

export const CouncilDistrictsContext = createContext<number[]>([]);

export default function CouncilDistrictsProvider({
  councilDistricts,
  children,
}: {
  councilDistricts: number[];
  children: React.ReactNode;
}) {
  return (
    <CouncilDistrictsContext.Provider value={councilDistricts}>
      {children}
    </CouncilDistrictsContext.Provider>
  );
}
