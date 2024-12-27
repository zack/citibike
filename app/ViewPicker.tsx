import BoroughData from './BoroughData';
import CommunityDistrictData from './CommunityDistrictData';
import CouncilDistrictData from './CouncilDistrictData';
import StationData from './StationData';
import { Typography } from '@mui/material';
import { useQueryState } from 'nuqs';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import React, { memo } from 'react';
const views = ['station', 'borough', 'community', 'council'];
type View = (typeof views)[number];

function parseView(input: string): View {
  if (views.includes(input)) {
    return input;
  } else {
    return '';
  }
}

export default memo(function ViewPicker() {
  const [view, setView] = useQueryState('view', {
    parse: parseView,
    defaultValue: null,
    clearOnDefault: true,
  });

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    newView: View,
  ) => {
    if (newView) {
      setTimeout(() => {
        history.replaceState(null, '', location.pathname);
      }, 0);
      setView(newView);
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      <div style={{ display: 'inline-block' }}>
        <Typography sx={{ marginRight: 1, display: 'inline-block' }}>
          See data by:
        </Typography>
        <ToggleButtonGroup
          aria-label='view type'
          color='primary'
          exclusive
          onChange={handleViewChange}
          value={view}
        >
          <ToggleButton value='borough' aria-label='borough'>
            Borough
          </ToggleButton>

          <ToggleButton value='community' aria-label='community district'>
            Community District
          </ToggleButton>

          <ToggleButton value='council' aria-label='council district'>
            Council District
          </ToggleButton>

          <ToggleButton value='station' aria-label='station'>
            Station
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {view === 'borough' && (
        <Box sx={{ height: '50vh' }}>
          <React.Suspense>
            <BoroughData />
          </React.Suspense>
        </Box>
      )}

      {view === 'community' && (
        <Box sx={{ height: '50vh' }}>
          <React.Suspense>
            <CommunityDistrictData />
          </React.Suspense>
        </Box>
      )}

      {view === 'council' && (
        <Box sx={{ height: '50vh' }}>
          <React.Suspense>
            <CouncilDistrictData />
          </React.Suspense>
        </Box>
      )}

      {view === 'station' && (
        <Box sx={{ height: '50vh' }}>
          <React.Suspense>
            <StationData />
          </React.Suspense>
        </Box>
      )}
    </Box>
  );
});
