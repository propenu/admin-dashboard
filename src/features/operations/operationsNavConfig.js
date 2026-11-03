/** Same labels as sidebar Operations — shown as a horizontal strip. */
export const OPERATIONS_TABS = [
  {
    id: "create-role",
    label: "Create Role & Access",
    path: "/access-control/roles/new",
  },
  {
    id: "create-credentials",
    label: "Create Credentials",
    path: "/access-control/credentials/new",
  },
  {
    id: "user-permissions",
    label: "User Permissions",
    path: "/access-control/users",
  },
  {
    id: "team-directory",
    label: "Team Directory",
    path: "/propenu-team-members",
  },
  {
    id: "team-management",
    label: "Team Management",
    path: "/dashboard/team-management",
  },
  {
    id: "transfer-credentials",
    label: "Transfer Credentials",
    action: "openTranforCredentialsModal",
  },
  {
    id: "assign-reports",
    label: "Assign Reports To",
    action: "openAssignAgentModal",
  },
];

export const OPERATIONS_PATH_PREFIXES = OPERATIONS_TABS.filter((t) => t.path).map(
  (t) => t.path,
);

export const isOperationsPath = (pathname = "") => {
  const path = String(pathname).split("?")[0];
  return OPERATIONS_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

export const resolveOperationsTabId = (pathname = "") => {
  const path = String(pathname).split("?")[0];
  const hit = OPERATIONS_TABS.find(
    (tab) =>
      tab.path && (path === tab.path || path.startsWith(`${tab.path}/`)),
  );
  return hit?.id || null;
};
