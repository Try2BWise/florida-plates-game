export function formatDiscoveryTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(isoTimestamp));
}

export function formatCoordinates(
  latitude: number | null,
  longitude: number | null
): string | null {
  if (latitude === null || longitude === null) {
    return null;
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
