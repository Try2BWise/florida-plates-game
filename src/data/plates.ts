import driverData from "./generated/florida-plate-driver.generated.json";
import { plateCategories, type Plate, type PlateCategory } from "../types";

const validCategories = new Set<string>(plateCategories);

function toPlateCategory(value: string): PlateCategory {
  if (validCategories.has(value)) {
    return value as PlateCategory;
  }

  return "Civic & Causes";
}

// All plates are top-level, flat structure
export const plates: Plate[] = driverData.plates.map((plate) => ({
  ...plate,
  category: toPlateCategory(plate.category)
}));

export const groupedPlates = plateCategories
  .map((category) => ({
    category,
    plates: plates.filter((plate) => plate.category === category)
  }))
  .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);
