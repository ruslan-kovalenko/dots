import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path';

export default ({ mode }) => {  
  return defineConfig({
    plugins: [vue()],
    server: {
      host: '127.0.0.1',
      port: 8080,
      strictPort: true,
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