import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDeletedAccess } from "./propertyService";
import { useAccessLiveUpdates } from "./accessLive";

export const DELETED_ACCESS_KEY = ["deleted-access"];

const NO_AREA = { view: false, headsEnabled: false, teamEnabled: false, canManageHeads: false, canManageTeam: false };

export function useDeletedAccess() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: DELETED_ACCESS_KEY,
    queryFn: async () => (await getDeletedAccess()).data?.data || null,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useAccessLiveUpdates(() => {
    queryClient.invalidateQueries({ queryKey: DELETED_ACCESS_KEY });
    queryClient.invalidateQueries({ queryKey: ["deleted-access-history"] });
  });

  const access = data || null;
  const level = access?.level || "staff";
  return {
    access,
    isLoading,
    isError,
    level,
    canPurge: Boolean(access?.canPurge),
    canManage: level === "super_admin" || level === "head",
    properties: access?.properties || NO_AREA,
    propertyLeads: access?.propertyLeads || NO_AREA,
    projects: access?.projects || NO_AREA,
    projectLeads: access?.projectLeads || NO_AREA,
  };
}
