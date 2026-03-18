import React, { useState, useEffect } from "react";
import { getActiveSubscriptions } from "../../features/payment/paymentServices";
import { Activity, Download, FileX } from "lucide-react";

// ─── Icon wrappers ────────────────────────────────────────────────────────────
const ActivityIcon = () => <Activity size={20} strokeWidth={1.5} />;
const DownloadIcon = () => <Download size={14} strokeWidth={2} />;
const EmptyIcon = () => (
  <FileX size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 120px 120px 180px 90px",
      gap: "0",
      padding: "20px 28px",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "center",
      animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`,
    }}
  >
    {[
      ["65%", "12px"],
      ["45%", "12px"],
      ["35%", "12px"],
      ["80%", "8px"],
      ["30%", "12px"],
    ].map(([w, h], i) => (
      <div
        key={i}
        style={{
          height: h,
          width: w,
          background: "#f0f2f5",
          borderRadius: "6px",
        }}
      />
    ))}
  </div>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "20px 24px",
      border: "1px solid #eef0f3",
      flex: 1,
      minWidth: "160px",
      borderLeft: `3px solid ${accent}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: "11px",
        fontWeight: "700",
        color: "#9ca3af",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: "6px 0 2px",
        fontSize: "22px",
        fontWeight: "800",
        color: "#111827",
        letterSpacing: "-0.5px",
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          color: "#6b7280",
          fontWeight: "500",
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, variant }) => {
  const styles = {
    agent: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    owner: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    member: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    annual: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    monthly: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    default: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  };
  const s = styles[variant?.toLowerCase()] || styles.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label}
    </span>
  );
};

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ daysLeft }) => {
  const isExpired = daysLeft <= 0;
  const isExpiringSoon = !isExpired && daysLeft <= 7;

  const config = isExpired
    ? { label: "Expired", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" }
    : isExpiringSoon
      ? {
          label: `${daysLeft}d left`,
          bg: "#fffbeb",
          color: "#92400e",
          dot: "#f59e0b",
        }
      : { label: "Active", bg: "#f0fdf4", color: "#166534", dot: "#22c55e" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "600",
        background: config.bg,
        color: config.color,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
          boxShadow:
            !isExpired && !isExpiringSoon
              ? `0 0 0 3px ${config.dot}33`
              : "none",
        }}
      />
      {config.label}
    </span>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color }) => (
  <div
    style={{
      height: "5px",
      background: "#f3f4f6",
      borderRadius: "99px",
      overflow: "hidden",
      width: "100%",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${value}%`,
        background: color,
        borderRadius: "99px",
        transition: "width 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    />
  </div>
);

// ─── Desktop Row ──────────────────────────────────────────────────────────────
const DesktopRow = ({ sub, index }) => {
  const [hovered, setHovered] = useState(false);

  const now = new Date();
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);

  const totalDuration = end - start;
  const remaining = end - now;
  const daysLeft = Math.max(Math.ceil(remaining / 86400000), 0);
  const progress = Math.min(
    Math.max((remaining / totalDuration) * 100, 0),
    100,
  );
  const isExpired = daysLeft <= 0;
  const isExpiringSoon = !isExpired && daysLeft <= 7;

  const progressColor = isExpired
    ? "#ef4444"
    : isExpiringSoon
      ? "#f59e0b"
      : "#27AE60";

  const planDisplay = (sub.planCode || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 120px 120px 180px 90px",
        gap: "0",
        padding: "18px 28px",
        borderBottom: "1px solid #f7f8fa",
        alignItems: "center",
        background: hovered ? "#fafbff" : index % 2 === 0 ? "#fff" : "#fdfdfd",
        transition: "background 0.15s ease",
        position: "relative",
        cursor: "default",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            background: "#27AE60",
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}

      {/* User / Plan */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          {planDisplay}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
            fontFamily: "monospace",
          }}
        >
          #{sub._id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Tier */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Badge label={sub.category} variant={sub.category} />
        <Badge label={sub.tier} variant={sub.tier?.toLowerCase()} />
      </div>

      {/* Usage */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
            color: "#111827",
            letterSpacing: "-0.3px",
          }}
        >
          {sub.usage?.contactUsed || 0}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          contacts used
        </p>
      </div>

      {/* Timeline */}
      <div style={{ width: "160px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <StatusChip daysLeft={daysLeft} />
          <span
            style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "500" }}
          >
            {new Date(sub.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
        <ProgressBar value={progress} color={progressColor} />
      </div>

      {/* Invoice */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {sub.invoiceUrl ? (
          <a
            href={sub.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "7px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: "600",
              background: hovered ? "#27AE60" : "#f3f4f6",
              color: hovered ? "#fff" : "#374151",
              transition: "all 0.15s ease",
            }}
          >
            <DownloadIcon /> PDF
          </a>
        ) : (
          <span
            style={{ fontSize: "11px", color: "#d1d5db", fontStyle: "italic" }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ sub }) => {
  const now = new Date();
  const end = new Date(sub.endDate);
  const daysLeft = Math.max(Math.ceil((end - now) / 86400000), 0);

  const planDisplay = (sub.planCode || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid #eef0f3",
        marginBottom: "12px",
        borderLeft: "3px solid #27AE60",
      }}
    >
      {/* Top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            {planDisplay}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: "10px",
              color: "#9ca3af",
              fontFamily: "monospace",
            }}
          >
            #{sub._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <StatusChip daysLeft={daysLeft} />
      </div>

      {/* Badges */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <Badge label={sub.category} variant={sub.category} />
        <Badge label={sub.tier} variant={sub.tier?.toLowerCase()} />
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #f3f4f6",
          marginBottom: "14px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Contacts Used
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "16px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            {sub.usage?.contactUsed || 0}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Expires
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "13px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            {new Date(sub.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Invoice */}
      {sub.invoiceUrl ? (
        <a
          href={sub.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #27AE60, #16a34a)",
            color: "#fff",
          }}
        >
          <DownloadIcon /> View Invoice
        </a>
      ) : (
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "11px",
            color: "#d1d5db",
            fontStyle: "italic",
          }}
        >
          No invoice available
        </p>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ActiveSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getActiveSubscriptions()
      .then((res) => {
        setSubscriptions(res?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load subscriptions", err);
        setError("Unable to fetch subscriptions. Please try again.");
        setLoading(false);
      });
  }, []);

  // Summaries
  const now = new Date();
  const expiringSoon = subscriptions.filter((s) => {
    const d = Math.ceil((new Date(s.endDate) - now) / 86400000);
    return d > 0 && d <= 7;
  }).length;
  const totalContacts = subscriptions.reduce(
    (s, i) => s + (i.usage?.contactUsed || 0),
    0,
  );

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Manrope', system-ui, sans-serif",
        minHeight: "100vh",
        background: "#f8fafc",
        padding: isMobile ? "20px 16px" : "32px 32px",
      }}
    >
      <style>{`
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            marginBottom: "28px",
            gap: "16px",
            animation: "fadeUp 0.4s ease forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #27AE60, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <ActivityIcon />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "800",
                  color: "#111827",
                  letterSpacing: "-0.5px",
                }}
              >
                Live Subscriptions
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Monitor active user plans and usage limits
              </p>
            </div>
          </div>

          {!loading && !error && (
            <div
              style={{
                padding: "9px 18px",
                borderRadius: "12px",
                border: "1px solid #eef0f3",
                background: "#fff",
                fontSize: "12px",
                fontWeight: "700",
                color: "#374151",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              Total Active:{" "}
              <strong style={{ color: "#27AE60" }}>
                {subscriptions.length}
              </strong>
            </div>
          )}
        </div>

        {/* ── Summary Cards ── */}
        {!loading && !error && subscriptions.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              flexWrap: "wrap",
              animation: "fadeUp 0.4s ease 0.1s both",
            }}
          >
            <SummaryCard
              label="Active Plans"
              value={subscriptions.length}
              sub="currently running"
              accent="#27AE60"
            />
            <SummaryCard
              label="Expiring Soon"
              value={expiringSoon}
              sub="within 7 days"
              accent="#f59e0b"
            />
            <SummaryCard
              label="Total Contacts Used"
              value={totalContacts.toLocaleString()}
              sub="across all plans"
              accent="#3b82f6"
            />
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #eef0f3",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              animation: "fadeUp 0.3s ease forwards",
            }}
          >
            <div
              style={{
                padding: "18px 28px",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <div
                style={{
                  height: "10px",
                  width: "25%",
                  background: "#f0f2f5",
                  borderRadius: "6px",
                }}
              />
            </div>
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #eef0f3",
              padding: "60px 24px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#ef4444",
                fontWeight: "600",
              }}
            >
              {error}
            </p>
            <p
              style={{ margin: "8px 0 0", fontSize: "12px", color: "#9ca3af" }}
            >
              Please try refreshing the page.
            </p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && subscriptions.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #eef0f3",
              padding: "80px 24px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <EmptyIcon />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              No Active Subscriptions
            </p>
            <p
              style={{ margin: "6px 0 0", fontSize: "13px", color: "#9ca3af" }}
            >
              Active plans will appear here
            </p>
          </div>
        )}

        {/* ── Desktop Table ── */}
        {!loading && !error && subscriptions.length > 0 && !isMobile && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #eef0f3",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              animation: "fadeUp 0.4s ease 0.2s both",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px 180px 90px",
                padding: "12px 28px",
                borderBottom: "2px solid #f3f4f6",
                background: "#fafbfc",
              }}
            >
              {[
                { label: "User / Plan" },
                { label: "Tier" },
                { label: "Usage" },
                { label: "Timeline" },
                { label: "Invoice", right: true },
              ].map(({ label, right }) => (
                <div
                  key={label}
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    textAlign: right ? "right" : "left",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {subscriptions.map((sub, index) => (
              <DesktopRow key={sub._id} sub={sub} index={index} />
            ))}

            {/* Footer */}
            <div
              style={{
                padding: "12px 28px",
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Showing{" "}
                <strong style={{ color: "#374151" }}>
                  {subscriptions.length}
                </strong>{" "}
                active subscriptions
              </p>
            </div>
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {!loading && !error && subscriptions.length > 0 && isMobile && (
          <div style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
            {subscriptions.map((sub) => (
              <MobileCard key={sub._id} sub={sub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSubscriptions;
