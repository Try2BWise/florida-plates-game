interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    hamlet?: string;
    county?: string;
    state?: string;
  };
}

export interface ReverseGeocodePlace {
  locality: string | null;
  county: string | null;
  state: string | null;
}

function buildLocalityLabel(address: NominatimResponse["address"]): string | null {
  if (!address) {
    return null;
  }

  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.hamlet ??
    address.county;

  if (!locality) {
    return null;
  }

  return address.state ? `${locality}, ${address.state}` : locality;
}

function buildCountyLabel(address: NominatimResponse["address"]): string | null {
  return address?.county?.replace(/\s+County$/i, "").trim() ?? null;
}

export async function reverseGeocodePlace(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodePlace> {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), 4500);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=en&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json"
        },
        signal: abortController.signal
      }
    );

    if (!response.ok) {
      return {
        locality: null,
        county: null,
        state: null
      };
    }

    const payload = (await response.json()) as NominatimResponse;
    return {
      locality: buildLocalityLabel(payload.address),
      county: buildCountyLabel(payload.address),
      state: payload.address?.state ?? null
    };
  } catch {
    return {
      locality: null,
      county: null,
      state: null
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function reverseGeocodeLocality(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const place = await reverseGeocodePlace(latitude, longitude);
  return place.locality;
}
