interface ProgressRingProps {
  percent: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  percent,
  size,
  strokeWidth,
  color,
  trackColor = "rgba(120, 120, 128, 0.2)",
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__fill"
        />
      </svg>
      {(label || sublabel) ? (
        <div className="progress-ring__center">
          {label ? <span className="progress-ring__label">{label}</span> : null}
          {sublabel ? <span className="progress-ring__sublabel">{sublabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
