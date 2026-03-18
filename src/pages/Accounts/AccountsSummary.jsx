// import React, { useEffect, useState } from "react";
// import { getAccountsSummary } from "../../features/payment/paymentServices";
// import LoadingSpinner from "../../components/common/LoadingSpinner";

// const DashboardPage = () => {
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getAccountsSummary()
//       .then((res) => setSummary(res.data))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[60vh] text-lg font-medium text-gray-600">
//        <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen  p-1 sm:p-6 lg:p-2">
//       <h2 className="text-2xl font-semibold text-[#27AE60] mb-6">
//         Business Overview
//       </h2>

//       {/* Responsive Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//         <StatCard
//           title="Total Revenue"
//           value={`₹${summary.totalRevenue.toLocaleString()}`}
//           borderColor="border-blue-500"
//         />

//         <StatCard
//           title="Today's Revenue"
//           value={`₹${summary.todayRevenue}`}
//           borderColor="border-green-500"
//         />

//         <StatCard
//           title="Active Subscriptions"
//           value={summary.activeSubscriptions}
//           borderColor="border-cyan-500"
//         />

//         <StatCard
//           title="Failed Payments"
//           value={summary.failedPayments}
//           borderColor={
//             summary.failedPayments > 0 ? "border-red-500" : "border-gray-300"
//           }
//         />
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, borderColor }) => {
//   return (
//     <div
//       className={`bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 p-6 border-l-4 ${borderColor}`}
//     >
//       <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//         {title}
//       </p>

//       <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
//     </div>
//   );
// };

// export default DashboardPage;

import React, { useEffect, useState } from "react";
import { getAccountsSummary } from "../../features/payment/paymentServices";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  BadgeCheck,
  XCircle,
} from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "20px 24px",
      border: "1px solid #eef0f3",
      borderLeft: "3px solid #f0f2f5",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`,
    }}
  >
    <div
      style={{
        height: "10px",
        width: "55%",
        background: "#f0f2f5",
        borderRadius: "6px",
        marginBottom: "14px",
      }}
    />
    <div
      style={{
        height: "22px",
        width: "40%",
        background: "#f0f2f5",
        borderRadius: "6px",
      }}
    />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, accent, icon: Icon, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px 24px",
        border: `1px solid ${hovered ? accent + "40" : "#eef0f3"}`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: hovered
          ? `0 8px 24px ${accent}18`
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        animation: `fadeUp 0.4s ease ${index * 0.08}s both`,
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
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
          {title}
        </p>
        <span
          style={{
            color: accent,
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.2s",
          }}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "26px",
          fontWeight: "800",
          color: "#111827",
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountsSummary()
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

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
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
            animation: "fadeUp 0.4s ease forwards",
          }}
        >
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
            <LayoutDashboard size={20} strokeWidth={1.5} />
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
              Business Overview
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              Real-time snapshot of your platform metrics
            </p>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
              gap: "16px",
              animation: "fadeUp 0.3s ease forwards",
            }}
          >
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            <StatCard
              title="Total Revenue"
              value={`₹${summary.totalRevenue.toLocaleString()}`}
              accent="#3b82f6"
              icon={TrendingUp}
              index={0}
            />
            <StatCard
              title="Today's Revenue"
              value={`₹${Number(summary.todayRevenue).toLocaleString()}`}
              accent="#27AE60"
              icon={CalendarCheck}
              index={1}
            />
            <StatCard
              title="Active Subscriptions"
              value={summary.activeSubscriptions.toLocaleString()}
              accent="#8b5cf6"
              icon={BadgeCheck}
              index={2}
            />
            <StatCard
              title="Failed Payments"
              value={summary.failedPayments.toLocaleString()}
              accent={summary.failedPayments > 0 ? "#ef4444" : "#9ca3af"}
              icon={XCircle}
              index={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;