import React, { useState, useEffect, useMemo } from "react";
import { getRevenueByPlan } from "../../features/payment/paymentServices";
import {
  TrendingUp,
  Download,
  LayoutGrid,
  List,
  ChevronDown,
} from "lucide-react";

// ─── Icon wrappers ────────────────────────────────────────────────────────────
const TrendingIcon = () => <TrendingUp size={20} strokeWidth={1.5} />;
const DownloadIcon = () => <Download size={14} strokeWidth={2} />;
const GridIcon = () => <LayoutGrid size={14} strokeWidth={2} />;
const ListIcon = () => <List size={14} strokeWidth={2} />;
const ChevronIcon = ({ up }) => (
  <ChevronDown
    size={12}
    strokeWidth={2.5}
    style={{
      transform: up ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  />
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "20px",
      border: "1px solid #eef0f3",
      padding: "24px",
      animation: `pulse 1.5s ease-in-out ${index * 0.12}s infinite`,
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        height: "10px",
        width: "30%",
        background: "#f0f2f5",
        borderRadius: "6px",
        marginBottom: "12px",
      }}
    />
    <div
      style={{
        height: "18px",
        width: "60%",
        background: "#f0f2f5",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    />
    <div
      style={{
        height: "6px",
        width: "100%",
        background: "#f0f2f5",
        borderRadius: "99px",
        marginBottom: "20px",
      }}
    />
    <div style={{ display: "flex", gap: "12px" }}>
      {[40, 55, 35].map((w, i) => (
        <div
          key={i}
          style={{
            height: "32px",
            width: `${w}%`,
            background: "#f0f2f5",
            borderRadius: "10px",
          }}
        />
      ))}
    </div>
  </div>
);

// ─── Summary Card ────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, sub, accent, icon }) => (
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "6px",
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
      <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>
    </div>
    <p
      style={{
        margin: "0 0 2px",
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "#27AE60" }) => (
  <div
    style={{
      height: "6px",
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

// ─── Revenue Card (Grid View) ─────────────────────────────────────────────────
const RevenueCard = ({ item, total, index }) => {
  const [hovered, setHovered] = useState(false);
  const percentage =
    total > 0 ? ((item.totalRevenue / total) * 100).toFixed(1) : 0;
  const accentColor = item.plan?.userType === "agent" ? "#8b5cf6" : "#27AE60";

  const planDisplay = (item.plan?.name || item._id)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: "20px",
        border: `1px solid ${hovered ? accentColor + "40" : "#eef0f3"}`,
        overflow: "hidden",
        position: "relative",
        boxShadow: hovered
          ? `0 8px 32px ${accentColor}18`
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "row",
        animation: `fadeUp 0.4s ease ${index * 0.08}s both`,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: "4px",
          flexShrink: 0,
          background: accentColor,
          borderRadius: "0",
        }}
      />

      <div style={{ flex: 1, padding: "22px 24px" }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  padding: "3px 10px",
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#6b7280",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {item.plan?.code || item._id}
              </span>
              {item.plan?.userType && (
                <Badge
                  label={item.plan.userType}
                  variant={item.plan.userType}
                />
              )}
              {item.plan?.tier && (
                <Badge
                  label={item.plan.tier}
                  variant={item.plan.tier?.toLowerCase()}
                />
              )}
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "800",
                color: "#111827",
                letterSpacing: "-0.3px",
                transition: "color 0.15s",
                ...(hovered ? { color: accentColor } : {}),
              }}
            >
              {planDisplay}
            </h3>
            {item.plan?.category && (
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "11px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                {item.plan.category.replace(/_/g, " ")}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                color: "#111827",
                letterSpacing: "-0.5px",
              }}
            >
              ₹{item.totalRevenue.toLocaleString()}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "11px",
                color: "#9ca3af",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {item.count} conversions
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Revenue Share
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: accentColor,
              }}
            >
              {percentage}%
            </span>
          </div>
          <ProgressBar value={percentage} color={accentColor} />
        </div>

        {/* Stats mini row */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderTop: "1px solid #f7f8fa",
            paddingTop: "14px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Price",
              value: `₹${(item.plan?.price || 0).toLocaleString()}`,
            },
            {
              label: "Duration",
              value: `${item.plan?.durationDays || "—"} Days`,
            },
            {
              label: "Avg / Sale",
              value: `₹${item.count > 0 ? Math.round(item.totalRevenue / item.count).toLocaleString() : "—"}`,
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{ flex: 1, minWidth: "80px", paddingRight: "12px" }}
            >
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
                {stat.label}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Table Row ────────────────────────────────────────────────────────────────
const TableRow = ({ item, index }) => {
  const [hovered, setHovered] = useState(false);
  const planDisplay = (item.plan?.name || item._id)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 110px 130px 110px 90px",
        gap: "0",
        padding: "16px 28px",
        borderBottom: "1px solid #f7f8fa",
        alignItems: "center",
        background: hovered ? "#fafbff" : index % 2 === 0 ? "#fff" : "#fdfdfd",
        transition: "background 0.15s ease",
        position: "relative",
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

      {/* Plan */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}
          >
            {planDisplay}
          </span>
          {item.plan?.userType && (
            <Badge label={item.plan.userType} variant={item.plan.userType} />
          )}
          {item.plan?.tier && (
            <Badge
              label={item.plan.tier}
              variant={item.plan.tier?.toLowerCase()}
            />
          )}
        </div>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          {item.plan?.category?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Duration */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {item.plan?.durationDays || "—"} days
        </p>
      </div>

      {/* Revenue */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "700",
            color: "#111827",
            letterSpacing: "-0.3px",
          }}
        >
          ₹{item.totalRevenue.toLocaleString()}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          total earned
        </p>
      </div>

      {/* Count */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "700",
            color: "#27AE60",
          }}
        >
          {item.count}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          conversions
        </p>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          justifyContent: "flex-end",
        }}
      >
        {item.plan?.features &&
          Object.entries(item.plan.features)
            .slice(0, 2)
            .map(([k, v]) => (
              <span
                key={k}
                style={{
                  background: "#f0fdf4",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {k}: {v}
              </span>
            ))}
      </div>
    </div>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ item }) => {
  const planDisplay = (item.plan?.name || item._id)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const accentColor = item.plan?.userType === "agent" ? "#8b5cf6" : "#27AE60";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid #eef0f3",
        marginBottom: "12px",
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
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
          <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#9ca3af" }}>
            {item.plan?.category?.replace(/_/g, " ")}
          </p>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "800",
            color: "#111827",
            letterSpacing: "-0.5px",
          }}
        >
          ₹{item.totalRevenue.toLocaleString()}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {item.plan?.userType && (
          <Badge label={item.plan.userType} variant={item.plan.userType} />
        )}
        {item.plan?.tier && (
          <Badge
            label={item.plan.tier}
            variant={item.plan.tier?.toLowerCase()}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #f3f4f6",
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
            Conversions
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "14px",
              fontWeight: "800",
              color: accentColor,
            }}
          >
            {item.count}
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
            Duration
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "14px",
              fontWeight: "800",
              color: "#374151",
            }}
          >
            {item.plan?.durationDays || "—"}d
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
            Price
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "14px",
              fontWeight: "800",
              color: "#374151",
            }}
          >
            ₹{(item.plan?.price || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Config Row (extracted to fix Rules of Hooks - no hooks inside .map()) ───
const ConfigRow = ({ item, index }) => {
  const [hov, setHov] = useState(false);
  const planDisplay = (item.plan?.name || item._id)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      key={item._id}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px 1fr 100px",
        padding: "16px 28px",
        borderBottom: "1px solid #f7f8fa",
        alignItems: "center",
        background: hov ? "#fafbff" : index % 2 === 0 ? "#fff" : "#fdfdfd",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      {hov && (
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
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          {item.plan?.category?.replace(/_/g, " ")}
        </p>
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          {item.plan?.durationDays || "—"} days
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {item.plan?.features &&
          Object.entries(item.plan.features).map(([k, v]) => (
            <span
              key={k}
              style={{
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                padding: "2px 7px",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {k}: {v}
            </span>
          ))}
      </div>
      <div style={{ textAlign: "right" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "800",
            color: "#c2410c",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "monospace",
          }}
        >
          {item.plan?.tier}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RevenueByPlanPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [sortField, setSortField] = useState("totalRevenue");
  const [sortDir, setSortDir] = useState("desc");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getRevenueByPlan()
      .then((res) => {
        setRevenueData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load revenue data.");
        setLoading(false);
      });
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...revenueData].sort((a, b) => {
      let aVal = a[sortField],
        bVal = b[sortField];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [revenueData, sortField, sortDir]);

  const totalRevenue = revenueData.reduce((s, i) => s + i.totalRevenue, 0);
  const totalSales = revenueData.reduce((s, i) => s + i.count, 0);
  const avgRevPerPlan =
    revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length) : 0;
  const topPlan = revenueData.reduce(
    (top, i) => (!top || i.totalRevenue > top.totalRevenue ? i : top),
    null,
  );

  const pageStyle = {
    fontFamily: "'DM Sans', 'Manrope', system-ui, sans-serif",
    minHeight: "100vh",
    background: "#f8fafc",
    padding: isMobile ? "20px 16px" : "32px 32px",
  };

  const sortableHeaderStyle = (field) => ({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    userSelect: "none",
    color: sortField === field ? "#27AE60" : "#6b7280",
    fontWeight: "700",
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "color 0.15s",
  });

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
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
              <TrendingIcon />
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
                Revenue Analytics
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Real-time performance breakdown by subscription tier
              </p>
            </div>
          </div>

          
        </div>

        {/* ── Summary Cards ── */}
        {!loading && !error && (
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
              label="Platform Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              sub={`across ${revenueData.length} plans`}
              accent="#27AE60"
              icon={<TrendingIcon />}
            />
            <SummaryCard
              label="Total Subscriptions"
              value={totalSales.toLocaleString()}
              sub="subscriptions sold"
              accent="#3b82f6"
              icon={null}
            />
            <SummaryCard
              label="Avg Rev / Plan"
              value={`₹${avgRevPerPlan.toLocaleString()}`}
              sub="mean per plan"
              accent="#f59e0b"
              icon={null}
            />
            {topPlan && (
              <SummaryCard
                label="Top Plan"
                value={(topPlan.plan?.name || topPlan._id).split("_")[0]}
                sub={`₹${topPlan.totalRevenue.toLocaleString()} earned`}
                accent="#8b5cf6"
                icon={null}
              />
            )}
          </div>
        )}

        {/* ── Toolbar ── */}
        {!loading && !error && revenueData.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              animation: "fadeUp 0.4s ease 0.15s both",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "800",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Plan Performance
            </h2>

            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  background: "#fff",
                  border: "1px solid #eef0f3",
                  borderRadius: "12px",
                  padding: "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {[
                  { mode: "grid", Icon: GridIcon, label: "Grid" },
                  { mode: "table", Icon: ListIcon, label: "Table" },
                ].map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      background: viewMode === mode ? "#27AE60" : "transparent",
                      color: viewMode === mode ? "#fff" : "#6b7280",
                    }}
                  >
                    <Icon /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "16px",
              }}
            >
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
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

        {/* ── Grid View ── */}
        {!loading && !error && (viewMode === "grid" || isMobile) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "16px",
              animation: "fadeUp 0.4s ease 0.2s both",
              marginBottom: "32px",
            }}
          >
            {isMobile
              ? sorted.map((item) => <MobileCard key={item._id} item={item} />)
              : sorted.map((item, i) => (
                  <RevenueCard
                    key={item._id}
                    item={item}
                    total={totalRevenue}
                    index={i}
                  />
                ))}
          </div>
        )}

        {/* ── Table View ── */}
        {!loading && !error && viewMode === "table" && !isMobile && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #eef0f3",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              animation: "fadeUp 0.4s ease 0.2s both",
              marginBottom: "32px",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 130px 110px 90px",
                padding: "12px 28px",
                borderBottom: "2px solid #f3f4f6",
                background: "#fafbfc",
              }}
            >
              {[
                { label: "Plan", field: "plan" },
                { label: "Duration", field: "plan.durationDays" },
                { label: "Revenue", field: "totalRevenue" },
                { label: "Sales", field: "count" },
                { label: "Features", field: null },
              ].map(({ label, field }) => (
                <div
                  key={label}
                  onClick={() => field && handleSort(field)}
                  style={{
                    ...sortableHeaderStyle(field),
                    justifyContent:
                      label === "Features" ? "flex-end" : "flex-start",
                  }}
                >
                  {label}
                  {field && field === sortField && (
                    <ChevronIcon up={sortDir === "asc"} />
                  )}
                </div>
              ))}
            </div>

            {sorted.map((item, i) => (
              <TableRow key={item._id} item={item} index={i} />
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
                <strong style={{ color: "#374151" }}>{sorted.length}</strong>{" "}
                plans
              </p>
            </div>
          </div>
        )}

        {/* ── Plan Configurations ── */}
        {!loading && !error && revenueData.length > 0 && (
          <>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
                fontWeight: "800",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                animation: "fadeUp 0.4s ease 0.25s both",
              }}
            >
              Plan Configurations
            </h2>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                border: "1px solid #eef0f3",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                animation: "fadeUp 0.4s ease 0.3s both",
              }}
            >
              {/* Desktop */}
              {!isMobile && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 1fr 100px",
                      padding: "12px 28px",
                      borderBottom: "2px solid #f3f4f6",
                      background: "#fafbfc",
                    }}
                  >
                    {["Plan", "Duration", "Features", "Tier"].map(
                      (label, i) => (
                        <div
                          key={label}
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            textAlign: i === 3 ? "right" : "left",
                          }}
                        >
                          {label}
                        </div>
                      ),
                    )}
                  </div>
                  {revenueData.map((item, index) => (
                    <ConfigRow key={item._id} item={item} index={index} />
                  ))}
                </>
              )}

              {/* Mobile */}
              {isMobile && (
                <div>
                  {revenueData.map((item) => {
                    const planDisplay = (item.plan?.name || item._id)
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                    return (
                      <div
                        key={item._id}
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#111827",
                            }}
                          >
                            {planDisplay}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#c2410c",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {item.plan?.tier}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: "11px",
                            color: "#9ca3af",
                            fontWeight: "500",
                          }}
                        >
                          {item.plan?.durationDays} day duration
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          {item.plan?.features &&
                            Object.entries(item.plan.features).map(([k, v]) => (
                              <div
                                key={k}
                                style={{
                                  background: "#f9fafb",
                                  border: "1px solid #eef0f3",
                                  borderRadius: "8px",
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "700",
                                    color: "#9ca3af",
                                    textTransform: "uppercase",
                                    marginRight: "4px",
                                  }}
                                >
                                  {k.replace(/_/g, " ")}:
                                </span>
                                <span
                                  style={{
                                    fontWeight: "700",
                                    color: "#374151",
                                  }}
                                >
                                  {v}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueByPlanPage;
