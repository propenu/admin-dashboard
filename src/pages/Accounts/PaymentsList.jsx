import React, { useState, useEffect, useCallback } from "react";
import { getPaymentsList } from "../../features/payment/paymentServices";
import {
  ArrowLeftRight,
  Upload,
  RefreshCw,
  FileX,
  ChevronDown,
} from "lucide-react";

// ─── Icon wrappers ────────────────────────────────────────────────────────────
const TransactionIcon = () => <ArrowLeftRight size={20} strokeWidth={1.5} />;
const ExportIcon = () => <Upload size={14} strokeWidth={2} />;
const RefreshIcon = () => <RefreshCw size={14} strokeWidth={2} />;
const EmptyIcon = () => (
  <FileX size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "140px 160px 130px 1fr 110px",
      gap: "0",
      padding: "20px 28px",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "center",
      animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`,
    }}
  >
    {[
      ["60%", "12px"],
      ["50%", "12px"],
      ["40%", "12px"],
      ["55%", "12px"],
      ["35%", "12px"],
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

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const isPaid = status === "paid";
  const config = isPaid
    ? { label: "Paid", bg: "#f0fdf4", color: "#166534", dot: "#22c55e" }
    : { label: "Failed", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" };

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
          boxShadow: isPaid ? `0 0 0 3px ${config.dot}33` : "none",
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

// ─── Desktop Row ──────────────────────────────────────────────────────────────
const DesktopRow = ({ payment, index }) => {
  const [hovered, setHovered] = useState(false);
  const d = new Date(payment.createdAt);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "140px 160px 130px 1fr 110px",
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
          {d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "11px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* User */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: "600",
            color: "#374151",
            fontFamily: "monospace",
          }}
        >
          {payment.userId?.slice(-10) || "—"}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          user id
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
          {payment.currency === "INR" ? "₹" : payment.currency}
          {payment.amount?.toLocaleString()}
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

      {/* Gateway ID */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: "600",
            fontFamily: "monospace",
            color: payment.razorpayPaymentId ? "#3b82f6" : "#d1d5db",
          }}
        >
          {payment.razorpayPaymentId || "—"}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          {payment.razorpayPaymentId ? "razorpay id" : "no gateway id"}
        </p>
      </div>

      {/* Status */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <StatusChip status={payment.status} />
      </div>
    </div>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ payment }) => {
  const d = new Date(payment.createdAt);
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
      {/* Top */}
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
            {d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9ca3af" }}>
            {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <StatusChip status={payment.status} />
      </div>

      {/* Amount */}
      <p
        style={{
          margin: "0 0 10px",
          fontSize: "18px",
          fontWeight: "800",
          color: "#111827",
          letterSpacing: "-0.5px",
        }}
      >
        {payment.currency === "INR" ? "₹" : payment.currency}
        {payment.amount?.toLocaleString()}
      </p>

      {/* Bottom */}
      <div style={{ paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: "11px",
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          User: {payment.userId?.slice(-10) || "—"}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#3b82f6",
            fontFamily: "monospace",
          }}
        >
          {payment.razorpayPaymentId || "No gateway ID"}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("paid");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPayments = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsList(status);
      setPayments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(currentStatus);
  }, [currentStatus, fetchPayments]);

  // Summaries
  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const currency =
    payments[0]?.currency === "INR" ? "₹" : payments[0]?.currency || "₹";

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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
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
          {/* Title */}
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
              <TransactionIcon />
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
                Transactions
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Managing{" "}
                <strong style={{ color: "#374151" }}>{currentStatus}</strong>{" "}
                payment records
              </p>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Status Toggle */}
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
              {["paid", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setCurrentStatus(status)}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    background:
                      currentStatus === status ? "#27AE60" : "transparent",
                    color: currentStatus === status ? "#fff" : "#6b7280",
                    textTransform: "capitalize",
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            

            {/* Refresh */}
            <button
              onClick={() => fetchPayments(currentStatus)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #27AE60, #16a34a)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
                color: "#fff",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px #27AE6033",
              }}
            >
              <RefreshIcon /> Refresh
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        {!loading && !error && payments.length > 0 && (
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
              label="Total Volume"
              value={`${currency}${totalAmount.toLocaleString()}`}
              sub={`${payments.length} transactions`}
              accent="#27AE60"
            />
            <SummaryCard
              label={currentStatus === "paid" ? "Successful" : "Failed"}
              value={payments.length}
              sub={`${currentStatus} payments`}
              accent={currentStatus === "paid" ? "#22c55e" : "#ef4444"}
            />
            <SummaryCard
              label="Avg Transaction"
              value={`${currency}${payments.length > 0 ? Math.round(totalAmount / payments.length).toLocaleString() : 0}`}
              sub="per payment"
              accent="#f59e0b"
            />
          </div>
        )}

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
                    width: "25%",
                    background: "#f0f2f5",
                    borderRadius: "6px",
                  }}
                />
              </div>
              {[...Array(6)].map((_, i) => (
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
                Please try refreshing.
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && payments.length === 0 && (
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
                No {currentStatus} transactions
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "13px",
                  color: "#9ca3af",
                }}
              >
                No records found for <strong>{currentStatus}</strong> status
              </p>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && payments.length > 0 && !isMobile && (
            <>
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 160px 130px 1fr 110px",
                  padding: "12px 28px",
                  borderBottom: "2px solid #f3f4f6",
                  background: "#fafbfc",
                }}
              >
                {[
                  { label: "Date" },
                  { label: "User" },
                  { label: "Amount" },
                  { label: "Gateway ID" },
                  { label: "Status", right: true },
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
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: right ? "flex-end" : "flex-start",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {payments.map((payment, index) => (
                <DesktopRow key={payment._id} payment={payment} index={index} />
              ))}
            </>
          )}

          {/* Mobile Cards */}
          {!loading && !error && payments.length > 0 && isMobile && (
            <div style={{ padding: "16px" }}>
              {payments.map((payment) => (
                <MobileCard key={payment._id} payment={payment} />
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && !error && payments.length > 0 && (
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
                <strong style={{ color: "#374151" }}>{payments.length}</strong>{" "}
                results
              </p>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;
