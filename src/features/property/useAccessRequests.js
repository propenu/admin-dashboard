import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAccessRequests } from "./propertyService";
import { useAccessLiveUpdates } from "./accessLive";

export const ACCESS_REQUESTS_KEY = ["access-requests"];

export const ACCESS_AREA_LABELS = {
  properties: "Deleted properties",
  propertyLeads: "Deleted property leads",
  projects: "Deleted projects",
  projectLeads: "Deleted project leads",
  leadContacts: "Full lead contacts",
};

function useRefreshOnAccessChange() {
  const queryClient = useQueryClient();
  useAccessLiveUpdates(() => {
    queryClient.invalidateQueries({ queryKey: ACCESS_REQUESTS_KEY });
  });
}

/** Area keys the signed-in user has a pending request for. */
export function useMyPendingAccessAreas(enabled = true) {
  useRefreshOnAccessChange();
  const { data } = useQuery({
    queryKey: [...ACCESS_REQUESTS_KEY, "mine"],
    queryFn: async () => (await listAccessRequests({ box: "mine" })).data?.data || [],
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  return new Set((data || []).filter((row) => row.status === "pending").map((row) => row.area));
}

export function usePendingAccessRequests(areas, enabled = true) {
  useRefreshOnAccessChange();
  return useQuery({
    queryKey: [...ACCESS_REQUESTS_KEY, "pending", areas.join(",")],
    queryFn: async () => (await listAccessRequests({ box: "pending", areas })).data?.data || [],
    enabled,
    staleTime: 0,
  });
}
