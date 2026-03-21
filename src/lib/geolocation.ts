import type { PlateDiscovery } from "../types";
import { reverseGeocodeLocality } from "./reverseGeocode";

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
      locality: null
    };
  }

  try {
    const position = await getCurrentPosition();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const locality = await reverseGeocodeLocality(latitude, longitude);

    return {
      foundAtIso,
      latitude,
      longitude,
      locality
    };
  } catch {
    return {
      foundAtIso,
      latitude: null,
      longitude: null,
      locality: null
    };
  }
}
