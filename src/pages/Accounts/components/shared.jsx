// src/features/users/components/shared.jsx
import React from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg: "#f0f2f5",
  card: "#ffffff",
  border: "#e5e7eb",
  accent: "#27AE60",
  accentLight: "#dcfce7",
  accentDark: "#15803d",
  text: "#0f172a",
  sub: "#475569",
  muted: "#94a3b8",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  warn: "#f59e0b",
  warnLight: "#fef3c7",
  info: "#3b82f6",
  infoLight: "#dbeafe",
  purple: "#8b5cf6",
  purpleLight: "#ede9fe",
  orange: "#f97316",
  orangeLight: "#ffedd5",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n) => (n ?? 0).toLocaleString();
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
export const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skel = ({ w = "100%", h = "14px", radius = "6px" }) => (
  <div
    style={{
      width: w,
      height: h,
      background:
        "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
      backgroundSize: "200% 100%",
      borderRadius: radius,
      animation: "shimmer 1.6s ease-in-out infinite",
    }}
  />
);

// ─── Empty ────────────────────────────────────────────────────────────────────
export const Empty = ({ msg = "No data found", icon = "📭" }) => (
  <div
    style={{
      textAlign: "center",
      padding: "36px 20px",
      color: C.muted,
    }}
  >
    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: C.sub }}>
      {msg}
    </p>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  paid: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Paid" },
  failed: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Failed" },
  active: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Active" },
  expired: {
    bg: "#f1f5f9",
    color: "#64748b",
    dot: "#94a3b8",
    label: "Expired",
  },
  verified: {
    bg: "#dcfce7",
    color: "#15803d",
    dot: "#22c55e",
    label: "Verified",
  },
  not_started: {
    bg: "#f1f5f9",
    color: "#64748b",
    dot: "#94a3b8",
    label: "Not Started",
  },
  pending: {
    bg: "#fef3c7",
    color: "#92400e",
    dot: "#f59e0b",
    label: "Pending",
  },
  featured: {
    bg: "#dbeafe",
    color: "#1d4ed8",
    dot: "#3b82f6",
    label: "Featured",
  },
  prime: { bg: "#ede9fe", color: "#6d28d9", dot: "#8b5cf6", label: "Prime" },
  normal: { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: "Normal" },
  sponsored: {
    bg: "#fef3c7",
    color: "#92400e",
    dot: "#f59e0b",
    label: "Sponsored",
  },
  kyc_pending: {
    bg: "#fef3c7",
    color: "#92400e",
    dot: "#f59e0b",
    label: "KYC Pending",
  },
  location_pending: {
    bg: "#ffedd5",
    color: "#9a3412",
    dot: "#f97316",
    label: "Location Pending",
  },
  draft: { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: "Draft" },
  published: {
    bg: "#dcfce7",
    color: "#15803d",
    dot: "#22c55e",
    label: "Published",
  },
};

// export const Badge = ({ status, label: overrideLabel }) => {
//   const cfg = BADGE_MAP[status] || BADGE_MAP.normal;
//   return (
//     <span
//       style={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: "5px",
//         padding: "3px 9px",
//         borderRadius: "99px",
//         fontSize: "10px",
//         fontWeight: "700",
//         background: cfg.bg,
//         color: cfg.color,
//         whiteSpace: "nowrap",
//         letterSpacing: "0.02em",
//       }}
//     >
//       <span
//         style={{
//           width: "5px",
//           height: "5px",
//           borderRadius: "50%",
//           background: cfg.dot,
//           flexShrink: 0,
//         }}
//       />
//       {overrideLabel || cfg.label}
//     </span>
//   );
// };

// ─── Stat pill ────────────────────────────────────────────────────────────────

export const Badge = ({ status, label: overrideLabel }) => {
  if (!status || !BADGE_MAP[status]) return null; // ✅ FIX

  const cfg = BADGE_MAP[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "99px",
        fontSize: "10px",
        fontWeight: "700",
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.dot,
        }}
      />
      {overrideLabel || cfg.label}
    </span>
  );
};
export const StatPill = ({ label, value, color = C.accent, icon }) => (
  <div
    style={{
      background: color + "14",
      border: `1px solid ${color}28`,
      borderRadius: "12px",
      padding: "12px 16px",
      flex: 1,
      minWidth: "100px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "4px",
      }}
    >
      {icon && <span style={{ fontSize: "13px" }}>{icon}</span>}
      <p
        style={{
          margin: 0,
          fontSize: "10px",
          fontWeight: "700",
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
    </div>
    <p
      style={{
        margin: 0,
        fontSize: "20px",
        fontWeight: "800",
        color,
        letterSpacing: "-0.5px",
      }}
    >
      {value}
    </p>
  </div>
);

// ─── Toggle pill tabs ─────────────────────────────────────────────────────────
export const TabToggle = ({
  options,
  active,
  onChange,
  activeColor = C.accent,
}) => (
  <div
    style={{
      display: "flex",
      gap: "3px",
      background: "#f1f5f9",
      borderRadius: "10px",
      padding: "3px",
    }}
  >
    {options.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        style={{
          padding: "5px 14px",
          borderRadius: "7px",
          border: "none",
          fontSize: "11px",
          fontWeight: "700",
          cursor: "pointer",
          background: active === key ? activeColor : "transparent",
          color: active === key ? "#fff" : C.muted,
          fontFamily: "inherit",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

// ─── Global styles injection ──────────────────────────────────────────────────
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    body { font-family: 'Outfit', system-ui, sans-serif; }
  `}</style>
);
