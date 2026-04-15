


// src/pages/EmailNotifications/EmailNotificationComponents/RunningBanner.jsx
import { RotateCcw, Loader2 } from "lucide-react";
import { ProgressBar } from "./Progressbar.jsx";

export const RunningBanner = ({ data, onRetry, retrying }) => {
  if (!data?.campaignId) return null;

  return (
    <>
      <style>{`
        @keyframes rbn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes rbn-radar {
          0%   { transform: scale(1);   opacity: 0.75; }
          100% { transform: scale(2.8); opacity: 0;    }
        }
        @keyframes rbn-slide-in {
          0%   { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0);     opacity: 1; }
        }
        @keyframes rbn-bar-fill {
          0%   { width: 0%; }
          100% { width: var(--rbn-target); }
        }
        @keyframes rbn-pill-in {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0);   }
        }
        @keyframes rbn-progress-flicker {
          0%, 100% { opacity: 1;   }
          45%      { opacity: 1;   }
          50%      { opacity: 0.4; }
          55%      { opacity: 1;   }
        }
        @keyframes rbn-glow {
          0%, 100% { box-shadow: 0 0 0 0px rgba(59,130,246,0.35); }
          50%      { box-shadow: 0 0 0 5px rgba(59,130,246,0);    }
        }
        @keyframes rbn-march {
          0%   { stroke-dashoffset: 0;   }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes rbn-spin {
          to { transform: rotate(360deg); }
        }

        .rbn-wrap {
          animation: rbn-slide-in 0.45s cubic-bezier(.22,1,.36,1) both;
        }

        .rbn-radar-dot {
          position: relative;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #27AE60;
          flex-shrink: 0;
        }
        .rbn-radar-dot::before,
        .rbn-radar-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #27AE60;
          animation: rbn-radar 1.6s ease-out infinite;
        }
        .rbn-radar-dot::after { animation-delay: 0.8s; }

        .rbn-shimmer-text {
          background: linear-gradient(
  90deg,
  #1e8449 0%,   /* darker green */
  #27AE60 40%,  /* primary */
  #58d68d 50%,  /* light highlight */
  #27AE60 60%,  /* primary */
  #1e8449 100%  /* darker green */
);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rbn-shimmer 2.4s linear infinite;
          font-size: 13px;
          font-weight: 700;
        }

        .rbn-track {
          height: 6px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(0,0,0,0.06);
          display: flex;
          position: relative;
        }

        .rbn-segment-sent {
          height: 100%;
          background: #22c55e;
          border-radius: 999px 0 0 999px;
          animation: rbn-bar-fill 1s cubic-bezier(.4,0,.2,1) both;
          animation-delay: 0.1s;
          position: relative;
          overflow: hidden;
        }
        .rbn-segment-sent::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%, rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 55%, transparent 100%
          );
          background-size: 200% 100%;
          animation: rbn-shimmer 1.8s linear infinite;
        }

        .rbn-segment-failed {
          height: 100%;
          background: #f87171;
          animation: rbn-bar-fill 1s cubic-bezier(.4,0,.2,1) both;
          animation-delay: 0.3s;
        }

        .rbn-segment-pending {
          height: 100%;
          background: #fcd34d;
          opacity: 0.55;
          border-radius: 0 999px 999px 0;
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .rbn-segment-pending::after {
          content: '';
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 5px,
            rgba(255,255,255,0.3) 5px,
            rgba(255,255,255,0.3) 7px
          );
          animation: rbn-march 0.7s linear infinite;
        }

        .rbn-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          animation: rbn-pill-in 0.4s ease both;
        }
        .rbn-pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .rbn-progress-label {
          font-size: 11px;
          font-weight: 700;
          color: #3b82f6;
          animation: rbn-progress-flicker 3s ease infinite;
        }

        .rbn-retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: 10px;
          border: 1.5px solid #3b82f6;
          background: transparent;
          color: #3b82f6;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          transition: background 0.16s, color 0.16s, transform 0.12s;
          animation: rbn-glow 2s ease-in-out infinite;
        }
        .rbn-retry-btn:not(:disabled):hover {
          background: #3b82f6;
          color: #fff;
          transform: scale(1.04);
          animation: none;
          box-shadow: none;
        }
        .rbn-retry-btn:not(:disabled):active {
          transform: scale(0.97);
        }
        .rbn-retry-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .rbn-spin { animation: rbn-spin 0.7s linear infinite; }
      `}</style>

      {/* ── Banner ── */}
      <div
        className="rbn-wrap"
        style={{
          background: "var(--color-background-primary, #FFFFFF)",
          border: "0.5px solid #27AE60",
          borderLeft: "5px solid #27AE60",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* ── Left: dot + content ── */}
        <div className="rbn-radar-dot" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 7,
              flexWrap: "wrap",
            }}
          >
            <span className="rbn-shimmer-text">Campaign Running</span>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--color-text-secondary, #000000)",
                background: "var(--color-background-secondary, #f1f5f9)",
                border:
                  "0.5px solid #27AE60",
                borderRadius: 6,
                padding: "2px 8px",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {data.campaignId}
            </span>
          </div>

          {/* Animated progress bar */}
          <div className="rbn-track" style={{ marginBottom: 7 }}>
            {data.total > 0 && (
              <>
                <div
                  className="rbn-segment-sent"
                  style={{
                    "--rbn-target": `${Math.round((data.success / data.total) * 100)}%`,
                    width: `${Math.round((data.success / data.total) * 100)}%`,
                  }}
                />
                {data.failed > 0 && (
                  <div
                    className="rbn-segment-failed"
                    style={{
                      "--rbn-target": `${Math.round((data.failed / data.total) * 100)}%`,
                      width: `${Math.round((data.failed / data.total) * 100)}%`,
                    }}
                  />
                )}
                <div className="rbn-segment-pending" />
              </>
            )}
          </div>

          {/* Stat pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            <span
              className="rbn-pill"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#15803d",
                animationDelay: "0.1s",
              }}
            >
              <span
                className="rbn-pill-dot"
                style={{ background: "#22c55e" }}
              />
              {data.success} sent
            </span>
            <span
              className="rbn-pill"
              style={{
                background: "rgba(248,113,113,0.1)",
                color: "#b91c1c",
                animationDelay: "0.2s",
              }}
            >
              <span
                className="rbn-pill-dot"
                style={{ background: "#f87171" }}
              />
              {data.failed} failed
            </span>
            <span
              className="rbn-pill"
              style={{
                background: "rgba(252,211,77,0.12)",
                color: "#92400e",
                animationDelay: "0.3s",
              }}
            >
              <span
                className="rbn-pill-dot"
                style={{ background: "#fcd34d" }}
              />
              {data.pending} pending
            </span>
            <span className="rbn-progress-label" style={{ marginLeft: "auto" }}>
              {data.progress}
            </span>
          </div>
        </div>

        {/* ── Retry button ── */}
        {data.failed > 0 && (
          <button
            className="rbn-retry-btn"
            onClick={() => onRetry(data.campaignId)}
            disabled={retrying}
          >
            {retrying ? (
              <Loader2 size={12} className="rbn-spin" />
            ) : (
              <RotateCcw size={12} />
            )}
            Retry failed
          </button>
        )}
      </div>
    </>
  );
};