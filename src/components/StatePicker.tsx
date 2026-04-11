import { useMemo, useRef, useState } from "react";
import { stateRegistry } from "../games/stateRegistry";
import { setSelectedStateId } from "../games/activeGame";
import { Icon } from "./Icon";
import { hapticsPinToggled } from "../lib/haptics";

const PINNED_STATES_KEY = "every-pl8-pinned-states";

function loadPinnedIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(PINNED_STATES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function savePinnedIds(ids: Set<string>): void {
  window.localStorage.setItem(PINNED_STATES_KEY, JSON.stringify([...ids]));
}

interface StatePickerProps {
  onSelect?: () => void;
}

export function StatePicker({ onSelect }: StatePickerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => loadPinnedIds());
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pinnedSectionRef = useRef<HTMLParagraphElement | null>(null);

  // Pinned section — in pin order (order they were pinned)
  const pinnedStates = useMemo(
    () => stateRegistry.filter(s => pinnedIds.has(s.id)),
    [pinnedIds]
  );

  // Main alphabetical list — excludes pinned states
  const unPinnedStates = useMemo(
    () => stateRegistry.filter(s => !pinnedIds.has(s.id)),
    [pinnedIds]
  );

  // Static quick-jump ranges — always shown, jump to unpinned list only
  const indexGroups = [
    { label: "A\u2013G", start: "A", end: "G" },
    { label: "H\u2013N", start: "H", end: "N" },
    { label: "O\u2013Z", start: "O", end: "Z" },
  ];

  function handleSelect(stateId: string) {
    if (loadingId) return;
    setLoadingId(stateId);
    setSelectedStateId(stateId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (onSelect) {
          onSelect();
        } else {
          window.location.reload();
        }
      }, 80);
    });
  }

  function handleTogglePin(e: React.MouseEvent, stateId: string) {
    e.stopPropagation();
    void hapticsPinToggled();
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(stateId)) {
        next.delete(stateId);
      } else {
        next.add(stateId);
      }
      savePinnedIds(next);
      return next;
    });
  }

  function handleJump(rangeStart: string) {
    const target = unPinnedStates.find(
      s => s.name[0].toUpperCase() >= rangeStart
    );
    if (target) {
      const el = cardRefs.current[`unpinned-${target.id}`];
      if (el) {
        const list = el.closest(".state-picker__list");
        if (list) {
          const listRect = list.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const scrollOffset = elRect.top - listRect.top + list.scrollTop;
          list.scrollTo({ top: scrollOffset, behavior: "smooth" });
        }
      }
    }
  }

  function renderCard(state: typeof stateRegistry[0], refKey: string) {
    const isPinned = pinnedIds.has(state.id);
    const isLoading = loadingId === state.id;
    return (
      <button
        key={refKey}
        ref={el => { cardRefs.current[refKey] = el; }}
        type="button"
        className={`state-picker__card ${!state.available ? "state-picker__card--disabled" : ""} ${isLoading ? "state-picker__card--loading" : ""}`}
        disabled={!state.available || loadingId !== null}
        onClick={() => handleSelect(state.id)}
      >
        {isLoading ? (
          <div className="state-picker__spinner" aria-label="Loading">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 14" />
            </svg>
          </div>
        ) : (
          <img
            className="state-picker__outline"
            src={`${import.meta.env.BASE_URL}state-outlines/${state.abbreviation}.svg`}
            alt=""
            aria-hidden="true"
          />
        )}
        <div className="state-picker__card-text">
          <span className="state-picker__name">{state.name}</span>
          <span className="state-picker__tagline">
            {isLoading ? "Loading..." : state.tagline}
          </span>
        </div>
        {!state.available ? (
          <span className="state-picker__coming-soon">Coming Soon</span>
        ) : (
          <button
            type="button"
            className={`state-picker__pin-btn ${isPinned ? "state-picker__pin-btn--active" : ""}`}
            onClick={e => handleTogglePin(e, state.id)}
            aria-label={isPinned ? `Unpin ${state.name}` : `Pin ${state.name}`}
            aria-pressed={isPinned}
            disabled={loadingId !== null}
          >
            <Icon name="pin" size={16} />
          </button>
        )}
      </button>
    );
  }

  return (
    <div className="state-picker">
      <div className="state-picker__header">
        <img
          className="state-picker__logo"
          src={`${import.meta.env.BASE_URL}state-pl8-logo.png`}
          alt="State PL8"
        />
        <h1 className="state-picker__title">Every PL8</h1>
        <p className="state-picker__subtitle">Choose your state to start collecting</p>
        <nav className="state-picker__index" aria-label="Alphabetical index">
          {pinnedIds.size > 0 && (
            <button
              type="button"
              className="state-picker__index-btn state-picker__index-btn--pin"
              onClick={() => {
                const el = pinnedSectionRef.current;
                if (el) {
                  const list = el.closest(".state-picker__list");
                  if (list) list.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              aria-label="Jump to pinned states"
            >
              <Icon name="pin" size={13} />
            </button>
          )}
          {indexGroups.map(group => (
            <button
              key={group.start}
              type="button"
              className="state-picker__index-btn"
              onClick={() => handleJump(group.start)}
            >
              {group.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="state-picker__list">
        {pinnedStates.length > 0 && (
          <>
            <p className="state-picker__section-label" ref={pinnedSectionRef} aria-label="Pinned states"><Icon name="pin" size={13} /></p>
            {pinnedStates.map(s => renderCard(s, `pinned-${s.id}`))}
            <div className="state-picker__section-divider" aria-hidden="true" />
          </>
        )}
        {unPinnedStates.map(s => renderCard(s, `unpinned-${s.id}`))}
      </div>
    </div>
  );
}
