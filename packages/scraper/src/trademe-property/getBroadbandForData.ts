import { goto } from "./navigation";
import { Page, BrowserContext } from "@playwright/test";
import { PropertyRecord } from "@staff0rd/shared/types";

async function getBroadbandForItem(
  item: PropertyRecord,
  page: Page
): Promise<void> {
  if (item.broadband) return;

  const { href } = item;
  await goto(page, href);
  const broadbandSelector = await page.$("tm-broadband-technologies");

  if (!broadbandSelector) {
    item.broadband = "None";
    return;
  }

  const broadbandText = await broadbandSelector.textContent();
  const broadband = broadbandText ? broadbandText.trim() : "";
  item.broadband = broadband || "None";
}

export async function getBroadbandForData(
  data: PropertyRecord[],
  page: Page
): Promise<void> {
  const itemsToProcess = data.filter((item) => !item.broadband);
  const parallelLimit = 5; // Process 5 items at a time

  for (let i = 0; i < itemsToProcess.length; i += parallelLimit) {
    const batch = itemsToProcess.slice(i, i + parallelLimit);
    const pagePromises = batch.map(async (item) => {
      const newPage = await page.context().newPage();
      try {
        await getBroadbandForItem(item, newPage);
      } finally {
        await newPage.close();
      }
    });

    await Promise.all(pagePromises);
  }
}
