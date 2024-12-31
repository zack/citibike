import ChartContainer from './ChartContainer';
import ChartControls from './ChartControls';
import { ChartData } from './types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Granularity } from './constants';
import LoadingSpinner from './LoadingSpinner';
import Table from './Table';
import { getQueryString } from './utils';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { type JSX } from 'react';
import { max as laterDate, sub as subDate } from 'date-fns';

export enum View {
  Chart,
  Table,
}

export interface NamedChartData extends ChartData {
  name: string;
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
  maxDate,
  minDate,
  parentLoading,
  type,
  userSelection, // a station id, borough, community district, or council district
}: {
  maxDate?: Date;
  minDate?: Date;
  parentLoading?: boolean;
  type: string;
  userSelection: string; // stringifying stationIds just for this component
}) {
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [selection, setSelection] = React.useState<View>(View.Chart);

  const [isLoading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ChartData[] | undefined>(undefined);

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

  const scrollRef = React.useRef<null | HTMLDivElement>(undefined);
  const daily = granularity === Granularity.Daily;
  const loading = isLoading || parentLoading === true;

  // There's a lot going on with these useEffects. Basically what's going on is
  // that this component is handling its own data (the data used for the chart)
  // and also its own inputs (the data range and granularity) but the *parent*
  // component supplies the minimum and maximum dates for for the date pickers.
  // We also want to use the minumum and maximum ranges to set smart defaults
  // on the datepickers whenever the user loads up a new selection. So the
  // intended behavior here, from the top down, is:
  // * When the userSelection changes we immediately forget the start and end
  //   dates. The parent, at this point, will have cleared out the min and max
  //   dates, so those will also be undefined.
  // * When the new minDate and maxDate come in from the parent we will set the
  //   startDate and endDate intelligently, using those dates.
  // * Once we have a start date and an end date for a selection we'll fetch new
  //   data.

  // When the userSelection changes, unload the start and end date so we can
  // get new ones when those come in. I would like this to be a little more
  // tightly coupled, but for now this works.
  React.useEffect(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, [userSelection]);

  // The moment the parent starts loading, dump the data
  React.useEffect(() => {
    if (parentLoading) {
      setData(undefined);
    }
  }, [parentLoading]);

  // This handles the case when we minDate and maxDate come in from the parent
  // component and is not already set (because we just changed the selection).
  // We want to use those to set the default date range.
  React.useEffect(() => {
    if (
      minDate
      && maxDate
      && startDate === undefined
      && endDate === undefined
    ) {
      setStartDate(laterDate([minDate, subDate(maxDate, { years: 1 })]));
      setEndDate(maxDate);
    }
  }, [minDate, maxDate, startDate, endDate]);

  // If anything about the user's selections changes we should get new data.
  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      if (
        userSelection !== undefined
        && !parentLoading
        && startDate
        && endDate
      ) {
        setLoading(true);
        const queryString = getQueryString({
          daily: granularity === Granularity.Daily ? 'true' : 'false',
          start: startDate.toString(),
          end: endDate.toString(),
          type,
          specifier: userSelection,
        });
        const data = await fetch(`/api/chart?${queryString}`);
        if (!ignore) {
          setLoading(false);
          setData(await data.json());
          scrollRef.current?.scrollIntoView();
        }
      }
    }
    cb();

    return () => {
      ignore = true;
    };
  }, [
    daily,
    endDate,
    granularity,
    parentLoading,
    startDate,
    type,
    userSelection,
  ]);

  function handleAccordionChange() {
    setAccordionOpen(!accordionOpen);
    if (!accordionOpen) {
      window.setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }),
        400,
      );
    }
  }

  return (
    <>
      <Accordion
        expanded={accordionOpen}
        onChange={handleAccordionChange}
        sx={{ marginY: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{accordionOpen ? 'Hide ' : 'Show '} more data</Typography>
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
                <ChartContainer isLoading={loading} daily={daily} data={data} />
              </TabPanel>

              <TabPanel value={selection} index={1}>
                <Table isLoading={loading} data={data} />
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
