import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTicketComment,
  assignTicket,
  changeTicketPriority,
  changeTicketStatus,
  createTicketAttachment,
  createTicket,
  getTicketAgentPerformance,
  getTicketById,
  getTicketDashboardTrends,
  getTickets,
  listTicketCategories,
  listTicketDepartments,
  updateTicket,
} from "../../../features/ticket/ticket_system";
import { createdByTagForUser, ticketInvolvesUser } from "../utils/ticketRoleAccess";

export const ticketKeys = {
  all: ["tickets"],
  list: (filters) => ["tickets", "list", filters],
  detail: (id) => ["tickets", "detail", id],
  trends: (params) => ["tickets", "trends", params],
  agents: (params) => ["tickets", "agents", params],
  categories: ["tickets", "categories"],
  departments: ["tickets", "departments"],
  overview: ["ticket-dashboard", "overview"],
};

export function useTicketList(filters, enabled = true) {
  const stableFilters = useMemo(() => filters, [filters]);
  return useQuery({
    queryKey: ticketKeys.list(stableFilters),
    queryFn: () => getTickets(stableFilters),
    enabled,
    keepPreviousData: true,
    staleTime: 30000,
  });
}

const OPEN_BUCKET_STATUSES = new Set([
  "open",
  "assigned",
  "under_review",
  "awaiting_user_response",
  "in_progress",
  "escalated",
  "reopened",
  "waiting_for_customer",
  "waiting_for_internal_team",
]);

const stripPersonalKeys = (filters = {}) => {
  const next = { ...filters };
  delete next.personalScope;
  delete next.assignedOrRequested;
  delete next.assignedTo;
  delete next.ownedBy;
  delete next.requesterId;
  delete next.tag;
  delete next.assignment;
  delete next.openBucket;
  delete next.deskRelation;
  // Overview uses from/to; list API expects createdFrom/createdTo.
  if (next.from && !next.createdFrom) next.createdFrom = next.from;
  if (next.to && !next.createdTo) next.createdTo = next.to;
  delete next.from;
  delete next.to;
  return next;
};

const dedupeTickets = (lists = []) => {
  const map = new Map();
  lists.flat().forEach((ticket) => {
    const id = ticket?._id || ticket?.id;
    if (!id) return;
    if (!map.has(String(id))) map.set(String(id), ticket);
  });
  return [...map.values()].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
};

