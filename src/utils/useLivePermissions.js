import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserDetails } from "../features/user/userService";
import { USER_DETAILS_QUERY_KEY } from "../hooks/useAuthUser";
import {
  getBuilderInvoiceAccess,
  getBuilderPlansUiFlags,
  getPlanAccess,
} from "./planAccessControl";

export const PERMISSIONS_UPDATED_EVENT = "propenu:permissions-updated";

const userFromCache = (cached) =>
  cached?.user ||
  (cached && (cached._id || cached.id || cached.roleName) ? cached : null);

/**
 * Live permissions for Accounts / pricing screens.
 * Uses shared React Query cache first; dual-fetch only when refreshing.
 * Focus refetch is throttled to avoid remount storms.
 */
export function useLivePermissions() {
  const queryClient = useQueryClient();
  const cachedUser = userFromCache(
    queryClient.getQueryData(USER_DETAILS_QUERY_KEY),
  );
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState("");
  const lastFetchAt = useRef(0);

  const refresh = useCallback(
    async ({ force = false } = {}) => {
      const now = Date.now();
      if (!force && now - lastFetchAt.current < 45_000 && user) {
        return user;
      }
      lastFetchAt.current = now;
      setLoading(!user);
      setError("");
      try {
        const res = await getUserDetails();
        const next = res?.data?.user || res?.data || null;

        if (!next) {
          throw new Error("Failed to load permissions");
        }

        setUser(next);
        queryClient.setQueryData(USER_DETAILS_QUERY_KEY, (old) => {
          if (old && typeof old === "object" && old.user) {
            return {
              ...old,
              user: { ...old.user, ...next, permissions: next.permissions },
            };
          }
          return { user: next };
        });
        return next;
      } catch (err) {
        setError(err?.message || "Failed to load permissions");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [queryClient, user],
  );

  useEffect(() => {
    refresh({ force: !cachedUser });
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh({ force: false });
    };
    const onPermissionsUpdated = () => refresh({ force: true });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, onPermissionsUpdated);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(
        PERMISSIONS_UPDATED_EVENT,
        onPermissionsUpdated,
      );
    };
    // Mount once; refresh identity is stable enough via refs/throttle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planAccess = useMemo(() => getPlanAccess(user), [user]);
  const invoiceAccess = useMemo(() => getBuilderInvoiceAccess(user), [user]);
  const uiFlags = useMemo(() => getBuilderPlansUiFlags(user), [user]);

  return {
    user,
    loading,
    error,
    refresh: () => refresh({ force: true }),
    planAccess,
    invoiceAccess,
    uiFlags,
  };
}
