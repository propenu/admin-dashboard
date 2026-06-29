export const getPropertyCreatorRole = (property) => {
  const createdBy = property?.createdBy;
  const role =
    createdBy?.roleName ||
    createdBy?.role ||
    createdBy?.roleId?.name ||
    createdBy?.roleId?.roleName ||
    "";

  return String(role).trim().toLowerCase();
};

export const isAgentCreatedProperty = (property) =>
  getPropertyCreatorRole(property).includes("agent");

export const getPropertyCreatorTag = (property) => {
  const role = getPropertyCreatorRole(property);

  if (role.includes("agent")) return "Agent";
  if (role === "user" || role === "owner") return "User";
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "builder") return "Builder";
  return role ? role.replace(/_/g, " ") : "User";
};
