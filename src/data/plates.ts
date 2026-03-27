import driverData from "./florida-plate-driver.json";
import { plateCategories, type Plate } from "../types";

// All plates are top-level, flat structure
export const plates: Plate[] = driverData.plates;

export const groupedPlates = plateCategories
  .map((category) => ({
    category,
    plates: plates.filter((plate) => plate.category === category)
  }))
  .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);
