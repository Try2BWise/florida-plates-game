import { useState } from "react";
import { stateRegistry } from "../games/stateRegistry";
import { setSelectedStateId } from "../games/activeGame";

interface StatePickerProps {
  onSelect?: () => void;
}

export function StatePicker({ onSelect }: StatePickerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      </div>
      <div className="state-picker__list">
        {stateRegistry.map((state) => (
          <button
            key={state.id}
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
