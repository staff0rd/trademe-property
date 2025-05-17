import { Page } from "@playwright/test";
import { PropertyRecord } from "@staff0rd/shared/types";

export async function findNewProperties(
  indexPage: Page,
  existingData: PropertyRecord[] = []
): Promise<PropertyRecord[]> {
  const data: PropertyRecord[] = [...existingData];
  const results = indexPage.locator("tm-search-card-switcher");
  const count_results = await results.count();

  for (let i = 0; i < count_results; i++) {
    const result = results.nth(i);
    const link = result.locator("a");
    await link.waitFor({ state: "visible" });
    await result
      .locator(".tm-loading-card__link")
      .waitFor({ state: "detached" });

    const href = await link.getAttribute("href");
    if (!href) throw new Error("Link has no href");

    const address = result.locator("tm-property-search-card-address-subtitle");
    const addressText = await address.textContent();
    if (!addressText) throw new Error("Address text not found");

    const priceSelector = result.locator(
      ".tm-property-search-card-price-attribute__price"
    );
    const price = await priceSelector.textContent();
    if (!price) throw new Error("Price text not found");

    if (data.find((x) => x.addressText === addressText)) continue;

    // Check if the price text contains a valid price format ($X,XXX or $XXX,XXX etc)
    if (!price.match(/\$\d{1,3}(?:,\d{3})*$/)) continue;

    const imageEl = result.locator(
      "img.tm-progressive-image-loader__full[alt^='Image 1 of']"
    );
    const imageUrl = (await imageEl.getAttribute("src")) || undefined;

    //console.log(`Found ${addressText}, ${price}`);
    data.push({
      addressText,
      price,
      href,
      created: new Date().toISOString(),
      imageUrl,
    });
  }

  return data;
}
