const { test } = require("@playwright/test");
const initSqlJs = require('sql.js');

const SQL = await initSqlJs();
const db = new SQL.Database();

const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
  minTime: 1033,
});

const HOST = "https://www.trademe.co.nz";
const SEARCH =
  "/a/property/residential/sale/search?price_max=1000000&bedrooms_min=1&property_type=house&land_area_min=1&sort_order=expirydesc";

test("scrape", async ({ page }) => {
  async function goto(path) {
    const url = `${HOST}${path.startsWith("/") ? path : `/${path}`}`;
    await limiter.schedule(() => page.goto(url));
  }

  await goto(SEARCH);

  const results = await page.$$("tm-search-card-switcher");

  console.log(`Found ${results.length} results`);

  const links = []

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
    links.push({
      addressText,
      price,
      href
    })
  }

  for (const { href, addressText, price } of links) {
    await goto(href);
    const broadbandSelector = await page.$("tm-broadband-technologies");
    if (!broadbandSelector) continue;
    const broadband = await broadbandSelector.textContent();
    console.log(addressText);
    console.log(`\t${price}`);
    console.log(`\t${broadband}`);
  }

  await page.pause();
});
