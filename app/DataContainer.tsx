'use client';

import ChartContainer from './ChartContainer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

export default function DataContainer({
  dockId,
  maxDate,
  minDate,
}: {
  dockId: number | undefined;
  maxDate: Date;
  minDate: Date;
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
        <ChartContainer dockId={dockId} maxDate={maxDate} minDate={minDate} />
      </AccordionDetails>
    </Accordion>
  );
}
