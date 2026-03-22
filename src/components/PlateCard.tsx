import type { Plate, PlateDiscovery } from "../types";
import { formatCoordinates, formatDiscoveryTime } from "../lib/format";

interface PlateCardProps {
  plate: Plate;
  discovery?: PlateDiscovery;
  onToggle: (plate: Plate, isFound: boolean) => void;
  onPreview: (plate: Plate) => void;
}

export function PlateCard({
  plate,
  discovery,
  onToggle,
  onPreview
}: PlateCardProps) {
  const isFound = Boolean(discovery);
  const localityLabel = discovery?.locality ?? null;
  const coordinateLabel = discovery
    ? formatCoordinates(discovery.latitude, discovery.longitude)
    : null;
  const imageBasePath = import.meta.env.BASE_URL;
  const pngSource = `${imageBasePath}plates/${plate.imageKey}.png`;
  const jpgSource = `${imageBasePath}plates/${plate.imageKey}.jpg`;

  return (
    <article className={`plate-card ${isFound ? "plate-card--found" : ""}`}>
      <button
        type="button"
        className="plate-card__image-button"
        onClick={() => onPreview(plate)}
        aria-label={`Preview ${plate.name} plate image`}
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
      </button>
      <button
        type="button"
        className="plate-card__content"
        onClick={() => onToggle(plate, isFound)}
        aria-pressed={isFound}
        aria-label={
          isFound ? `Mark ${plate.name} as not found` : `Mark ${plate.name} as found`
        }
      >
        <span className="plate-card__name">{plate.name}</span>
        {discovery ? (
          <>
            <span className="plate-card__timestamp">
              {formatDiscoveryTime(discovery.foundAtIso)}
            </span>
            {localityLabel ? (
              <span className="plate-card__coordinates">{localityLabel}</span>
            ) : coordinateLabel ? (
              <span className="plate-card__coordinates">{coordinateLabel}</span>
            ) : (
              <span className="plate-card__coordinates plate-card__coordinates--muted">
                Location unavailable
              </span>
            )}
          </>
        ) : null}
      </button>
    </article>
  );
}
