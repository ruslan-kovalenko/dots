import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'
import { resolve, dirname } from "node:path"

export default defineConfig({
  setupFiles: ['./vitest.setup.ts'],
  plugins: [vue()],
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  },  
  test: {
    globals: true,
    environment: 'happy-dom',
    threads: false,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
})