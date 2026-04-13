import { Geolocation } from "@capacitor/geolocation";
import { reverseGeocodePlace } from "./reverseGeocode";
import { stateRegistry } from "../games/stateRegistry";
import { getItem, setItem } from "./persistentStorage";

const LAST_GEO_PROMPT_KEY = "every-pl8-last-geo-prompt";

// Map full state names to registry IDs
const stateNameToId = new Map<string, string>();
for (const entry of stateRegistry) {
  if (entry.available) {
    stateNameToId.set(entry.name.toLowerCase(), entry.id);
  }
}

/**
 * Check the user's current location and return a geo-prompt message
 * if they're in a state with an available pack. Returns null if:
 * - Location unavailable
 * - Not in a state with a pack
 * - Already prompted for this state today
 * - Already playing this state
 */
export async function checkGeoPrompt(activeStateId: string): Promise<{ message: string; stateId: string } | null> {
  // Don't prompt more than once per day per state (skip throttle in debug)
  if (activeStateId !== "__debug_force__") {
    const lastPrompt = getItem(LAST_GEO_PROMPT_KEY);
    if (lastPrompt) {
      try {
        const { stateId, date } = JSON.parse(lastPrompt);
        const today = new Date().toISOString().slice(0, 10);
        if (date === today && stateId) return null;
      } catch { /* ignore corrupt data */ }
    }
  }

  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 5000,
    });

    const place = await reverseGeocodePlace(
      position.coords.latitude,
      position.coords.longitude
    );

    if (!place.state) return null;

    const matchedId = stateNameToId.get(place.state.toLowerCase());
    if (!matchedId) return null;

    // Don't prompt if they're already playing this state
    if (matchedId === activeStateId) return null;

    // Record the prompt so we don't repeat today
    setItem(LAST_GEO_PROMPT_KEY, JSON.stringify({
      stateId: matchedId,
      date: new Date().toISOString().slice(0, 10)
    }));

    const entry = stateRegistry.find(s => s.id === matchedId);
    const stateName = entry?.name ?? place.state;

    return {
      message: `You're in ${stateName}! Switch to spot local plates?`,
      stateId: matchedId
    };
  } catch {
    return null;
  }
}
