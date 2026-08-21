import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import { filterUsersInReportingTree } from "../../../utils/reportingTree";
import {
  BDH_TEAM_ROLES,
  enrichTeamMember,
  normalizeRmRole,
  unpackList,
} from "../regionalManagerDashboard/regionalManagerDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

export function useBdhDashboard() {
  const meQuery = useQuery({
    queryKey: ["bdh-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 60_000,
  });

  const usersQuery = useQuery({
    queryKey: ["bdh-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers({ scope: "team_directory" });
        return unpackList(response?.data || response);
      }, []),
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  const me = meQuery.data;
  const actorId = String(me?._id || me?.id || "");

  const teamFloor = useMemo(() => {
    const now = Date.now();
    const list = Array.isArray(usersQuery.data) ? usersQuery.data : [];
    // Prefer reports-to chain under this BDH; fall back to role descendants if empty.
    const inTree = actorId ? filterUsersInReportingTree(list, actorId) : [];
    const pool = inTree.length ? inTree : list;
    return pool
      .filter((u) => BDH_TEAM_ROLES.has(normalizeRmRole(u.roleName)))
      .map((u) => enrichTeamMember(u, now));
  }, [actorId, usersQuery.data]);

  const summary = useMemo(() => {
    const online = teamFloor.filter((m) => m.isOnline).length;
    const active = teamFloor.filter((m) => m.isAccountActive).length;
    const rms = teamFloor.filter((m) => m.group === "regional_manager").length;
    return {
      teamCount: teamFloor.length,
      teamOnline: online,
      teamOffline: teamFloor.filter((m) => m.isAccountActive && !m.isOnline).length,
      activeTeam: active,
      regionalManagers: rms,
    };
  }, [teamFloor]);

  const refetch = async () => {
    await Promise.all([meQuery.refetch(), usersQuery.refetch()]);
  };

  return {
    me,
    currentUserName: me?.name || me?.fullName || "Business Development Head",
    teamFloor,
    summary,
    isLoading: meQuery.isLoading || usersQuery.isLoading,
    isFetching: meQuery.isFetching || usersQuery.isFetching,
    refetch,
  };
}
