import Database from "better-sqlite3";
import { PropertyRecord } from "./types";
import path from "path";

export const LandArea = {
  "1ha": 1,
  "750m2": 0.075,
  "1000m2": 0.1,
  "2000m2": 0.2,
} as const;

export const MaxPrice = {
  "1m": 1000000,
  "750k": 750000,
  "650k": 650000,
} as const;

export type LandAreaKey = keyof typeof LandArea;
export type MaxPriceKey = keyof typeof MaxPrice;

export const PRICE_KEY: MaxPriceKey = "650k";
export const LAND_KEY: LandAreaKey = "750m2";
export const MAX_PRICE = MaxPrice[PRICE_KEY];
export const MAX_LAND_AREA = LandArea[LAND_KEY];
export const DATA_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  `${PRICE_KEY}_${LAND_KEY}.db`
);
export const SEARCH = `/a/property/residential/sale/taranaki/search?price_max=${MAX_PRICE}&bedrooms_min=1&property_type=house&land_area_min=${MAX_LAND_AREA}&sort_order=expirydesc`;

function getDb() {
  const db = new Database(DATA_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      addressText TEXT PRIMARY KEY,
      price TEXT,
      href TEXT,
      created TEXT,
      broadband TEXT,
      imageUrl TEXT
    )
  `);
  return db;
}

export function loadData(): PropertyRecord[] {
  try {
    const db = getDb();
    const records = db
      .prepare("SELECT * FROM properties")
      .all() as PropertyRecord[];
    db.close();
    return records;
  } catch (error) {
    return [];
  }
}

export async function saveData(data: PropertyRecord[]): Promise<void> {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO properties (addressText, price, href, created, broadband, imageUrl)
    VALUES (@addressText, @price, @href, @created, @broadband, @imageUrl)
  `);

  const insertMany = db.transaction((records: PropertyRecord[]) => {
    for (const record of records) {
      insert.run(record);
    }
  });

  insertMany(data);
  db.close();
}
