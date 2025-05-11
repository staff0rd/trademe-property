import { goto } from "./trademe.spec";
import { Page } from "@playwright/test";
import { PropertyRecord } from "./types";

export async function getBroadbandForData(
  data: PropertyRecord[],
  page: Page
): Promise<void> {
  for (const item of data) {
    if (item.broadband) continue;
    const { href } = item;
    await goto(page, href);
    const broadbandSelector = await page.$("tm-broadband-technologies");
    if (!broadbandSelector) {
      item.broadband = "None";
      continue;
    }
    const broadbandText = await broadbandSelector.textContent();
    const broadband = broadbandText ? broadbandText.trim() : "";
    if (!broadband) item.broadband = "None";
    else item.broadband = broadband;
  }
}