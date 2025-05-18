import { getBroadbandForData } from "./getBroadbandForData";
import { printPropertiesWithFibre } from "./printPropertiesWithFibre";
import { Page } from "@playwright/test";
import { PropertyRecord } from "@staff0rd/shared/types";
import { findNewProperties } from "./findNewProperties";
import { saveData } from "@staff0rd/shared/data";

export async function scrapeLinks(
  fileName: string,
  data: PropertyRecord[],
  indexPage: Page,
  count: number = 1
): Promise<void> {
  // Collect data from current page
  const updatedData = await findNewProperties(indexPage, data);

  // Process broadband data in parallel
  await getBroadbandForData(updatedData, indexPage);

  printPropertiesWithFibre(updatedData);
  saveData(fileName, updatedData);

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
  await scrapeLinks(fileName, updatedData, indexPage, count + 1);
}
