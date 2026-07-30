/**
 * Frontend-only ticket role access model.
 * Desk roles → shared Ticket Desk (Overview / Queue / Config).
 * CCE desk → same Overview / Queue / Config UI, but data is exclusive to assigned-to-me.
 * Staff roles → personal inbox (assigned / created / requested).
 */

const normalizeRole = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Shared inbox — see all tickets, Overview + Config. */
export const TICKET_DESK_ROLES = new Set([
  "super_admin",
  "admin",
  "customer_support_head",
]);

/**
 * Customer Care Executive — same desk UI as before, exclusive assigned data only.
 */
export const TICKET_EXECUTIVE_ROLES = new Set([
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
]);

export const isTicketExecutiveRole = (role = "") => {
  const key = normalizeRole(role);
  if (TICKET_EXECUTIVE_ROLES.has(key)) return true;
  if (key.includes("customer_support_head") || key.includes("team_lead")) return false;
  return (
    key === "customer_care" ||
    key.startsWith("customer_care_executive") ||
    (key.includes("customer_care") && key.includes("executive"))
  );
};

export const getTicketUserId = (user) =>
  String(user?._id || user?.id || user?.userId || "").trim();

export const createdByTagForUser = (userId) => {
  const id = String(userId || "").trim();
  return id ? `created_by_${id}` : null;
};

export const involvedTagForUser = (userId) => {
  const id = String(userId || "").trim();
  return id ? `involved_${id}` : null;
};

export const resolveTicketRoleAccess = (user) => {
  const roleName = normalizeRole(user?.roleName || user?.role);
  const userId = getTicketUserId(user);
  const isExecutive = isTicketExecutiveRole(roleName);
  const isDeskRole = !isExecutive && TICKET_DESK_ROLES.has(roleName);

  // CCE: keep old Customer Care desk (Overview / Queue / Config).
  // Unique data = assigned to me + created by me + reassigned by me to staff.
  if (isExecutive) {
    return {
      mode: "desk",
      roleName,
      userId,
      canUseFullDesk: true,
      canAssign: true,
      canCreate: true,
      exclusiveAssignee: true,
      title: "Ticket Desk",
      subtitle: "Your assigned, created, and reassigned tickets.",
      notice: null,
      availableTabs: null,
      personalScopes: null,
    };
  }

  if (isDeskRole) {
    return {
      mode: "desk",
      roleName,
      userId,
      canUseFullDesk: true,
      canAssign: true,
      canCreate: true,
      exclusiveAssignee: false,
      title: "Ticket Desk",
      subtitle: "Shared support inbox for overview, queue, and config.",
      notice: null,
      availableTabs: null,
      personalScopes: null,
    };
  }

  return {
    mode: "personal",
    roleName,
    userId,
    canUseFullDesk: false,
    canAssign: false,
    canCreate: true,
    exclusiveAssignee: false,
    title: "My Tickets",
    subtitle: "Tickets assigned to you or created by you.",
    notice: null,
    availableTabs: [{ key: "queue", label: "My Tickets", icon: null }],
    personalScopes: [
      {
        key: "mine",
        label: "All mine",
        hint: "Assigned to me + created by me + requested by me",
      },
      {
        key: "assigned",
        label: "Assigned to me",
        hint: "Support desk sent this ticket to your user ID",
      },
      {
        key: "created",
        label: "Created by me",
        hint: "Tickets you raised from this desk",
      },
      {
        key: "requested",
        label: "I am requester",
        hint: "You are the customer/requester on the ticket",
      },
    ],
  };
};

export const ticketInvolvesUser = (ticket, userId) => {
  if (!ticket || !userId) return false;
  const id = String(userId);
  const assigned = String(ticket?.assignedTo?.userId || "") === id;
  const requested = String(ticket?.requester?.userId || "") === id;
  const createTag = createdByTagForUser(id);
  const involveTag = involvedTagForUser(id);
  const tags = Array.isArray(ticket?.tags) ? ticket.tags.map(String) : [];
  const created =
    String(ticket?.metadata?.createdByUserId || "") === id ||
    (createTag ? tags.includes(createTag) : false);
  const involved =
    (Array.isArray(ticket?.metadata?.involvedAssigneeIds) &&
      ticket.metadata.involvedAssigneeIds.map(String).includes(id)) ||
    (involveTag ? tags.includes(involveTag) : false);
  return {
    assigned,
    requested,
    created,
    involved,
    any: assigned || requested || created || involved,
  };
};

export const involvementBadge = (ticket, userId) => {
  const flags = ticketInvolvesUser(ticket, userId);
  if (!flags) return null;
  if (flags.assigned && flags.created) return "Assigned · You created";
  if (flags.assigned) return "Assigned to you";
  if (flags.created && !flags.assigned) return "Created by you";
  if (flags.involved && !flags.assigned) return "You reassigned";
  if (flags.requested) return "You are requester";
  return null;
};
