// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",

  build: {
    // Use a dedicated output directory. The legacy `dist` directory can be
    // held open by a local preview/static server on Windows, which prevents
    // Vite from cleaning it and causes EPERM build failures.
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
        },
      },
    },
    // `country-state-city` ships its worldwide city catalogue as one module.
    // It is only requested by lazy-loaded notification routes, so it does not
    // increase the initial dashboard payload. Keep the warning above that
    // isolated dataset while retaining route-level code splitting.
    chunkSizeWarningLimit: 9000,
  },
});
