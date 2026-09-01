import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",

  build: {
    // Dedicated outDir — avoids Windows EPERM when legacy `dist` is locked by a preview server.
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // ~8MB worldwide city catalogue — keep out of the entry chunk.
          if (id.includes("country-state-city")) return "country-state-city";

          if (id.includes("xlsx")) return "xlsx";
          if (id.includes("pdfjs-dist") || id.includes("pdf-lib")) return "pdf";
          if (id.includes("@tiptap")) return "tiptap";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "maps";
          if (id.includes("react-router")) return "router";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("lucide-react")) return "lucide";
          if (id.includes("framer-motion")) return "motion";

          return undefined;
        },
      },
    },
    // Entry may still be large due to app shell; vendor data is split above.
    chunkSizeWarningLimit: 12000,
  },
});
