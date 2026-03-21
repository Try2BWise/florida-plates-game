import type { PlateDiscoveryMap } from "../types";

const STORAGE_KEY = "florida-plates-discoveries";

export function loadDiscoveries(): PlateDiscoveryMap {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as PlateDiscoveryMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function saveDiscoveries(discoveries: PlateDiscoveryMap): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveries));
}
