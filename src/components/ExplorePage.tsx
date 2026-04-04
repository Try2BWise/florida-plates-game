import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { BadgeIcon } from "./BadgeIcon";
import { PageView } from "./PageView";
import { formatDiscoveryTime } from "../lib/format";
import type { EvaluatedBadge, BadgeGroup } from "../lib/badges";
import type { Plate, PlateDiscovery } from "../types";

type ExploreTab = "badges" | "stats" | "timeline" | "map";
type TimelineSort = "desc" | "asc";

interface DiscoveryEntry {
  plate: Plate;
  discovery: PlateDiscovery;
}

interface CategoryStat {
  category: string;
  found: number;
  total: number;
  percent: number;
}

interface MapPin {
  id: string;
  plateName: string;
  locality: string | null;
  left: number;
  top: number;
  latitude: number;
  longitude: number;
}

interface MapBounds {
  north: string;
  south: string;
  east: string;
  west: string;
}

interface ExplorePageProps {
  onBack: () => void;
  activeTab: ExploreTab;
  onTabChange: (tab: ExploreTab) => void;
  // Stats
  foundCount: number;
  totalPlates: number;
  localityCount: number;
  categoryStats: CategoryStat[];
  topLocalities: [string, number][];
  newestSighting: DiscoveryEntry | null;
  oldestSighting: DiscoveryEntry | null;
  // Badges
  evaluatedBadges: EvaluatedBadge[];
  earnedBadges: EvaluatedBadge[];
  allBadgeGroups: [BadgeGroup, EvaluatedBadge[]][];
  badgeGroupLabels: Record<BadgeGroup, string>;
  badgeGroupSymbols: Record<BadgeGroup, string>;
  onBadgeDetail: (badge: EvaluatedBadge) => void;
  // Timeline
  timelineSort: TimelineSort;
  onTimelineSortChange: (sort: TimelineSort) => void;
  timelineGroups: [string, DiscoveryEntry[]][];
  collapsedTimelineDates: Set<string>;
  onToggleTimelineDate: (dateLabel: string) => void;
  // Map
  mapPins: MapPin[];
  mapBounds: MapBounds | null;
  geotaggedEntries: DiscoveryEntry[];
}

function getLocationStatus(discovery: PlateDiscovery): string {
  if (discovery.locality) return discovery.locality;
  if (discovery.latitude !== null && discovery.longitude !== null) return "Coordinates saved";
  return "Location unavailable";
}

