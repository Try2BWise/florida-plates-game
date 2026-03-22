import rawCatalog from "./generated/catalog.generated.json";
import { plateCategories, type Plate, type PlateCategory, type PlateVersion } from "../types";

interface RawPlateVersion {
  id: string;
  label: string;
  source: "legacy" | "zip";
  isDefault: boolean;
  imageKey: string;
  imagePath: string;
  imageUrl?: string | null;
  productUrl?: string | null;
  notes?: string | null;
}

interface RawPlate {
  id: string;
  name: string;
  appCategory: PlateCategory;
  sourceCategories: string[];
  aliases?: string[];
  introducedYear?: number | null;
  introducedYearConfidence?: "high" | "medium" | "low" | null;
  popularityWeight?: 1 | 2 | 3 | 4 | 5 | null;
  sponsor?: {
    name?: string | null;
    notes?: string | null;
    url?: string | null;
  };
  matchSource: "legacy_only" | "current_only" | "normalized_name" | "manual_override";
  versions: RawPlateVersion[];
}

function buildSearchText(plate: RawPlate) {
  return [
    plate.name,
    ...(plate.aliases ?? []),
    plate.appCategory,
    ...(plate.sourceCategories ?? []),
    plate.sponsor?.name ?? "",
    plate.sponsor?.notes ?? ""
  ]
    .join(" ")
    .trim()
    .toLowerCase();
}

function normalizeVersions(versions: RawPlateVersion[]): PlateVersion[] {
  const ordered = [...versions].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1;
    }

    if (left.source !== right.source) {
      return left.source === "zip" ? -1 : 1;
    }

    return left.label.localeCompare(right.label);
  });

  let legacyCount = 0;
  let currentCount = 0;

  return ordered.map((version) => {
    let label = version.label;
    if (version.source === "legacy") {
      legacyCount += 1;
      label = legacyCount === 1 ? "Legacy" : `Legacy ${legacyCount}`;
    } else if (version.label === "Current" || version.isDefault) {
      currentCount += 1;
      label = currentCount === 1 ? "Current" : `Current ${currentCount}`;
    }

    return {
      ...version,
      label,
      imageUrl: version.imageUrl ?? null,
      productUrl: version.productUrl ?? null,
      notes: version.notes ?? null
    };
  });
}

const typedRawCatalog = rawCatalog as RawPlate[];

export const plates: Plate[] = typedRawCatalog
  .map((plate) => {
    const versions = normalizeVersions(plate.versions);
    const defaultVersion =
      versions.find((version) => version.isDefault) ?? versions[0];

    return {
      id: plate.id,
      name: plate.name,
      category: plate.appCategory,
      sourceCategories: plate.sourceCategories ?? [],
      aliases: plate.aliases ?? [],
      introducedYear: plate.introducedYear ?? null,
      introducedYearConfidence: plate.introducedYearConfidence ?? null,
      popularityWeight: plate.popularityWeight ?? null,
      sponsor: {
        name: plate.sponsor?.name ?? null,
        notes: plate.sponsor?.notes ?? null,
        url: plate.sponsor?.url ?? null
      },
      matchSource: plate.matchSource,
      versions,
      defaultVersion,
      searchText: buildSearchText(plate)
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

export const groupedPlates = plateCategories
  .map((category) => ({
    category,
    plates: plates.filter((plate) => plate.category === category)
  }))
  .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);

export function getPlateVersionById(
  plate: Plate,
  versionId: string | null | undefined
): PlateVersion {
  if (!versionId) {
    return plate.defaultVersion;
  }

  return plate.versions.find((version) => version.id === versionId) ?? plate.defaultVersion;
}