const matchesLocalFilters = (ticket, filters = {}, { userId = "" } = {}) => {
  if (filters.openBucket === "true" || filters.openBucket === true) {
    if (!OPEN_BUCKET_STATUSES.has(String(ticket?.status || "").toLowerCase())) return false;
  } else if (filters.status) {
    const status = String(ticket?.status || "").toLowerCase();
    if (status !== String(filters.status).toLowerCase()) return false;
  }
  if (filters.priority) {
    const priority = String(ticket?.priority || "").toLowerCase();
    if (priority !== String(filters.priority).toLowerCase()) return false;
  }
  if (filters.assignment === "unassigned") {
    if (ticket?.assignedTo?.userId || ticket?.assignedTo?.name) return false;
  }
  if (filters.deskRelation && userId) {
    const flags = ticketInvolvesUser(ticket, userId);
    const relation = String(filters.deskRelation).toLowerCase();
    if (relation === "assigned" && !flags?.assigned) return false;
    if (relation === "created" && !flags?.created) return false;
    if (relation === "reassigned" && !(flags?.involved && !flags?.assigned)) return false;
  }
  if (filters.overdue === "true" || filters.overdue === true) {
    if (!ticket?.dueAt) return false;
    const due = new Date(ticket.dueAt).getTime();
    const closed = ["resolved", "closed"].includes(String(ticket.status || "").toLowerCase());
    if (closed || Number.isNaN(due) || due >= Date.now()) return false;
  }
  if (filters.overdue === "false" || filters.overdue === false) {
    const closed = ["resolved", "closed"].includes(String(ticket.status || "").toLowerCase());
    if (!closed && ticket?.dueAt) {
      const due = new Date(ticket.dueAt).getTime();
      if (!Number.isNaN(due) && due < Date.now()) return false;
    }
  }
  const q = String(filters.q || "").trim().toLowerCase();
  if (q) {
    const haystack = [
      ticket?.title,
      ticket?.description,
      ticket?.requester?.name,
      ticket?.requester?.email,
      ticket?.assignedTo?.name,
      ...(Array.isArray(ticket?.tags) ? ticket.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const hasClientOnlyFilters = (filters = {}) =>
  filters.assignment === "unassigned" ||
  filters.openBucket === "true" ||
  filters.openBucket === true ||
  filters.overdue === "false" ||
  filters.overdue === false ||
  Boolean(filters.deskRelation);

const buildPersonalFilterSets = ({ personalScope, userId, base, createTag }) => {
  if (!userId) return [];
  const common = {
    ...base,
    page: 1,
    limit: Math.max(Number(base.limit) || 20, 100),
  };
  // Drop API overdue=false (backend ignores false); we filter that client-side.
  if (common.overdue === "false" || common.overdue === false) {
    delete common.overdue;
  }

  if (personalScope === "assigned") {
    return [{ key: "assigned", ...common, assignedTo: userId }];
  }
  if (personalScope === "requested") {
    return [{ key: "requested", ...common, requesterId: userId }];
  }
  if (personalScope === "created") {
    return createTag ? [{ key: "created", ...common, tag: createTag }] : [];
  }
  // All mine = assigned/requested OR created by me
  return [
    { key: "involved", ...common, assignedOrRequested: userId },
    ...(createTag ? [{ key: "created", ...common, tag: createTag }] : []),
  ];
};

/**
 * Desk → shared list (optionally exclusive to assignedTo when CCE).
 * Personal → only active scope queries (no stale merge from other pills).
 */
export function useRoleScopedTicketList({
  mode,
  userId,
  filters,
  enabled = true,
  exclusiveAssignee = false,
}) {
  const personalScope = filters?.personalScope || "mine";
  const base = useMemo(() => stripPersonalKeys(filters || {}), [filters]);
  const createTag = createdByTagForUser(userId);

  const deskFilters = useMemo(() => {
    const next = { ...base };
    if (next.overdue === "false" || next.overdue === false) delete next.overdue;
    // Client-only open bucket — do not send a single status to the API.
    if (filters?.openBucket === "true" || filters?.openBucket === true) {
      delete next.status;
    }
    // Fetch a wider page when client-side filters need to match overview counts.
    if (hasClientOnlyFilters(filters)) {
      next.limit = Math.max(Number(next.limit) || 20, 100);
      next.page = 1;
    }
    // CCE unique desk: assigned + created by me + reassigned by me to staff.
    if (exclusiveAssignee && userId) {
      next.ownedBy = userId;
      delete next.assignedTo;
      next.limit = Math.max(Number(next.limit) || 20, 100);
    }
    return next;
  }, [base, filters, exclusiveAssignee, userId]);

  const personalFilterSets = useMemo(
    () =>
      mode === "personal"
        ? buildPersonalFilterSets({ personalScope, userId, base, createTag })
        : [],
    [mode, personalScope, userId, base, createTag],
  );

  // Exclusive CCE desk uses ownedBy on the desk query (not personal pills).
  const deskQuery = useTicketList(
    deskFilters,
    enabled && mode === "desk",
  );

  const personalQueries = useQueries({
    queries: personalFilterSets.map((filterSet) => {
      const { key, ...apiFilters } = filterSet;
      return {
        queryKey: ticketKeys.list({ mode: "personal", scope: key, personalScope, ...apiFilters }),
        queryFn: () => getTickets(apiFilters),
        enabled: enabled && mode === "personal" && Boolean(userId),
        staleTime: 10_000,
      };
    }),
  });

  const queryEpoch = personalQueries.map((q) => `${q.status}:${q.dataUpdatedAt || 0}`).join("|");
  const personalTickets = useMemo(() => {
    if (mode !== "personal") return [];
    // Only the active scope's queries exist in personalFilterSets — no stale pill merge.
    const lists = personalQueries.map((q) => {
      if (q.isPending && !q.data) return [];
      return q.data?.data || [];
    });
    return dedupeTickets(lists).filter((ticket) =>
      matchesLocalFilters(ticket, filters, { userId }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryEpoch tracks query result identity
  }, [
    mode,
    personalScope,
    queryEpoch,
    userId,
    filters.status,
    filters.priority,
    filters.q,
    filters.overdue,
    filters.assignment,
    filters.openBucket,
    filters.deskRelation,
  ]);

  if (mode === "desk") {
    const mineId = exclusiveAssignee ? String(userId || "") : "";
    const deskTickets = (deskQuery.data?.data || [])
      .filter((ticket) => {
        if (!mineId) return true;
        const flags = ticketInvolvesUser(ticket, mineId);
        return Boolean(flags?.assigned || flags?.created || flags?.involved);
      })
      .filter((ticket) => matchesLocalFilters(ticket, filters, { userId: mineId || userId }));
    const apiMeta = deskQuery.data?.meta || deskQuery.data?.pagination || {};
    const clientOnly = hasClientOnlyFilters(filters) || Boolean(mineId);
    return {
      data: deskQuery.data,
      tickets: deskTickets,
      meta: {
        ...apiMeta,
        total: clientOnly ? deskTickets.length : Number(apiMeta.total ?? deskTickets.length),
      },
      isLoading: deskQuery.isLoading,
      isFetching: deskQuery.isFetching,
      refetch: deskQuery.refetch,
    };
  }

  const waitingForFirstPage =
    personalFilterSets.length > 0 &&
    personalQueries.some((q) => q.isPending || q.isLoading) &&
    !personalQueries.some((q) => q.isSuccess || q.isError);
  const isFetching = personalQueries.some((q) => q.isFetching);

  return {
    data: {
      data: personalTickets,
      meta: {
        total: personalTickets.length,
        page: 1,
        limit: personalTickets.length,
        pages: 1,
      },
    },
    tickets: personalTickets,
    meta: {
      total: personalTickets.length,
      page: 1,
      limit: personalTickets.length,
      pages: 1,
    },
    isLoading: waitingForFirstPage,
    isFetching,
    refetch: () => Promise.all(personalQueries.map((q) => q.refetch())),
  };
}

export function useTicketDetail(ticketId) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 15000,
  });
}

export function useTicketTrends(params = { days: 14 }) {
  return useQuery({
    queryKey: ticketKeys.trends(params),
    queryFn: () => getTicketDashboardTrends(params),
    staleTime: 60000,
  });
}

export function useTicketAgentPerformance(params) {
  return useQuery({
    queryKey: ticketKeys.agents(params),
    queryFn: () => getTicketAgentPerformance(params),
    staleTime: 60000,
  });
}

export function useTicketCatalogs() {
  const categories = useQuery({
    queryKey: ticketKeys.categories,
    queryFn: () => listTicketCategories({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const departments = useQuery({
    queryKey: ticketKeys.departments,
    queryFn: () => listTicketDepartments({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories,
    departments,
    categoryItems: categories.data?.data || [],
    departmentItems: departments.data?.data || [],
  };
}

export function useTicketActions() {
  const queryClient = useQueryClient();

  const invalidateTickets = () => {
    queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    queryClient.invalidateQueries({ queryKey: ticketKeys.overview });
    queryClient.invalidateQueries({ queryKey: ["customer-care-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["customer-support-head-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["ticket-dashboard"] });
  };

  return {
    createTicket: useMutation({
      mutationFn: createTicket,
      onSuccess: invalidateTickets,
    }),
    updateTicket: useMutation({
      mutationFn: updateTicket,
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, status, payload }) =>
        changeTicketStatus({
          id,
          payload: payload || (status ? { status } : {}),
        }),
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    changePriority: useMutation({
      mutationFn: ({ id, priority, payload }) =>
        changeTicketPriority({
          id,
          payload: payload || (priority ? { priority } : {}),
        }),
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    assignTicket: useMutation({
      mutationFn: assignTicket,
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    addComment: useMutation({
      mutationFn: addTicketComment,
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    createAttachment: useMutation({
      mutationFn: createTicketAttachment,
      onSuccess: (attachment) => {
        invalidateTickets();
        if (attachment?.ticketId) queryClient.invalidateQueries({ queryKey: ticketKeys.detail(attachment.ticketId) });
      },
    }),
  };
}

export function buildTicketActor(user) {
  if (!user) return undefined;
  return {
    userId: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.roleName || user.role,
  };
}
