import React from 'react';
import { ToplineData } from './types';
import { format as formatDate } from 'date-fns';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import { differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';

const InlineSkeleton = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => (
  <Skeleton
    sx={{ display: 'inline-block', mx: '10px', my: '-10px' }}
    variant='rounded'
    height={height}
    width={width}
  />
);

function Bold({
  children,
  highlight,
}: {
  children: string;
  highlight?: boolean;
}) {
  return (
    <Box
      component='span'
      fontWeight='bold'
      sx={{ background: highlight ? '#ED6C02' : 'white' }}
    >
      {children}
    </Box>
  );
}

export default function Topline({
  borough,
  communityDistrict,
  councilDistrict,
  dataSpecifier,
  maxDate,
  minDate,
  outOfDate,
  parentLoading,
  stationName,
}: {
  borough?: string;
  communityDistrict?: number;
  councilDistrict?: number;
  dataSpecifier: string;
  maxDate?: Date;
  minDate?: Date;
  outOfDate?: boolean;
  parentLoading?: boolean;
  stationName?: string;
}) {
  const [data, setData] = React.useState<ToplineData | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  // The moment the parent starts loading, dump the data
  React.useEffect(() => {
    if (parentLoading) {
      setData(undefined);
    }
  }, [parentLoading]);

  React.useEffect(() => {
    let ignore = false;

    async function cb() {
      if (
        dataSpecifier
        && !parentLoading
        && maxDate
        && minDate
        && (borough || stationName || councilDistrict || communityDistrict)
      ) {
        setIsLoading(true);
        const response = await fetch(`/api/topline?${dataSpecifier}`);
        if (!ignore) {
          const newData = await response.json();
          setIsLoading(false);
          setData(newData);
        }
      }
    }
    cb();

    return () => {
      ignore = true;
    };
  }, [
    borough,
    communityDistrict,
    councilDistrict,
    dataSpecifier,
    maxDate,
    minDate,
    parentLoading,
    stationName,
  ]);

  const totalTrips = data
    ? data.trips.electric + data.trips.acoustic
    : undefined;
  const months =
    maxDate && minDate
      ? differenceInCalendarMonths(maxDate, minDate) + 1
      : undefined;
  const days =
    maxDate && minDate
      ? differenceInCalendarDays(maxDate, minDate) + 1
      : undefined;
  const perMonth =
    totalTrips && months !== undefined
      ? Math.round(totalTrips / Math.max(months, 1))
      : undefined;
  const perDay = totalTrips && days ? Math.round(totalTrips / days) : undefined;
  const eBikes = data
    ? data.tripsSinceFirstElectric > 0
      ? Math.round((data.trips.electric / data.tripsSinceFirstElectric) * 100)
      : 0
    : undefined;

  let unit;

  if (communityDistrict) {
    unit = 'community district';
  } else if (councilDistrict) {
    unit = 'council district';
  } else if (stationName) {
    unit = 'station';
  } else if (borough) {
    // this needs to be last
    unit = 'borough';
  }

  const eBikeTooltipTitle = `Percent of trips that were on eBikes since this ${unit} saw its first eBike trip.`;
  const loading = isLoading || parentLoading;

  return (
    <>
      <Box sx={{ marginTop: 4, marginBottom: 2 }}>
        <Typography fontSize='2rem'>
          <>
            {stationName && (
              <>
                The station at
                <Bold>{` ${stationName} `}</Bold>
                in
                <Bold>{` ${borough === 'Bronx' ? 'the Bronx' : borough} `}</Bold>
                has
              </>
            )}
            {communityDistrict && (
              <>
                Stations in
                <Bold>{` Community District ${communityDistrict} `}</Bold>
                in
                <Bold>{` ${borough === 'Bronx' ? 'the Bronx' : borough} `}</Bold>
                have
              </>
            )}
            {councilDistrict && (
              <>
                Stations in
                <Bold>{` Council District ${councilDistrict} `}</Bold>
                in
                <Bold>{` ${borough === 'Bronx' ? 'the Bronx' : borough} `}</Bold>
                have
              </>
            )}
            {!stationName
              && !councilDistrict
              && !communityDistrict
              && borough && (
                <>
                  Stations in
                  <Bold>{` ${borough === 'Bronx' ? 'the Bronx' : borough} `}</Bold>
                  have
                </>
              )}{' '}
            been used
            {!loading && totalTrips ? (
              <Bold>{` ${totalTrips.toLocaleString('en-US')} `}</Bold>
            ) : (
              <InlineSkeleton height={40} width={150} />
            )}
            times between
            {minDate ? (
              <Bold>{` ${formatDate(minDate, 'MMMM yyyy')} `}</Bold>
            ) : (
              <InlineSkeleton height={40} width={150} />
            )}
            and
            {maxDate ? (
              <>
                {' '}
                <Bold
                  highlight={outOfDate}
                >{`${formatDate(maxDate, 'MMMM yyyy')}`}</Bold>
              </>
            ) : (
              <InlineSkeleton height={40} width={150} />
            )}
            .
          </>
        </Typography>
      </Box>

      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'space-around',
          marginBottom: 4,
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize='4rem' fontWeight='bold'>
            {!loading && perMonth ? (
              perMonth.toLocaleString('en-US')
            ) : (
              <InlineSkeleton height={60} width={120} />
            )}
          </Typography>
          <Typography sx={{ marginTop: '-1rem' }}>uses per month</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize='4rem' fontWeight='bold'>
            {!loading && perDay ? (
              perDay.toLocaleString('en-US')
            ) : (
              <InlineSkeleton height={60} width={120} />
            )}
          </Typography>
          <Typography sx={{ marginTop: '-1rem' }}> uses per day </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize='4rem' fontWeight='bold'>
            {!loading && eBikes && eBikes > 0 ? `${eBikes}%` : null}
            {!loading && eBikes === 0 ? 'n/a' : null}
            {loading || eBikes === undefined ? (
              <span>
                <InlineSkeleton height={60} width={120} />
              </span>
            ) : null}
          </Typography>
          <Typography sx={{ marginTop: '-1rem' }} component='span'>
            on{' '}
          </Typography>
          <Tooltip
            onClose={() => setTooltipOpen(false)}
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={eBikeTooltipTitle}
            slotProps={{
              popper: {
                disablePortal: true,
              },
            }}
          >
            <Typography
              component='span'
              onClick={() => setTooltipOpen(!tooltipOpen)}
            >
              {String.fromCodePoint(0x26a1)}
              <Typography
                tabIndex={0}
                component='span'
                sx={{
                  color: '#0034DF',
                  cursor: 'pointer',
                  display: 'inline',
                  textDecoration: 'underline',
                }}
              >
                eBikes
              </Typography>
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}
