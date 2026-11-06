import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "rules", replacement: path.resolve(__dirname, "../rules/src/index.ts") },
    ],
  },
});
