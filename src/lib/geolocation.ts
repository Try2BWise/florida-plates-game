import { Geolocation } from "@capacitor/geolocation";
import { reverseGeocodePlace } from "./reverseGeocode";
import type { PlateDiscovery } from "../types";

async function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  try {
    // Try Capacitor native geolocation first
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    // Fall back to web API
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not available"));
        return;
      }

      const timeoutId = setTimeout(() => reject(new Error("Location timeout")), 12000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
}

/**
 * Request location permission. Call before first use.
 * Returns true if granted.
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const status = await Geolocation.requestPermissions();
    return status.location === "granted" || status.coarseLocation === "granted";
  } catch {
    // Web fallback — permission is requested on first getCurrentPosition call
    return true;
  }
}

export async function createDiscovery(): Promise<PlateDiscovery> {
  const foundAtIso = new Date().toISOString();

  return {
    foundAtIso,
    latitude: null,
    longitude: null,
    locality: null,
    county: null,
    state: null
  };
}

export async function enrichDiscoveryLocation(
  foundAtIso: string
): Promise<PlateDiscovery> {
  const emptyDiscovery = {
    foundAtIso,
    latitude: null,
    longitude: null,
    locality: null,
    county: null,
    state: null
  };

  try {
    const { latitude, longitude } = await getCurrentPosition();
    const place = await reverseGeocodePlace(latitude, longitude);

    return {
      foundAtIso,
      latitude,
      longitude,
      locality: place.locality,
      county: place.county,
      state: place.state
    };
  } catch {
    return emptyDiscovery;
  }
}
