// frontend/admin-dashboard/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";

import App from "./App.jsx";
import "./index.css";
import { store } from "./store/newIndex.js";

// A user may keep the dashboard open while a new production deployment
// replaces hashed lazy-loaded chunks. Refresh once so the browser receives
// the latest index and asset manifest instead of remaining on a broken route.
const recoverFromStaleDeployment = () => {
  const recoveryKey = "propenu-vite-preload-recovery";
  const lastRecovery = Number(sessionStorage.getItem(recoveryKey) || 0);
  const now = Date.now();

  if (now - lastRecovery > 30_000) {
    sessionStorage.setItem(recoveryKey, String(now));
    window.location.reload();
  }
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  recoverFromStaleDeployment();
});

// Some browsers surface React.lazy failures as an unhandled promise rejection
// without emitting Vite's preload event.
window.addEventListener("unhandledrejection", (event) => {
  const message = String(event.reason?.message || event.reason || "");
  if (
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      message,
    )
  ) {
    event.preventDefault();
    recoverFromStaleDeployment();
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
