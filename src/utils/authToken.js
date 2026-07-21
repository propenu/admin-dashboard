import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export const getAuthToken = () =>
  localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || "";

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  // Keep the legacy cookie for smaller tokens and older code paths.
  Cookies.set(TOKEN_KEY, token, {
    path: "/",
    expires: 30,
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(TOKEN_KEY, { path: "/" });
};

