const STORAGE_KEY = "propenu.users.pageFilters.v1";
const RETURN_KEY = "propenu.users.listReturnTo";

export const DEFAULT_PAGE_SIZE = 20;

export const readUsersFilterStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const writeUsersFilterStorage = (state) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state || {}));
  } catch {
    /* ignore quota / private mode */
  }
};

export const clearUsersFilterStorage = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

/** Remember All Users list URL (filters + page) before opening a user detail. */
export const rememberUsersListReturn = (returnTo) => {
  try {
    if (!returnTo) return;
    sessionStorage.setItem(RETURN_KEY, String(returnTo));
  } catch {
    /* ignore */
  }
};

export const readUsersListReturn = () => {
  try {
    const value = sessionStorage.getItem(RETURN_KEY);
    if (!value) return "";
    // Only allow return into All Users list
    if (value === "/users" || value.startsWith("/users?")) return value;
    return "";
  } catch {
    return "";
  }
};

/** True when URL already has working list state (filters and/or pagination). */
export const urlHasUsersFilters = (searchParams) => {
  if (!searchParams) return false;
  const keys = [
    "status",
    "accountStatus",
    "filter",
    "kyc",
    "phone",
    "active",
    "role",
    "joined",
    "date",
    "createdFrom",
    "createdTo",
    "from",
    "to",
    "q",
    "search",
    "location",
    "page",
    "pageSize",
  ];
  return keys.some((key) => {
    const value = searchParams.get(key);
    return value != null && String(value).trim() !== "";
  });
};

export const parsePositiveInt = (value, fallback) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
