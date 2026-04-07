import { stateRegistry } from "../games/stateRegistry";
import { setSelectedStateId } from "../games/activeGame";

interface StatePickerProps {
  onSelect?: () => void;
}

export function StatePicker({ onSelect }: StatePickerProps) {
  function handleSelect(stateId: string) {
    setSelectedStateId(stateId);
    if (onSelect) {
      onSelect();
    } else {
      window.location.reload();
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
      </div>
      <div className="state-picker__list">
        {stateRegistry.map((state) => (
          <button
            key={state.id}
            type="button"
            className={`state-picker__card ${!state.available ? "state-picker__card--disabled" : ""}`}
            disabled={!state.available}
            onClick={() => handleSelect(state.id)}
          >
            <img
              className="state-picker__outline"
              src={`${import.meta.env.BASE_URL}state-outlines/${state.abbreviation}.svg`}
              alt=""
              aria-hidden="true"
            />
            <div className="state-picker__card-text">
              <span className="state-picker__name">{state.name}</span>
              <span className="state-picker__tagline">{state.tagline}</span>
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
