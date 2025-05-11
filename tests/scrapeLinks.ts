import { getBroadbandForData } from "./getBroadbandForData";
import { goto, saveData } from "./trademe.spec";
import { printPropertiesWithFibre } from "./printPropertiesWithFibre";
import { Page, BrowserContext } from "@playwright/test";
import { PropertyRecord } from "./types";

export async function scrapeLinks(
  data: PropertyRecord[],
  indexPage: Page,
  context: BrowserContext,
  count: number = 1
): Promise<void> {
  const results = indexPage.locator("tm-search-card-switcher");
  const count_results = await results.count();

  console.log(`Found ${count_results} results on page ${count}`);

  for (let i = 0; i < count_results; i++) {
    const result = results.nth(i);
    const link = result.locator("a");
    await link.waitFor({ state: "visible" });
    await result.locator(".tm-loading-card__link").waitFor({ state: "detached" });
    const href = await link.getAttribute("href");
    if (!href) throw new Error("Link has no href");
    const address = result.locator("tm-property-search-card-address-subtitle");
    const addressText = await address.textContent();
    if (!addressText) throw new Error("Address text not found");
    
    const priceSelector = result.locator(".tm-property-search-card-price-attribute__price");
    const price = await priceSelector.textContent();
    if (!price) throw new Error("Price text not found");
    if (data.find((x) => x.addressText === addressText)) continue;
    console.log(`Found ${addressText}, ${price}`);
    data.push({
      addressText,
      price,
      href,
      created: new Date().toISOString(),
    });
  }

  await getBroadbandForData(data, await context.newPage());

  printPropertiesWithFibre(data);

  saveData(data);

  const next = await indexPage
    .locator("tg-pagination-link")
    .filter({ hasText: "Next" });
  if ((await next.count()) === 0) {
    console.log("No more pages");
    return;
  }

  await next.click();
  await scrapeLinks(data, indexPage, context, count + 1);
}