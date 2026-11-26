interface ViewSwitchProps {
  label: string;
  checked: boolean;
  controls: string;
  onChange: () => void;
}

export function ViewSwitch({ label, checked, controls, onChange }: ViewSwitchProps) {
  return (
    <button
      type="button"
      className="view-switch"
      role="switch"
      aria-checked={checked}
      aria-controls={controls}
      onClick={onChange}
    >
      <span>{label}</span>
      <span className="view-switch-track" aria-hidden="true">
        <span className="view-switch-thumb" />
      </span>
      <span className="view-switch-state" aria-hidden="true">{checked ? 'On' : 'Off'}</span>
    </button>
  );
}
