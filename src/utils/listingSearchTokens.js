/**
 * Collect human-readable names/emails/ids from a user-like field
 * (plain string, ObjectId, or populated { name, email, userId }).
 */
export const personSearchTokens = (person) => {
  if (!person) return [];
  if (typeof person === "string" || typeof person === "number") {
    return [String(person)];
  }
  if (typeof person !== "object") return [];

  const nested =
    person.userId && typeof person.userId === "object" ? person.userId : null;

  return [
    person.name,
    person.fullName,
    person.email,
    person.phone,
    person.roleName,
    person._id,
    person.id,
    person.userId && typeof person.userId !== "object" ? person.userId : "",
    nested?.name,
    nested?.email,
    nested?.phone,
    nested?._id,
    nested?.id,
  ].filter(Boolean);
};

/** All people fields used on property / project listing cards. */
export const listingPeopleSearchTokens = (doc) => [
  ...personSearchTokens(doc?.createdBy),
  ...personSearchTokens(doc?.postedBy),
  ...personSearchTokens(doc?.approvedBy),
  ...personSearchTokens(doc?.ownerId),
];

/**
 * Core listing text fields + posted by / approved by / created by.
 * Used by properties + projects dashboard free-text search.
 */
export const listingSearchTokens = (doc) =>
  [
    doc?.title,
    doc?.slug,
    doc?._id,
    doc?.id,
    doc?.propertyCode,
    doc?.city,
    doc?.state,
    doc?.locality,
    doc?.address,
    doc?.buildingName,
    doc?.landName,
    doc?.projectName,
    ...listingPeopleSearchTokens(doc),
  ].filter(Boolean);
