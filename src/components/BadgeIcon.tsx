import type { ReactNode } from "react";
import type { EvaluatedBadge } from "../lib/badges";

interface BadgeIconProps {
  badge: EvaluatedBadge;
}

interface BadgePalette {
  outer: string;
  inner: string;
  accent: string;
  ink: string;
}

const palettes: Record<EvaluatedBadge["group"], BadgePalette> = {
  progress: {
    outer: "#1d4ed8",
    inner: "#dbeafe",
    accent: "#60a5fa",
    ink: "#0f172a"
  },
  category: {
    outer: "#15803d",
    inner: "#dcfce7",
    accent: "#4ade80",
    ink: "#14532d"
  },
  collection: {
    outer: "#c2410c",
    inner: "#ffedd5",
    accent: "#fb923c",
    ink: "#7c2d12"
  },
  college: {
    outer: "#9f1239",
    inner: "#ffe4e6",
    accent: "#fb7185",
    ink: "#4c0519"
  },
  locality: {
    outer: "#0f766e",
    inner: "#ccfbf1",
    accent: "#2dd4bf",
    ink: "#134e4a"
  },
  service: {
    outer: "#4f46e5",
    inner: "#e0e7ff",
    accent: "#818cf8",
    ink: "#312e81"
  },
  florida: {
    outer: "#047857",
    inner: "#d1fae5",
    accent: "#34d399",
    ink: "#065f46"
  }
};

function MedalBase({
  badge,
  children
}: {
  badge: EvaluatedBadge;
  children: ReactNode;
}) {
  const palette = palettes[badge.group];

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="badge-icon-svg"
    >
      <defs>
        <linearGradient id={`badge-grad-${badge.id}`} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor={palette.inner} />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path
        d="M22 6h20l4 8h8l-3 11 7 7-8 7 3 11h-8l-4 8H22l-4-8h-8l3-11-7-7 7-7-3-11h8z"
        fill={palette.outer}
      />
      <circle cx="32" cy="32" r="20" fill={`url(#badge-grad-${badge.id})`} />
      <circle
        cx="32"
        cy="32"
        r="17.5"
        fill="none"
        stroke={palette.accent}
        strokeWidth="2.4"
      />
      {children}
    </svg>
  );
}

function CenterText({
  badge,
  primary,
  secondary
}: {
  badge: EvaluatedBadge;
  primary: string;
  secondary?: string;
}) {
  const palette = palettes[badge.group];
  return (
    <>
      <text
        x="32"
        y={secondary ? "30" : "35"}
        textAnchor="middle"
        fontFamily="Avenir Next, Trebuchet MS, sans-serif"
        fontWeight="900"
        fontSize={secondary ? "22" : "24"}
        fill={palette.ink}
      >
        {primary}
      </text>
      {secondary ? (
        <text
          x="32"
          y="43"
          textAnchor="middle"
          fontFamily="Avenir Next, Trebuchet MS, sans-serif"
          fontWeight="800"
          fontSize="8"
          letterSpacing="1.5"
          fill={palette.outer}
        >
          {secondary}
        </text>
      ) : null}
    </>
  );
}

function RingStar({ badge }: { badge: EvaluatedBadge }) {
  const palette = palettes[badge.group];
  return (
    <>
      <path
        d="M32 18l3.5 7.3 8 .9-5.9 5.3 1.6 7.8L32 35.7l-7.2 3.6 1.6-7.8-5.9-5.3 8-.9z"
        fill={palette.outer}
      />
      <circle cx="32" cy="32" r="4.5" fill={palette.accent} />
    </>
  );
}

function PlateGlyph({ badge }: { badge: EvaluatedBadge }) {
  const palette = palettes[badge.group];
  return (
    <>
      <rect
        x="17"
        y="22"
        width="30"
        height="20"
        rx="4"
        fill="#ffffff"
        stroke={palette.outer}
        strokeWidth="2"
      />
      <rect x="19" y="24" width="26" height="4" rx="2" fill={palette.accent} />
      <rect x="24" y="31" width="16" height="3" rx="1.5" fill={palette.outer} opacity="0.85" />
      <circle cx="23" cy="26" r="1" fill={palette.outer} />
      <circle cx="41" cy="26" r="1" fill={palette.outer} />
    </>
  );
}

