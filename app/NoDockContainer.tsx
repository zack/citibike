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

export default function NoDockContainer({
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
        <Typography> See more data </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <ChartContainer dockId={dockId} maxDate={maxDate} minDate={minDate} />
      </AccordionDetails>
    </Accordion>
  );
}
