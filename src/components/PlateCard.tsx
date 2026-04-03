
import { formatCoordinates, formatDiscoveryTime } from "../lib/format";
import type { Plate, PlateDiscovery } from "../types";
import { Icon } from "./Icon";

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
  const imageSource = `${import.meta.env.BASE_URL}${plate.image.path}`;

  return (
    <article className="plate-card">
      <button
        type="button"
        className="plate-card__image-button"
        onClick={() => onPreview(plate)}
        aria-label={`Preview ${plate.name} plate image`}
      >
        <div className="plate-card__image-wrap">
          <img
            className="plate-card__image"
            src={imageSource}
            alt={plate.name}
            loading="lazy"
          />
        </div>
      </button>
      <button
        type="button"
        className="plate-card__info"
        onClick={() => onPreview(plate)}
        aria-label={`View ${plate.name} details`}
      >
        <span className="plate-card__name">{plate.name}</span>
        {discovery ? (
          <>
            <span className="plate-card__meta">
              {formatDiscoveryTime(discovery.foundAtIso)}
            </span>
            {localityLabel ? (
              <span className="plate-card__meta">{localityLabel}</span>
            ) : coordinateLabel ? (
              <span className="plate-card__meta">{coordinateLabel}</span>
            ) : (
              <span className="plate-card__meta plate-card__meta--muted">
                Location unavailable
              </span>
            )}
          </>
        ) : null}
      </button>
      <button
        type="button"
        className="plate-card__toggle"
        onClick={() => onToggle(plate, isFound)}
        aria-pressed={isFound}
        aria-label={
          isFound ? `Mark ${plate.name} as not found` : `Mark ${plate.name} as found`
        }
      >
        {isFound ? (
          <Icon name="check-circle" size={28} className="plate-card__check-icon" />
        ) : (
          <Icon name="plus-circle" size={24} className="plate-card__plus-icon" />
        )}
      </button>
    </article>
  );
}
