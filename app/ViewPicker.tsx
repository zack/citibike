import BoroughData from './BoroughData';
import CommunityDistrictData from './CommunityDistrictData';
import CouncilDistrictData from './CouncilDistrictData';
import DockData from './DockData';
import { Typography } from '@mui/material';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import React, { memo } from 'react';

type View = 'dock' | 'borough' | 'community' | 'council';

export default memo(function ViewPicker() {
  const [view, setView] = React.useState<View>('dock');

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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ marginRight: 1 }}> See data by: </Typography>
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

          <ToggleButton value='dock' aria-label='dock'>
            Dock
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <Box sx={{ display: view === 'borough' ? 'block' : 'none' }}>
        <BoroughData />
      </Box>

      <Box sx={{ display: view === 'community' ? 'block' : 'none' }}>
        <CommunityDistrictData />
      </Box>

      <Box sx={{ display: view === 'council' ? 'block' : 'none' }}>
        <CouncilDistrictData />
      </Box>

      <Box sx={{ display: view === 'dock' ? 'block' : 'none', height: '50vh' }}>
        <DockData />
      </Box>
    </Box>
  );
});
