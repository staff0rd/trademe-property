import { getBroadbandForData } from "./getBroadbandForData";
import { printPropertiesWithFibre } from "./printPropertiesWithFibre";
import { Page, BrowserContext } from "@playwright/test";
import { PropertyRecord } from "./types";
import { findNewProperties } from "./findNewProperties";
import { saveData } from "./data";

export async function scrapeLinks(
  data: PropertyRecord[],
  indexPage: Page,
  context: BrowserContext,
  count: number = 1
): Promise<void> {
  // Collect data from current page
  const updatedData = await findNewProperties(indexPage, data);
  
  // Process broadband data in parallel
  await getBroadbandForData(updatedData, indexPage);
  
  printPropertiesWithFibre(updatedData);
  saveData(updatedData);

  console.log(`Page ${count}: ${updatedData.length} properties found`);
  
  // Check for next page
  const next = await indexPage
    .locator("tg-pagination-link")
    .filter({ hasText: "Next" });
    
  if ((await next.count()) === 0) {
    console.log("No more pages");
    return;
  }
  
  await next.click();
  await scrapeLinks(updatedData, indexPage, context, count + 1);
}