const normalizeTeamRole = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const TEAM_ROLE_ALIASES = {
  customer_support_team_lead: "team_lead",
  team_leads: "team_lead",
  customer_support_team_leads: "team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  regional_managers: "regional_manager",
};

const TEAM_ROLE_HIERARCHY = [
  ["super_admin", 0],
  ["ceo", 1],
  ["founder", 1],
  ["operations_head", 1],
  ["business_development_head", 2],
  ["regional_manager", 3],
  ["business_development_manager", 4],
  ["sales_agent", 4],
  ["sales_executive", 4],
  ["sales_manager", 4],
  ["customer_support_head", 2],
  ["team_lead", 3],
  ["customer_care", 4],
  ["customer_care_executive", 4],
  ["relationship_manager", 4],
  ["marketing_head", 2],
  ["digital_marketing", 3],
  ["social_media", 3],
  ["content_team", 3],
  ["creative_team", 3],
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

const teamHierarchyParentByRole = new Map();
TEAM_ROLE_HIERARCHY.forEach(([name, depth], index) => {
  if (!depth) return;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (TEAM_ROLE_HIERARCHY[cursor][1] === depth - 1) {
      teamHierarchyParentByRole.set(name, TEAM_ROLE_HIERARCHY[cursor][0]);
      break;
    }
  }
});

export const canonicalTeamRole = (value = "") => {
  const normalized = normalizeTeamRole(value);
  return TEAM_ROLE_ALIASES[normalized] || normalized;
};

export const enrichHierarchyRoles = (roles = []) => {
  const rolesById = new Map(roles.map((role) => [String(role._id), role]));
  const rolesByName = new Map(roles.map((role) => [canonicalTeamRole(role.name), role]));
  const depthFor = (role, visited = new Set()) => {
    const parentId = role?.effectiveParentRoleId || role?.parentRoleId?._id || role?.parentRoleId;
    if (!parentId || visited.has(String(parentId))) return 0;
    const parent = rolesById.get(String(parentId));
    if (!parent) return 0;
    visited.add(String(parentId));
    return 1 + depthFor(parent, visited);
  };
  return roles.map((role) => {
    const nameKey = canonicalTeamRole(role.name);
    const hierarchy = teamHierarchyRank.get(nameKey);
    const canonicalParentName = teamHierarchyParentByRole.get(nameKey) || null;
    const canonicalParentRole = canonicalParentName ? rolesByName.get(canonicalParentName) : null;
    return {
      ...role,
      hierarchyDepth: depthFor(role) || hierarchy?.depth || 0,
      hierarchyIndex: hierarchy?.index ?? 1000,
      hierarchyParentId:
        role?.effectiveParentRoleId ||
        role?.parentRoleId?._id ||
        role?.parentRoleId ||
        canonicalParentRole?._id ||
        null,
    };
  });
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
  const appendBranch = (parentId = "__root__") => {
    const branch = [...(childrenByParent.get(String(parentId)) || [])].sort(sortWithinLevel);
    branch.forEach((role) => {
      const roleId = String(role._id || role.name);
      if (visited.has(roleId)) return;
      visited.add(roleId);
      ordered.push(role);
      appendBranch(role._id);
    });
  };
  appendBranch("__root__");
  enriched.sort(sortWithinLevel).forEach((role) => {
    const roleId = String(role._id || role.name);
    if (visited.has(roleId)) return;
    visited.add(roleId);
    ordered.push(role);
    appendBranch(role._id);
  });
  return ordered;
};

/** Selected role + every descendant under it in the organisation hierarchy. */
export const getRoleSubtree = (selectedRoleName, roles = []) => {
  if (!selectedRoleName) return { ids: new Set(), names: new Set(), canonicalNames: new Set() };
  const enriched = enrichHierarchyRoles(roles);
  const childrenByParent = buildChildrenByParent(enriched);
  // Prefer exact role name so alias siblings are not collapsed incorrectly.
  const selected =
    enriched.find((role) => role.name === selectedRoleName) ||
    enriched.find((role) => canonicalTeamRole(role.name) === canonicalTeamRole(selectedRoleName));
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
    if (role.name) names.add(role.name);
    canonicalNames.add(canonicalTeamRole(role.name));
    (childrenByParent.get(String(role._id)) || []).forEach(walk);
  };
  walk(selected);

  // Include alias-equivalent role docs (e.g. customer_care ↔ customer_care_executive).
  enriched.forEach((role) => {
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

/** Exact role only (plus name aliases like team_lead ↔ customer_support_team_lead). No child roles. */
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
