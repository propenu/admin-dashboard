// src/pages/EmailNotifications/EmailNotificationComponents/Progressbar.jsx

const STYLES = `
  @keyframes pb-fill-in {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes pb-sweep {
    0%   { left: -60%; }
    100% { left: 120%; }
  }
  @keyframes pb-march {
    from { background-position: 0 0; }
    to   { background-position: 24px 0; }
  }
  @keyframes pb-tick-in {
    from { opacity: 0; transform: scaleY(0); }
    to   { opacity: 1; transform: scaleY(1); }
  }
  @keyframes pb-badge-pop {
    0%   { transform: scale(0.7); opacity: 0; }
    80%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }

  .pb-track {
    width: 100%; height: 7px; border-radius: 999px;
    background: rgba(0,0,0,0.06);
    overflow: hidden; display: flex; position: relative;
  }
  .pb-seg {
    height: 100%;
    transform-origin: left;
    animation: pb-fill-in 0.9s cubic-bezier(.4,0,.2,1) both;
  }
  .pb-seg-sent  { background: #22c55e; border-radius: 999px 0 0 999px; animation-delay: 0.05s; }
  .pb-seg-fail  { background: #f87171; animation-delay: 0.2s; }
  .pb-seg-pend  { background: #fcd34d; opacity: 0.5; border-radius: 0 999px 999px 0; flex: 1; }
  .pb-sweep-layer {
    position: absolute; top: 0; height: 100%; width: 40%;
    background: rgba(255,255,255,0.4); border-radius: 999px;
    animation: pb-sweep 2.4s ease-in-out infinite;
    pointer-events: none;
  }
  .pb-pill {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 600; padding: 2px 7px;
    border-radius: 999px;
    animation: pb-badge-pop 0.45s cubic-bezier(.22,1,.36,1) both;
  }
  .pb-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
`;

let _stylesInjected = false;
const injectStyles = () => {
  if (_stylesInjected) return;
  const el = document.createElement("style");
  el.textContent = STYLES;
  document.head.appendChild(el);
  _stylesInjected = true;
};

// ─── Variant 1: Sweep Shimmer ─────────────────────────────
const SweepBar = ({ s, f }) => (
  <div className="pb-track">
    {s > 0 && <div className="pb-seg pb-seg-sent" style={{ width: `${s}%` }} />}
    {f > 0 && <div className="pb-seg pb-seg-fail" style={{ width: `${f}%` }} />}
    <div className="pb-seg pb-seg-pend" />
    <div className="pb-sweep-layer" />
  </div>
);

// ─── Variant 2: Segmented Blocks ──────────────────────────
const BlocksBar = ({ s, f, p }) => (
  <div style={{ display: "flex", gap: 3, height: 10 }}>
    <div
      style={{
        flex: s || 0.01,
        background: "#22c55e",
        borderRadius: 4,
        transformOrigin: "left",
        animation: "pb-fill-in 0.85s cubic-bezier(.4,0,.2,1) both 0.05s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(90deg,rgba(255,255,255,0.18) 0,rgba(255,255,255,0.18) 6px,transparent 6px,transparent 12px)",
        }}
      />
    </div>
    {f > 0 && (
      <div
        style={{
          flex: f,
          background: "#f87171",
          borderRadius: 4,
          transformOrigin: "left",
          animation: "pb-fill-in 0.85s cubic-bezier(.4,0,.2,1) both 0.2s",
        }}
      />
    )}
    <div
      style={{
        flex: p || 0.01,
        borderRadius: 4,
        backgroundImage:
          "repeating-linear-gradient(90deg,#fcd34d 0,#fcd34d 8px,rgba(255,255,255,0.28) 8px,rgba(255,255,255,0.28) 9px)",
        backgroundSize: "24px 100%",
        opacity: 0.55,
        animation: "pb-march 0.9s linear infinite",
      }}
    />
  </div>
);

