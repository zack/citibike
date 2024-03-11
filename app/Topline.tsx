import LoadingSpinner from './LoadingSpinner';
import React from 'react';
import { format as formatDate } from 'date-fns';
import { Box, Tooltip, Typography } from '@mui/material';
import { ToplineData, getToplineData } from './action';
import { differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';

function Bold({ children }: { children: string }) {
  return (
    <Box component='span' fontWeight='bold'>
      {children}
    </Box>
  );
}

export default function Topline({
  dockId,
  dockName,
}: {
  dockId: number | undefined;
  dockName: string;
}) {
  const [data, setData] = React.useState<ToplineData | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (dockId !== undefined) {
      setIsLoading(true);
      getToplineData(dockId).then((newData) => {
        setData(newData);
        setIsLoading(false);
      });
    }
  }, [dockId]);

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
    const months = differenceInCalendarMonths(data.lastDate, data.firstDate);
    const days = differenceInCalendarDays(data.lastDate, data.firstDate);
    const perMonth = Math.round(totalTrips / months);
    const perDay = Math.round(totalTrips / days);
    const eBikes =
      data.tripsSinceFirstElectric > 0
        ? Math.round((data.trips.electric / data.tripsSinceFirstElectric) * 100)
        : 0;

    const eBikeTooltipTitle =
      'Percent of uses that were on eBikes since this dock saw its first eBike.';

    return (
      <>
        <Box sx={{ marginTop: 4, marginBottom: 2 }}>
          <Typography fontSize='2rem'>
            <>
              The dock at
              <Bold>{` ${dockName} `}</Bold>
              has been used for
              <Bold>{` ${totalTrips.toLocaleString('en-US')} `}</Bold>
              trips
              {data.firstDate && data.lastDate ? (
                <>
                  {' '}
                  between
                  <Bold>{` ${formatDate(data.firstDate, 'MMMM yyyy')} `}</Bold>
                  and
                  <Bold>{` ${formatDate(data.lastDate, 'MMMM yyyy')}`}</Bold>.
                </>
              ) : (
                '.'
              )}
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
              trips on eBikes
              <Tooltip title={eBikeTooltipTitle}>
                <Typography
                  tabIndex={0}
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
