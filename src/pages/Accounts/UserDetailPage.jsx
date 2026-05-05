// src/features/users/UserDetailPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Package,
  Star,
  Home,
  User,
  ChevronRight,
} from "lucide-react";

import { useUserById } from "./useUserDetail";
import { C, GlobalStyles, Badge, Skel, fmtDate } from "./components/shared";
import UserProfileCard from "./components/UserProfileCard";
import PaymentsSection from "./components/PaymentsSection";
import SubscriptionsSection from "./components/SubscriptionsSection";
import FeaturedProjectsSection from "./components/FeaturedProjectsSection";
import PropertiesSection from "./components/PropertiesSection";

// ─── Nav items config ─────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   { key: "profile", label: "Profile", icon: User, color: C.accent },
//   { key: "payments", label: "Payments", icon: CreditCard, color: C.accent },
//   {
//     key: "subscriptions",
//     label: "Subscriptions",
//     icon: Package,
//     color: C.info,
//   },
//   { key: "featured", label: "Featured Projects", icon: Star, color: C.warn },
//   { key: "properties", label: "Properties", icon: Home, color: C.purple },
// ];


// const getNavItemsByRole = (role) => {
//   const base = [
//     { key: "profile", label: "Profile", icon: User, color: C.accent },
//     { key: "payments", label: "Payments", icon: CreditCard, color: C.accent },
//     {
//       key: "subscriptions",
//       label: "Subscriptions",
//       icon: Package,
//       color: C.info,
//     },
//   ];

//   if (role === "user") {
//     return [
//       ...base,
//       { key: "properties", label: "Properties", icon: Home, color: C.purple },
//     ];
//   }

//   if (role === "builder") {
//     return [
//       ...base,
//       {
//         key: "featured",
//         label: "Projects",
//         icon: Star,
//         color: C.warn,
//       },
//     ];
//   }

//   // default (admin, others)
//   return [
//     ...base,
//     { key: "featured", label: "Projects", icon: Star, color: C.warn },
//     { key: "properties", label: "Properties", icon: Home, color: C.purple },
//   ];
// };

const getNavItemsByRole = (role) => {
  // ── Always available ──
  const profile = {
    key: "profile",
    label: "Profile",
    icon: User,
    color: C.accent,
  };

  const payments = {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    color: C.accent,
  };

  const subscriptions = {
    key: "subscriptions",
    label: "Subscriptions",
    icon: Package,
    color: C.info,
  };

  const projects = {
    key: "featured",
    label: "Projects",
    icon: Star,
    color: C.warn,
  };

  const properties = {
    key: "properties",
    label: "Properties",
    icon: Home,
    color: C.purple,
  };

  // ── Role groups ──
  const SALES_ROLES = [
    "sales_manager",
    "sales_agent",
    "agent",
    "customer_care",
  ];

  // ── USER ──
  if (role === "user") {
    return [profile, payments, subscriptions, properties];
  }

  // ── BUILDER ──
  if (role === "builder") {
    return [profile, payments, subscriptions, projects];
  }

  // ── SALES TEAM ──
  if (SALES_ROLES.includes(role)) {
    return [profile, projects, properties];
  }

  // ── ACCOUNTS TEAM ──
  if (role === "accounts") {
    return [profile, payments, subscriptions];
  }

  // ── DEFAULT (admin, super_admin, etc.) ──
  return [profile, payments, subscriptions, projects, properties];
};

// ─── Left sidebar nav item ────────────────────────────────────────────────────
const NavItem = ({ item, active, onClick, badge }) => {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <button
      onClick={() => onClick(item.key)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "12px 14px",
        borderRadius: "12px",
        border: "none",
        background: isActive ? item.color + "14" : "transparent",
        cursor: "pointer",
        fontFamily: "'Outfit', system-ui, sans-serif",
        transition: "all 0.15s",
        marginBottom: "4px",
        outline: isActive ? `1.5px solid ${item.color}30` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: isActive ? item.color + "20" : "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          <Icon
            size={16}
            color={isActive ? item.color : C.muted}
            strokeWidth={2.2}
          />
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: isActive ? "700" : "600",
            color: isActive ? item.color : C.sub,
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0,
        }}
      >
        {badge !== undefined && badge > 0 && (
          <span
            style={{
              padding: "2px 7px",
              borderRadius: "99px",
              fontSize: "10px",
              fontWeight: "700",
              background: isActive ? item.color + "20" : "#f1f5f9",
              color: isActive ? item.color : C.muted,
            }}
          >
            {badge}
          </span>
        )}
        <ChevronRight
          size={14}
          color={isActive ? item.color : C.muted}
          style={{ opacity: isActive ? 1 : 0.4 }}
        />
      </div>
    </button>
  );
};

// ─── Mobile bottom nav tab ────────────────────────────────────────────────────
const MobileTab = ({ item, active, onClick }) => {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <button
      onClick={() => onClick(item.key)}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        padding: "8px 4px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "9px",
          background: isActive ? item.color + "20" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          size={16}
          color={isActive ? item.color : C.muted}
          strokeWidth={2.2}
        />
      </div>
      <span
        style={{
          fontSize: "9px",
          fontWeight: "700",
          color: isActive ? item.color : C.muted,
        }}
      >
        {item.label.split(" ")[0]}
      </span>
    </button>
  );
};

