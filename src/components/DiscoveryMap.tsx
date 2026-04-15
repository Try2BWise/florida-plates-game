import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { formatDiscoveryTime } from "../lib/format";
import type { Plate, PlateDiscovery } from "../types";

interface DiscoveryEntry {
  plate: Plate;
  discovery: PlateDiscovery;
}

interface DiscoveryMapProps {
  entries: DiscoveryEntry[];
  resolvedTheme: "light" | "dark";
}

// CARTO tile providers — free, no API key required.
// Attribution string is required by both OSM and CARTO terms of use.
const TILE_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

// Custom DivIcon sidesteps the well-known Vite + Leaflet broken-default-icon
// issue (default markers ship as separate PNGs that bundlers don't resolve).
const pinIcon = L.divIcon({
  className: "discovery-map__pin-wrapper",
  html: '<div class="discovery-map__pin" aria-hidden="true"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8]
});

/**
 * Inner component that auto-fits the map to the current entry set.
 * Must be a child of MapContainer so useMap() can access the instance.
 */
function FitBounds({ entries }: { entries: DiscoveryEntry[] }) {
  const map = useMap();

  useEffect(() => {
    if (entries.length === 0) return;

    if (entries.length === 1) {
      const { latitude, longitude } = entries[0].discovery;
      if (latitude !== null && longitude !== null) {
        map.setView([latitude, longitude], 12);
      }
      return;
    }

    const latLngs: L.LatLngTuple[] = entries
      .filter(
        (e) => e.discovery.latitude !== null && e.discovery.longitude !== null
      )
      .map((e) => [e.discovery.latitude as number, e.discovery.longitude as number]);

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  return null;
}

export function DiscoveryMap({ entries, resolvedTheme }: DiscoveryMapProps) {
  const validEntries = useMemo(
    () =>
      entries.filter(
        (e) => e.discovery.latitude !== null && e.discovery.longitude !== null
      ),
    [entries]
  );

  if (validEntries.length === 0) {
    return null;
  }

  // Initial center: first valid entry. fitBounds will adjust on mount.
  const initialCenter: L.LatLngTuple = [
    validEntries[0].discovery.latitude as number,
    validEntries[0].discovery.longitude as number
  ];

  const tile = TILE_LAYERS[resolvedTheme];

  return (
    <div className="discovery-map">
      <MapContainer
        center={initialCenter}
        zoom={10}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        {/* key={resolvedTheme} forces a clean remount when the theme flips */}
        <TileLayer key={resolvedTheme} url={tile.url} attribution={tile.attribution} />
        {validEntries.map(({ plate, discovery }) => (
          <Marker
            key={plate.id}
            position={[
              discovery.latitude as number,
              discovery.longitude as number
            ]}
            icon={pinIcon}
          >
            <Popup>
              <strong>{plate.name}</strong>
              {discovery.locality ? (
                <>
                  <br />
                  {discovery.locality}
                </>
              ) : null}
              <br />
              <small>{formatDiscoveryTime(discovery.foundAtIso)}</small>
            </Popup>
          </Marker>
        ))}
        <FitBounds entries={validEntries} />
      </MapContainer>
    </div>
  );
}
