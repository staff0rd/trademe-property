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

export type SortField = "created" | "landArea" | "price";
export type SortOrder = "asc" | "desc";

export const DATA_PATH_ROOT = path.join(__dirname, "..", "..", "..", "data");

export function getDbFilePath(parameterString: string) {
  return path.join(DATA_PATH_ROOT, `${parameterString}.db`);
}

export function buildDbFilePath(priceKey: string, landKey: string) {
  return getDbFilePath(`${priceKey}_${landKey}`);
}

export function getSearchPath(priceKey: MaxPriceKey, landKey: LandAreaKey) {
  const MAX_PRICE = MaxPrice[priceKey];
  const MAX_LAND_AREA = LandArea[landKey];
  return `/a/property/residential/sale/search?price_max=${MAX_PRICE}&bedrooms_min=1&property_type=house&land_area_min=${MAX_LAND_AREA}&sort_order=expirydesc`;
}

function getDb(dbPath: string) {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      addressText TEXT PRIMARY KEY,
      priceText TEXT,
      priceNumber INTEGER,
      href TEXT,
      created TEXT,
      broadband TEXT,
      imageUrl TEXT,
      houseArea TEXT,
      landArea TEXT
    )
  `);
  return db;
}

export function loadData(fileName: string): PropertyRecord[] {
  try {
    const db = getDb(fileName);
    const records = db
      .prepare("SELECT * FROM properties")
      .all() as PropertyRecord[];
    db.close();
    return records;
  } catch (error) {
    return [];
  }
}

export function loadFibreProperties(
  parameterString: string,
  sortBy?: SortField,
  order: SortOrder = "asc"
): PropertyRecord[] {
  try {
    const db = getDb(getDbFilePath(parameterString));

    let query = "SELECT * FROM properties WHERE broadband LIKE '%fibre%'";
    if (sortBy) {
      const direction = order === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY ${
        sortBy === "price" ? "priceNumber" : sortBy
      } ${direction}`;
    }

    const records = db.prepare(query).all() as PropertyRecord[];
    db.close();
    return records;
  } catch (error) {
    return [];
  }
}

export async function saveData(
  fileName: string,
  data: PropertyRecord[]
): Promise<void> {
  const db = getDb(fileName);
  const insert = db.prepare(`
    INSERT OR REPLACE INTO properties (addressText, priceText, priceNumber, href, created, broadband, imageUrl, houseArea, landArea)
    VALUES (@addressText, @priceText, @priceNumber, @href, @created, @broadband, @imageUrl, @houseArea, @landArea)
  `);

  const insertMany = db.transaction((records: PropertyRecord[]) => {
    for (const record of records) {
      insert.run(record);
    }
  });

  insertMany(data);
  db.close();
}
