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
  Typography,
} from '@mui/material';

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
          <ChartContainer dockId={dockId} maxDate={maxDate} minDate={minDate} />
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
