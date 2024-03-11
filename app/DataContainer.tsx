'use client';

import ChartContainer from './ChartContainer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

export enum View {
  Chart,
  Table,
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

function TabPanel({
  value,
  index,
  children,
}: {
  value: View;
  index: number;
  children: JSX.Element;
}) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      <>{value === index && children}</>
    </div>
  );
}

export default function DataContainer({
  dockId,
  maxDate,
  minDate,
}: {
  dockId: number;
  maxDate: Date | undefined;
  minDate: Date | undefined;
}) {
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [selection, setSelection] = React.useState<View>(View.Chart);

  function handleTabChange(event: React.SyntheticEvent, newValue: View) {
    setSelection(newValue);
  }

  return (
    <Accordion
      expanded={accordionOpen}
      onChange={() => setAccordionOpen(!accordionOpen)}
      sx={{ marginY: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography> More data </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {minDate && maxDate ? (
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={selection}
              onChange={handleTabChange}
              aria-label='data view options'
            >
              <Tab label='Chart' {...a11yProps(0)} />
              <Tab label='Table' {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={selection} index={0}>
              <ChartContainer
                dockId={dockId}
                maxDate={maxDate}
                minDate={minDate}
              />
            </TabPanel>

            <TabPanel value={selection} index={1}>
              <Typography> Table </Typography>
            </TabPanel>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LoadingSpinner />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