// ─── Variant 3: Stacked Rows ──────────────────────────────
const RowItem = ({ label, pct, color, textColor, delay }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span
      style={{
        fontSize: 10,
        color: "#6b7280",
        width: 44,
        textAlign: "right",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <div
      style={{
        flex: 1,
        height: 5,
        borderRadius: 999,
        background: "rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transformOrigin: "left",
          animation: `pb-fill-in 0.9s cubic-bezier(.4,0,.2,1) both ${delay}s`,
        }}
      />
    </div>
    <span
      style={{ fontSize: 10, fontWeight: 600, color: textColor, width: 30 }}
    >
      {pct}%
    </span>
  </div>
);

const RowsBar = ({ s, f, p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <RowItem
      label="Sent"
      pct={s}
      color="#22c55e"
      textColor="#15803d"
      delay={0.05}
    />
    <RowItem
      label="Failed"
      pct={f}
      color="#f87171"
      textColor="#b91c1c"
      delay={0.2}
    />
    <RowItem
      label="Pending"
      pct={p}
      color="#fcd34d"
      textColor="#92400e"
      delay={0.35}
    />
  </div>
);

// ─── Variant 4: Dot Ticks ─────────────────────────────────
const TicksBar = ({ success, failed, total }) => {
  const cap = Math.min(total, 60);
  const scale = cap / total;
  const sSc = Math.round(success * scale);
  const fSc = Math.round(failed * scale);
  const pSc = cap - sSc - fSc;
  const tiles = [
    ...Array(sSc).fill({ color: "#22c55e", op: 1 }),
    ...Array(fSc).fill({ color: "#f87171", op: 1 }),
    ...Array(Math.max(pSc, 0)).fill({ color: "#fcd34d", op: 0.55 }),
  ];
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: t.color,
            opacity: t.op,
            flexShrink: 0,
            transformOrigin: "center bottom",
            animation: `pb-tick-in 0.2s ease both ${(i * 0.03).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Labels ───────────────────────────────────────────────
const Labels = ({ success, failed, pending, total }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
  >
    <span
      className="pb-pill"
      style={{
        background: "rgba(34,197,94,0.1)",
        color: "#15803d",
        animationDelay: "0.1s",
      }}
    >
      <span className="pb-dot" style={{ background: "#22c55e" }} />
      {success} sent
    </span>
    {failed > 0 && (
      <span
        className="pb-pill"
        style={{
          background: "rgba(248,113,113,0.1)",
          color: "#b91c1c",
          animationDelay: "0.2s",
        }}
      >
        <span className="pb-dot" style={{ background: "#f87171" }} />
        {failed} failed
      </span>
    )}
    <span
      className="pb-pill"
      style={{
        background: "rgba(252,211,77,0.12)",
        color: "#92400e",
        animationDelay: "0.3s",
      }}
    >
      <span
        className="pb-dot"
        style={{ background: "#fcd34d", opacity: 0.7 }}
      />
      {pending} pending
    </span>
    <span
      style={{
        marginLeft: "auto",
        fontSize: 10,
        fontWeight: 700,
        color: "#6b7280",
        animation: "pb-badge-pop 0.4s ease both 0.35s",
      }}
    >
      {success}/{total}
    </span>
  </div>
);

// ─── Main Export ──────────────────────────────────────────
export const ProgressBar = ({
  success = 0,
  failed = 0,
  total = 0,
  variant = "sweep", // "sweep" | "blocks" | "rows" | "ticks"
  showLabels = false,
}) => {
  if (typeof document !== "undefined") injectStyles();

  const s = total ? Math.round((success / total) * 100) : 0;
  const f = total ? Math.round((failed / total) * 100) : 0;
  const p = 100 - s - f;
  const pending = Math.max(total - success - failed, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {variant === "sweep" && <SweepBar s={s} f={f} />}
      {variant === "blocks" && <BlocksBar s={s} f={f} p={p} />}
      {variant === "rows" && <RowsBar s={s} f={f} p={p} />}
      {variant === "ticks" && (
        <TicksBar success={success} failed={failed} total={total} />
      )}
      {showLabels && (
        <Labels
          success={success}
          failed={failed}
          pending={pending}
          total={total}
        />
      )}
    </div>
  );
};
