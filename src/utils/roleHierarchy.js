const normalizeTeamRole = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const TEAM_ROLE_ALIASES = {
  operation_head: "operations_head",
  team_lead: "customer_support_team_lead",
  team_leads: "customer_support_team_lead",
  customer_support_team_leads: "customer_support_team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  sales_agent: "sales_executive",
  regional_managers: "regional_manager",
  // Legacy "Accounts & Finance" role → same Accounts row
  accounts_finance: "accounts",
  // Legacy short / custom names that duplicate hierarchy labels in Create Credentials
  hr: "hr_administration",
  hr_admin: "hr_administration",
  hr_and_administration: "hr_administration",
  human_resources: "hr_administration",
  legal: "legal_compliance",
  legal_and_compliance: "legal_compliance",
  compliance: "legal_compliance",
};

/** When label is HR/Legal but name is a custom slug, still collapse to hierarchy role. */
const LABEL_ALIASES_TO_CANONICAL = {
  hr: "hr_administration",
  human_resources: "hr_administration",
  legal: "legal_compliance",
  legal_compliance: "legal_compliance",
  hr_administration: "hr_administration",
};

/** Preferred DB role name when collapsing aliases for display. */
const PREFERRED_ROLE_NAME = {
  customer_care_executive: "customer_care_executive",
  customer_support_team_lead: "customer_support_team_lead",
  sales_executive: "sales_agent",
  relationship_manager: "relationship_manager",
  operations_head: "operations_head",
  accounts: "accounts",
  hr_administration: "hr_administration",
  legal_compliance: "legal_compliance",
};

/**
 * Super Admin
 * ├── CEO
 * └── Operations Head
 *     ├── BD Head → Regional Managers → (BD Manager, Sales Executives)
 *     ├── Support Head → Customer Support Team Lead → (Care Executives, Relationship Managers)
 *     ├── Marketing Head → Digital Marketing → (Social / Content / Creative / Performance)
 *     ├── Accounts · Legal · HR
 *     └── Tech Support Head → Tech Support Team
 */
export const TEAM_CANONICAL_PARENT = {
  ceo: "super_admin",
  founder: "super_admin",
  admin: "super_admin",
  operations_head: "super_admin",
  business_development_head: "operations_head",
  regional_manager: "business_development_head",
  business_development_manager: "regional_manager",
  sales_manager: "regional_manager",
  sales_executive: "regional_manager",
  sales_agent: "regional_manager",
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
  accounts_finance: "operations_head",
  legal_compliance: "operations_head",
  hr_administration: "operations_head",
  technical_support_head: "operations_head",
  technical_support_team: "technical_support_head",
};

/** Direct child roles that report under this role in the org chart. */
export const getReportingChildRoles = (roleName = "") => {
  const parent = canonicalTeamRole(roleName);
  return [
    ...new Set(
      Object.entries(TEAM_CANONICAL_PARENT)
        .filter(([, p]) => p === parent)
        .map(([child]) => (child === "sales_agent" ? "sales_executive" : child)),
    ),
  ];
};

const TEAM_ROLE_HIERARCHY = [
  ["super_admin", 0],
  ["ceo", 1],
  ["founder", 1],
  ["operations_head", 1],
  ["business_development_head", 2],
  ["regional_manager", 3],
  ["business_development_manager", 4],
  ["sales_manager", 4],
  ["sales_executive", 4],
  ["sales_agent", 4],
  ["customer_support_head", 2],
  ["customer_support_team_lead", 3],
  ["customer_care_executive", 4],
  ["relationship_manager", 4],
  ["marketing_head", 2],
  ["digital_marketing", 3],
  ["social_media", 4],
  ["content_team", 4],
  ["creative_team", 4],
  ["performance_marketing", 4],
  ["accounts", 2],
  ["accounts_finance", 2],
  ["legal_compliance", 2],
  ["hr_administration", 2],
  ["technical_support_head", 2],
  ["technical_support_team", 3],
];

const teamHierarchyRank = new Map(
  TEAM_ROLE_HIERARCHY.map(([name, depth], index) => [name, { depth, index }]),
);

export const canonicalTeamRole = (value = "") => {
  const normalized = normalizeTeamRole(value);
  return TEAM_ROLE_ALIASES[normalized] || normalized;
};

/**
 * Collapse alias duplicates (e.g. customer_care + customer_care_executive,
 * or custom "HR"/"Legal" + hr_administration/legal_compliance) into one row.
 */
