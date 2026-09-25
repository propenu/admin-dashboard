const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const isObjectIdString = (value) =>
  typeof value === "string" && /^[a-f0-9]{24}$/i.test(value.trim());

const personName = (person) => {
  if (!person) return "";
  if (typeof person === "string") {
    return isObjectIdString(person) ? "" : person.trim();
  }
  if (typeof person !== "object") return "";
  const nested =
    (person.user && typeof person.user === "object" && person.user) ||
    (person.userId && typeof person.userId === "object" && person.userId) ||
    null;
  return firstText(
    person.name,
    person.fullName,
    person.companyName,
    person.company,
    person.displayName,
    nested?.name,
    nested?.fullName,
    nested?.companyName,
    nested?.company,
  );
};

const personPhone = (person) => {
  if (!person || typeof person !== "object") return "";
  const nested =
    (person.user && typeof person.user === "object" && person.user) ||
    (person.userId && typeof person.userId === "object" && person.userId) ||
    null;
  return firstText(person.phone, person.contact, nested?.phone, nested?.contact);
};

const titleCaseName = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

/** Listing card name: createdBy user only — never postedBy. */
export const getCreatedByDisplayName = (property) =>
  titleCaseName(personName(property?.createdBy) || personName(property?.createdByUser));

export const getCreatedByPhone = (property) =>
  personPhone(property?.createdBy) || personPhone(property?.createdByUser);

const createdByRoleRaw = (property) => {
  const createdBy = property?.createdBy;
  const postedBy = property?.postedBy;

  if (!createdBy || typeof createdBy !== "object") {
    return firstText(property?.listingSource, postedBy?.roleName);
  }

  return firstText(
    property?.listingSource,
    createdBy.roleName,
    createdBy.role,
    createdBy.roleId?.label,
    createdBy.roleId?.name,
    createdBy.roleId?.roleName,
    typeof createdBy.roleId === "string" ? createdBy.roleId : "",
    createdBy.user?.roleName,
    createdBy.user?.role,
    postedBy?.roleName,
  );
};

const roleKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

export const getPropertyCreatorRole = (property) => {
  const createdBy = property?.createdBy;
  const postedBy = property?.postedBy;
  const role =
    createdByRoleRaw(property) ||
    postedBy?.roleName ||
    postedBy?.role ||
    "";

  return String(role).trim().toLowerCase();
};

export const isAgentCreatedProperty = (property) =>
  getPropertyCreatorRole(property).includes("agent");

const mapRoleToBadge = (raw) => {
  const key = roleKey(raw);
  if (!key) return "Owner";
  if (key.includes("agent")) return "Agent";
  if (key === "user" || key === "owner") return "Owner";
  if (key.includes("builder")) return "Builder";
  if (key.includes("superadmin")) return "Super Admin";
  if (key === "admin") return "Admin";
  if (key.includes("customersupport") || key.includes("customercare")) {
    return "Support";
  }
  return String(raw)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getPropertyCreatorTag = (property) =>
  mapRoleToBadge(getPropertyCreatorRole(property));

const createdByExactRoleRaw = (property) => {
  const createdBy = property?.createdBy;
  const nestedUser =
    createdBy && typeof createdBy === "object"
      ? createdBy.user ||
        (createdBy.userId && typeof createdBy.userId === "object"
          ? createdBy.userId
          : null)
      : null;

  return firstText(
    createdBy && typeof createdBy === "object" ? createdBy.roleName : "",
    createdBy && typeof createdBy === "object" ? createdBy.role : "",
    createdBy?.roleId?.label,
    createdBy?.roleId?.name,
    createdBy?.roleId?.roleName,
    typeof createdBy?.roleId === "string" && !isObjectIdString(createdBy.roleId)
      ? createdBy.roleId
      : "",
    nestedUser?.roleName,
    nestedUser?.role,
    nestedUser?.roleId?.label,
    nestedUser?.roleId?.name,
  );
};

const formatExactRoleName = (raw) => {
  const value = String(raw || "").trim();
  if (!value || isObjectIdString(value)) return "";
  const key = roleKey(value);
  if (
    key === "owner" ||
    key === "owners" ||
    key === "listing" ||
    key === "featured" ||
    key === "normal" ||
    key === "prime" ||
    key === "sponsored"
  ) {
    return "";
  }
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/** Card badge: exact createdBy role (Agent, User). Falls back to listingSource. */
export const getCreatedByRoleLabel = (property) =>
  formatExactRoleName(createdByExactRoleRaw(property)) ||
  formatExactRoleName(
    firstText(
      property?.listingSource,
      property?.postedBy?.roleName,
      property?.postedBy?.role,
    ),
  );
