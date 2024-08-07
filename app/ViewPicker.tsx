import BoroughData from './BoroughData';
import CommunityDistrictData from './CommunityDistrictData';
import CouncilDistrictData from './CouncilDistrictData';
import StationData from './StationData';
import { Typography } from '@mui/material';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import React, { memo } from 'react';

type View = 'station' | 'borough' | 'community' | 'council';

export default memo(function ViewPicker() {
  const [view, setView] = React.useState<View>('station');

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    newView: View,
  ) => {
    if (newView) {
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

      <Box
        sx={{ display: view === 'borough' ? 'block' : 'none', height: '50vh' }}
      >
        <BoroughData />
      </Box>

      <Box
        sx={{
          display: view === 'community' ? 'block' : 'none',
          height: '50vh',
        }}
      >
        <CommunityDistrictData />
      </Box>

      <Box
        sx={{ display: view === 'council' ? 'block' : 'none', height: '50vh' }}
      >
        <CouncilDistrictData />
      </Box>

      <Box sx={{ display: view === 'station' ? 'block' : 'none', height: '50vh' }}>
        <StationData />
      </Box>
    </Box>
  );
});
