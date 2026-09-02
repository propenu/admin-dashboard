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

/**
 * True only for listings waiting in the approval queue.
 * Active/live listings never show Approve (even if nested approval was stale).
 * After an edit on a live listing, status becomes pending again → Approve returns.
 */
export const isPropertyAwaitingApproval = (property) => {
  if (!property) return false;
  const status = String(property.status || "").toLowerCase();
  if (status === "active") return false;
  return status === "pending";
};

/** Previously live listing edited → needs hierarchy re-approve + doc re-verify */
export const isPropertyReverification = (property) =>
  Boolean(property?.approval?.reverificationRequired) &&
  isPropertyAwaitingApproval(property);

export const canViewPropertyApprovals = (user) =>
  canViewPendingProjectApprovals(user);

/**
 * Show Approve / Review for a listing based on createdBy hierarchy.
 * Agent details page (pending @ 70%) and user docs review (pending @ 80%) both use this.
 */
export const canApproveProperty = (user, property) => {
  if (!property || !user) return false;
  if (!isPropertyAwaitingApproval(property)) return false;

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

/** Dashboard Approve/Review only for true pending listings. */
export const canReviewPropertyListing = (user, property) => {
  if (!canApproveProperty(user, property)) return false;
  return String(property?.status || "").toLowerCase() === "pending";
};

/** Head / approver roles that may edit a listing while it is still pending. */
const PROPERTY_PENDING_EDIT_HEAD_ROLES = new Set([
  "super_admin",
  "admin",
  "ceo",
  "founder",
  "operations_head",
  "operation_head",
  "business_development_head",
  "business_development_manager",
  "regional_manager",
  "sales_manager",
  "customer_support_head",
]);

export const isPropertyHeadRole = (user) => {
  const role = normalizeProjectRole(user?.roleName || user?.role);
  if (PROPERTY_PENDING_EDIT_HEAD_ROLES.has(role)) return true;
  return canViewPendingProjectApprovals(user);
};

/**
 * Pending listings: Edit for heads (and anyone who can approve that listing).
 * Non-pending: callers keep their existing Edit behavior.
 */
export const canEditPendingProperty = (user, property) => {
  if (!property || !user) return false;
  if (!isPropertyAwaitingApproval(property)) return false;
  if (isPropertyHeadRole(user)) return true;
  return canApproveProperty(user, property);
};
