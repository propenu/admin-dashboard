import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTicketDashboardOverview } from "../../../features/ticket/ticket_system";
import { normalizeTicketOverview } from "../utils/ticketNormalizers";

export function useTicketDashboard() {
  const query = useQuery({
    queryKey: ["ticket-dashboard", "overview"],
    queryFn: getTicketDashboardOverview,
    refetchInterval: 60000,
  });

  const overview = useMemo(
    () => normalizeTicketOverview(query.data),
    [query.data],
  );

  return {
    ...query,
    overview,
  };
}
