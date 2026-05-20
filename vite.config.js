import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./src/manifest.js";
import tailwindcss from "@tailwindcss/vite";

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
    },

    plugins: [crx({ manifest }), react(), tailwindcss()],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  };
});
