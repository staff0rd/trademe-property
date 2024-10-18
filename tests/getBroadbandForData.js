import { goto } from "./trademe.spec";

export async function getBroadbandForData(data, page) {
  for (const item of data) {
    if (item.broadband) continue;
    const { href } = item;
    await goto(page, href);
    const broadbandSelector = await page.$("tm-broadband-technologies");
    if (!broadbandSelector) {
      item.broadband = "None";
      continue;
    }
    const broadband = (await broadbandSelector.textContent()).trim();
    if (!broadband) item.broadband = "None";
    else item.broadband = broadband;
  }
}
