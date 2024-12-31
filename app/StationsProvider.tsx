'use client';

import React from 'react';
import { Stations } from './types';

import { createContext } from 'react';

export const StationsContext = createContext<Stations>({
  Bronx: [],
  Brooklyn: [],
  Manhattan: [],
  Queens: [],
});

export default function StationsProvider({
  stations,
  children,
}: {
  stations: Stations;
  children: React.ReactNode;
}) {
  return (
    <StationsContext.Provider value={stations}>
      {children}
    </StationsContext.Provider>
  );
}
