import { HOST } from "./trademe.spec";


export function printPropertiesWithFibre(data) {
  for (const item of data) {
    if (item.broadband.includes("Fibre")) {
      console.log(`${item.addressText}, ${item.price}, ${HOST}${item.href}`);
    }
  }
}
