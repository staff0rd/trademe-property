import { test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { scrapeLinks } from "./scrapeLinks";
import { PropertyRecord } from "./types";
import { goto } from "./navigation";

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

const DATA_PATH = "1mil.csv";
const SEARCH =
  "/a/property/residential/sale/search?price_max=1000000&bedrooms_min=1&property_type=house&land_area_min=1&sort_order=expirydesc";

test("scrape", async ({ page, context }) => {
  await goto(page, SEARCH, "tm-search-card-switcher");
  await scrapeLinks([], page, context);
  await page.pause();
});