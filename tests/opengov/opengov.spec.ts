import { test, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { APIResponse } from '@playwright/test';

const HOME = 'https://wayback.archive-it.org/22771/20240425155743mp_/https:/www.opengov.nsw.gov.au/searches?query=&agencyId=25059&page=1&size=10&fullAgencyId=25059&maxPages=33'
const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

async function downloadDocuments(page: Page) {
  // Find all media-body elements
  const mediaElements = await page.$$('.media-body');
  const downloadPromises = [];

  for (const element of mediaElements) {
    // Get the heading text and transform to filename
    const heading = await element.$('.media-heading');
    if (!heading) {
      console.log('No heading found for media element');
      continue;
    }
    
    const text = await heading.textContent();
    if (!text) {
      console.log('No text content found in heading');
      continue;
    }

    const filename = text
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '.') // Replace spaces with dots
      + '.pdf';

    const filepath = path.join(DOWNLOADS_DIR, filename);

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`File already exists: ${filename}`);
      continue;
    }

    // Find download link
    const downloadLink = await element.$('.document-download a');
    if (!downloadLink) {
      console.log(`No download link found for: ${filename}`);
      continue;
    }

    const href = await downloadLink.getAttribute('href');
    if (!href) {
      console.log(`No href attribute found for: ${filename}`);
      continue;
    }

    // Setup download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    // Save the file
    try {
      await download.saveAs(filepath);
      console.log(`Downloaded: ${filename}`);
    } catch (error) {
      console.error(`Failed to download ${filename}: ${error}`);
    }
  }
}

test("scrape", async ({ page }) => {
  await page.goto(HOME);
  await downloadDocuments(page);
});