export const dedupeRolesForHierarchyDisplay = (roles = []) => {
  const groups = new Map();
  roles.forEach((role) => {
    const nameKey = canonicalTeamRole(role.name);
    const labelKey = normalizeTeamRole(role.label || "");
    const key =
      LABEL_ALIASES_TO_CANONICAL[labelKey] ||
      LABEL_ALIASES_TO_CANONICAL[nameKey] ||
      nameKey;
    const list = groups.get(key) || [];
    list.push(role);
    groups.set(key, list);
  });

  return [...groups.entries()].map(([canonical, group]) => {
    const preferred = PREFERRED_ROLE_NAME[canonical];
    const preferredRole =
      preferred && group.find((role) => role.name === preferred);
    const primary =
      preferredRole ||
      group.find((role) => teamHierarchyRank.has(canonicalTeamRole(role.name))) ||
      group.find((role) => canonicalTeamRole(role.name) === role.name) ||
      group.find((role) => role.parentRoleId) ||
      group[0];
    return {
      ...primary,
      // Prefer hierarchy slug when that role doc exists; keep aliases for counts.
      name: preferredRole ? preferred : primary.name,
      label: preferredRole?.label || primary.label || preferred || primary.name,
      canonicalName: canonical,
      aliasRoleNames: [...new Set(group.map((role) => role.name).filter(Boolean))],
      aliasRoleIds: group.map((role) => role._id).filter(Boolean),
    };
  });
};

/**
 * Build parent/child links inside the *current* role list only.
 * When Ops Head (etc.) loads Create Credentials, parent roles above them are
 * omitted — those children become local roots so indent stays correct.
 * Prefer canonical parent over stale DB parentRoleId when both exist in-set.
 */
export const enrichHierarchyRoles = (roles = []) => {
  const deduped = dedupeRolesForHierarchyDisplay(roles);
  const rolesById = new Map(deduped.map((role) => [String(role._id), role]));
  const rolesByName = new Map(deduped.map((role) => [canonicalTeamRole(role.name), role]));

  const withParents = deduped.map((role) => {
    const nameKey = canonicalTeamRole(role.name);
    const hierarchy = teamHierarchyRank.get(nameKey);
    const canonicalParentName = TEAM_CANONICAL_PARENT[nameKey] || null;
    const canonicalParentRole = canonicalParentName ? rolesByName.get(canonicalParentName) : null;
    const persistedParentId =
      role?.effectiveParentRoleId || role?.parentRoleId?._id || role?.parentRoleId || null;
    const persistedParentInSet =
      persistedParentId && rolesById.has(String(persistedParentId))
        ? rolesById.get(String(persistedParentId))
        : null;
    const parentRole = canonicalParentRole || persistedParentInSet || null;

    return {
      ...role,
      hierarchyIndex: hierarchy?.index ?? 1000,
      hierarchyParentId: parentRole?._id || null,
    };
  });

  const byId = new Map(withParents.map((role) => [String(role._id), role]));
  const depthFor = (role, visited = new Set()) => {
    const parentId = role.hierarchyParentId;
    if (!parentId || visited.has(String(parentId))) return 0;
    const parent = byId.get(String(parentId));
    if (!parent) return 0;
    visited.add(String(parentId));
    return 1 + depthFor(parent, visited);
  };

  return withParents.map((role) => ({
    ...role,
    hierarchyDepth: depthFor(role),
  }));
};

export const buildChildrenByParent = (enrichedRoles = []) => {
  const childrenByParent = new Map();
  enrichedRoles.forEach((role) => {
    const key = role.hierarchyParentId ? String(role.hierarchyParentId) : "__root__";
    const branch = childrenByParent.get(key) || [];
    branch.push(role);
    childrenByParent.set(key, branch);
  });
  return childrenByParent;
};

