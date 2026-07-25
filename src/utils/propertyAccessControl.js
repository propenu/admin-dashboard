/**
 * Hierarchy-based property listing approve / review access.
 * Mirrors projectAccessControl + property-service listingApprovalGuard.
 */

import {
  canApproveProject,
  canViewPendingProjectApprovals,
  getProjectRoleRank,
  normalizeProjectRole,
} from "./projectAccessControl";
import { getPropertyCreatorRole } from "./propertyCreatorRole";

/** Pending agent path (~70%) or user docs path (~80% / pending). */
export const isPropertyAwaitingApproval = (property) => {
  if (!property) return false;
  const status = String(property.status || "").toLowerCase();
  const approval = String(property.approval?.status || "").toLowerCase();
  const percent = Number(property.completion?.percent || 0);
  if (status === "pending" || approval === "pending") return true;
  if (percent === 70 || percent === 80) return true;
  return false;
};

export const canViewPropertyApprovals = (user) =>
  canViewPendingProjectApprovals(user);

/**
 * Show Approve / Review for a listing based on createdBy hierarchy.
 * Agent details page (70%) and user docs review (80% pending) both use this.
 */
export const canApproveProperty = (user, property) => {
  if (!property || !user) return false;
  if (!isPropertyAwaitingApproval(property) && String(property.status).toLowerCase() !== "pending") {
    // Still allow hierarchy check when explicitly pending-like
    const status = String(property.status || "").toLowerCase();
    if (status !== "pending" && status !== "draft") return false;
  }

  const creatorRole = getPropertyCreatorRole(property);
  const synthetic = {
    ...property,
    createdBy:
      property.createdBy && typeof property.createdBy === "object"
        ? {
            ...property.createdBy,
            roleName:
              property.createdBy.roleName ||
              property.createdBy.role ||
              creatorRole,
          }
        : property.createdBy,
    postedBy: property.postedBy || {
      roleName: creatorRole,
      userId: property.createdBy?._id || property.createdBy,
    },
  };

  // Reuse project hierarchy; expand SM for marketplace agent/user like backend.
  if (canApproveProject(user, synthetic)) return true;

  const actorRole = normalizeProjectRole(user?.roleName || user?.role);
  const actorId = String(user?._id || user?.id || user?.userId || "");
  const creatorId = String(
    property?.createdBy?._id ||
      property?.createdBy?.id ||
      property?.createdBy ||
      property?.postedBy?.userId ||
      "",
  );
  const normalizedCreator = normalizeProjectRole(creatorRole);

  if (
    actorId &&
    creatorId &&
    actorId === creatorId &&
    actorRole !== "super_admin" &&
    actorRole !== "admin"
  ) {
    return false;
  }

  const smMayApprove = new Set([
    "sales_agent",
    "sales_executive",
    "agent",
    "user",
    "builder",
    "builder_staff",
  ]);

  if (
    actorRole === "sales_manager" &&
    smMayApprove.has(normalizedCreator) &&
    getProjectRoleRank(actorRole) > getProjectRoleRank(normalizedCreator)
  ) {
    return true;
  }

  return false;
};

/** Dashboard "Review" for docs path (pending @ ~80%). */
export const canReviewPropertyListing = (user, property) => {
  if (!canApproveProperty(user, property)) return false;
  const status = String(property?.status || "").toLowerCase();
  const percent = Number(property?.completion?.percent || 0);
  return status === "pending" || percent === 70 || percent === 80;
};
