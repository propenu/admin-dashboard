import { Building2, Home, MapPin, UsersRound, ListChecks } from "lucide-react";

/** Shared Projects ↔ Properties scope across Main Desk inventory pages. */
export const INVENTORY_KIND_STORAGE_KEY = "propenu:inventory-kind";

export const INVENTORY_KINDS = [
  { id: "main", label: "Main Desk", shortLabel: "Desk" },
  { id: "projects", label: "Projects", shortLabel: "Projects" },
  { id: "properties", label: "Properties", shortLabel: "Properties" },
];

const inventoryLeaf = (path, label, icon) => ({ path, label, icon });

/** Paths owned by Projects / Properties nav modes — hidden on Main Desk sidebar. */
export const MAIN_DESK_HIDDEN_PATHS = [
  "/projects",
  "/properties",
  "/leads",
  "/property-progress",
  "/locations",
];

const pathIsMainDeskHidden = (path = "") => {
  const clean = String(path).split("?")[0];
  return MAIN_DESK_HIDDEN_PATHS.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
  );
};

/** Full Main Desk menu minus items already available via Projects / Properties tabs. */
export const filterMainDeskMenu = (items = []) =>
  items
    .map((item) => {
      if (Array.isArray(item.children) && item.children.length) {
        const children = filterMainDeskMenu(item.children);
        if (!children.length && !item.path && !item.action) return null;
        if (item.path && pathIsMainDeskHidden(item.path) && !children.length) {
          return null;
        }
        return { ...item, children };
      }
      if (item.path && pathIsMainDeskHidden(item.path)) return null;
      // Parent groups that only held inventory links (e.g. Dashboard → Projects)
      if (
        Array.isArray(item.children) &&
        !item.children.length &&
        !item.path &&
        !item.action
      ) {
        return null;
      }
      return item;
    })
    .filter(Boolean);

/**
 * Focused sidebar for Projects / Properties mode (same idea as Home Care).
 * Projects: Projects → Lead Management → Locations
 * Properties: Properties → Property Progress → Lead Management → Locations
 */
export const getInventoryKindMenu = (kind) => {
  if (kind === "projects") {
    return [
      inventoryLeaf("/projects", "Projects", Building2),
      inventoryLeaf("/leads", "Lead Management", UsersRound),
      inventoryLeaf("/locations", "Locations", MapPin),
    ];
  }
  if (kind === "properties") {
    return [
      inventoryLeaf("/properties", "Properties", Home),
      inventoryLeaf("/property-progress", "Property Progress", ListChecks),
      inventoryLeaf("/leads", "Lead Management", UsersRound),
      inventoryLeaf("/locations", "Locations", MapPin),
    ];
  }
  return [];
};

export const INVENTORY_KIND_PATHS = {
  projects: ["/projects", "/projects/deleted", "/projects/deleted-leads"],
  properties: [
    "/properties",
    "/properties/deleted",
    "/properties/deleted-leads",
    "/property-progress",
  ],
  shared: ["/leads", "/locations", "/lead-capture", "/all-users-activity"],
};

export const isInventoryRelatedPath = (pathname = "") => {
  const path = String(pathname).split("?")[0];
  return (
    INVENTORY_KIND_PATHS.projects.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    ) ||
    INVENTORY_KIND_PATHS.properties.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    ) ||
    INVENTORY_KIND_PATHS.shared.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  );
};

export const resolveInventoryKindFromPath = (pathname = "") => {
  const path = String(pathname).split("?")[0];
  if (
    path === "/projects" ||
    path.startsWith("/projects/") ||
    path.startsWith("/featured") ||
    path.startsWith("/prime") ||
    path.startsWith("/sponsored") ||
    path.startsWith("/normal")
  ) {
    return "projects";
  }
  if (
    path === "/properties" ||
    path.startsWith("/properties/") ||
    path === "/property-progress" ||
    path.startsWith("/property/") ||
    path.startsWith("/residential") ||
    path.startsWith("/commercial") ||
    path.startsWith("/land") ||
    path.startsWith("/agricultural")
  ) {
    return "properties";
  }
  return null;
};

export const homePathForInventoryKind = (kind) => {
  if (kind === "main") return "/";
  if (kind === "projects") return "/projects";
  if (kind === "properties") return "/properties";
  return null;
};

/** Lead Management category that matches the inventory kind. */
export const leadCategoryForInventoryKind = (kind, currentCategory = "all") => {
  if (kind === "projects") return "featured";
  if (kind === "properties") {
    if (["residential", "commercial", "land", "agricultural"].includes(currentCategory)) {
      return currentCategory;
    }
    return "residential";
  }
  return "all";
};
