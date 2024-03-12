/* eslint-disable no-console */

// This file has three jobs:
// 1. Check for the most recent trip in the database
// 2. Determine whether there is any more recent data available
// 3. Download and unzip newer data if it is available

import { PrismaClient } from '@prisma/client';
import adm from 'adm-zip';
import concat from 'concat-files';
import { exec } from 'child_process';
import { writeFile } from 'node:fs/promises';

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

import fs, { readdirSync, rmSync } from 'fs';

const client = new S3Client({ region: 'us-east-1' });
const prisma = new PrismaClient();

const TMP_DIR = process.env.TMP_DIR;
const BUCKET_NAME = 'tripdata';

async function getMostRecentData() {
  const mostRecentDay = await prisma.dockDay.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
  });

  return {
    mostRecentMonth: Number(
      mostRecentDay?.month ?? process.env.START_MONTH ?? 0,
    ),
    mostRecentYear: Number(mostRecentDay?.year ?? process.env.START_YEAR ?? 0),
  };
}

async function getListOfFileNamesOnS3() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
  });

  let isTruncated = true;

  let fileNames = [];
  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } =
      await client.send(command);
    fileNames = Contents.map((c) => c.Key);
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }

  return fileNames;
}

// As of February 2024 the Citibike team has made the absolutely ludicrous
// decision to change their naming & file structure scheme. Previous years are
// rolled up into a single zip file each (e.g. 2023-citibike-tripdata.zip) that
// contains a single directory (e.g. 2023-citibike-tripdata) which contains
// monthly directories (e.g. 1_January) which themselves contain multiple zip
// files for a single month. The current year gets one top level file per month
// (e.g. 202401-citibike-tripdata.csv.zip) which also contains multiple files
// for the single month. This is really really dumb and I hate that they did
// this.
async function getFilesNewerThanNewestData(
  fileNames,
  mostRecentYear,
  mostRecentMonth,
) {
  return fileNames.filter((fileName) => {
    // JC- files will return NaN here
    const fileYear = parseInt(fileName.slice(0, 4));
    // Annual files will return NaN here
    const fileMonth = parseInt(fileName.slice(4, 6));

    const fileIsMonthly = Number.isInteger(fileMonth);
    const fileIsYearly = !fileIsMonthly;

    return (
      // A whole yearly rollup file of a year ahead of any data we have
      (fileIsYearly && fileYear > mostRecentYear) ||
      // A yearly file for a year that we haven't yet completed
      (fileIsYearly && fileYear === mostRecentYear && mostRecentMonth < 12) ||
      // A monthly file in a year for which we currently have no data
      (fileIsMonthly && fileYear > mostRecentYear) ||
      // A monthly file for a year, but not a month, in which we have data
      (fileIsMonthly &&
        fileYear === mostRecentYear &&
        fileMonth > mostRecentMonth)
    );
  });
}

async function downloadAndUnzipFiles(
  fileNames,
  mostRecentYear,
  mostRecentMonth,
) {
  if (fileNames.length > 0 && !fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }

  // Delete any files left over in this temp dir
  readdirSync(TMP_DIR).forEach((f) => rmSync(`${TMP_DIR}/${f}`));

  console.log(`Most recent data from ${mostRecentYear}-${mostRecentMonth}`);
  console.log(`Found ${fileNames.length} files to download:`);

  let counter = 0;
  for (const file of fileNames) {
    counter++;
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file,
    });

    const response = await client.send(command);
    const zipLocation = `${TMP_DIR}/${file}`;

    const padLength = fileNames.length.toString().length;
    const paddedCounter = String(counter).padStart(padLength, '0');
    console.log(
      `[${paddedCounter}/${fileNames.length}] Downloading ${file}...`,
    );
    await writeFile(zipLocation, response.Body);

    const zip = new adm(zipLocation);
    const zipEntries = zip.getEntries();
    for (const entry of zipEntries) {
      // Based on the filtering we did at the point of choosing which files to
      // download, the only CSVs here that we *don't* want are the ones with
      // both year and month dated before our most recent data.
      if (entry.entryName.match(/\.csv$/)) {
        const fileName = entry.entryName.match(/\d{6}.*\.csv$/)[0];
        const fileYear = parseInt(fileName.slice(0, 4));
        const fileMonth = parseInt(fileName.slice(4, 6));

        if (entry.entryName[0] === '_') {
          // This is in the __MACOSX subdirectory and we don't want it
        } else if (fileYear > mostRecentYear || fileMonth > mostRecentMonth) {
          await zip.extractEntryTo(entry.entryName, TMP_DIR, false, true);
        }
      }
    }

    fs.unlinkSync(zipLocation);
  }
}

// Before Citibike migrated to a strictly dumber and worse file scheme, each
// month was one file. The seeder expects this, and I don't want to rewrite
// that, so I'm going to concatenate the multiple files per month into one
// file and tell the seeder to skip the extra header rows.
async function concatenateFiles() {
  const files = readdirSync(TMP_DIR);
  const months = new Set();
  files.forEach((file) => months.add(file.slice(0, 6)));

  for (const month of months) {
    const newFileName = `${TMP_DIR}/${month}.csv`;
    const thisMonthAbsoluteFiles = files
      .filter((file) => file.indexOf(month) > -1)
      .map((file) => `${TMP_DIR}/${file}`);

    // You're never going to believe me but we've started having an issue with
    // the final lines of the csv files being truncated. I don't care enough
    // about (roughly) 1 in 100,000 trips, so I'm just going to delete the last
    // line of each file to be safe.
    for (const file of thisMonthAbsoluteFiles) {
      exec(`tail -n 1 ${file} | wc -c | xargs -I {} truncate ${file} -s -{}`);
    }

    concat(thisMonthAbsoluteFiles, newFileName, () => {
      exec(`dos2unix ${newFileName}`);
      thisMonthAbsoluteFiles.forEach((file) => {
        fs.unlinkSync(file);
      });
    });
  }
}

(async () => {
  const { mostRecentMonth, mostRecentYear } = await getMostRecentData();
  const fileNames = await getListOfFileNamesOnS3();
  const newFileNames = await getFilesNewerThanNewestData(
    fileNames,
    mostRecentYear,
    mostRecentMonth,
  );
  await downloadAndUnzipFiles(newFileNames, mostRecentYear, mostRecentMonth);
  await concatenateFiles();
})();
