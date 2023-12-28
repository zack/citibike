// This file has three jobs:
// 1. Check for the most recent trip in the database
// 2. Determine whether there is any more recent data available
// 3. Download and unzip newer data if it is available

import { PrismaClient } from '@prisma/client'
import adm from 'adm-zip';
import fs from 'fs';
import { writeFile } from 'node:fs/promises';

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const client = new S3Client({ region: 'us-east-1' });
const prisma = new PrismaClient();

const TMP_DIR = process.env.TMP_DIR;
const BUCKET_NAME = 'tripdata';

async function getMostRecentData() {
  const mostRecentDay = await prisma.dockDay.findFirst({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { day: 'desc' }
    ],
  });

  return ({
    mostRecentMonth: parseInt(mostRecentDay?.month ?? process.env.START_MONTH),
    mostRecentYear: parseInt(mostRecentDay?.year ?? process.env.START_YEAR),
  });
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

async function getFilesNewerThanNewestData(fileNames) {
  const { mostRecentMonth, mostRecentYear } = await getMostRecentData();

  return fileNames.filter(fileName => {
    // JC- files will safely return NaN and then false
    const fileYear = parseInt(fileName.slice(0,4));
    const fileMonth = parseInt(fileName.slice(4,6));

    return fileYear > mostRecentYear
      || (fileYear === mostRecentYear && fileMonth > mostRecentMonth);
  });
}

async function downloadAndUnzipFiles(fileNames) {
  if (fileNames.length > 0 && !fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }

  await fileNames.forEach(async (file) => {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file,
    });

    const response = await client.send(command);
    const zipLocation = `${TMP_DIR}/${file}`;

    await writeFile(zipLocation, response.Body);

    const zip = new adm(zipLocation);
    const zipEntries = zip.getEntries();
    zipEntries.forEach(entry => {
      if (entry.entryName.match(/^\d.*csv$/) !== null) {
        zip.extractEntryTo(entry.entryName, TMP_DIR, false, true);
      }
    });

    fs.unlinkSync(zipLocation);
  });
}

(async () => {
  const fileNames = await getListOfFileNamesOnS3();
  const newFileNames = await getFilesNewerThanNewestData(fileNames);
  await downloadAndUnzipFiles(newFileNames);
})();
