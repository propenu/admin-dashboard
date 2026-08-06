/** Mirrors backend reportsToPolicy for UI labels + below-role filtering. */

const ROLE_NAME_ALIASES = {
  operation_head: "operations_head",
  team_lead: "customer_support_team_lead",
  team_leads: "customer_support_team_lead",
  customer_support_team_leads: "customer_support_team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  sales_agent: "sales_executive",
  accounts_finance: "accounts",
};

/** Canonical parent chain — must match backend reportsToPolicy / roleHierarchy. */
const ORG_PARENT_BY_ROLE = {
  ceo: "super_admin",
  founder: "super_admin",
  operations_head: "super_admin",
  business_development_head: "operations_head",
  regional_manager: "business_development_head",
  business_development_manager: "regional_manager",
  sales_manager: "regional_manager",
  sales_executive: "regional_manager",
  customer_support_head: "operations_head",
  customer_support_team_lead: "customer_support_head",
  customer_care_executive: "customer_support_team_lead",
  relationship_manager: "customer_support_team_lead",
  marketing_head: "operations_head",
  digital_marketing: "marketing_head",
  social_media: "digital_marketing",
  content_team: "digital_marketing",
  creative_team: "digital_marketing",
  performance_marketing: "digital_marketing",
  accounts: "operations_head",
  legal_compliance: "operations_head",
  hr_administration: "operations_head",
  technical_support_head: "operations_head",
  technical_support_team: "technical_support_head",
};

/** Preferred reports-to role first; optional skip-level fallback after. */
const REPORTS_TO_ROLE_OPTIONS = {
  marketing_head: ["operations_head"],
  digital_marketing: ["marketing_head"],
  social_media: ["digital_marketing", "marketing_head"],
  content_team: ["digital_marketing", "marketing_head"],
  creative_team: ["digital_marketing", "marketing_head"],
  performance_marketing: ["digital_marketing", "marketing_head"],
  customer_support_team_lead: ["customer_support_head"],
  customer_care_executive: ["customer_support_team_lead"],
  relationship_manager: ["customer_support_team_lead"],
  technical_support_team: ["technical_support_head"],
};

const ORG_CHILDREN_BY_ROLE = {
  super_admin: ["ceo", "operations_head"],
  operations_head: [
    "business_development_head",
    "customer_support_head",
    "marketing_head",
    "accounts",
    "legal_compliance",
    "hr_administration",
    "technical_support_head",
  ],
  business_development_head: ["regional_manager"],
  regional_manager: [
    "business_development_manager",
    "sales_executive",
    "sales_agent",
    "sales_manager",
  ],
  sales_manager: ["sales_agent", "sales_executive"],
  customer_support_head: ["customer_support_team_lead"],
  customer_support_team_lead: ["customer_care_executive", "relationship_manager"],
  marketing_head: ["digital_marketing"],
  digital_marketing: [
    "social_media",
    "content_team",
    "creative_team",
    "performance_marketing",
  ],
  technical_support_head: ["technical_support_team"],
};

export const canonicalRoleName = (roleName = "") => {
  const raw = String(roleName || "").trim().toLowerCase();
  return ROLE_NAME_ALIASES[raw] || raw;
};

/** All role names strictly below the actor (never self / never above). */
export const getRolesBelowActor = (actorRoleName = "") => {
  const root = canonicalRoleName(actorRoleName);
  if (!root) return [];
  if (root === "super_admin" || root === "admin") return null; // null = unrestricted dashboard set
  const out = [];
  const seen = new Set([root]);
  let frontier = [root];
  while (frontier.length) {
    const next = [];
    for (const role of frontier) {
      for (const child of ORG_CHILDREN_BY_ROLE[role] || []) {
        const name = canonicalRoleName(child);
        if (!name || seen.has(name)) continue;
        seen.add(name);
        out.push(name);
        next.push(name);
      }
    }
    frontier = next;
  }
  return out;
};

export const isRoleBelowActor = (actorRoleName, targetRoleName) => {
  const below = getRolesBelowActor(actorRoleName);
  if (below === null) return true;
  const target = canonicalRoleName(targetRoleName);
  if (!target) return false;
  if (target === canonicalRoleName(actorRoleName)) return false;
  return (
    below.includes(target) ||
    (target === "sales_executive" && below.includes("sales_agent")) ||
    (target === "sales_agent" && below.includes("sales_executive"))
  );
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  ceo: "CEO",
  founder: "Founder",
  operations_head: "Operations Head",
  business_development_head: "Business Development Head",
  regional_manager: "Regional Manager",
  business_development_manager: "Business Development Manager",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
  sales_agent: "Sales Executive",
  customer_support_head: "Customer Support Head",
  customer_support_team_lead: "Customer Support Team Lead",
  customer_support_team_leads: "Customer Support Team Lead",
  team_lead: "Customer Support Team Lead",
  team_leads: "Customer Support Team Lead",
  customer_care_executive: "Customer Care Executive",
  customer_care_executives: "Customer Care Executive",
  customer_care: "Customer Care Executive",
  relationship_manager: "Relationship Manager",
  relationship_managers: "Relationship Manager",
  marketing_head: "Marketing Head",
  digital_marketing: "Digital Marketing",
  social_media: "Social Media",
  content_team: "Content Team",
  creative_team: "Creative Team",
  performance_marketing: "Performance Marketing",
  accounts: "Accounts",
  legal_compliance: "Legal",
  hr_administration: "HR",
  technical_support_head: "Technical Support Head",
  technical_support_team: "Technical Support Team",
};

export const cleanRoleLabel = (roleName = "") => {
  const key = canonicalRoleName(roleName);
  return (
    ROLE_LABELS[key] ||
    ROLE_LABELS[String(roleName || "").toLowerCase()] ||
    String(roleName || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const getOrgRolesAbove = (roleName = "") => {
  const chain = [];
  let current = canonicalRoleName(roleName);
  const seen = new Set();
  while (current && !seen.has(current)) {
    seen.add(current);
    const parent = ORG_PARENT_BY_ROLE[current];
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }
  return chain;
};

export const getReportsToRoleOptionsForUi = (roleName = "") => {
  const key = canonicalRoleName(roleName);
  return REPORTS_TO_ROLE_OPTIONS[key] ? [...REPORTS_TO_ROLE_OPTIONS[key]] : [];
};

export const formatHierarchyHint = (hierarchy, roleName = "") => {
  const selectedRole = canonicalRoleName(
    roleName || hierarchy?.role || hierarchy?.targetRole || "",
  );
  if (!hierarchy && !selectedRole) {
    return {
      aboveText: "—",
      belowText: "—",
      reportsToText: "—",
      preferredReportsToRole: null,
    };
  }

  // Always prefer canonical client tree so Create Credentials stays correct
  // even if an older user-service process is still running.
  const aboveCanonical = selectedRole
    ? getOrgRolesAbove(selectedRole)
    : (hierarchy?.above || []).map((name) => canonicalRoleName(name));
  const above = aboveCanonical.map(cleanRoleLabel);

  const directBelow = (ORG_CHILDREN_BY_ROLE[selectedRole] || []).map((name) =>
    canonicalRoleName(name),
  );
  const uniqueDirectBelow = [...new Set(directBelow)].filter(Boolean);
  const belowSource =
    uniqueDirectBelow.length > 0
      ? uniqueDirectBelow
      : (hierarchy?.below || []).map((name) => canonicalRoleName(name));
  const below = [...new Set(belowSource)].map(cleanRoleLabel);

  const reportsToRoles =
    getReportsToRoleOptionsForUi(selectedRole).length > 0
      ? getReportsToRoleOptionsForUi(selectedRole)
      : (hierarchy?.reportsToRoles || []).map((name) => canonicalRoleName(name));
  const preferred = reportsToRoles[0] || null;
  const reportsTo = reportsToRoles.map(cleanRoleLabel);

  return {
    aboveText: above.length ? above.join(" → ") : "Top of tree",
    belowText: below.length
      ? below.slice(0, 8).join(", ") + (below.length > 8 ? "…" : "")
      : "No roles below",
    reportsToText: reportsTo.length
      ? reportsTo.length > 1
        ? `${reportsTo[0]} (preferred)${reportsTo.slice(1).length ? ` · fallback: ${reportsTo.slice(1).join(" or ")}` : ""}`
        : reportsTo[0]
      : "No person reporting for this role",
    preferredReportsToRole: preferred,
  };
};
