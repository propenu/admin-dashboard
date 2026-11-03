import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  INVENTORY_KIND_STORAGE_KEY,
  homePathForInventoryKind,
  isInventoryRelatedPath,
  resolveInventoryKindFromPath,
} from "./inventoryKindConfig";

const InventoryKindContext = createContext(null);

const normalizeKind = (value) => {
  if (value === "projects" || value === "properties" || value === "main") {
    return value;
  }
  return "main";
};

const readStoredKind = () => {
  try {
    return normalizeKind(window.localStorage.getItem(INVENTORY_KIND_STORAGE_KEY));
  } catch {
    return "main";
  }
};

const writeStoredKind = (kind) => {
  try {
    window.localStorage.setItem(INVENTORY_KIND_STORAGE_KEY, kind);
  } catch {
    /* ignore */
  }
};

export function InventoryKindProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [kind, setKindState] = useState(readStoredKind);

  const pathKind = resolveInventoryKindFromPath(pathname);

  // Board routes → Projects / Properties. Dashboard `/` → Main Desk (logo selected).
  useEffect(() => {
    const path = String(pathname || "").split("?")[0];
    if (path === "/") {
      setKindState((prev) => {
        if (prev === "main") return prev;
        writeStoredKind("main");
        return "main";
      });
      return;
    }
    if (!pathKind) return;
    setKindState((prev) => {
      if (prev === pathKind) return prev;
      writeStoredKind(pathKind);
      return pathKind;
    });
  }, [pathKind, pathname]);

  const setInventoryKind = useCallback(
    (nextKind, { navigateHome = true } = {}) => {
      const kind = normalizeKind(nextKind);
      setKindState(kind);
      writeStoredKind(kind);

      if (!navigateHome) return;
      const path = String(pathname || "").split("?")[0];
      const home = homePathForInventoryKind(kind);
      if (!home || path === home) return;
      navigate(home);
    },
    [navigate, pathname],
  );

  const openMainDesk = useCallback(() => {
    setKindState("main");
    writeStoredKind("main");
    const path = String(pathname || "").split("?")[0];
    if (path !== "/") navigate("/");
    window.scrollTo(0, 0);
  }, [navigate, pathname]);

  const value = useMemo(
    () => ({
      inventoryKind: kind,
      setInventoryKind,
      openMainDesk,
      isInventoryPage: isInventoryRelatedPath(pathname),
      isMainDesk: kind === "main",
      isProjects: kind === "projects",
      isProperties: kind === "properties",
    }),
    [kind, pathname, setInventoryKind, openMainDesk],
  );

  return (
    <InventoryKindContext.Provider value={value}>
      {children}
    </InventoryKindContext.Provider>
  );
}

export function useInventoryKind() {
  const ctx = useContext(InventoryKindContext);
  if (!ctx) {
    throw new Error("useInventoryKind must be used within InventoryKindProvider");
  }
  return ctx;
}

/** Safe for components that may render outside the provider. */
export function useInventoryKindOptional() {
  return useContext(InventoryKindContext);
}
