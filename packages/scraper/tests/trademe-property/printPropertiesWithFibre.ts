import { HOST } from "./navigation";
import { PropertyRecord } from "@staff0rd/shared/types";

export function printPropertiesWithFibre(data: PropertyRecord[]): void {
  for (const item of data) {
    if (item.broadband?.includes("Fibre")) {
      console.log(`${item.addressText}, ${item.price}, ${HOST}${item.href}`);
    }
  }
}
