import { getBroadbandForData } from "./getBroadbandForData";
import { goto, saveData } from "./trademe.spec";
import { printPropertiesWithFibre } from "./printPropertiesWithFibre";

export async function scrapeLinks(data, indexPage, context, count = 1) {
  const results = await indexPage.$$("tm-search-card-switcher");

  console.log(`Found ${results.length} results on page ${count}`);

  for (const result of results) {
    const link = await result.$("a");
    if (!link) throw new Error("Link not found");
    const href = await link.getAttribute("href");
    if (!href) throw new Error("Link has no href");
    const address = await result.$("tm-property-search-card-address-subtitle");
    if (!address) throw new Error("Address not found");
    const addressText = await address.textContent();
    const priceSelector = await result.$(
      ".tm-property-search-card-price-attribute__price"
    );
    if (!priceSelector) throw new Error("Price not found");
    const price = await priceSelector?.textContent();
    if (data.find((x) => x.addressText === addressText)) continue;
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
