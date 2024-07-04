import LoadingSpinner from './LoadingSpinner';
import React from 'react';
import { ToplineData } from './action';
import { format as formatDate } from 'date-fns';
import { Box, Tooltip, Typography } from '@mui/material';
import { differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';

function Bold({ children }: { children: string }) {
  return (
    <Box component='span' fontWeight='bold'>
      {children}
    </Box>
  );
}

export default function Topline({
  borough,
  dataFetcherFunc,
  dockName,
  maxDate,
  minDate,
}: {
  borough: string;
  dataFetcherFunc: () => Promise<ToplineData | undefined>;
  dockName?: string;
  maxDate: Date;
  minDate: Date;
}) {
  const [data, setData] = React.useState<ToplineData | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (borough || dockName) {
      setIsLoading(true);
      dataFetcherFunc().then((newData) => {
        setData(newData);
        setIsLoading(false);
      });
    }
  }, [borough, dataFetcherFunc, dockName, minDate, maxDate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  } else if (data === undefined) {
    return null;
  } else {
    const totalTrips = data.trips.electric + data.trips.acoustic;
    const months = differenceInCalendarMonths(maxDate, minDate);
    const days = differenceInCalendarDays(maxDate, minDate);
    const perMonth = Math.round(totalTrips / months);
    const perDay = Math.round(totalTrips / days);
    const eBikes =
      data.tripsSinceFirstElectric > 0
        ? Math.round((data.trips.electric / data.tripsSinceFirstElectric) * 100)
        : 0;

    let unit;
    if (dockName) {
      unit = 'dock';
    } else if (borough) {
      unit = 'borough';
    }

    const eBikeTooltipTitle = `Percent of trips that were on eBikes since this ${unit} saw its first eBike trip.`;

    return (
      <>
        <Box sx={{ marginTop: 4, marginBottom: 2 }}>
          <Typography fontSize='2rem'>
            <>
              {dockName && (
                <>
                  The dock at
                  <Bold>{` ${dockName} `}</Bold>
                  in
                  <Bold>{` ${borough === 'Bronx' ? 'the Bronx' : borough} `}</Bold>
                  has
                </>
              )}
              {!dockName && borough && (
                <>
                  Docks in
                  <Bold>{` ${borough === 'Bronx' ? 'The Bronx' : borough} `}</Bold>
                  have
                </>
              )}{' '}
              been used
              <Bold>{` ${totalTrips.toLocaleString('en-US')} `}</Bold>
              times between
              <Bold>{` ${formatDate(minDate, 'MMMM yyyy')} `}</Bold>
              and
              <Bold>{` ${formatDate(maxDate, 'MMMM yyyy')}`}</Bold>.
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
              {perMonth.toLocaleString('en-US')}
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}>trips per month</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize='4rem' fontWeight='bold'>
              {perDay.toLocaleString('en-US')}
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}> trips per day </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize='4rem' fontWeight='bold'>
              {eBikes}%
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}>
              on {String.fromCodePoint(0x26a1)}eBikes
              <Tooltip title={eBikeTooltipTitle}>
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
                  *
                </Typography>
              </Tooltip>
            </Typography>
          </Box>
        </Box>
      </>
    );
  }
}
