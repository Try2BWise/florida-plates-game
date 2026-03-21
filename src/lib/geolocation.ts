import type { PlateDiscovery } from "../types";

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
      longitude: null
    };
  }

  try {
    const position = await getCurrentPosition();
    return {
      foundAtIso,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch {
    return {
      foundAtIso,
      latitude: null,
      longitude: null
    };
  }
}
