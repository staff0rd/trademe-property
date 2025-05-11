import { HOST } from "./trademe.spec";
import { PropertyRecord } from "./types";

export function printPropertiesWithFibre(data: PropertyRecord[]): void {
  for (const item of data) {
    if (item.broadband && item.broadband.includes("Fibre")) {
      console.log(`${item.addressText}, ${item.price}, ${HOST}${item.href}`);
    }
  }
}