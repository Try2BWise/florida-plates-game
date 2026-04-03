import { activeLegacyIdMap, activeStorage } from "../games/activeGame";
import type { PlateDiscoveryMap } from "../types";

export function loadDiscoveries(): PlateDiscoveryMap {
  try {
    const rawValue = window.localStorage.getItem(activeStorage.discoveriesKey);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as PlateDiscoveryMap;
    if (!parsed) {
      return {};
    }

    const typedLegacyMap = activeLegacyIdMap;

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
  window.localStorage.setItem(activeStorage.discoveriesKey, JSON.stringify(discoveries));
}