export const orderRolesByHierarchy = (roles = []) => {
  const enriched = enrichHierarchyRoles(roles);
  const childrenByParent = buildChildrenByParent(enriched);
  const sortWithinLevel = (first, second) =>
    Number(second.isCurrentRole) - Number(first.isCurrentRole) ||
    first.hierarchyIndex - second.hierarchyIndex ||
    String(first.label || first.name).localeCompare(String(second.label || second.name));
  const ordered = [];
  const visited = new Set();
  const appendBranch = (parentId = "__root__", depth = 0) => {
    const branch = [...(childrenByParent.get(String(parentId)) || [])].sort(sortWithinLevel);
    branch.forEach((role) => {
      const roleId = String(role._id || role.name);
      if (visited.has(roleId)) return;
      visited.add(roleId);
      ordered.push({ ...role, hierarchyDepth: depth });
      appendBranch(role._id, depth + 1);
    });
  };
  appendBranch("__root__", 0);
  // Any remaining roles (broken links) start a new local root at depth 0
  enriched.sort(sortWithinLevel).forEach((role) => {
    const roleId = String(role._id || role.name);
    if (visited.has(roleId)) return;
    visited.add(roleId);
    ordered.push({ ...role, hierarchyDepth: 0 });
    appendBranch(role._id, 1);
  });
  return ordered;
};

/** Selected role + every descendant under it in the organisation hierarchy. */
export const getRoleSubtree = (selectedRoleName, roles = []) => {
  if (!selectedRoleName) return { ids: new Set(), names: new Set(), canonicalNames: new Set() };
  const enriched = enrichHierarchyRoles(roles);
  const childrenByParent = buildChildrenByParent(enriched);
  const selected =
    enriched.find((role) => role.name === selectedRoleName) ||
    enriched.find((role) => canonicalTeamRole(role.name) === canonicalTeamRole(selectedRoleName)) ||
    enriched.find((role) => (role.aliasRoleNames || []).includes(selectedRoleName));
  if (!selected) {
    const fallback = canonicalTeamRole(selectedRoleName);
    return {
      ids: new Set(),
      names: new Set([selectedRoleName, fallback].filter(Boolean)),
      canonicalNames: new Set([fallback].filter(Boolean)),
    };
  }
  const ids = new Set();
  const names = new Set();
  const canonicalNames = new Set();
  const walk = (role) => {
    const roleId = String(role._id || role.name);
    if (ids.has(roleId)) return;
    ids.add(roleId);
    (role.aliasRoleIds || []).forEach((id) => ids.add(String(id)));
    if (role.name) names.add(role.name);
    (role.aliasRoleNames || []).forEach((name) => names.add(name));
    canonicalNames.add(canonicalTeamRole(role.name));
    (childrenByParent.get(String(role._id)) || []).forEach(walk);
  };
  walk(selected);

  // Also include any non-deduped alias docs from original list for matching.
  roles.forEach((role) => {
    const canonical = canonicalTeamRole(role.name);
    if (!canonicalNames.has(canonical)) return;
    ids.add(String(role._id || role.name));
    if (role.name) names.add(role.name);
  });

  return { ids, names, canonicalNames };
};

export const userMatchesRoleSubtree = (user, subtree) => {
  if (!subtree || (!subtree.ids.size && !subtree.names.size && !subtree.canonicalNames.size)) {
    return false;
  }
  const roleId = user.roleId?._id || user.roleId;
  if (roleId && subtree.ids.has(String(roleId))) return true;
  if (user.roleName && subtree.names.has(user.roleName)) return true;
  if (user.roleName && subtree.canonicalNames.has(canonicalTeamRole(user.roleName))) return true;
  return false;
};

export const countUsersInRoleSubtree = (users = [], roleName, roles = []) => {
  if (!roleName) return users.length;
  const subtree = getRoleSubtree(roleName, roles);
  return users.filter((user) => userMatchesRoleSubtree(user, subtree)).length;
};

/** Exact role only (plus name aliases). No child roles. */
export const getExactRoleMatch = (selectedRoleName, roles = []) => {
  if (!selectedRoleName) return { ids: new Set(), names: new Set(), canonicalNames: new Set() };
  const canonical = canonicalTeamRole(selectedRoleName);
  const ids = new Set();
  const names = new Set([selectedRoleName, canonical].filter(Boolean));
  const canonicalNames = new Set([canonical].filter(Boolean));

  roles.forEach((role) => {
    if (role.name !== selectedRoleName && canonicalTeamRole(role.name) !== canonical) return;
    ids.add(String(role._id || role.name));
    if (role.name) names.add(role.name);
    canonicalNames.add(canonicalTeamRole(role.name));
  });

  return { ids, names, canonicalNames };
};

export const userMatchesExactRole = (user, match) => userMatchesRoleSubtree(user, match);

export const countUsersInExactRole = (users = [], roleName, roles = []) => {
  if (!roleName) return users.length;
  const match = getExactRoleMatch(roleName, roles);
  return users.filter((user) => userMatchesExactRole(user, match)).length;
};
