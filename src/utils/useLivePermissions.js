import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserDetails } from "../features/user/userService";
import { fetchLoggedInUser } from "../services/UserServices/userServices";
import {
  getBuilderInvoiceAccess,
  getBuilderPlansUiFlags,
  getPlanAccess,
  resolveUserPermissions,
} from "./planAccessControl";

export const PERMISSIONS_UPDATED_EVENT = "propenu:permissions-updated";

const pickRicherUser = (a, b) => {
  const aCount = resolveUserPermissions(a).length;
  const bCount = resolveUserPermissions(b).length;
  if (!a) return b || null;
  if (!b) return a;
  return bCount >= aCount ? b : a;
};

/**
 * Always loads live /me permissions (both API clients) so Role Permission
 * edits appear without waiting on a stale react-query cache.
 */
export function useLivePermissions() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [viaAuth, viaApiClient] = await Promise.allSettled([
        fetchLoggedInUser(),
        getUserDetails().then((res) => res?.data?.user || res?.data || null),
      ]);

      const authUser = viaAuth.status === "fulfilled" ? viaAuth.value : null;
      const apiUser = viaApiClient.status === "fulfilled" ? viaApiClient.value : null;
      const next = pickRicherUser(authUser, apiUser);

      if (!next) {
        throw new Error(
          viaAuth.status === "rejected"
            ? viaAuth.reason?.message || "Failed to load permissions"
            : "Failed to load permissions",
        );
      }

      setUser(next);
      queryClient.setQueryData(["userDetails"], (old) => {
        if (old && typeof old === "object" && old.user) {
          return { ...old, user: { ...old.user, ...next, permissions: next.permissions } };
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
  }, [queryClient]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onPermissionsUpdated = () => refresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, onPermissionsUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(PERMISSIONS_UPDATED_EVENT, onPermissionsUpdated);
    };
  }, [refresh]);

  const planAccess = useMemo(() => getPlanAccess(user), [user]);
  const invoiceAccess = useMemo(() => getBuilderInvoiceAccess(user), [user]);
  const uiFlags = useMemo(() => getBuilderPlansUiFlags(user), [user]);

  return {
    user,
    loading,
    error,
    refresh,
    planAccess,
    invoiceAccess,
    uiFlags,
  };
}
