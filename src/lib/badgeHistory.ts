import { getItem, setItem } from "./persistentStorage";
import type { BadgeHistoryEntry, BadgeHistoryMap } from "../types";
import type { EvaluatedBadge } from "./badges";

/**
 * Badge history — per-state record of when each badge was first earned
 * and whether the user has "seen" that earn yet.
 *
 * Purpose: let the Achievements UI flag a just-earned badge as "New!"
 * and display an "Earned on [date]" stamp in the badge detail modal.
 *
 * This is local-only runtime state. It is NOT exported or synced.
 * On a fresh device, re-import of discoveries will re-compute earned
 * status and the history re-migrates legacy (no "New!" flood).
 */

export function storageKey(stateId: string): string {
  return `${stateId}-plates-badge-history`;
}

export function loadBadgeHistory(stateId: string): BadgeHistoryMap {
  try {
    const raw = getItem(storageKey(stateId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as BadgeHistoryMap;
  } catch {
    return {};
  }
}

export function saveBadgeHistory(stateId: string, history: BadgeHistoryMap): void {
  setItem(storageKey(stateId), JSON.stringify(history));
}

/**
 * Reconcile the existing history against the currently-evaluated badges.
 *
 * Rules:
 * - Badge earned & already in history: keep the existing entry unchanged.
 * - Badge earned & NOT in history & history is empty (first run ever):
 *   treat as legacy. Stamp with `earnedAtIso: null, seen: true` so the
 *   user doesn't get flooded with "New!" on first upgrade.
 * - Badge earned & NOT in history & history already has entries:
 *   this is a fresh earn. Stamp with `earnedAtIso: now, seen: false`.
 * - Badge not earned: removed from history (so unearning a badge and
 *   re-earning it later is treated as a fresh earn — correct behavior).
 *
 * Returns { next, changed }. `changed === true` iff the caller should
 * persist `next` back to storage.
 */
export function reconcileBadgeHistory(
  previous: BadgeHistoryMap,
  evaluatedBadges: EvaluatedBadge[],
  nowIso: string
): { next: BadgeHistoryMap; changed: boolean } {
  const isFirstRun = Object.keys(previous).length === 0;
  const next: BadgeHistoryMap = {};
  let changed = false;

  for (const badge of evaluatedBadges) {
    if (!badge.earned) continue;

    const existing = previous[badge.id];
    if (existing) {
      next[badge.id] = existing;
    } else if (isFirstRun) {
      // Legacy migration: already-earned before tracking started.
      next[badge.id] = { earnedAtIso: null, seen: true };
      changed = true;
    } else {
      // Fresh earn since last evaluation.
      next[badge.id] = { earnedAtIso: nowIso, seen: false };
      changed = true;
    }
  }

  // Drop entries for badges no longer earned (shouldn't normally happen,
  // but keeps the record honest if a discovery is cleared).
  for (const id of Object.keys(previous)) {
    if (!next[id]) {
      changed = true;
    }
  }

  return { next, changed };
}

/**
 * Mark all `seen: false` entries as seen. Called when the user opens
 * the Achievements tab. Returns { next, changed }.
 */
export function markAllAsSeen(
  history: BadgeHistoryMap
): { next: BadgeHistoryMap; changed: boolean } {
  let changed = false;
  const next: BadgeHistoryMap = {};
  for (const [id, entry] of Object.entries(history)) {
    if (!entry.seen) {
      next[id] = { ...entry, seen: true };
      changed = true;
    } else {
      next[id] = entry;
    }
  }
  return { next, changed };
}

/**
 * Build a quick-lookup map of `id -> BadgeHistoryEntry` for decoration.
 * (Currently the history IS that lookup, so this is a no-op pass-through
 * — kept as a named function so future indirection is easy if needed.)
 */
export function toLookup(history: BadgeHistoryMap): Record<string, BadgeHistoryEntry> {
  return history;
}
