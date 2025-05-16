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

const LandArea = {
  "1ha":1,
  "750m2": 0.075,
  "1000m2": 0.1,
  "2000m2": 0.2,
} as const;

const MaxPrice = {
  "1m": 1000000,
  "750k": 750000,
  "650k": 650000,
} as const;

type LandAreaKey = keyof typeof LandArea;
type MaxPriceKey = keyof typeof MaxPrice;

const PRICE_KEY: MaxPriceKey = "650k";
const LAND_KEY: LandAreaKey = "1000m2";
const MAX_PRICE = MaxPrice[PRICE_KEY];
const MAX_LAND_AREA = LandArea[LAND_KEY];
const DATA_PATH = `${PRICE_KEY}_${LAND_KEY}.csv`;
const SEARCH =
  `/a/property/residential/sale/search?price_max=${MAX_PRICE}&bedrooms_min=1&property_type=house&land_area_min=${MAX_LAND_AREA}&sort_order=expirydesc`;

test("scrape", async ({ page, context }) => {
  console.log(`Price: ${PRICE_KEY}`);
  console.log(`Land: ${LAND_KEY}`);
  await goto(page, SEARCH, "tm-search-card-switcher");
  const data = loadData();
  await scrapeLinks(data, page, context);
  await page.pause();
});