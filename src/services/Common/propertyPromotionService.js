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

/** PATCH /{category}/:id/renew */
export const renewPropertyListing = (category, id, data = { days: 10 }) => {
  const cat = assertCategory(category);
  return propertyApi.patch(`/${cat}/${id}/renew`, data);
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
