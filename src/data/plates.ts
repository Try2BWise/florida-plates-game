import rawPlates from "./floridaPlates.json";
import type { Plate, PlateCategory } from "../types";

interface RawPlateEntry {
  id: number;
  plate: {
    LicensePlate: string;
    DateEnacted?: string;
    Image: string;
  };
}

interface RawPlateCollection {
  Environmental: RawPlateEntry[];
  Miscellaneous: RawPlateEntry[];
  "Professional Sports": RawPlateEntry[];
  Universities: RawPlateEntry[];
}

const categoryOrder: PlateCategory[] = [
  "Environmental",
  "Miscellaneous",
  "Professional Sports",
  "Universities"
];

const typedRawPlates = rawPlates as RawPlateCollection;

export const plates: Plate[] = categoryOrder.flatMap((category) =>
  [...typedRawPlates[category]]
    .sort((left, right) =>
      left.plate.LicensePlate.localeCompare(right.plate.LicensePlate)
    )
    .map((entry) => ({
      id: `${category}-${entry.id}`,
      name: entry.plate.LicensePlate,
      category,
      imageKey: entry.plate.Image,
      enactedOn: entry.plate.DateEnacted
    }))
);

export const groupedPlates = categoryOrder.map((category) => ({
  category,
  plates: plates.filter((plate) => plate.category === category)
}));
