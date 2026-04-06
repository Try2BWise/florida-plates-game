import { useState } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { BadgeIcon } from "./BadgeIcon";
import { PageView } from "./PageView";
import { ProgressRing } from "./ProgressRing";
import { formatDiscoveryTime } from "../lib/format";
import type { EvaluatedBadge, BadgeGroup, PlayerRankInfo } from "../lib/badges";
import type { Plate, PlateDiscovery } from "../types";

type AchievementsTab = "achievements" | "journey" | "map";
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

interface AchievementsPageProps {
  onBack: () => void;
  activeTab: AchievementsTab;
  onTabChange: (tab: AchievementsTab) => void;
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
  // Rank
  playerRank: PlayerRankInfo;
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

export function AchievementsPage({
  onBack, activeTab, onTabChange,
  foundCount, totalPlates, localityCount,
  categoryStats, topLocalities, newestSighting, oldestSighting,
  evaluatedBadges, earnedBadges, allBadgeGroups, badgeGroupLabels, badgeGroupSymbols, onBadgeDetail,
  playerRank,
  timelineSort, onTimelineSortChange, timelineGroups, collapsedTimelineDates, onToggleTimelineDate,
  mapPins, mapBounds, geotaggedEntries
}: AchievementsPageProps) {
  const [showLocked, setShowLocked] = useState(false);

  const badgeGroupColors: Record<string, string> = {
    progress: "#3b82f6",
    category: "#2f9e44",
    collection: "#f08c00",
    college: "#9b2226",
    locality: "#0f766e",
    service: "#4f46e5",
    florida: "#047857",
    sports: "#b45309",
  };

  const earnedByGroup = allBadgeGroups
    .map(([group, badges]) => [group, badges.filter(b => b.earned)] as [BadgeGroup, EvaluatedBadge[]])
    .filter(([, badges]) => badges.length > 0);

  const inProgressBadges = evaluatedBadges.filter(
    b => !b.earned && typeof b.progressCurrent === "number" && b.progressCurrent > 0
  );

  const lockedBadges = evaluatedBadges.filter(
    b => !b.earned && (b.progressCurrent === undefined || b.progressCurrent === 0)
  );

  return (
    <PageView
      title="Achievements"
      onBack={onBack}
      tabs={
        <>
          {(["achievements", "journey", "map"] as AchievementsTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`view-toggle__chip ${activeTab === tab ? "view-toggle__chip--active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => onTabChange(tab)}
            >
              {tab === "achievements" ? "Achievements" : tab === "journey" ? "Journey" : "Map"}
            </button>
          ))}
        </>
      }
    >
      {activeTab === "achievements" ? (
        <div className="utility-stack">
          {/* ── Hero summary ── */}
          <div className="achievements-hero">
            <ProgressRing
              percent={playerRank.progress}
              size={72}
              strokeWidth={7}
              color="#D33C2E"
              label={`${earnedBadges.length}`}
              sublabel=""
            />
            <div className="achievements-hero__copy">
              <span className="achievements-hero__rank">{playerRank.label}</span>
              <span className="achievements-hero__count">
                {earnedBadges.length} <span className="achievements-hero__total">of {evaluatedBadges.length} badges</span>
              </span>
              <span className="achievements-hero__next">
                {playerRank.nextRank
                  ? `${playerRank.badgesForNext} more to ${playerRank.nextRank.label}`
                  : "Max rank achieved!"}
              </span>
            </div>
          </div>

          {/* ── Earned ── */}
          {earnedByGroup.length > 0 ? (() => {
            let badgeIndex = 0;
            return (
              <section className="utility-card">
                <h3 className="achievements-section__title">Earned</h3>
                <div className="utility-stack">
                  {earnedByGroup.map(([group, badges]) => (
                    <section className="badge-group" key={`earned-${group}`}>
                      <div className="badge-group__header">
                        <h4>
                          <Icon name={badgeGroupSymbols[group] as IconName} size={16} className={`badge-group__icon badge-group__icon--${group}`} />
                          {badgeGroupLabels[group]}
                        </h4>
                        <span>{badges.length}</span>
                      </div>
                      <div className="badge-icon-grid">
                        {badges.map((badge) => {
                          const idx = badgeIndex++;
                          return (
                            <div className="badge-icon-grid-item" key={badge.id} tabIndex={0} role="button" aria-label={badge.name} onClick={() => onBadgeDetail(badge)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onBadgeDetail(badge); }} style={{ outline: "none", cursor: "pointer" }}>
                              <div className="badge-frame badge-frame--earned" style={{ width: 88, height: 88, "--badge-group-color": badgeGroupColors[group] ?? "var(--accent)", "--badge-index": idx } as React.CSSProperties}>
                                <BadgeIcon badge={badge} size={88} />
                              </div>
                              <span className="badge-medal-label">{badge.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            );
          })() : null}

          {/* ── In Progress ── */}
          {inProgressBadges.length > 0 ? (
            <section className="utility-card">
              <h3 className="achievements-section__title">In Progress</h3>
              <div className="badge-icon-grid">
                {inProgressBadges.map((badge) => {
                  const percent = badge.progressTarget
                    ? Math.round((badge.progressCurrent! / badge.progressTarget) * 100)
                    : 0;
                  const r = 35;
                  const circ = 2 * Math.PI * r;
                  const offset = circ - (percent / 100) * circ;
                  return (
                    <div className="badge-icon-grid-item" key={badge.id} tabIndex={0} role="button" aria-label={badge.name} onClick={() => onBadgeDetail(badge)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onBadgeDetail(badge); }} style={{ outline: "none", cursor: "pointer" }}>
                      <div className="badge-frame badge-frame--in-progress" style={{ width: 72, height: 72 }}>
                        <BadgeIcon badge={badge} size={72} />
                        <svg className="badge-frame__progress-ring" viewBox="0 0 76 76">
                          <circle className="badge-frame__progress-track" cx="38" cy="38" r={r} />
                          <circle className="badge-frame__progress-fill" cx="38" cy="38" r={r} strokeDasharray={circ} strokeDashoffset={offset} />
                        </svg>
                      </div>
                      <span className="badge-medal-label">{badge.name}</span>
                      <span className="badge-progress-indicator">
                        {badge.progressTarget ? `${Math.min(badge.progressCurrent ?? 0, badge.progressTarget)}/${badge.progressTarget}` : `${badge.progressCurrent}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ── Locked ── */}
          {lockedBadges.length > 0 ? (
            <section className="utility-card">
              <button
                type="button"
                className="achievements-locked-toggle"
                onClick={() => setShowLocked(!showLocked)}
                aria-expanded={showLocked}
              >
                <h3 className="achievements-section__title">
                  Locked
                  <span className="achievements-locked-toggle__count">({lockedBadges.length})</span>
                </h3>
                <strong className={`timeline-group__chevron ${!showLocked ? "timeline-group__chevron--collapsed" : ""}`} aria-hidden="true">▾</strong>
              </button>
              {showLocked ? (
                <div className="badge-icon-grid">
                  {lockedBadges.map((badge) => (
                    <div className="badge-icon-grid-item" key={badge.id} tabIndex={0} role="button" aria-label={badge.name} onClick={() => onBadgeDetail(badge)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onBadgeDetail(badge); }} style={{ outline: "none", cursor: "pointer" }}>
                      <div className="badge-frame" style={{ width: 72, height: 72 }}>
                        <BadgeIcon badge={badge} size={72} />
                        <div className="badge-frame__lock">
                          <Icon name="lock" size={20} className="badge-frame__lock-icon" />
                        </div>
                      </div>
                      <span className="badge-medal-label">{badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}

      {activeTab === "journey" ? (
        <div className="utility-stack">
          {/* ── Stats ── */}
          <div className="stats-dashboard">
            {/* ── Completion rings ── */}
            <section className="stats-rings">
              <ProgressRing
                percent={totalPlates > 0 ? Math.round((foundCount / totalPlates) * 100) : 0}
                size={160}
                strokeWidth={14}
                color="var(--accent)"
                label={`${foundCount}`}
                sublabel={`of ${totalPlates} plates`}
              />
              <ProgressRing
                percent={evaluatedBadges.length > 0 ? Math.round((earnedBadges.length / evaluatedBadges.length) * 100) : 0}
                size={100}
                strokeWidth={10}
                color="#D33C2E"
                label={`${earnedBadges.length}`}
                sublabel={`of ${evaluatedBadges.length} badges`}
              />
            </section>

            {/* ── Inline stats ── */}
            <div className="stats-inline-row">
              <div className="stats-inline-stat">
                <span className="stats-inline-stat__value">{localityCount}</span>
                <span className="stats-inline-stat__label">Localities</span>
              </div>
              <div className="stats-inline-stat">
                <span className="stats-inline-stat__value">{Math.round((foundCount / totalPlates) * 100)}%</span>
                <span className="stats-inline-stat__label">Complete</span>
              </div>
            </div>

            {/* ── Category progress ── */}
            <section className="stats-section">
              <h3 className="stats-section__title">Category Progress</h3>
              <div className="stats-category-list">
                {categoryStats.map((stat) => (
                  <div className="stats-category-row" key={stat.category}>
                    <div className="stats-category-row__header">
                      <span className="stats-category-row__name">{stat.category}</span>
                      <span className="stats-category-row__count">{stat.found}/{stat.total}</span>
                    </div>
                    <div className="stats-bar">
                      <span className="stats-bar__fill" style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Recent activity ── */}
            <section className="stats-section">
              <h3 className="stats-section__title">Activity</h3>
              <div className="stats-activity-list">
                <div className="stats-activity-item">
                  <span className="stats-activity-item__label">First sighting</span>
                  <span className="stats-activity-item__value">
                    {oldestSighting ? `${oldestSighting.plate.name}` : "None yet"}
                  </span>
                  {oldestSighting ? (
                    <span className="stats-activity-item__meta">{formatDiscoveryTime(oldestSighting.discovery.foundAtIso)}</span>
                  ) : null}
                </div>
                <div className="stats-activity-item">
                  <span className="stats-activity-item__label">Most recent</span>
                  <span className="stats-activity-item__value">
                    {newestSighting ? `${newestSighting.plate.name}` : "None yet"}
                  </span>
                  {newestSighting ? (
                    <span className="stats-activity-item__meta">{formatDiscoveryTime(newestSighting.discovery.foundAtIso)}</span>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ── Top localities ── */}
            {topLocalities.length > 0 ? (
              <section className="stats-section">
                <h3 className="stats-section__title">Top Localities</h3>
                <div className="stats-locality-list">
                  {topLocalities.map(([locality, count]) => (
                    <div className="stats-locality-row" key={locality}>
                      <span>{locality}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* ── Timeline ── */}
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
    </PageView>
  );
}
