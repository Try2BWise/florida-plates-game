import legacyIdMap from "../data/generated/legacy-id-map.generated.json";
import type { PlateDiscoveryMap } from "../types";

const STORAGE_KEY = "florida-plates-discoveries";

export function loadDiscoveries(): PlateDiscoveryMap {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as PlateDiscoveryMap;
    if (!parsed) {
      return {};
    }

    const typedLegacyMap = legacyIdMap as Record<string, string>;

    return Object.fromEntries(
      Object.entries(parsed).map(([plateId, discovery]) => [
        typedLegacyMap[plateId] ?? plateId,
        {
          ...discovery,
          locality: discovery.locality ?? null,
          county: discovery.county ?? null,
          state: discovery.state ?? null
        }
      ])
    );
  } catch {
    return {};
  }
}

export function saveDiscoveries(discoveries: PlateDiscoveryMap): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveries));
}
