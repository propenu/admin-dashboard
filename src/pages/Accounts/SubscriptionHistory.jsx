
import React, { useState, useEffect, useMemo } from "react";
import { getSubscriptionHistory } from "../../features/payment/paymentServices";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronIcon = ({ up }) => (
  <svg
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    style={{
      transform: up ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const EmptyIcon = () => (
  <svg
    width="48"
    height="48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    style={{ opacity: 0.3 }}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "140px 1fr 120px 120px 100px",
      gap: "0",
      padding: "20px 28px",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "center",
      animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`,
    }}
  >
    {[
      ["70%", "12px"],
      ["55%", "12px"],
      ["40%", "12px"],
      ["60%", "12px"],
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

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, variant }) => {
  const styles = {
    owner: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    member: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    annual: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    monthly: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  };
  const s = styles[variant] || styles.member;
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
const StatusChip = ({ endDate }) => {
  const now = new Date();
  const end = new Date(endDate);
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const isActive = daysLeft > 0;
  const isExpiringSoon = isActive && daysLeft <= 7;

  const config = isActive
    ? isExpiringSoon
      ? {
          label: `${daysLeft}d left`,
          bg: "#fffbeb",
          color: "#92400e",
          dot: "#f59e0b",
        }
      : { label: "Active", bg: "#f0fdf4", color: "#166534", dot: "#22c55e" }
    : { label: "Expired", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" };

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
            isActive && !isExpiringSoon ? `0 0 0 3px ${config.dot}33` : "none",
        }}
      />
      {config.label}
    </span>
  );
};

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

// ─── Table Row ────────────────────────────────────────────────────────────────
const TableRow = ({ item, index }) => {
  const [hovered, setHovered] = useState(false);

  const planDisplay = item.planCode
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const amount = item.currency === "INR" ? "₹" : item.currency;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr 120px 120px 100px",
        gap: "0",
        padding: "18px 28px",
        borderBottom: "1px solid #f7f8fa",
        alignItems: "center",
        background: hovered ? "#fafbff" : index % 2 === 0 ? "#fff" : "#fdfdfd",
        transition: "background 0.15s ease",
        cursor: "default",
        position: "relative",
      }}
    >
      {/* Hover accent line */}
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

      {/* Date */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {new Date(item.purchasedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            fontWeight: "700",
            color: "#9ca3af",
            letterSpacing: "0.08em",
          }}
        >
          #{item._id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Plan Details */}
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
          <Badge label={item.userType} variant={item.userType} />
          <Badge
            label={item.tier || "monthly"}
            variant={item.tier?.toLowerCase() || "monthly"}
          />
        </div>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "11px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          {item.category}
        </p>
      </div>

      {/* Amount */}
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
          {amount}
          {item.price.toLocaleString()}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          paid
        </p>
      </div>

      {/* Status */}
      <div>
        <StatusChip endDate={item.endDate} />
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          until{" "}
          {new Date(item.endDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </p>
      </div>

      {/* Invoice */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {item.invoiceUrl ? (
          <a
            href={item.invoiceUrl}
            target="_blank"
            rel="noreferrer"
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
              border: "none",
              cursor: "pointer",
            }}
          >
            <DownloadIcon />
            PDF
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
const MobileCard = ({ item }) => {
  const planDisplay = item.planCode
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const amount = item.currency === "INR" ? "₹" : item.currency;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid #eef0f3",
        marginBottom: "12px",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
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
          <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#9ca3af" }}>
            {item.category}
          </p>
        </div>
        <StatusChip endDate={item.endDate} />
      </div>

      {/* Badges */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <Badge label={item.userType} variant={item.userType} />
        <Badge
          label={item.tier || "monthly"}
          variant={item.tier?.toLowerCase() || "monthly"}
        />
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            {amount}
            {item.price.toLocaleString()}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#9ca3af" }}>
            {new Date(item.purchasedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            · #{item._id.slice(-8).toUpperCase()}
          </p>
        </div>
        {item.invoiceUrl ? (
          <a
            href={item.invoiceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: "700",
              background: "#27AE60",
              color: "#fff",
            }}
          >
            <DownloadIcon />
            Invoice
          </a>
        ) : (
          <span
            style={{ fontSize: "11px", color: "#d1d5db", fontStyle: "italic" }}
          >
            No Invoice
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SubscriptionHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("purchasedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getSubscriptionHistory()
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load billing history.");
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

  const filteredAndSorted = useMemo(() => {
    let data = history.filter((item) => {
      const matchesSearch =
        item.planCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userId?.includes(searchTerm) ||
        item._id.includes(searchTerm);
      const matchesFilter =
        filterType === "all" || item.userType === filterType;
      return matchesSearch && matchesFilter;
    });

    data.sort((a, b) => {
      let aVal = a[sortField],
        bVal = b[sortField];
      if (sortField === "purchasedAt" || sortField === "endDate") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (sortField === "price") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [history, searchTerm, filterType, sortField, sortDir]);

  // Summaries
  const totalSpend = history.reduce((s, i) => s + (i.price || 0), 0);
  const activeCount = history.filter(
    (i) => new Date(i.endDate) > new Date(),
  ).length;
  const currencies = [...new Set(history.map((i) => i.currency))][0] || "INR";
  const currSymbol = currencies === "INR" ? "₹" : currencies;

  // ── Styles ──
  const pageStyle = {
    fontFamily: "'DM Sans', 'Manrope', system-ui, sans-serif",
    minHeight: "100vh",
    background: "#f8fafc",
    padding: isMobile ? "20px 16px" : "32px 32px",
  };

  const containerStyle = { maxWidth: "1200px", margin: "0 auto" };

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #c4c9d4; }
        input:focus { outline: none; }
        a:hover { opacity: 0.9; }
      `}</style>

      <div style={containerStyle}>
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
              <ReceiptIcon />
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
                Billing History
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Your complete subscription & payment records
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
              label="Total Spend"
              value={`${currSymbol}${totalSpend.toLocaleString()}`}
              sub={`across ${history.length} transactions`}
              accent="#27AE60"
            />
            <SummaryCard
              label="Active Plans"
              value={activeCount}
              sub={`${history.length - activeCount} expired`}
              accent="#3b82f6"
            />
            <SummaryCard
              label="Invoices"
              value={history.filter((i) => i.invoiceUrl).length}
              sub="available to download"
              accent="#f59e0b"
            />
          </div>
        )}

        {/* ── Toolbar ── */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            flexWrap: "wrap",
            animation: "fadeUp 0.4s ease 0.15s both",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              border: "1px solid #eef0f3",
              borderRadius: "12px",
              padding: "0 14px",
              flex: 1,
              minWidth: "220px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ color: "#9ca3af", flexShrink: 0 }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search plan, user ID, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                padding: "11px 0",
                fontSize: "13px",
                color: "#374151",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "16px",
                  padding: "0",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Tabs */}
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
            {["all", "owner", "member"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  background: filterType === type ? "#27AE60" : "transparent",
                  color: filterType === type ? "#fff" : "#6b7280",
                  textTransform: "capitalize",
                }}
              >
                {type === "all"
                  ? "All"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Table ── */}
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
          {/* Loading */}
          {loading && (
            <div>
              <div
                style={{
                  padding: "18px 28px",
                  borderBottom: "1px solid #f0f2f5",
                }}
              >
                <div
                  style={{
                    height: "10px",
                    width: "30%",
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

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
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
                style={{
                  margin: "8px 0 0",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                Please try refreshing the page.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAndSorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
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
                {searchTerm ? "No results found" : "No billing history yet"}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "13px",
                  color: "#9ca3af",
                }}
              >
                {searchTerm
                  ? `No records matching "${searchTerm}"`
                  : "Your subscription records will appear here"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    marginTop: "16px",
                    padding: "8px 20px",
                    borderRadius: "10px",
                    background: "#f3f4f6",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    fontFamily: "inherit",
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && filteredAndSorted.length > 0 && !isMobile && (
            <>
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 120px 120px 100px",
                  padding: "12px 28px",
                  borderBottom: "2px solid #f3f4f6",
                  background: "#fafbfc",
                }}
              >
                {[
                  { label: "Date", field: "purchasedAt" },
                  { label: "Plan", field: "planCode" },
                  { label: "Amount", field: "price" },
                  { label: "Status", field: "endDate" },
                  { label: "Invoice", field: null },
                ].map(({ label, field }) => (
                  <div
                    key={label}
                    onClick={() => field && handleSort(field)}
                    style={{
                      ...sortableHeaderStyle(field),
                      justifyContent:
                        label === "Invoice" ? "flex-end" : "flex-start",
                    }}
                  >
                    {label}
                    {field && field === sortField && (
                      <ChevronIcon up={sortDir === "asc"} />
                    )}
                  </div>
                ))}
              </div>

              {/* Table Body */}
              {filteredAndSorted.map((item, index) => (
                <TableRow key={item._id} item={item} index={index} />
              ))}
            </>
          )}

          {/* Mobile Cards */}
          {!loading && !error && filteredAndSorted.length > 0 && isMobile && (
            <div style={{ padding: "16px" }}>
              {filteredAndSorted.map((item) => (
                <MobileCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {/* Footer count */}
          {!loading && !error && filteredAndSorted.length > 0 && (
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
                  {filteredAndSorted.length}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "#374151" }}>{history.length}</strong>{" "}
                records
              </p>
              {filterType !== "all" || searchTerm ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#27AE60",
                    fontWeight: "600",
                    fontFamily: "inherit",
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHistoryPage;