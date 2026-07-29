/** Mirrors backend reportsToPolicy for UI labels + below-role filtering. */

const ROLE_NAME_ALIASES = {
  operation_head: "operations_head",
  customer_support_team_lead: "team_lead",
  team_leads: "team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  sales_agent: "sales_executive",
  accounts_finance: "accounts",
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
  customer_support_head: ["team_lead"],
  team_lead: ["customer_care_executive", "relationship_manager"],
  marketing_head: ["digital_marketing", "social_media", "content_team", "creative_team"],
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
  team_lead: "Customer Support Team Lead",
  team_leads: "Customer Support Team Lead",
  customer_support_team_lead: "Customer Support Team Lead",
  customer_support_team_leads: "Customer Support Team Lead",
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

export const formatHierarchyHint = (hierarchy) => {
  if (!hierarchy) {
    return {
      aboveText: "—",
      belowText: "—",
      reportsToText: "—",
    };
  }
  const above = (hierarchy.above || []).map(cleanRoleLabel);
  // Prefer direct org children for the selected role (permission/hierarchy flow).
  const selectedRole = hierarchy.role || hierarchy.targetRole || "";
  const directBelow = (ORG_CHILDREN_BY_ROLE[canonicalRoleName(selectedRole)] || []).map(
    (name) => canonicalRoleName(name),
  );
  const uniqueDirectBelow = [...new Set(directBelow)].filter(Boolean);
  const belowSource =
    uniqueDirectBelow.length > 0
      ? uniqueDirectBelow
      : (hierarchy.below || []).map((name) => canonicalRoleName(name));
  const below = [...new Set(belowSource)].map(cleanRoleLabel);
  const reportsTo = (hierarchy.reportsToRoles || []).map(cleanRoleLabel);
  return {
    aboveText: above.length ? above.join(" → ") : "Top of tree",
    belowText: below.length
      ? below.slice(0, 8).join(", ") + (below.length > 8 ? "…" : "")
      : "No roles below",
    reportsToText: reportsTo.length
      ? reportsTo.join(" or ")
      : "No person reporting for this role",
  };
};
