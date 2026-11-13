import {
  Building2,
  Home,
  MapPin,
  UsersRound,
  ListChecks,
  Store,
  Map as MapIcon,
  Sprout,
  Layers,
  Star,
  TrendingUp,
  Zap,
  LayoutGrid,
} from "lucide-react";

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

/** Query keys the Projects / Properties boards read from the URL (category, listing tier). */
export const INVENTORY_FILTER_KEYS = ["category", "promotion"];

const CATEGORY_META = {
  residential: { label: "Residential", icon: Home },
  commercial: { label: "Commercial", icon: Store },
  land: { label: "Land", icon: MapIcon },
  agricultural: { label: "Agricultural", icon: Sprout },
};

const CATEGORY_ORDER = {
  projects: ["residential", "land", "commercial", "agricultural"],
  properties: ["residential", "commercial", "land", "agricultural"],
};

const PROMOTION_TIERS = [
  { value: "normal", label: "Normal", icon: Layers },
  { value: "prime", label: "Prime", icon: Star },
  { value: "featured", label: "Top Selling", icon: TrendingUp },
  { value: "sponsored", label: "Sponsored", icon: Zap },
];

const inventoryBoardPath = (kind) => (kind === "projects" ? "/projects" : "/properties");

/**
 * One catalog for the Properties mega menu and the Projects / Properties sidebar,
 * so picking a link in either place highlights the same entry in the other.
 */
export const getInventoryCatalog = (kind) => {
  if (kind !== "projects" && kind !== "properties") return null;
  const board = inventoryBoardPath(kind);
  const noun = kind === "projects" ? "Projects" : "Properties";
  return {
    kind,
    label: noun,
    overview: inventoryLeaf(board, `All ${noun}`, LayoutGrid),
    categories: CATEGORY_ORDER[kind].map((value) =>
      inventoryLeaf(`${board}?category=${value}`, CATEGORY_META[value].label, CATEGORY_META[value].icon),
    ),
    tiers: PROMOTION_TIERS.map((tier) =>
      inventoryLeaf(`${board}?promotion=${tier.value}`, tier.label, tier.icon),
    ),
    manage: [
      ...(kind === "properties"
        ? [inventoryLeaf("/property-progress", "Property Progress", ListChecks)]
        : []),
      inventoryLeaf("/leads", "Lead Management", UsersRound),
      inventoryLeaf("/locations", "Locations", MapPin),
    ],
  };
};

/**
 * Projects / Properties links for the Main Desk sidebar (single entries — category and
 * tier filters live in the top Properties menu). `access` mirrors the role menu.
 */
export const getInventorySidebarItems = (access = {}) => {
  const items = [];
  if (access.projects) items.push(inventoryLeaf("/projects", "Projects", Building2));
  if (access.properties) items.push(inventoryLeaf("/properties", "Properties", Home));
  if (access.leads) items.push(inventoryLeaf("/leads", "Lead Management", UsersRound));
  if (access.locations) items.push(inventoryLeaf("/locations", "Locations", MapPin));
  return items;
};

/**
 * Active check for inventory links that carry a query (e.g. /projects?category=land).
 * The bare board path is only active when no category / tier filter is applied.
 */
export const isInventoryLinkActive = (linkPath, pathname, search) => {
  const [linkPathname, linkQuery] = String(linkPath).split("?");
  const current = String(pathname || "").split("?")[0];
  if (current !== linkPathname) return null;
  const have = new URLSearchParams(search || "");
  if (linkQuery) {
    const want = new URLSearchParams(linkQuery);
    for (const [key, value] of want) {
      if (have.get(key) !== value) return false;
    }
    return true;
  }
  if (linkPathname === "/projects" || linkPathname === "/properties") {
    return !INVENTORY_FILTER_KEYS.some((key) => have.get(key));
  }
  return null;
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
