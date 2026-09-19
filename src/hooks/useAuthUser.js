import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../features/user/userService";
import { getAuthToken } from "../utils/authToken";

/** Shared cache key used across dashboards, permissions, and layout. */
export const USER_DETAILS_QUERY_KEY = ["userDetails"];

async function fetchUserDetailsPayload() {
  const res = await getUserDetails();
  return res?.data ?? null;
}

/**
 * Industry-default session query:
 * - one /auth/me for the whole app
 * - cached so refresh/navigation does not flash a full-screen spinner
 * - does not refetch on every focus/mount
 */
export function useAuthUser(options = {}) {
  const hasToken = Boolean(getAuthToken());
  const { enabled, ...rest } = options;

  return useQuery({
    queryKey: USER_DETAILS_QUERY_KEY,
    queryFn: fetchUserDetailsPayload,
    enabled: hasToken && enabled !== false,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (count, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return count < 1;
    },
    ...rest,
  });
}

/** Normalized user object from the shared /me cache. */
export function useAuthUserProfile(options = {}) {
  const query = useAuthUser(options);
  const payload = query.data;
  const user =
    payload?.user ||
    (payload && typeof payload === "object" && (payload._id || payload.id || payload.roleName)
      ? payload
      : null);

  return {
    ...query,
    user,
    roleName: user?.roleName || user?.role?.name || "",
    permissions: Array.isArray(user?.permissions) ? user.permissions : [],
  };
}
