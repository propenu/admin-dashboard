// src/features/users/components/SubscriptionsSection.jsx
import React, { useState } from "react";
import { Package, FileText, ExternalLink } from "lucide-react";
import AccordionSection from "./AccordionSection";
import { C, Badge, Skel, Empty, TabToggle, fmt, fmtDate } from "./shared";
import {
  useUserSubscriptions,
  useUserSubscriptionHistory,
} from "../useUserDetail";

const SubCard = ({ s }) => {
  const isActive = s.status === "active";
  const daysLeft = isActive
    ? Math.max(0, Math.ceil((new Date(s.endDate) - Date.now()) / 86400000))
    : null;

  return (
    <div
      style={{
        borderRadius: "12px",
        border: `1px solid ${isActive ? C.accent + "50" : C.border}`,
        padding: "14px",
        background: isActive ? C.accentLight + "50" : "#fafbfc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
          gap: "8px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: "800",
              color: C.text,
              letterSpacing: "-0.2px",
            }}
          >
            {s.planCode || "—"}
          </p>
          <div
            style={{
              display: "flex",
              gap: "5px",
              marginTop: "5px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "99px",
                background: C.purpleLight,
                color: C.purple,
              }}
            >
              {s.tier?.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "99px",
                background: C.infoLight,
                color: C.info,
              }}
            >
              {s.category?.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "99px",
                background: "#f1f5f9",
                color: C.sub,
              }}
            >
              {s.userType}
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <Badge status={s.status} />
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "16px",
              fontWeight: "800",
              color: C.text,
            }}
          >
            ₹{fmt(s.price)}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          padding: "10px",
          background: "rgba(0,0,0,0.03)",
          borderRadius: "8px",
          marginBottom: "8px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "9px",
              fontWeight: "700",
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Start
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              fontWeight: "700",
              color: C.sub,
            }}
          >
            {fmtDate(s.startDate)}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "9px",
              fontWeight: "700",
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            End
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              fontWeight: "700",
              color: isActive ? C.accent : C.sub,
            }}
          >
            {fmtDate(s.endDate)}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isActive && daysLeft !== null ? (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: daysLeft <= 7 ? C.danger : C.accent,
              background: daysLeft <= 7 ? C.dangerLight : C.accentLight,
              padding: "3px 9px",
              borderRadius: "99px",
            }}
          >
            {daysLeft} days left
          </span>
        ) : (
          <span />
        )}
        {s.invoiceUrl && (
          <a
            href={s.invoiceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10px",
              fontWeight: "700",
              color: C.info,
              textDecoration: "none",
              padding: "3px 9px",
              background: C.infoLight,
              borderRadius: "99px",
            }}
          >
            <FileText size={10} /> Invoice <ExternalLink size={9} />
          </a>
        )}
      </div>
    </div>
  );
};

const SubscriptionsContent = ({ userId }) => {
  const [tab, setTab] = useState("active");
  const { data: subs = [], isLoading: subsLoading } =
    useUserSubscriptions(userId);
  const { data: history = [], isLoading: histLoading } =
    useUserSubscriptionHistory(userId);
  const list = tab === "active" ? subs : history;
  const loading = tab === "active" ? subsLoading : histLoading;

  return (
    <>
      <div style={{ marginBottom: "14px" }}>
        <TabToggle
          options={[
            { key: "active", label: "Active" },
            { key: "history", label: "History" },
          ]}
          active={tab}
          onChange={setTab}
          activeColor={C.info}
        />
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2].map((i) => (
            <Skel key={i} h="150px" radius="12px" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Empty msg={`No ${tab} subscriptions`} icon="📦" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {list.map((s) => (
            <SubCard key={s._id} s={s} />
          ))}
        </div>
      )}
    </>
  );
};

const SubscriptionsSection = ({ userId, flat }) => {
  const { data: subs = [] } = useUserSubscriptions(userId);

  if (flat) return <SubscriptionsContent userId={userId} />;

  return (
    <AccordionSection
      title="Subscriptions"
      icon={Package}
      accent={C.info}
      badge={subs.length || undefined}
    >
      <SubscriptionsContent userId={userId} />
    </AccordionSection>
  );
};

export default SubscriptionsSection;
