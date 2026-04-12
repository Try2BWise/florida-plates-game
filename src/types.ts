export const statePackCategories = [
  "Civic",
  "Commercial",
  "First Responders",
  "Government",
  "Health",
  "Heritage",
  "Military",
  "Motorcycle",
  "Schools",
  "Sports",
  "Standard",
  "Universities",
  "Wildlife & Nature"
] as const;

export const fiftyStatesCategories = [
  "New England",
  "Middle Atlantic",
  "East North Central",
  "West North Central",
  "South Atlantic",
  "East South Central",
  "West South Central",
  "Mountain",
  "Pacific",
  "Territories"
] as const;

export const plateCategories = [...statePackCategories, ...fiftyStatesCategories] as const;

export type PlateCategory = (typeof plateCategories)[number];


export interface PlateImage {
  path: string;
  remoteUrl: string | null;
}

export interface PlateMetadataBlob {
  sponsorCandidates?: Array<{
    source: string;
    priority: number;
    value: string;
  }>;
  noteCandidates?: Array<{
    source: string;
    priority: number;
    value: string;
  }>;
  sourceCategories?: string[];
  aliases?: string[];
  rawNames?: string[];
  filenames?: string[];
  urls?: string[];
}

export interface Plate {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  baseName: string;
  variantLabel: string | null;
  plateType: string;
  isCurrent: boolean;
  isActive: boolean;
  category: PlateCategory;
  image: PlateImage;
  sponsor: string | null;
  notes: string | null;
  metadataBlob?: PlateMetadataBlob;
  searchTerms?: string[];
  variantOf?: string | null;
  relatedPlates?: string[];
  sourceRefs?: Array<{
    source: string;
    sourceId: string | number;
    versionId?: string;
    filename?: string;
    section?: string;
    imageKey?: string;
    variant?: string;
  }>;
}

export interface PlateDiscovery {
  foundAtIso: string;
  latitude: number | null;
  longitude: number | null;
  locality: string | null;
  county: string | null;
  state: string | null;
}

export type PlateDiscoveryMap = Record<string, PlateDiscovery>;

export interface GameInstallInstructions {
  ios: string;
  android: string;
}

export interface GameBranding {
  appName: string;
  appShareName: string;
  shareUrl: string;
  appTagline: string;
  headerImage:
    | { type: "welcome-sign"; line1: string; line2: string; line3: string }
    | { type: "logo"; path: string; alt: string };
  attribution: {
    text: string;
    agencyName: string;
    agencyUrl: string;
    logoPath: string;
    logoAlt: string;
  };
}

export interface GameDefinition {
  id: string;
  branding: GameBranding;
}
