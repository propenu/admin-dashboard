import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthUserProfile } from "../../hooks/useAuthUser";
import {
  WORKSPACE_STORAGE_KEY,
  getVisibleWorkspaces,
  getWorkspaceById,
  resolveWorkspaceFromPath,
} from "./adminWorkspaceConfig";

const AdminWorkspaceContext = createContext(null);

const readStoredWorkspace = () => {
  try {
    return window.sessionStorage.getItem(WORKSPACE_STORAGE_KEY) || "main";
  } catch {
    return "main";
  }
};

const writeStoredWorkspace = (id) => {
  try {
    window.sessionStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};

export function AdminWorkspaceProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthUserProfile();
  const [fallbackWorkspaceId, setFallbackWorkspaceId] = useState(readStoredWorkspace);

  const pathWorkspaceId = resolveWorkspaceFromPath(pathname);
  const visibleWorkspaces = useMemo(() => getVisibleWorkspaces(user), [user]);

  const workspaceId = useMemo(() => {
    const candidate = pathWorkspaceId || fallbackWorkspaceId || "main";
    const allowed = visibleWorkspaces.some((item) => item.id === candidate);
    return allowed ? candidate : "main";
  }, [pathWorkspaceId, fallbackWorkspaceId, visibleWorkspaces]);

  useEffect(() => {
    if (pathWorkspaceId) {
      setFallbackWorkspaceId(pathWorkspaceId);
      writeStoredWorkspace(pathWorkspaceId);
    }
  }, [pathWorkspaceId]);

  const setWorkspace = useCallback(
    (nextId) => {
      const workspace = getWorkspaceById(nextId);
      if (!visibleWorkspaces.some((item) => item.id === workspace.id)) return;
      setFallbackWorkspaceId(workspace.id);
      writeStoredWorkspace(workspace.id);
      const target = workspace.homePath;
      const current = String(pathname || "").split("?")[0];
      // Avoid remount flicker when the tab is already on its home route.
      if (current === target) return;
      navigate(target);
    },
    [navigate, pathname, visibleWorkspaces],
  );

  const value = useMemo(
    () => ({
      workspaceId,
      workspace: getWorkspaceById(workspaceId),
      visibleWorkspaces,
      setWorkspace,
    }),
    [workspaceId, visibleWorkspaces, setWorkspace],
  );

  return (
    <AdminWorkspaceContext.Provider value={value}>
      {children}
    </AdminWorkspaceContext.Provider>
  );
}

export function useAdminWorkspace() {
  const ctx = useContext(AdminWorkspaceContext);
  if (!ctx) {
    return {
      workspaceId: "main",
      workspace: getWorkspaceById("main"),
      visibleWorkspaces: getVisibleWorkspaces(null),
      setWorkspace: () => {},
    };
  }
  return ctx;
}
