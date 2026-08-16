import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error TanStack Start's Vite plugin currently lacks compatible typings.
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    tailwindcss(),
    react(),
  ],
});
