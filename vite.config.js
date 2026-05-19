import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./src/manifest.js";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: isDev
      ? {
          port: 5173,
          strictPort: true,
          cors: {
            origin: [/chrome-extension:\/\//],
          },
        }
      : undefined,
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        input: {
          "src/popup/popup": resolve(__dirname, "src/popup/popup.html"),
          "src/options/options": resolve(__dirname, "src/options/options.html"),
          "src/newtab/newtab": resolve(__dirname, "src/newtab/newtab.html"),
          "src/sidepanel/sidepanel": resolve(
            __dirname,
            "src/sidepanel/sidepanel.html",
          ),
          "src/devtools/devtools": resolve(
            __dirname,
            "src/devtools/devtools.html",
          ),
        },
        output: {
          chunkFileNames: "assets/chunk-[hash].js",
        },
        onwarn(warning, warn) {
          // Suppress "emitted file overwrites" warnings for logo files
          if (
            warning.message.includes("overwrites a previously emitted file")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },

    plugins: [crx({ manifest }), react(), tailwindcss()],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  };
});
