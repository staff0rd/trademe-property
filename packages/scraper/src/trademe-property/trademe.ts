import { chromium } from "@playwright/test";
import { scrapeLinks } from "./scrapeLinks";
import { goto } from "./navigation";
import {
  loadData,
  MaxPriceKey,
  LandAreaKey,
  buildDbFilePath,
  getSearchPath,
} from "@staff0rd/shared/data";

export async function scrapeTradeMe(
  priceKey: MaxPriceKey = "650k",
  landKey: LandAreaKey = "750m2"
) {
  console.log(`Price: ${priceKey}`);
  console.log(`Land: ${landKey}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const search = getSearchPath(priceKey, landKey);
    await goto(page, search, "tm-search-card-switcher");

    const fileName = buildDbFilePath(priceKey, landKey);
    const data = loadData(fileName);
    await scrapeLinks(fileName, data, page);
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error; // Re-throw to let caller handle
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}