function LeafGlyph({ badge }: { badge: EvaluatedBadge }) {
  const palette = palettes[badge.group];
  return (
    <>
      <path
        d="M20 38c0-12 8-18 22-18-1 12-8 20-20 20-1 0-1.5 0-2-.2 4-5 9-9 14-12-7 2-11 5.4-14 10.2z"
        fill={palette.outer}
      />
      <path d="M24 41c3-6 8-10.6 14-14" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function CapGlyph({ badge }: { badge: EvaluatedBadge }) {
  const palette = palettes[badge.group];
  return (
    <>
      <path
        d="M16 28l16-8 16 8-16 8z"
        fill={palette.outer}
      />
      <path d="M22 32v5c3 2.5 10 4.5 10 4.5s7-2 10-4.5v-5" fill={palette.accent} />
      <path d="M48 29v8" stroke={palette.outer} strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="39" r="2" fill={palette.outer} />
    </>
  );
}

function BallGlyph({ badge, sport }: { badge: EvaluatedBadge; sport: "baseball" | "football" | "hockey" | "basketball" }) {
  const palette = palettes[badge.group];

  if (sport === "baseball") {
    return (
      <>
        <circle cx="32" cy="32" r="12" fill="#ffffff" stroke={palette.outer} strokeWidth="2" />
        <path d="M24 24c3 2 5 4.8 6 8-1 3.2-3 6-6 8" fill="none" stroke={palette.accent} strokeWidth="2" />
        <path d="M40 24c-3 2-5 4.8-6 8 1 3.2 3 6 6 8" fill="none" stroke={palette.accent} strokeWidth="2" />
      </>
    );
  }

  if (sport === "football") {
    return (
      <>
        <path d="M22 41c-4-6-4-12 0-18 6-4 12-4 20 0 4 6 4 12 0 18-8 4-14 4-20 0z" fill={palette.outer} />
        <path d="M27 32h10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 28v8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 29v6M35 29v6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  }

  if (sport === "hockey") {
    return (
      <>
        <circle cx="26" cy="26" r="7" fill={palette.outer} />
        <path d="M34 20l8 14" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 34l4 7h-8" stroke={palette.outer} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  return (
    <>
      <circle cx="32" cy="32" r="12" fill={palette.accent} stroke={palette.outer} strokeWidth="2" />
      <path d="M20 32h24M32 20v24" stroke={palette.outer} strokeWidth="2" />
      <path d="M24 24c4 3 6 8 6 8s-2 5-6 8M40 24c-4 3-6 8-6 8s2 5 6 8" fill="none" stroke={palette.outer} strokeWidth="2" />
    </>
  );
}

function PinGlyph({ badge }: { badge: EvaluatedBadge }) {
  const palette = palettes[badge.group];
  return (
    <>
      <path
        d="M32 18c-6 0-11 4.6-11 10.5 0 8.4 11 18.5 11 18.5s11-10.1 11-18.5C43 22.6 38 18 32 18z"
        fill={palette.outer}
      />
      <circle cx="32" cy="29" r="4.5" fill="#ffffff" />
      <circle cx="24" cy="42" r="2.6" fill={palette.accent} />
      <circle cx="40" cy="39" r="2.6" fill={palette.accent} />
    </>
  );
}

function renderBadgeGlyph(badge: EvaluatedBadge) {
  if (badge.group === "florida") {
    if (badge.id === "all-around-florida") {
      return <CenterText badge={badge} primary="ALL" secondary="FLA" />;
    }

    return <PinGlyph badge={badge} />;
  }

  switch (badge.id) {
    case "first-spot":
      return <PlateGlyph badge={badge} />;
    case "five-alive":
      return <CenterText badge={badge} primary="5" secondary="PLATES" />;
    case "ten-down":
      return <CenterText badge={badge} primary="10" secondary="PLATES" />;
    case "quarter-mark":
      return <CenterText badge={badge} primary="25" secondary="PCT" />;
    case "halfway-home":
      return <CenterText badge={badge} primary="50" secondary="PCT" />;
    case "closing-in":
      return <CenterText badge={badge} primary="75" secondary="PCT" />;
    case "complete-set":
      return <RingStar badge={badge} />;
    case "green-light":
    case "eco-scout":
      return <LeafGlyph badge={badge} />;
    case "sports-fan":
    case "all-teams":
      return <BallGlyph badge={badge} sport="football" />;
    case "mixed-bag":
    case "full-spectrum":
      return <CenterText badge={badge} primary="MIX" />;
    case "reporting-for-duty":
    case "on-call":
      return <CenterText badge={badge} primary="USA" />;
    case "in-service":
      return <CenterText badge={badge} primary="10" secondary="SERVE" />;
    case "all-branches":
      return <CenterText badge={badge} primary="5" secondary="BRANCH" />;
    case "back-the-blue":
      return <CenterText badge={badge} primary="3" secondary="BLUE" />;
    case "fire-watch":
      return <CenterText badge={badge} primary="FIRE" />;
    case "united-front":
      return <CenterText badge={badge} primary="5" secondary="SAFETY" />;
    case "air-support":
      return <CenterText badge={badge} primary="AIR" />;
    case "airborne":
      return <CenterText badge={badge} primary="JUMP" />;
    case "those-who-serve":
      return <CenterText badge={badge} primary="USA" />;
    case "bronze-star-honor":
      return <RingStar badge={badge} />;
    case "distinguished":
      return <CenterText badge={badge} primary="X" secondary="CROSS" />;
    case "combat-ready":
      return <CenterText badge={badge} primary="CMBT" />;
    case "decorated-service":
      return <CenterText badge={badge} primary="3" secondary="HONOR" />;
    case "campus-tour":
    case "first-day-of-school":
    case "graduation-day":
      return <CapGlyph badge={badge} />;
    case "grand-slam":
      return <BallGlyph badge={badge} sport="baseball" />;
    case "touchdown":
      return <BallGlyph badge={badge} sport="football" />;
    case "hat-trick":
      return <BallGlyph badge={badge} sport="hockey" />;
    case "slam-dunk":
      return <BallGlyph badge={badge} sport="basketball" />;
    case "freshman":
      return <CenterText badge={badge} primary="I" secondary="20%" />;
    case "sophomore":
      return <CenterText badge={badge} primary="II" secondary="40%" />;
    case "junior":
      return <CenterText badge={badge} primary="III" secondary="60%" />;
    case "senior":
      return <CenterText badge={badge} primary="IV" secondary="80%" />;
    case "road-trip":
    case "i-get-around":
      return <PinGlyph badge={badge} />;
    case "escapee":
      return <CenterText badge={badge} primary="OUT" />;
    case "panhandle-scout":
      return <CenterText badge={badge} primary="PAN" />;
    default:
      return <CenterText badge={badge} primary="FL" />;
  }
}

export function BadgeIcon({ badge }: BadgeIconProps) {
  return <MedalBase badge={badge}>{renderBadgeGlyph(badge)}</MedalBase>;
}
