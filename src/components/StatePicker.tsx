import { useMemo, useRef, useState } from "react";
import { stateRegistry } from "../games/stateRegistry";
import { setSelectedStateId } from "../games/activeGame";

interface StatePickerProps {
  onSelect?: () => void;
}

export function StatePicker({ onSelect }: StatePickerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Build letter-range quickjump groups from available states
  const indexGroups = useMemo(() => {
    const ranges = [
      { label: "A\u2013F", start: "A", end: "F" },
      { label: "G\u2013M", start: "G", end: "M" },
      { label: "N\u2013S", start: "N", end: "S" },
      { label: "T\u2013Z", start: "T", end: "Z" },
    ];
    // Only include ranges that contain at least one state
    return ranges.filter((r) =>
      stateRegistry.some((s) => {
        const ch = s.name[0].toUpperCase();
        return ch >= r.start && ch <= r.end;
      })
    );
  }, []);

  function handleSelect(stateId: string) {
    if (loadingId) return; // prevent double-tap
    setLoadingId(stateId);
    setSelectedStateId(stateId);

    // Small delay so the spinner renders before the reload freezes the UI
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

  function handleJump(rangeStart: string) {
    // Find the first state whose name starts at or after rangeStart
    const target = stateRegistry.find(
      (s) => s.name[0].toUpperCase() >= rangeStart
    );
    if (target) {
      const el = cardRefs.current[target.id];
      if (el) {
        // Scroll so the card clears the sticky header
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
        {indexGroups.length > 1 && (
          <nav className="state-picker__index" aria-label="Alphabetical index">
            {indexGroups.map((group) => (
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
        )}
      </div>
      <div className="state-picker__list">
        {stateRegistry.map((state) => (
          <button
            key={state.id}
            ref={(el) => { cardRefs.current[state.id] = el; }}
            type="button"
            className={`state-picker__card ${!state.available ? "state-picker__card--disabled" : ""} ${loadingId === state.id ? "state-picker__card--loading" : ""}`}
            disabled={!state.available || loadingId !== null}
            onClick={() => handleSelect(state.id)}
          >
            {loadingId === state.id ? (
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
                {loadingId === state.id ? "Loading..." : state.tagline}
              </span>
            </div>
            {!state.available ? (
              <span className="state-picker__coming-soon">Coming Soon</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
