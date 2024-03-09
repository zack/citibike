import React from 'react';
import { format as formatDate } from 'date-fns';
import { Box, Typography } from '@mui/material';
import { ToplineData, getToplineData } from './action';

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
    return (
      <Box sx={{ marginY: 3 }}>
        <Typography fontSize='2rem' lineHeight='1.75rem'>
          <>
            The dock at
            <Bold>{` ${dockName} `}</Bold>
            has been used
            <Bold>{` ${data.trips} `}</Bold>
            times
            {data.firstDate && data.lastDate ? (
              <>
                {' '}
                between
                <Bold>{` ${formatDate(data.firstDate, "MMMM ''yy")} `}</Bold>
                and
                <Bold>{` ${formatDate(data.lastDate, "MMMM ''yy")}`}</Bold>.
              </>
            ) : (
              '.'
            )}
          </>
        </Typography>
      </Box>
    );
  }
}
