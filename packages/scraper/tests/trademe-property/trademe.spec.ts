import { test } from "@playwright/test";
import { scrapeLinks } from "./scrapeLinks";
import { goto } from "./navigation";
import { loadData, SEARCH, PRICE_KEY, LAND_KEY } from "@staff0rd/shared/data";

test("scrape", async ({ page, context }) => {
  console.log(`Price: ${PRICE_KEY}`);
  console.log(`Land: ${LAND_KEY}`);
  await goto(page, SEARCH, "tm-search-card-switcher");
  const data = loadData();
  await scrapeLinks(data, page, context);
  await page.pause();
});
