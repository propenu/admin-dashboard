// src/pages/users/AllUserInDetails/roleConfig.js

import {
  Crown,
  Shield,
  TrendingUp,
  Briefcase,
  UserCheck,
  Building2,
  Home,
  Users,
  CreditCard,
  Megaphone,
  Handshake,
} from "lucide-react";

// ─── Role metadata ────────────────────────────────────────────────────────────
export const ROLE_META = {
//   super_admin: {
//     label: "Super Admins",
//     color: "#27AE60",
//     icon: Crown,
//     bg: "#dcfce7",
//     query: "super_admin",
//   },
//   admin: {
//     label: "Admins",
//     color: "#3b82f6",
//     icon: Shield,
//     bg: "#dbeafe",
//     query: "admin",
//   },
  sales_manager: {
    label: "Sales Managers",
    //color: "#f59e0b",
    color: "#27AE60",
    icon: TrendingUp,
    bg: "#fef3c7",
    query: "sales_manager",
  },
  sales_agent: {
    label: "Sales Agents",
    //color: "#8b5cf6",
    color: "#27AE60",
    icon: Briefcase,
    bg: "#ede9fe",
    query: "sales_agent",
  },
  agent: {
    label: "Agents",
    //color: "#06b6d4",
    color: "#27AE60",
    icon: UserCheck,
    bg: "#cffafe",
    query: "agent",
  },
  builder: {
    label: "Builders",
    //color: "#f97316",
    color: "#27AE60",
    icon: Building2,
    bg: "#ffedd5",
    query: "builder",
  },
  user: {
    label: "Buyers / Owners",
    //color: "#ec4899",
    color: "#27AE60",
    icon: Home,
    bg: "#fce7f3",
    query: "user",
  },
  customer_care: {
    label: "Customer Care",
    //color: "#14b8a6",
    color: "#27AE60",
    icon: Users,
    bg: "#ccfbf1",
    query: "customer_care",
  },
  accounts: {
    label: "Accounts",
    //color: "#6366f1",
    color: "#27AE60",
    icon: CreditCard,
    bg: "#e0e7ff",
    query: "accounts",
  },
  digital_marketing: {
    label: "Digital Marketing",
    color: "#27AE60",
    icon: Megaphone,
    bg: "#dcfce7",
    query: "digital_marketing",
  },
  relationship_manager: {
    label: "Relationship Managers",
    color: "#27AE60",
    icon: Handshake,
    bg: "#dcfce7",
    query: "relationship_manager",
  },
  regional_manager: {
    label: "Regional Managers",
    color: "#27AE60",
    icon: Users,
    bg: "#dcfce7",
    query: "regional_manager",
  },
};

// ─── Workflow steps per role ──────────────────────────────────────────────────
export const WORKFLOW_STEPS = {
  super_admin: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Status",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "team",
      label: "Team Oversight",
      desc: () => "Manages all admins and teams",
    },
  ],
  admin: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Status",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "manage",
      label: "Managing Users",
      desc: () => "Admin manages user accounts & listings",
    },
  ],
  sales_manager: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Verified",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "team",
      label: "Team Assigned",
      desc: (u) => (u?.managerId ? "Team manager assigned" : "No team yet"),
    },
    {
      key: "tracking",
      label: "Sales Tracking",
      desc: () => "Tracking team leads & conversions",
    },
  ],
  sales_agent: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Verified",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "manager",
      label: "Manager Assigned",
      desc: (u) =>
        u?.managerId ? "Assigned to manager" : "No manager assigned yet",
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "leads",
      label: "Lead Tracking",
      desc: () => "Working on property leads",
    },
  ],
  agent: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Verified",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "profile",
      label: "Agent Profile",
      desc: (u) =>
        u?.agentDetails?.agencyName
          ? `Agency: ${u.agentDetails.agencyName}`
          : "Profile created",
    },
    {
      key: "verification",
      label: "Agent Verified",
      desc: (u) => `Verification: ${u?.verificationStatus || "pending"}`,
    },
    {
      key: "plan",
      label: "Plan Active",
      desc: (u) => `Account: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "listings",
      label: "Listings Live",
      desc: (u) => `Published: ${u?.agentDetails?.stats?.publishedCount ?? 0}`,
    },
  ],
  builder: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Verified",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "projects",
      label: "Projects Added",
      desc: () => "Builder projects listed",
    },
    {
      key: "featured",
      label: "Featured Listing",
      desc: () => "Projects promoted/featured",
    },
  ],
  user: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Status",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "plan",
      label: "Plan Purchased",
      desc: () => "Subscription plan active",
    },
    {
      key: "property",
      label: "Property Search",
      desc: () => "Browsing / shortlisting properties",
    },
  ],
  customer_care: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Status",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "support",
      label: "Support Active",
      desc: () => "Handling user queries & tickets",
    },
  ],
  accounts: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "kyc",
      label: "KYC Status",
      desc: (u) =>
        `KYC: ${u?.kyc?.status?.replace(/_/g, " ") || "not started"}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "finance",
      label: "Finance Access",
      desc: () => "Accounts team managing payments & invoices",
    },
  ],
  digital_marketing: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "campaigns",
      label: "Campaign Access",
      desc: () => "Managing campaigns, blogs and promotions",
    },
    {
      key: "leads",
      label: "Lead Reach",
      desc: () => "Supporting digital lead generation",
    },
  ],
  relationship_manager: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "relationships",
      label: "Client Relationships",
      desc: () => "Managing client follow-ups and relationships",
    },
    {
      key: "properties",
      label: "Property Coordination",
      desc: () => "Coordinating projects, properties and tickets",
    },
  ],
  regional_manager: [
    {
      key: "registered",
      label: "Account Created",
      desc: (u) => `Joined ${fmtDate(u?.createdAt)}`,
    },
    {
      key: "active",
      label: "Account Active",
      desc: (u) => `Status: ${u?.accountStatus?.replace(/_/g, " ") || "—"}`,
    },
    {
      key: "regions",
      label: "Regional Operations",
      desc: () => "Managing regional users, projects and follow-ups",
    },
    {
      key: "properties",
      label: "Property Coordination",
      desc: () => "Coordinating properties, progress and tickets",
    },
  ],
};

Object.keys(WORKFLOW_STEPS).forEach((role) => {
  WORKFLOW_STEPS[role] = WORKFLOW_STEPS[role].filter((step) => step.key !== "kyc");
});

// ─── Resolve step status from user data ──────────────────────────────────────
export const resolveStep = (key, user) => {
  switch (key) {
    case "registered":
      return user?.createdAt ? "done" : "pending";
    case "kyc":
      return user?.kyc?.status === "verified"
        ? "done"
        : user?.kyc?.status === "not_started"
          ? "pending"
          : "inprogress";
    case "active":
      return user?.accountStatus === "active" ? "done" : "inprogress";
    case "manager":
      return user?.managerId ? "done" : "pending";
    case "plan":
      return user?.accountStatus === "active" ? "done" : "pending";
    case "verification":
      return user?.verificationStatus === "approved"
        ? "done"
        : user?.verificationStatus === "rejected"
          ? "failed"
          : "inprogress";
    case "profile":
      return user?.agentDetails?.agencyName ? "done" : "inprogress";
    case "listings":
      return (user?.agentDetails?.stats?.publishedCount ?? 0) > 0
        ? "done"
        : "pending";
    default:
      return user?.accountStatus === "active" ? "done" : "inprogress";
  }
};

// ─── Date formatter ──────────────────────────────────────────────────────────
export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
