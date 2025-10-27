import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteBasicSslPlugin from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteBasicSslPlugin(),
  ],
  build: {
    assetsDir: 'static', // Change assets directory from the default 'assets' to 'static' to avoid conflict with Login SPA
  },
  server: {
    host: 'local.portal.io',
    allowedHosts: ['local.portal.io'],
    port: 3000,
    proxy: {
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
    },
  },
})