export function ExplorePage({
  onBack, activeTab, onTabChange,
  foundCount, totalPlates, localityCount,
  categoryStats, topLocalities, newestSighting, oldestSighting,
  evaluatedBadges, earnedBadges, allBadgeGroups, badgeGroupLabels, badgeGroupSymbols, onBadgeDetail,
  timelineSort, onTimelineSortChange, timelineGroups, collapsedTimelineDates, onToggleTimelineDate,
  mapPins, mapBounds, geotaggedEntries
}: ExplorePageProps) {
  return (
    <PageView
      title="Explore"
      onBack={onBack}
      tabs={
        <>
          {(["badges", "stats", "timeline", "map"] as ExploreTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`view-toggle__chip ${activeTab === tab ? "view-toggle__chip--active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => onTabChange(tab)}
            >
              {tab === "badges" ? "Badges" : tab === "stats" ? "Stats" : tab === "timeline" ? "Timeline" : "Map"}
            </button>
          ))}
        </>
      }
    >
      {activeTab === "stats" ? (
        <div className="utility-stack stats-dashboard">
          <section className="stats-kpi-grid">
            <article className="utility-card utility-card--stat">
              <h3>Plates found</h3>
              <p className="utility-card__metric">{foundCount}</p>
              <p className="utility-card__meta">of {totalPlates} total</p>
            </article>
            <article className="utility-card utility-card--stat">
              <h3>Completion</h3>
              <p className="utility-card__metric">{Math.round((foundCount / totalPlates) * 100)}%</p>
              <p className="utility-card__meta">overall progress</p>
            </article>
            <article className="utility-card utility-card--stat">
              <h3>Badges earned</h3>
              <p className="utility-card__metric">{earnedBadges.length}</p>
              <p className="utility-card__meta">of {evaluatedBadges.length}</p>
            </article>
            <article className="utility-card utility-card--stat">
              <h3>Localities</h3>
              <p className="utility-card__metric">{localityCount}</p>
              <p className="utility-card__meta">distinct named places</p>
            </article>
          </section>
          <section className="utility-card stats-card stats-card--span-2">
            <h3>Category progress</h3>
            <div className="utility-list">
              {categoryStats.map((stat) => (
                <article className="utility-card utility-card--stat-row" key={stat.category}>
                  <div className="utility-card__header">
                    <h3>{stat.category}</h3>
                    <span>{stat.percent}%</span>
                  </div>
                  <div className="stats-bar">
                    <span className="stats-bar__fill" style={{ width: `${stat.percent}%` }} />
                  </div>
                  <p className="utility-card__meta">{stat.found} of {stat.total} found</p>
                </article>
              ))}
            </div>
          </section>
          <section className="utility-grid stats-grid">
            <article className="utility-card">
              <h3>First sighting</h3>
              <p className="utility-card__meta">
                {oldestSighting ? `${oldestSighting.plate.name} on ${formatDiscoveryTime(oldestSighting.discovery.foundAtIso)}` : "No sightings yet"}
              </p>
            </article>
            <article className="utility-card">
              <h3>Most recent</h3>
              <p className="utility-card__meta">
                {newestSighting ? `${newestSighting.plate.name} on ${formatDiscoveryTime(newestSighting.discovery.foundAtIso)}` : "No sightings yet"}
              </p>
            </article>
          </section>
          <section className="utility-card stats-card stats-card--span-2">
            <h3>Top localities</h3>
            {topLocalities.length > 0 ? (
              <div className="utility-list utility-list--compact">
                {topLocalities.map(([locality, count]) => (
                  <div className="utility-row" key={locality}>
                    <span>{locality}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="utility-card__meta">Locality counts will appear as sightings pick up place names.</p>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "map" ? (
        mapPins.length > 0 ? (
          <div className="utility-stack">
            <section className="map-card">
              <div className="map-card__surface">
                <div className="map-card__grid" />
                {mapBounds ? (
                  <>
                    <div className="map-card__label map-card__label--north">N {mapBounds.north}</div>
                    <div className="map-card__label map-card__label--south">S {mapBounds.south}</div>
                    <div className="map-card__label map-card__label--west">W {mapBounds.west}</div>
                    <div className="map-card__label map-card__label--east">E {mapBounds.east}</div>
                  </>
                ) : null}
                {mapPins.map((pin) => (
                  <button key={pin.id} type="button" className="map-card__pin" style={{ left: `${pin.left}%`, top: `${pin.top}%` }} title={`${pin.plateName}${pin.locality ? ` - ${pin.locality}` : ""}`} aria-label={`${pin.plateName}${pin.locality ? ` in ${pin.locality}` : ""}`} />
                ))}
              </div>
              <p className="map-card__note">Dynamic pushpin plot based on the current spread of saved GPS sightings.</p>
            </section>
            <div className="utility-list utility-list--compact">
              {geotaggedEntries.slice(0, 10).map(({ plate, discovery }) => (
                <article className="utility-card" key={`${plate.id}-map`}>
                  <div className="utility-card__header">
                    <h3>{plate.name}</h3>
                    <span>{discovery.locality ?? "Pinned"}</span>
                  </div>
                  <p className="utility-card__meta">{discovery.latitude?.toFixed(4)}, {discovery.longitude?.toFixed(4)}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <section className="empty-state">
            <h2>No map pins yet</h2>
            <p>Find a few plates with location enabled and they will appear here.</p>
          </section>
        )
      ) : null}

      {activeTab === "timeline" ? (
        <div className="utility-stack">
          <section className="utility-card utility-card--about">
            <div className="utility-card__header">
              <div>
                <h3>Timeline</h3>
                <p className="utility-card__meta">Plate sightings grouped by date.</p>
              </div>
              <div className="view-toggle" role="group" aria-label="Timeline sort">
                <button type="button" className={`view-toggle__chip ${timelineSort === "desc" ? "view-toggle__chip--active" : ""}`} onClick={() => onTimelineSortChange("desc")} aria-pressed={timelineSort === "desc"}>Newest first</button>
                <button type="button" className={`view-toggle__chip ${timelineSort === "asc" ? "view-toggle__chip--active" : ""}`} onClick={() => onTimelineSortChange("asc")} aria-pressed={timelineSort === "asc"}>Oldest first</button>
              </div>
            </div>
          </section>
          {timelineGroups.length > 0 ? (
            <div className="timeline-groups">
              {timelineGroups.map(([dateLabel, entries]) => (
                <section className="utility-card timeline-group" key={dateLabel}>
                  <button type="button" className="timeline-group__header" onClick={() => onToggleTimelineDate(dateLabel)} aria-expanded={!collapsedTimelineDates.has(dateLabel)}>
                    <h3>{dateLabel}</h3>
                    <span>{entries.length}<strong className={`timeline-group__chevron ${collapsedTimelineDates.has(dateLabel) ? "timeline-group__chevron--collapsed" : ""}`} aria-hidden="true">▾</strong></span>
                  </button>
                  {!collapsedTimelineDates.has(dateLabel) ? (
                    <div className="timeline-list">
                      {entries.map(({ plate, discovery }) => (
                        <article className="utility-card timeline-entry" key={`${plate.id}-${discovery.foundAtIso}`}>
                          <div className="timeline-entry__plate">
                            <img className="timeline-entry__image" src={`${import.meta.env.BASE_URL}${plate.image.path}`} alt={plate.name} />
                            <div className="timeline-entry__copy">
                              <h4>{plate.name}</h4>
                              <p className="utility-card__meta">{formatDiscoveryTime(discovery.foundAtIso)}</p>
                              <p className="utility-card__meta">{getLocationStatus(discovery)}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <h2>No timeline yet</h2>
              <p>Find a few plates and your sightings will appear here.</p>
            </section>
          )}
        </div>
      ) : null}

      {activeTab === "badges" ? (
        <div className="utility-stack">
          <section className="utility-card utility-card--about">
            <h3>Merit badges</h3>
            <p className="utility-card__metric">{earnedBadges.length} of {evaluatedBadges.length} earned</p>
            <p className="utility-card__meta">Badges currently reflect your saved state.</p>
          </section>
          <section className="utility-card">
            <div className="utility-stack">
              {allBadgeGroups.map(([group, badges]) => (
                <section className="badge-group" key={`earned-${group}`}>
                  <div className="badge-group__header">
                    <h4>
                      <Icon name={badgeGroupSymbols[group] as IconName} size={16} className={`badge-group__icon badge-group__icon--${group}`} />
                      {badgeGroupLabels[group]}
                    </h4>
                    <span>{badges.length}</span>
                  </div>
                  <div className="badge-icon-grid">
                    {badges.map((badge) => (
                      <div className="badge-icon-grid-item" key={badge.id} tabIndex={0} role="button" aria-label={badge.name} onClick={() => onBadgeDetail(badge)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onBadgeDetail(badge); }} style={{ outline: "none", cursor: "pointer" }}>
                        <BadgeIcon badge={badge} />
                        <span className="badge-medal-label">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </PageView>
  );
}
