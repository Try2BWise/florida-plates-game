export const plateCategories = [
  "Civic & Causes",
  "Education & Culture",
  "Health & Family",
  "Military & Veterans",
  "Nature & Wildlife",
  "Professional Sports",
  "Public Safety",
  "Recreation & Tourism",
  "Universities"
] as const;

export type PlateCategory = (typeof plateCategories)[number];

export interface PlateVersion {
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

export interface PlateSponsor {
  name?: string | null;
  notes?: string | null;
  url?: string | null;
}

export interface Plate {
  id: string;
  name: string;
  category: PlateCategory;
  sourceCategories: string[];
  aliases: string[];
  introducedYear?: number | null;
  introducedYearConfidence?: "high" | "medium" | "low" | null;
  popularityWeight?: 1 | 2 | 3 | 4 | 5 | null;
  sponsor: PlateSponsor;
  matchSource: "legacy_only" | "current_only" | "normalized_name" | "manual_override";
  versions: PlateVersion[];
  defaultVersion: PlateVersion;
  searchText: string;
}

export interface PlateDiscovery {
  foundAtIso: string;
  latitude: number | null;
  longitude: number | null;
  locality: string | null;
}

export type PlateDiscoveryMap = Record<string, PlateDiscovery>;
