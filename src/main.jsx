// frontend/admin-dashboard/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      staleTime: 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 1;
      },
      networkMode: "online",
    },
    mutations: {
      retry: 0,
      networkMode: "online",
    },
  },
});

/** Lazy-load DevTools so production never ships them open/permanent. */
function ReactQueryDevtoolsLazy() {
  const [Devtools, setDevtools] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    import("@tanstack/react-query-devtools").then((mod) => {
      if (alive) setDevtools(() => mod.ReactQueryDevtools);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!Devtools) return null;
  return (
    <Devtools
      initialIsOpen={false}
      buttonPosition="bottom-left"
      position="bottom"
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV ? <ReactQueryDevtoolsLazy /> : null}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
