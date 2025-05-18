import { Page } from "@playwright/test";
import { PropertyRecord } from "@staff0rd/shared/types";
import * as chrono from "chrono-node";

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
    const pageUrl = new URL(indexPage.url());
    const fullHref = new URL(href, pageUrl.origin).toString();

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

    // Find house and land areas
    const metrics = result.locator(
      ".tm-property-search-card-attribute-icons__metric"
    );
    const metricsCount = await metrics.count();
    let houseArea: string | undefined;
    let landArea: string | undefined;

    for (let j = 0; j < metricsCount; j++) {
      const metric = metrics.nth(j);
      const icon = metric.locator("tg-icon");
      const altText = await icon.getAttribute("alt");

      if (altText === "House area" || altText === "Land area") {
        const valueSpan = metric.locator(
          ".tm-property-search-card-attribute-icons__metric-value"
        );
        const value = await valueSpan.textContent();
        if (value) {
          // Remove any whitespace and extract just the number
          const numericValue = value.trim();
          if (altText === "House area") {
            houseArea = numericValue;
          } else {
            landArea = numericValue;
          }
        }
      }
    }

    const listedDateEl = result.locator(
      "tm-property-search-card-listed-date span.ng-star-inserted"
    );
    const listedDate = await listedDateEl.textContent();
    if (!listedDate) throw new Error("Listed date not found");

    // Parse date like " Fri, 16 May " into ISO format
    const trimmedDate = listedDate.trim();
    const parsedDate = chrono.parseDate(trimmedDate);
    const isoDate = parsedDate?.toISOString() || "unknown";

    //console.log(`Found ${addressText}, ${price}`);
    data.push({
      addressText,
      price,
      href: fullHref,
      created: isoDate,
      imageUrl,
      houseArea,
      landArea,
    });
  }

  return data;
}