// ─── Right panel content renderer ─────────────────────────────────────────────
const PanelContent = ({ activeKey, userId, user, userLoading }) => {
  switch (activeKey) {
    case "profile":
      return (
        <div>
          <PanelHeader title="User Profile" subtitle="Full profile details" />
          <UserProfileCard user={user} loading={userLoading} />
        </div>
      );
    case "payments":
      return (
        <div>
          <PanelHeader title="Payments" subtitle="All payment transactions" />
          <PaymentsSection userId={userId} flat />
        </div>
      );
    case "subscriptions":
      return (
        <div>
          <PanelHeader
            title="Subscriptions"
            subtitle="Active & past subscriptions"
          />
          <SubscriptionsSection userId={userId} flat />
        </div>
      );
    case "featured":
      return (
        <div>
          <PanelHeader
            title="Featured Projects"
            subtitle="All featured, prime, normal & sponsored"
          />
          <FeaturedProjectsSection userId={userId} flat />
        </div>
      );
    case "properties":
      return (
        <div>
          <PanelHeader
            title="Properties"
            subtitle="Residential, commercial, land & agricultural"
          />
          <PropertiesSection userId={userId} flat />
        </div>
      );
    default:
      return null;
  }
};

const PanelHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: "16px" }}>
    <h2
      style={{
        margin: 0,
        fontSize: "18px",
        fontWeight: "800",
        color: C.text,
        letterSpacing: "-0.4px",
      }}
    >
      {title}
    </h2>
    <p
      style={{
        margin: "3px 0 0",
        fontSize: "12px",
        color: C.muted,
        fontWeight: "500",
      }}
    >
      {subtitle}
    </p>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUserById(userId);
  const [activeSection, setActiveSection] = useState("profile");

  const navItems = getNavItemsByRole(user?.roleName);

  return (
    <div
      style={{
        fontFamily: "'Outfit', system-ui, sans-serif",
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GlobalStyles />

      {/* ── Top header bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: `1px solid ${C.border}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} color={C.text} strokeWidth={2.5} />
        </button>

        {/* User mini info in header */}
        {userLoading ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Skel w="36px" h="36px" radius="10px" />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <Skel w="120px" h="14px" />
              <Skel w="80px" h="10px" />
            </div>
          </div>
        ) : user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                flexShrink: 0,
              }}
            >
              {(user.name || "?")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "800",
                  color: C.text,
                  letterSpacing: "-0.3px",
                }}
              >
                {user.name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "2px",
                }}
              >
                {/* <Badge
                  status={
                    // user.accountStatus === "active"
                    //   ? "active"
                    //   : user.accountStatus === "kyc_pending"
                    //     ? "kyc_pending"
                    //     : "inactive"
                    user.accountStatus === "active"
                      ? "active"
                      : user.accountStatus === "kyc_pending"
                        ? "kyc_pending"
                        : user.accountStatus === "location_pending"
                          ? "location_pending"
                          : user.accountStatus === "pending"
                            ? "pending"
                            : "inactive"
                  }
                /> */}
                {user.accountStatus && <Badge status={user.accountStatus} />}
                <span
                  style={{
                    fontSize: "10px",
                    color: C.muted,
                    fontWeight: "600",
                  }}
                >
                  {user.roleName?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "800",
                color: C.text,
              }}
            >
              User Details
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: C.muted }}>
              Loading…
            </p>
          </div>
        )}
      </div>

      {/* ── Two-panel layout ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: "20px 20px 40px",
          gap: "18px",
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT sidebar ── */}
        <div
          style={{
            width: "220px",
            flexShrink: 0,
            position: "sticky",
            top: "76px" /* below header */,
            background: C.card,
            borderRadius: "16px",
            border: `1px solid ${C.border}`,
            padding: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
          className="sidebar-desktop"
        >
          {/* User mini card inside sidebar */}
          {user && (
            <div
              style={{
                padding: "12px",
                background: C.bg,
                borderRadius: "10px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "900",
                  margin: "0 auto 8px",
                }}
              >
                {(user.name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "800",
                  color: C.text,
                  letterSpacing: "-0.2px",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: "2px 0 6px",
                  fontSize: "10px",
                  color: C.muted,
                }}
              >
                {user.city || "—"}, {user.state || ""}
              </p>
              {/* <Badge
                status={
                  // user.accountStatus === "active"
                  //   ? "active"
                  //   : user.accountStatus === "kyc_pending"
                  //     ? "kyc_pending"
                  //     : "inactive"
                  user.accountStatus === "active"
                    ? "active"
                    : user.accountStatus === "kyc_pending"
                      ? "kyc_pending"
                      : user.accountStatus === "location_pending"
                        ? "location_pending"
                        : user.accountStatus === "pending"
                          ? "pending"
                          : "inactive"
                }
              /> */}
              {user.accountStatus && <Badge status={user.accountStatus} />}
            </div>
          )}
          {userLoading && (
            <div
              style={{
                padding: "12px",
                background: C.bg,
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            >
              <Skel w="48px" h="48px" radius="14px" />
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Skel h="12px" w="80%" />
                <Skel h="10px" w="60%" />
              </div>
            </div>
          )}
          {/* Nav items */}

          {navItems.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeSection}
              onClick={setActiveSection}
            />
          ))}
        </div>

        {/* ── RIGHT content panel ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            animation: "fadeUp 0.25s ease forwards",
          }}
          key={activeSection} /* re-animate on tab change */
        >
          <PanelContent
            activeKey={activeSection}
            userId={userId}
            user={user}
            userLoading={userLoading}
          />
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div
        className="mobile-tabs"
        style={{
          display: "none" /* shown via media query below */,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${C.border}`,
          padding: "4px 8px 8px",
        }}
      >
        {navItems.map((item) => (
          <MobileTab
            key={item.key}
            item={item}
            active={activeSection}
            onClick={setActiveSection}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 680px) {
          .sidebar-desktop { display: none !important; }
          .mobile-tabs     { display: flex !important; }
          /* shrink main padding for mobile */
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UserDetailPage;
