// src/features/users/components/PaymentsSection.jsx
import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import AccordionSection from "./AccordionSection";
import {
  C,
  Badge,
  StatPill,
  Skel,
  Empty,
  TabToggle,
  fmt,
  fmtDate,
  fmtTime,
} from "./shared";
import { useUserPayments } from "../../UserInformationCenter/useUserDetail";

const PaymentCard = ({ p }) => (
  <div
    style={{
      borderRadius: "12px",
      border: `1px solid ${C.border}`,
      padding: "14px",
      background: "#fafbfc",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "10px",
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "800",
          color: C.text,
          letterSpacing: "-0.4px",
        }}
      >
        ₹{fmt(p.amount)}
      </p>
      <p
        style={{
          margin: "3px 0 0",
          fontSize: "10px",
          color: C.muted,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {p.razorpayPaymentId || "No Gateway ID"}
      </p>
      <p style={{ margin: "3px 0 0", fontSize: "10px", color: C.muted }}>
        {fmtDate(p.createdAt)} · {fmtTime(p.createdAt)}
      </p>
      {p.planId && (
        <p
          style={{
            margin: "5px 0 0",
            fontSize: "10px",
            fontWeight: "700",
            color: C.info,
          }}
        >
          {p.planId.name} · {p.planId.tier}
        </p>
      )}
      {p.userType && (
        <p style={{ margin: "2px 0 0", fontSize: "10px", color: C.muted }}>
          Type: <strong style={{ color: C.sub }}>{p.userType}</strong>
        </p>
      )}
    </div>
    <Badge status={p.status} />
  </div>
);

// ─── Inner content (reused by both flat and accordion) ────────────────────────
const PaymentsContent = ({ userId }) => {
  const [status, setStatus] = useState("paid");
  const { data: payments = [], isLoading } = useUserPayments(userId, status);
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <>
      <div style={{ marginBottom: "14px" }}>
        <TabToggle
          options={[
            { key: "paid", label: "✓ Paid" },
            { key: "failed", label: "✗ Failed" },
          ]}
          active={status}
          onChange={setStatus}
          activeColor={status === "paid" ? C.accent : C.danger}
        />
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map((i) => (
            <Skel key={i} h="100px" radius="12px" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Empty
          msg={`No ${status} payments found`}
          icon={status === "paid" ? "💳" : "❌"}
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <StatPill
              label="Total Amount"
              value={`₹${fmt(total)}`}
              color={status === "paid" ? C.accent : C.danger}
              icon="💰"
            />
            <StatPill
              label="Transactions"
              value={payments.length}
              color={C.info}
              icon="🧾"
            />
            <StatPill
              label="Avg Amount"
              value={`₹${fmt(Math.round(total / payments.length))}`}
              color={C.purple}
              icon="📊"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {payments.map((p) => (
              <PaymentCard key={p._id} p={p} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

// flat=true → no accordion wrapper (used in two-panel layout)
const PaymentsSection = ({ userId, flat }) => {
  const { data: payments = [] } = useUserPayments(userId, "paid");

  if (flat) return <PaymentsContent userId={userId} />;

  return (
    <AccordionSection
      title="Payments"
      icon={CreditCard}
      accent={C.accent}
      badge={payments.length || undefined}
    >
      <PaymentsContent userId={userId} />
    </AccordionSection>
  );
};

export default PaymentsSection;
