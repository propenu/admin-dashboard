export const ROLE_OPTIONS = [
  { value: "user", label: "Owner" },
  { value: "builder", label: "Builder" },
  { value: "builder_staff", label: "Builder Staff" },
  { value: "agent", label: "Agent" },
];

/** Role filter → dedicated list pages (same as Users sidebar). */
export const ROLE_DEDICATED_PAGES = {
  user: "/owners",
  builder: "/builders",
  builder_staff: "/builder-staff",
  agent: "/all-agents",
};

/** Button copy: "View Builders page", etc. */
export const ROLE_PAGE_TITLES = {
  user: "Owners",
  builder: "Builders",
  builder_staff: "Builder Staff",
  agent: "Agents",
};

export const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map((item) => [item.value, item.label]),
);

export const roleLabel = (role) => {
  const key = String(role || "")
    .trim()
    .toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];
  if (!key) return "Unknown";
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
