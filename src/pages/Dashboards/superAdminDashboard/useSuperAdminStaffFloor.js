import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import {
  enrichTeamMember,
  normalizeRmRole,
  SA_STAFF_ROLES,
  unpackList,
} from "../regionalManagerDashboard/regionalManagerDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

/**
 * Super Admin Staff Floor — all Propenu staff roles, live online/offline.
 * Same presence rules as BDH / RM Team Floor.
 */
export function useSuperAdminStaffFloor() {
  const meQuery = useQuery({
    queryKey: ["sa-staff-floor", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 60_000,
  });

  const usersQuery = useQuery({
    queryKey: ["sa-staff-floor", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers({ scope: "team_directory" });
        return unpackList(response?.data || response);
      }, []),
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  const teamFloor = useMemo(() => {
    const now = Date.now();
    const list = Array.isArray(usersQuery.data) ? usersQuery.data : [];
    return list
      .filter((u) => SA_STAFF_ROLES.has(normalizeRmRole(u.roleName)))
      .map((u) => enrichTeamMember(u, now));
  }, [usersQuery.data]);

  const summary = useMemo(() => {
    const online = teamFloor.filter((m) => m.isOnline).length;
    const active = teamFloor.filter((m) => m.isAccountActive).length;
    return {
      teamCount: teamFloor.length,
      teamOnline: online,
      teamOffline: teamFloor.filter((m) => m.isAccountActive && !m.isOnline).length,
      activeTeam: active,
      regionalManagers: teamFloor.filter((m) => m.group === "regional_manager").length,
    };
  }, [teamFloor]);

  const refetch = async () => {
    await Promise.all([meQuery.refetch(), usersQuery.refetch()]);
  };

  return {
    me: meQuery.data,
    currentUserName:
      meQuery.data?.name || meQuery.data?.fullName || "Super Admin",
    teamFloor,
    summary,
    isLoading: meQuery.isLoading || usersQuery.isLoading,
    isFetching: meQuery.isFetching || usersQuery.isFetching,
    refetch,
  };
}
