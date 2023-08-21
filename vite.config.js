import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path';

export default ({ mode }) => {  
  return defineConfig({
    plugins: [vue()],
    server: {
      port: 8080,
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
      ],
    },
  })
}