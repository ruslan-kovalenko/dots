import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'
import { resolve, dirname } from "node:path"

export default defineConfig({
  setupFiles: ['./vitest.setup.ts'],
  plugins: [vue()],
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  },
  deps: {
    inline: ['vitest-canvas-mock'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    threads: false,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
})