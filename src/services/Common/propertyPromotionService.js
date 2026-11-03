import propertyApi from "../../config/PropertyApi";

const CATEGORIES = new Set([
  "residential",
  "commercial",
  "land",
  "agricultural",
]);

const assertCategory = (category) => {
  const key = String(category || "")
    .trim()
    .toLowerCase();
  if (!CATEGORIES.has(key)) {
    throw new Error(`Invalid property category: ${category}`);
  }
  return key;
};

/** PATCH /{category}/:id/promote */
export const promotePropertyListing = (category, id, data = {}) => {
  const cat = assertCategory(category);
  return propertyApi.patch(`/${cat}/${id}/promote`, data);
};

/** PATCH /{category}/:id/renew — direct renew with optional custom days (1–365). */
export const renewPropertyListing = (category, id, data = {}) => {
  const cat = assertCategory(category);
  const n = Math.trunc(Number(data?.days ?? 40));
  const days = Number.isFinite(n) && n > 0 ? Math.min(n, 365) : 40;
  return propertyApi.patch(
    `/${cat}/${id}/renew`,
    { ...data, days },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );
};

/** PATCH /{category}/:id/expire */
export const expirePropertyListing = (category, id) => {
  const cat = assertCategory(category);
  return propertyApi.patch(`/${cat}/${id}/expire`);
};

/** PATCH /{category}/:id/reset */
export const resetPropertyListing = (category, id) => {
  const cat = assertCategory(category);
  return propertyApi.patch(`/${cat}/${id}/reset`);
};
