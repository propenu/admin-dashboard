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
import { createdByTagForUser } from "../utils/ticketRoleAccess";

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

const stripPersonalKeys = (filters = {}) => {
  const next = { ...filters };
  delete next.personalScope;
  delete next.assignedOrRequested;
  delete next.assignedTo;
  delete next.requesterId;
  delete next.tag;
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

/**
 * Desk → single unscoped list.
 * Personal → merge assigned/requested + created-by-me (tag) so creators still see tickets they raised.
 */
export function useRoleScopedTicketList({ mode, userId, filters, enabled = true }) {
  const personalScope = filters?.personalScope || "mine";
  const base = useMemo(() => stripPersonalKeys(filters || {}), [filters]);
  const createTag = createdByTagForUser(userId);

  const deskFilters = useMemo(() => ({ ...base }), [base]);

  const assignedFilters = useMemo(
    () => ({
      ...base,
      page: 1,
      limit: Math.max(Number(base.limit) || 20, 50),
      assignedTo: userId,
    }),
    [base, userId],
  );

  const requestedFilters = useMemo(
    () => ({
      ...base,
      page: 1,
      limit: Math.max(Number(base.limit) || 20, 50),
      requesterId: userId,
    }),
    [base, userId],
  );

  const involvedFilters = useMemo(
    () => ({
      ...base,
      page: 1,
      limit: Math.max(Number(base.limit) || 20, 50),
      assignedOrRequested: userId,
    }),
    [base, userId],
  );

  const createdFilters = useMemo(
    () => ({
      ...base,
      page: 1,
      limit: Math.max(Number(base.limit) || 20, 50),
      tag: createTag || "__none__",
    }),
    [base, createTag],
  );

  const deskQuery = useTicketList(deskFilters, enabled && mode === "desk");

  const personalQueries = useQueries({
    queries: [
      {
        queryKey: ticketKeys.list({ scope: "involved", ...involvedFilters }),
        queryFn: () => getTickets(involvedFilters),
        enabled:
          enabled &&
          mode === "personal" &&
          Boolean(userId) &&
          (personalScope === "mine"),
        staleTime: 30000,
        keepPreviousData: true,
      },
      {
        queryKey: ticketKeys.list({ scope: "assigned", ...assignedFilters }),
        queryFn: () => getTickets(assignedFilters),
        enabled:
          enabled &&
          mode === "personal" &&
          Boolean(userId) &&
          personalScope === "assigned",
        staleTime: 30000,
        keepPreviousData: true,
      },
      {
        queryKey: ticketKeys.list({ scope: "requested", ...requestedFilters }),
        queryFn: () => getTickets(requestedFilters),
        enabled:
          enabled &&
          mode === "personal" &&
          Boolean(userId) &&
          personalScope === "requested",
        staleTime: 30000,
        keepPreviousData: true,
      },
      {
        queryKey: ticketKeys.list({ scope: "created", ...createdFilters }),
        queryFn: () => getTickets(createdFilters),
        enabled:
          enabled &&
          mode === "personal" &&
          Boolean(userId) &&
          Boolean(createTag) &&
          (personalScope === "mine" || personalScope === "created"),
        staleTime: 30000,
        keepPreviousData: true,
      },
    ],
  });

  if (mode === "desk") {
    return {
      data: deskQuery.data,
      tickets: deskQuery.data?.data || [],
      meta: deskQuery.data?.meta || deskQuery.data?.pagination,
      isLoading: deskQuery.isLoading,
      isFetching: deskQuery.isFetching,
      refetch: deskQuery.refetch,
    };
  }

  const lists = personalQueries.map((q) => q.data?.data || []);
  const tickets = dedupeTickets(lists);
  const isLoading = personalQueries.some((q) => q.isLoading);
  const isFetching = personalQueries.some((q) => q.isFetching);

  return {
    data: {
      data: tickets,
      meta: { total: tickets.length, page: 1, limit: tickets.length, pages: 1 },
    },
    tickets,
    meta: { total: tickets.length, page: 1, limit: tickets.length, pages: 1 },
    isLoading,
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
