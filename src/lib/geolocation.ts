import type { PlateDiscovery } from "../types";
import { reverseGeocodePlace } from "./reverseGeocode";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

export async function createDiscovery(): Promise<PlateDiscovery> {
  const foundAtIso = new Date().toISOString();

  if (!("geolocation" in navigator)) {
    return {
      foundAtIso,
      latitude: null,
      longitude: null,
      locality: null,
      county: null,
      state: null
    };
  }

  try {
    const position = await getCurrentPosition();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
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
    return {
      foundAtIso,
      latitude: null,
      longitude: null,
      locality: null,
      county: null,
      state: null
    };
  }
}
