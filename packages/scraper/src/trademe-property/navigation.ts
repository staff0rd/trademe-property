import { Page } from "@playwright/test";
import Bottleneck from "bottleneck";

export const HOST = "https://www.trademe.co.nz";

const limiter = new Bottleneck({
  minTime: 1033,
});

export async function goto(
  page: Page,
  path: string,
  waitForSelector?: string
): Promise<void> {
  const url = path.startsWith("http")
    ? path
    : `${HOST}${path.startsWith("/") ? path : `/${path}`}`;
  await limiter.schedule(async () => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 30000 });
    }
  });
}
