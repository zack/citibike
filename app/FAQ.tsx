import React from 'react';

import { exoFontFamily } from './ThemeProvider';

import { Box, Typography } from '@mui/material';

export default function FAQ() {
  return (
    <Box sx={{ pb: '10vh' }}>
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
        Citi Bike publishes monthly data to an s3 bucket{' '}
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
        Sometimes Citi Bike is slow in uploading new data, so it might be that.
        Otherwise, if you see the data available at the link above but it&apos;s
        been more than a day and it&apos;s still not here, there might have been
        a bug in my code. Hopefully I&apos;ll see it soon. Feel free to{' '}
        <a href='https://github.com/zack/citibike/issues/new'>
          open an issue on GitHub
        </a>{' '}
        or email me about it at{' '}
        <a href='mailto:zack@citibikedata.nyc'>zack@citibikedata.nyc</a>.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Where can I find the code?
      </Typography>

      <Typography>
        <a href='https://github.com/zack/citibike'>Here</a>.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        What are you counting?
      </Typography>

      <Typography>
        I&apos;m counting each stationing and unstationing as an individual use.
        That means most trips generate two uses, and usually at two different
        stations. I consider this the most valuable number because it shows how
        many times a station is providing value to someone in a day/month. If
        you are looking for data about trips taken, you will have to find that
        elsewhere, sorry.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        How far back does the data go?
      </Typography>

      <Typography>
        Citi Bike publishes data as far back as June 2013. All of that data is
        available here.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        Didn&apos;t this used to be about stations? What are stations?
      </Typography>

      <Typography>
        Citi Bike{' '}
        <a href='https://help.citibikenyc.com/hc/en-us/articles/360032104712-What-is-a-station-A-station-A-kiosk'>
          defines
        </a>{' '}
        a station as the device that holds an individual bicycle. A station is a
        row of stations. I originally was accidentally using the term
        &apos;station&apos; when what I really meant was &apos;station&apos;. A
        kind commenter on the{' '}
        <a href='https://nyc.streetsblog.org/2024/07/17/wednesdays-headlines-citi-bike-by-the-numbers-edition'>
          Streetsblog article
        </a>{' '}
        pointed out the mistake and I have now fixed it.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        I found a bug or I have a feature request or suggestion
      </Typography>

      <Typography>
        Feel free to{' '}
        <a href='https://github.com/zack/citibike/issues/new'>
          open an issue on GitHub
        </a>{' '}
        or email me about it at{' '}
        <a href='mailto:zack@citibikedata.nyc'>zack@citibikedata.nyc</a>.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        I think I found a missing station, or something else looks weird
      </Typography>

      <Typography>
        I&apos;ll be blunt: Citi Bike&apos;s data is pretty messy. Sometimes
        they move stations and/or change names, which makes the data look kind
        of weird, but there&apos;s not really anything I can do about that. I
        also sometimes have to drop trips (a tiny fraction of a percent of
        trips) because the row is malformed. If you think you&apos;ve found
        something really wrong, or you&apos;re just not sure, feel free to{' '}
        <a href='https://github.com/zack/citibike/issues/new'>
          open an issue on GitHub
        </a>{' '}
        or send me an email at{' '}
        <a href='mailto:zack@citibikedata.nyc'>zack@citibikedata.nyc</a>.
      </Typography>

      <Typography sx={{ marginTop: 2 }}>
        Oh, and I don&apos;t include stations in New Jersey or Canada.
      </Typography>

      <Typography
        variant='h6'
        component='h3'
        sx={{ fontFamily: exoFontFamily, marginTop: 2 }}
      >
        What podcasts should I listen to to learn more about urbanism, transit,
        and related topics?
      </Typography>

      <ul>
        <li>
          <Typography>
            <a href='https://thewaroncars.org/'>The War on Cars</a>
          </Typography>
        </li>
        <li>
          <Typography>
            <a href='https://linktr.ee/deniersplaybook'>
              The Climate Denier&apos;s Playbook
            </a>
          </Typography>
        </li>
        <li>
          <Typography>
            <a href='https://nebula.tv/agenda'>The Urbanist Agenda</a>
          </Typography>
        </li>
      </ul>
    </Box>
  );
}
