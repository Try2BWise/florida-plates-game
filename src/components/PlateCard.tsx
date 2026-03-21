import type { Plate, PlateDiscovery } from "../types";
import { formatCoordinates, formatDiscoveryTime } from "../lib/format";

interface PlateCardProps {
  plate: Plate;
  discovery?: PlateDiscovery;
  onToggle: (plate: Plate, isFound: boolean) => void;
}

export function PlateCard({ plate, discovery, onToggle }: PlateCardProps) {
  const isFound = Boolean(discovery);
  const coordinateLabel = discovery
    ? formatCoordinates(discovery.latitude, discovery.longitude)
    : null;
  const imageBasePath = import.meta.env.BASE_URL;
  const pngSource = `${imageBasePath}plates/${plate.imageKey}.png`;
  const jpgSource = `${imageBasePath}plates/${plate.imageKey}.jpg`;

  return (
    <button
      type="button"
      className={`plate-card ${isFound ? "plate-card--found" : ""}`}
      onClick={() => onToggle(plate, isFound)}
      aria-pressed={isFound}
    >
      <div className="plate-card__image-wrap">
        <img
          className="plate-card__image"
          src={pngSource}
          alt={plate.name}
          loading="lazy"
          onError={(event) => {
            const target = event.currentTarget;
            if (!target.dataset.fallbackApplied) {
              target.dataset.fallbackApplied = "true";
              target.src = jpgSource;
            }
          }}
        />
      </div>
      <div className="plate-card__content">
        <span className="plate-card__name">{plate.name}</span>
        {discovery ? (
          <>
            <span className="plate-card__timestamp">
              {formatDiscoveryTime(discovery.foundAtIso)}
            </span>
            {coordinateLabel ? (
              <span className="plate-card__coordinates">{coordinateLabel}</span>
            ) : (
              <span className="plate-card__coordinates plate-card__coordinates--muted">
                Location unavailable
              </span>
            )}
          </>
        ) : null}
      </div>
    </button>
  );
}
