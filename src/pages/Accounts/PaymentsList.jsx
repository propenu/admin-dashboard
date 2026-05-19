// src/features/payment/PaymentsList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentsList } from "../../features/payment/paymentServices";
import {
  ArrowLeftRight,
  RefreshCw,
  FileX,
  ChevronRight,
} from "lucide-react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const TransactionIcon = () => <ArrowLeftRight size={20} strokeWidth={1.5} />;
const RefreshIcon = () => <RefreshCw size={14} strokeWidth={2} />;
const EmptyIcon = () => (
  <FileX size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
);

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f5f6fa",
  card: "#ffffff",
  border: "#eaecf0",
  accent: "#27AE60",
  accentLight: "#e8f8ef",
  accentDark: "#1e8449",
  text: "#111827",
  sub: "#6b7280",
  muted: "#9ca3af",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div
    style={{
      padding: "16px 20px",
      borderBottom: `1px solid #f0f2f5`,
      animation: `pulse 1.5s ease-in-out ${index * 0.08}s infinite`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <div style={{ display: "flex", gap: "12px", flex: 1, alignItems: "center" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0f2f5", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ width: "45%", height: "12px", background: "#f0f2f5", borderRadius: "6px" }} />
          <div style={{ width: "60%", height: "10px", background: "#f0f2f5", borderRadius: "6px" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
        <div style={{ width: "60px", height: "12px", background: "#f0f2f5", borderRadius: "6px" }} />
        <div style={{ width: "48px", height: "20px", background: "#f0f2f5", borderRadius: "99px" }} />
      </div>
    </div>
  </div>
);

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const isPaid = status === "paid";
  const cfg = isPaid
    ? { label: "Paid", bg: C.accentLight, color: C.accentDark, dot: C.accent }
    : { label: "Failed", bg: C.dangerLight, color: "#991b1b", dot: C.danger };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "10px",
        fontWeight: "700",
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
          boxShadow: isPaid ? `0 0 0 3px ${cfg.dot}33` : "none",
        }}
      />
      {cfg.label}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: C.card,
      borderRadius: "14px",
      padding: "16px 18px",
      border: `1px solid ${C.border}`,
      flex: 1,
      minWidth: "130px",
      borderLeft: `3px solid ${accent}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}
  >
    <p style={{ margin: 0, fontSize: "10px", fontWeight: "700", color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {label}
    </p>
    <p style={{ margin: "5px 0 2px", fontSize: "20px", fontWeight: "800", color: C.text, letterSpacing: "-0.5px" }}>
      {value}
    </p>
    {sub && <p style={{ margin: 0, fontSize: "11px", color: C.muted, fontWeight: "500" }}>{sub}</p>}
  </div>
);

// ─── Payment Row (mobile-first card style) ────────────────────────────────────
const PaymentRow = ({ payment, onClick, index }) => {
  const [hovered, setHovered] = useState(false);
  const d = new Date(payment.createdAt);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "14px 20px",
        borderBottom: `1px solid #f7f8fa`,
        background: hovered ? "#f0fdf4" : index % 2 === 0 ? C.card : "#fdfdfd",
        cursor: "pointer",
        transition: "background 0.15s ease",
        position: "relative",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "3px",
            background: C.accent,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Avatar */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${C.accent}22, ${C.accent}44)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "800",
            color: C.accentDark,
            flexShrink: 0,
          }}
        >
          {(payment.userId?.name || "?")[0].toUpperCase()}
        </div>

        {/* Middle content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {payment.userId?.name || "Unknown User"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "10px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {payment.userId?.email || payment.userId?.phone || "—"}
              </p>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: C.text, letterSpacing: "-0.3px" }}>
                ₹{(payment.amount || 0).toLocaleString()}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "10px", color: C.muted }}>
                {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}>
              <StatusChip status={payment.status} />
              {payment.planId?.name && (
                <span style={{ fontSize: "10px", color: C.muted, fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>
                  {payment.planId.name}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              {payment.userId?._id && (
                <span style={{ fontSize: "10px", color: C.accent, fontWeight: "700" }}>View</span>
              )}
              <ChevronRight size={13} color={C.muted} />
            </div>
          </div>

          {/* Location */}
          {(payment.userId?.city || payment.userId?.locality) && (
            <p style={{ margin: "4px 0 0", fontSize: "10px", color: C.muted }}>
              📍 {[payment.userId?.locality, payment.userId?.city, payment.userId?.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentsList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("paid");

  const fetchPayments = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsList(status);
      setPayments(res?.data?.data || []);
    } catch (err) {
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(currentStatus);
  }, [currentStatus, fetchPayments]);

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const handleRowClick = (payment) => {
    const uid = payment.userId?._id;
    if (uid) {
      navigate(`/dashboard/users/${uid}`);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Manrope', system-ui, sans-serif",
        minHeight: "100vh",
        background: C.bg,
        padding: "24px 16px 40px",
      }}
    >
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "12px",
            animation: "fadeUp 0.35s ease forwards",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px", height: "40px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
              }}
            >
              <TransactionIcon />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: C.text, letterSpacing: "-0.4px" }}>
                Transactions
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: C.muted, fontWeight: "500" }}>
                Tap a row to view user details
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Toggle */}
            <div style={{ display: "flex", gap: "3px", background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "3px" }}>
              {["paid", "failed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStatus(s)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "7px",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    background: currentStatus === s
                      ? (s === "paid" ? C.accent : C.danger)
                      : "transparent",
                    color: currentStatus === s ? "#fff" : C.muted,
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchPayments(currentStatus)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "700",
                color: "#fff",
                fontFamily: "inherit",
                boxShadow: `0 2px 8px ${C.accent}33`,
              }}
            >
              <RefreshIcon /> Refresh
            </button>
          </div>
        </div>

        {/* ── Summary ── */}
        {!loading && !error && payments.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", animation: "fadeUp 0.35s ease 0.08s both" }}>
            <SummaryCard label="Total Volume" value={`₹${totalAmount.toLocaleString()}`} sub={`${payments.length} transactions`} accent={C.accent} />
            <SummaryCard
              label={currentStatus === "paid" ? "Successful" : "Failed"}
              value={payments.length}
              sub={`${currentStatus} payments`}
              accent={currentStatus === "paid" ? C.accent : C.danger}
            />
          </div>
        )}

        {/* ── Table card ── */}
        <div
          style={{
            background: C.card,
            borderRadius: "16px",
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.35s ease 0.15s both",
          }}
        >
          {loading && (
            <>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid #f0f2f5`, background: "#fafbfc" }}>
                <div style={{ height: "10px", width: "20%", background: "#f0f2f5", borderRadius: "6px" }} />
              </div>
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} index={i} />)}
            </>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: C.danger, fontWeight: "700" }}>{error}</p>
              <p style={{ margin: "6px 0 0", fontSize: "11px", color: C.muted }}>Please try refreshing.</p>
            </div>
          )}

          {!loading && !error && payments.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <EmptyIcon />
              </div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: C.sub }}>
                No {currentStatus} transactions
              </p>
              <p style={{ margin: "5px 0 0", fontSize: "12px", color: C.muted }}>
                No records found for <strong>{currentStatus}</strong> status
              </p>
            </div>
          )}

          {!loading && !error && payments.length > 0 && (
            <>
              {/* Column header (desktop hint) */}
              <div
                style={{
                  padding: "10px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  background: "#fafbfc",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  User / Payment
                </span>
                <span style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Amount / Date
                </span>
              </div>

              {payments.map((payment, index) => (
                <PaymentRow
                  key={payment._id}
                  payment={payment}
                  index={index}
                  onClick={() => handleRowClick(payment)}
                />
              ))}

              {/* Footer */}
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: C.muted, fontWeight: "500" }}>
                  Showing <strong style={{ color: C.sub }}>{payments.length}</strong> results
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;