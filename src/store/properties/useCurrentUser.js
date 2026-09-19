import { useAuthUser } from "../../hooks/useAuthUser";

/**
 * Shared current-user hook (backed by one React Query /me cache).
 * Prefer useAuthUser / useAuthUserProfile for new code.
 */
export const useCurrentUser = (options = {}) => {
  return useAuthUser({
    // Keep permissions reasonably fresh without remount storms.
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    ...options,
  });
};
