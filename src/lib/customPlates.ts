import { getItem, setItem } from "./persistentStorage";

/**
 * Custom user-created plates. Stored per-state in persistentStorage.
 * These are plates the user spotted but aren't in the official catalog.
 *
 * Custom plates:
 * - Appear in a "My Plates" category
 * - Count toward total found (but NOT toward badge evaluation)
 * - Are local-only (no sync, no backend)
 * - Can be edited and deleted
 */

export interface CustomPlate {
  id: string;           // "custom-{stateId}-{timestamp}"
  name: string;         // User-entered name
  notes: string;        // Optional user notes
  category: string;     // User's guess at category, or "Unknown"
  foundAtIso: string;   // When they created/spotted it
  latitude: number | null;
  longitude: number | null;
  locality: string | null;
}

function storageKey(stateId: string): string {
  return `${stateId}-custom-plates`;
}

export function loadCustomPlates(stateId: string): CustomPlate[] {
  try {
    const raw = getItem(storageKey(stateId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomPlates(stateId: string, plates: CustomPlate[]): void {
  setItem(storageKey(stateId), JSON.stringify(plates));
}

export function addCustomPlate(stateId: string, plate: Omit<CustomPlate, "id" | "foundAtIso">): CustomPlate {
  const existing = loadCustomPlates(stateId);
  const newPlate: CustomPlate = {
    ...plate,
    id: `custom-${stateId}-${Date.now()}`,
    foundAtIso: new Date().toISOString(),
  };
  existing.push(newPlate);
  saveCustomPlates(stateId, existing);
  return newPlate;
}

export function updateCustomPlate(stateId: string, plateId: string, updates: Partial<Pick<CustomPlate, "name" | "notes" | "category">>): void {
  const existing = loadCustomPlates(stateId);
  const index = existing.findIndex(p => p.id === plateId);
  if (index >= 0) {
    existing[index] = { ...existing[index], ...updates };
    saveCustomPlates(stateId, existing);
  }
}

export function deleteCustomPlate(stateId: string, plateId: string): void {
  const existing = loadCustomPlates(stateId);
  saveCustomPlates(stateId, existing.filter(p => p.id !== plateId));
}
