#!/usr/bin/env node
import { Command } from "commander";
import { scrapeTradeMe } from "./trademe-property/trademe";
import {
  MaxPriceKey,
  LandAreaKey,
  MaxPrice,
  LandArea,
} from "@staff0rd/shared/data";

const program = new Command();

program
  .name("property-scraper")
  .description("CLI tool for scraping property data")
  .version("1.0.0");

program
  .command("trademe")
  .description("Scrape TradeMe property listings")
  .option("-p, --price <price>", "Maximum price", "650k")
  .option("-l, --land <area>", "Minimum land area", "750m2")
  .action(async (options) => {
    const priceKey = options.price as MaxPriceKey;
    const landKey = options.land as LandAreaKey;

    // Validate inputs
    if (!MaxPrice[priceKey]) {
      console.error(
        `Invalid price key. Valid options are: ${Object.keys(MaxPrice).join(
          ", "
        )}`
      );
      process.exit(1);
    }
    if (!LandArea[landKey]) {
      console.error(
        `Invalid land area key. Valid options are: ${Object.keys(LandArea).join(
          ", "
        )}`
      );
      process.exit(1);
    }

    try {
      await scrapeTradeMe(priceKey, landKey);
    } catch (error) {
      console.error("Error during scraping:", error);
      process.exit(1);
    }
  });

program.parse();
