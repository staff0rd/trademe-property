import { test } from "@playwright/test";
import { scrapeLinks } from "./scrapeLinks";
import { goto } from "./navigation";
import {
  loadData,
  MaxPriceKey,
  LandAreaKey,
  buildDbFilePath,
  getSearchPath,
} from "@staff0rd/shared/data";

test("scrape", async ({ page }) => {
  const PRICE_KEY: MaxPriceKey = "650k";
  const LAND_KEY: LandAreaKey = "750m2";
  console.log(`Price: ${PRICE_KEY}`);
  console.log(`Land: ${LAND_KEY}`);
  const search = getSearchPath(PRICE_KEY, LAND_KEY);
  await goto(page, search, "tm-search-card-switcher");
  const fileName = buildDbFilePath(PRICE_KEY, LAND_KEY);
  const data = loadData(fileName);
  await scrapeLinks(fileName, data, page);
  await page.pause();
});
