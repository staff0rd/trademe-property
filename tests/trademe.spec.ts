import { test, Page } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { scrapeLinks } from "./scrapeLinks";
import { PropertyRecord } from "./types";
import Bottleneck from "bottleneck";

function loadData(): PropertyRecord[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, "utf-8");
  const records = parse(data, { columns: true }) as PropertyRecord[];
  return records;
}

export async function saveData(data: PropertyRecord[]): Promise<void> {
  const csv = stringify(data, { header: true });
  fs.writeFileSync(DATA_PATH, csv, "utf-8");
}

const limiter = new Bottleneck({
  minTime: 1033,
});

export const HOST = "https://www.trademe.co.nz";

// const DATA_PATH = "500k.csv";
// const SEARCH =
//   "/a/property/residential/sale/search?price_max=500000&bedrooms_min=1&property_type=house&land_area_min=0.1&sort_order=expirydesc";
const DATA_PATH = "1mil.csv";
const SEARCH =
  "/a/property/residential/sale/search?price_max=1000000&bedrooms_min=1&property_type=house&land_area_min=1&sort_order=expirydesc";

export async function goto(page: Page, path: string, waitForSelector?: string): Promise<void> {
  const url = `${HOST}${path.startsWith("/") ? path : `/${path}`}`;
  await limiter.schedule(async () => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 30000 });
    }
  });
}

test("scrape", async ({ page, context }) => {
  await goto(page, SEARCH, "tm-search-card-switcher");
  await scrapeLinks([], page, context);
  await page.pause();
});