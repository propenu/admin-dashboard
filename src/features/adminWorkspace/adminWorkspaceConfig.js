import { Landmark, Hammer, Paintbrush, HeartHandshake, UsersRound, FileText } from "lucide-react";

/** Product workspaces shown in the top nav (bank-style tabs). */
export const ADMIN_WORKSPACES = [
  {
    id: "main",
    label: "Properties",
    shortLabel: "Props",
    homePath: "/",
    pathPrefixes: [],
  },
  {
    id: "home_loans",
    label: "Home Loans",
    shortLabel: "Loans",
    homePath: "/home-loans",
    pathPrefixes: ["/home-loans"],
  },
  {
    id: "construction",
    label: "Construction",
    shortLabel: "Build",
    homePath: "/services/construction",
    pathPrefixes: ["/services/construction"],
    comingSoon: true,
  },
  {
    id: "interior",
    label: "Interior",
    shortLabel: "Interior",
    homePath: "/services/interior",
    pathPrefixes: ["/services/interior"],
    comingSoon: true,
  },
  {
    id: "home_care",
    label: "Home Care",
    shortLabel: "Care",
    homePath: "/services/home-care",
    pathPrefixes: ["/services/home-care"],
    comingSoon: true,
  },
];

export const WORKSPACE_STORAGE_KEY = "propenu:admin-workspace";

/**
 * Routes that belong to every workspace (profile chip, etc.).
 * /dashboard/users keeps the Home Loans tab active when opening an existing applicant profile.
 */
export const SHARED_WORKSPACE_PATHS = [
  "/profile",
  "/settings",
  "/signin",
  "/signup",
  "/dashboard/users",
];

const cleanPath = (path = "") => String(path).split("?")[0];

export const getWorkspaceById = (id) =>
  ADMIN_WORKSPACES.find((item) => item.id === id) || ADMIN_WORKSPACES[0];

export const pathMatchesPrefixes = (path, prefixes = []) => {
  const pathname = cleanPath(path);
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

export const isSharedWorkspacePath = (pathname) => {
  const path = cleanPath(pathname);
  return SHARED_WORKSPACE_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

/** Resolve workspace from URL. Shared pages return null (keep last selection). */
export const resolveWorkspaceFromPath = (pathname) => {
  const path = cleanPath(pathname);
  if (isSharedWorkspacePath(path)) return null;

  for (const workspace of ADMIN_WORKSPACES) {
    if (workspace.id === "main") continue;
    if (pathMatchesPrefixes(path, workspace.pathPrefixes)) return workspace.id;
  }
  return "main";
};

export const isServiceOnlyPath = (path) => {
  const pathname = cleanPath(path);
  return ADMIN_WORKSPACES.some(
    (workspace) =>
      workspace.id !== "main" && pathMatchesPrefixes(pathname, workspace.pathPrefixes),
  );
};

/** Strip service-only leaves from Main Admin sidebar (keeps all existing menus). */
export const filterMainWorkspaceMenu = (items = []) =>
  items
    .map((item) => {
      if (Array.isArray(item.children) && item.children.length) {
        const children = filterMainWorkspaceMenu(item.children);
        if (!children.length && !item.path && !item.action) return null;
        return { ...item, children };
      }
      if (item.path && isServiceOnlyPath(item.path)) return null;
      return item;
    })
    .filter(Boolean);

const serviceLeaf = (path, label, Icon) => ({
  path,
  label,
  icon: Icon,
});

/** Dedicated sidebars for service workspaces — does not rewrite Main menus. */
export const getServiceWorkspaceMenu = (workspaceId) => {
  if (workspaceId === "home_loans") {
    // Loan-scoped routes only — keeps the top tab on Home Loans.
    return [
      serviceLeaf("/home-loans", "Applications", FileText),
      serviceLeaf("/home-loans/users", "Home Loan Users", UsersRound),
    ];
  }
  if (workspaceId === "construction") {
    return [serviceLeaf("/services/construction", "Dashboard", Hammer)];
  }
  if (workspaceId === "interior") {
    return [serviceLeaf("/services/interior", "Dashboard", Paintbrush)];
  }
  if (workspaceId === "home_care") {
    return [serviceLeaf("/services/home-care", "Dashboard", HeartHandshake)];
  }
  return [];
};

export const buildWorkspaceMenu = (rawMenuItems, workspaceId) => {
  if (!workspaceId || workspaceId === "main") {
    return filterMainWorkspaceMenu(rawMenuItems);
  }
  return getServiceWorkspaceMenu(workspaceId);
};

/**
 * Who sees which tabs.
 * - Main: everyone
 * - Home Loans: same access as today's /home-loans sidebar entry
 * - Coming-soon services: super_admin / admin only (safe until those verticals launch)
 */
export const getVisibleWorkspaces = (user) => {
  const role = String(user?.roleName || user?.role || "")
    .trim()
    .toLowerCase();
  const permissions = new Set(
    (Array.isArray(user?.permissions) ? user.permissions : []).map((p) =>
      String(p).trim().toLowerCase(),
    ),
  );
  const isElevated = role === "super_admin" || role === "admin";
  const canHomeLoans =
    isElevated ||
    permissions.has("user:view") ||
    permissions.has("dashboard:view") ||
    permissions.has("team:view") ||
    role.includes("customer_care") ||
    role.includes("support");

  return ADMIN_WORKSPACES.filter((workspace) => {
    if (workspace.id === "main") return true;
    if (workspace.id === "home_loans") return canHomeLoans;
    if (workspace.comingSoon) return isElevated;
    return false;
  });
};
