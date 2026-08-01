export const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "builder", label: "Builder" },
  { value: "builder_staff", label: "Builder Staff" },
  { value: "agent", label: "Agent" },
];

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
