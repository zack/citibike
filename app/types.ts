export type Borough = 'Bronx' | 'Brooklyn' | 'Manhattan' | 'Queens';

export interface ChartData {
  acoustic: number;
  day: number | undefined;
  electric: number;
  month: number;
  year: number;
}

export interface Station {
  borough: Borough;
  id: number;
  name: string;
}

export interface Stations {
  Bronx: Station[];
  Brooklyn: Station[];
  Manhattan: Station[];
  Queens: Station[];
}

export interface CommunityDistrict {
  communityDistrict: number;
  borough: Borough;
}

export interface CouncilDistrict {
  councilDistrict: number;
  borough: Borough;
}

export interface Timeframe {
  firstDate: Date;
  lastDate: Date;
}

export interface ToplineData {
  trips: {
    acoustic: number;
    electric: number;
  };
  tripsSinceFirstElectric: number;
}

export type WhereSpecifier =
  | BoroughSpecifier
  | CommunityDistrictSpecifier
  | CouncilDistrictSpecifier
  | StationSpecifier
  | Record<string, never>;

export interface Timeframe {
  firstDate: Date;
  lastDate: Date;
}

interface BoroughSpecifier {
  station: {
    borough: Borough;
  };
}

interface StationSpecifier {
  stationId: number;
}

interface CommunityDistrictSpecifier {
  station: {
    communityDistrict: number;
  };
}

interface CouncilDistrictSpecifier {
  station: {
    councilDistrict: number;
  };
}

export interface ToplineData {
  trips: {
    acoustic: number;
    electric: number;
  };
  tripsSinceFirstElectric: number;
}
