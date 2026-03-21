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

export async function reverseGeocodeLocality(
  latitude: number,
  longitude: number
): Promise<string | null> {
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
      return null;
    }

    const payload = (await response.json()) as NominatimResponse;
    return buildLocalityLabel(payload.address);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
