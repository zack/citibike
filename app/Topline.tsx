import React from 'react';
import { format as formatDate } from 'date-fns';
import { Box, Typography } from '@mui/material';
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
    return <Typography> Loading... </Typography>;
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

    return (
      <>
        <Box sx={{ marginTop: 3, marginBottom: -1 }}>
          <Typography fontSize='2rem' lineHeight='2rem'>
            <>
              The dock at
              <Bold>{` ${dockName} `}</Bold>
              has been used
              <Bold>{` ${totalTrips.toLocaleString('en-US')} `}</Bold>
              times
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
            alignItems: 'center',
            display: 'flex',
            gap: 1,
            justifyContent: 'space-around',
            marginBottom: 1,
            pt: 1,
            width: '100%',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize='4rem' fontWeight='bold'>
              {perMonth.toLocaleString('en-US')}
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}>times per month</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize='4rem' fontWeight='bold'>
              {perDay.toLocaleString('en-US')}
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}> times per day </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize='4rem' fontWeight='bold'>
              {eBikes}%
            </Typography>
            <Typography sx={{ marginTop: '-1rem' }}>
              trips on eBikes*
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize='1rem'>
            * eBike trips as a percent of trips since this dock saw its first
            eBike
          </Typography>
        </Box>
      </>
    );
  }
}
