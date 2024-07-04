import React from 'react';
import { Typography } from '@mui/material';
import { exoFontFamily } from './ThemeProvider';

export default function FAQ() {
  return (
    <>
      <Typography
        variant='h5'
        component='h2'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Frequently Asked Questions
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Where does the data come from?
      </Typography>

      <Typography>
        CitiBike publishes monthly data to an s3 bucket{' '}
        <a href='https://s3.amazonaws.com/tripdata/index.html'>here</a>. I pull
        down this data, format it to fit in a database, and then store it there.
        A program checks for new data each morning.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Why isn&apos;t the most recent month available?
      </Typography>

      <Typography>
        Sometimes CitiBike is slow in uploading new data, so it might be that.
        Otherwise, if you see the data available at the link above but it&apos;s
        been more than a day and it&apos;s still not here, there might have been
        a bug in my code. Hopefully I&apos;ll see it soon. Feel free to open an
        issue on GitHub or email me about it at{' '}
        <a href='mailto:citibikedata.nyc@youngren.io'>
          citibikedata.nyc@youngren.io
        </a>
        .
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Where can I find the code?
      </Typography>

      <Typography>
        <a href='https://github.com/zack/citibike'>Here</a>
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        What is a &quot;trip&quot;?
      </Typography>

      <Typography>
        For my graphs and charts, one trip counts as either a docking or an
        undocking. I consider this the most valuable number because it shows how
        many times a dock is providing value to someone in a day/month.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        How far back does the data go?
      </Typography>

      <Typography>
        CitiBike publishes data as far back as June 2013. All of that data is
        available here.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        I found a bug or I have a feature request or suggestion
      </Typography>

      <Typography>
        Feel free to open an issue on GitHub if you know how, or email me about
        it at{' '}
        <a href='mailto:citibikedata.nyc@youngren.io'>
          citibikedata.nyc@youngren.io
        </a>
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        I think I found a missing dock, or something else looks weird
      </Typography>

      <Typography>
        I&apos;ll be blunt: CitiBike&apos;s data is pretty messy. Sometimes they move
        docks and/or change names, which makes the data look kind of weird, but
        there&apos;s not really anything I can do about that. I also sometimes
        have to drop trips (a tiny fraction of a percent of trips) because the
        row is malformed. If you think you&apos;ve found something really wrong,
        or you&apos;re just not sure, feel free to open a GitHub issue or email
        me.
      </Typography>

      <Typography sx={{ marginTop: 2 }}>
        Oh, and I don&apos;t include docks in New Jersey or Canada.
      </Typography>
    </>
  );
}
