'use client';

import ChartContainer from './ChartContainer';
import ChartControls from './ChartControls';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Granularity } from './Main';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';
import Table from './Table';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DockData, getDockData } from './action';
import { max as laterDate, sub as subDate } from 'date-fns';

export enum View {
  Chart,
  Table,
}

export interface ChartData {
  acoustic: number;
  day: number | undefined;
  electric: number;
  month: number;
  name: string;
  year: number;
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

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [dockData, setDockData] = React.useState<DockData | undefined>(
    undefined,
  );

  const [endDate, setEndDate] = React.useState<Date | undefined>(maxDate);
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    if (minDate && maxDate) {
      return laterDate([minDate, subDate(maxDate, { years: 1 })]);
    } else {
      return undefined;
    }
  });
  const [granularity, setGranularity] = React.useState<Granularity>(
    Granularity.Monthly,
  );

  const scrollRef = React.useRef<null | HTMLDivElement>();
  const daily = granularity === Granularity.Daily;

  // There's a lot going on with these useEffects. Basically what's going on is
  // that this component is handling its own data (the data used for the chart)
  // and also its own inputs (the data range and granularity) but the *parent*
  // component supplies the minimum and maximum dates for for the date pickers.
  // We also want to use the minumum and maximum ranges to set smart defaults
  // on the datepickers whenever the user loads up a new dock. So the intended
  // behavior here, from the top down, is:
  // * When the dockId changes we immediately forget the start and end dates.
  //   The parent, at this point, will have cleared out the min and max dates,
  //   so those will also be undefined.
  // * When the new minDate and maxDate come in from the parent we will set the
  //   startDate and endDate intelligently, using those dates.
  // * Once we have a start date and an end date for a dock we'll fetch new
  //   dock data.

  // When the dockId changes, unload the start and end date so we can get new
  // ones when those come in. I would like this to be a little more tightly
  // coupled, but for now this works.
  React.useEffect(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, [dockId]);

  // This handles the case when we minDate and maxDate come in from the parent
  // component and is not already set (because we just changed the dock
  // selection). We want to use those to set the default date range.
  React.useEffect(() => {
    if (
      minDate &&
      maxDate &&
      startDate === undefined &&
      endDate === undefined
    ) {
      setStartDate(laterDate([minDate, subDate(maxDate, { years: 1 })]));
      setEndDate(maxDate);
    }
  }, [minDate, maxDate, startDate, endDate]);

  // If anything about the user's selections changes we should get new data.
  React.useEffect(() => {
    if (dockId !== undefined && startDate && endDate) {
      setIsLoading(true);
      getDockData(dockId, daily, startDate, endDate).then((newDockData) => {
        setDockData(newDockData);
        setIsLoading(false);
        scrollRef.current?.scrollIntoView();
      });
    }
  }, [daily, dockId, endDate, startDate]);

  if (dockData === undefined) {
    return null;
  }

  return (
    <>
      <Accordion
        expanded={accordionOpen}
        onChange={() => setAccordionOpen(!accordionOpen)}
        sx={{ marginY: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography> More data </Typography>
        </AccordionSummary>

        <AccordionDetails>
          {minDate && maxDate && startDate && endDate && (
            <ChartControls
              endDate={endDate}
              granularity={granularity}
              maxDate={maxDate}
              minDate={minDate}
              setEndDate={setEndDate}
              setGranularity={setGranularity}
              setStartDate={setStartDate}
              startDate={startDate}
            />
          )}

          {minDate && maxDate ? (
            <Box sx={{ width: '100%' }}>
              <Tabs
                sx={{ my: 2 }}
                value={selection}
                onChange={(e, v) => {
                  setSelection(v);
                  scrollRef.current?.scrollIntoView();
                }}
                aria-label='data view options'
              >
                <Tab label='Chart' {...a11yProps(0)} />
                <Tab label='Table' {...a11yProps(1)} />
              </Tabs>
              <TabPanel value={selection} index={0}>
                <ChartContainer
                  isLoading={isLoading}
                  daily={daily}
                  dockData={dockData}
                />
              </TabPanel>

              <TabPanel value={selection} index={1}>
                <Table isLoading={isLoading} dockData={dockData} />
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
        <Box ref={scrollRef} />
      </Accordion>
    </>
  );
}
