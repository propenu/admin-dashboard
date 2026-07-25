/**
 * Frontend-only ticket role access model.
 * Desk roles → shared Ticket Desk (Overview / Queue / Config).
 * Staff roles → personal inbox (assigned to me + created by me + requested by me).
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
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
]);

export const getTicketUserId = (user) =>
  String(user?._id || user?.id || user?.userId || "").trim();

export const createdByTagForUser = (userId) => {
  const id = String(userId || "").trim();
  return id ? `created_by_${id}` : null;
};

export const resolveTicketRoleAccess = (user) => {
  const roleName = normalizeRole(user?.roleName || user?.role);
  const userId = getTicketUserId(user);
  const isDeskRole = TICKET_DESK_ROLES.has(roleName);

  if (isDeskRole) {
    return {
      mode: "desk",
      roleName,
      userId,
      canUseFullDesk: true,
      canAssign: true,
      canCreate: true,
      title: "Ticket Desk",
      subtitle:
        "Shared support inbox — Overview, full Queue, and Config. Create tickets and assign them to staff by user ID.",
      notice:
        "You see every ticket in the desk. When you create and assign a ticket, that staff member sees it under My Tickets. You keep seeing it here in the shared Queue.",
      availableTabs: null, // default Overview / Queue / Config
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
    title: "My Tickets",
    subtitle:
      "Tickets assigned to you, tickets you created, and tickets where you are the requester — based on your logged-in user.",
    notice:
      "This list is personal to your login. Create a ticket and send it to a teammate — you still see it under Created by me; they see it under Assigned to me.",
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
  const tag = createdByTagForUser(id);
  const created =
    String(ticket?.metadata?.createdByUserId || "") === id ||
    (Array.isArray(ticket?.tags) && tag ? ticket.tags.includes(tag) : false);
  return { assigned, requested, created, any: assigned || requested || created };
};

export const involvementBadge = (ticket, userId) => {
  const flags = ticketInvolvesUser(ticket, userId);
  if (!flags) return null;
  if (flags.assigned && flags.created) return "Assigned · You created";
  if (flags.assigned) return "Assigned to you";
  if (flags.created) return "Created by you";
  if (flags.requested) return "You are requester";
  return null;
};
