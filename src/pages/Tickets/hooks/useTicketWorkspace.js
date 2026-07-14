import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTicketComment,
  assignTicket,
  changeTicketPriority,
  changeTicketStatus,
  createTicket,
  getTicketAgentPerformance,
  getTicketById,
  getTicketDashboardTrends,
  getTickets,
  listTicketCategories,
  listTicketDepartments,
  updateTicket,
} from "../../../features/ticket/ticket_system";

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

export function useTicketList(filters) {
  const stableFilters = useMemo(() => filters, [filters]);
  return useQuery({
    queryKey: ticketKeys.list(stableFilters),
    queryFn: () => getTickets(stableFilters),
    keepPreviousData: true,
    staleTime: 30000,
  });
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
      mutationFn: changeTicketStatus,
      onSuccess: (ticket) => {
        invalidateTickets();
        if (ticket?._id) queryClient.setQueryData(ticketKeys.detail(ticket._id), ticket);
      },
    }),
    changePriority: useMutation({
      mutationFn: changeTicketPriority,
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
