export type PlateCategory =
  | "Environmental"
  | "Miscellaneous"
  | "Professional Sports"
  | "Universities";

export interface Plate {
  id: string;
  name: string;
  category: PlateCategory;
  imageKey: string;
  enactedOn?: string;
}

export interface PlateDiscovery {
  foundAtIso: string;
  latitude: number | null;
  longitude: number | null;
  locality: string | null;
}

export type PlateDiscoveryMap = Record<string, PlateDiscovery>;
