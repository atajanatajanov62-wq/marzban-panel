import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";
import { marzbanMockApi } from "./mock-api";

const isProduction = process.env.NODE_ENV === "production";

/* ─────────────────── PORT (dev only) ─────────────────── */
let port = 3000;
if (!isProduction) {
  const rawPort = process.env.PORT;
  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }
  const p = Number(rawPort);
  if (Number.isNaN(p) || p <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  port = p;
}

/* ─────────────────── BASE_PATH ───────────────────────── */
const basePath = process.env.BASE_PATH ?? "/";

if (!isProduction && !process.env.BASE_PATH) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

/* ─────────────────── VITE_BASE_API ──────────────────── */
// In production: leave empty so API calls go to same-origin Marzban backend
// In dev: set in .env or defaults to empty (mock-api handles everything)

export default defineConfig({
  base: basePath,
  plugins: [
    ...(!isProduction ? [marzbanMockApi()] : []),
    react({
      include: "**/*.tsx",
    }),
    tailwindcss(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },
    }),
    ...(!isProduction
      ? await Promise.all([
          import("@replit/vite-plugin-runtime-error-modal")
            .then((m) => m.default())
            .catch(() => null),
        ]).then((plugins) => plugins.filter(Boolean))
      : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "assets": path.resolve(import.meta.dirname, "src/assets"),
      "components": path.resolve(import.meta.dirname, "src/components/marzban"),
      "contexts": path.resolve(import.meta.dirname, "src/contexts"),
      "pages": path.resolve(import.meta.dirname, "src/pages-marzban"),
      "hooks": path.resolve(import.meta.dirname, "src/hooks-marzban"),
      "service": path.resolve(import.meta.dirname, "src/service"),
      "utils": path.resolve(import.meta.dirname, "src/utils"),
      "types": path.resolve(import.meta.dirname, "src/types"),
      "constants": path.resolve(import.meta.dirname, "src/constants"),
      "locales": path.resolve(import.meta.dirname, "src/locales"),
      "themes": path.resolve(import.meta.dirname, "src/themes"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "@chakra-ui/react"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
