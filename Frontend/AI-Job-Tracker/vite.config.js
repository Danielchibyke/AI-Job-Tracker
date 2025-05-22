import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ai-job-tracker-6ekq.onrender.com',
        changeOrigin: true,
        secure: false,
        credentials: true,
        cookieDomainRewrite: {
          '*': 'localhost',
          '192.168.56.1': '192.168.56.1',
          '172.20.10.3': '172.20.10.3',
        },
        cookiePathRewrite: {
          '*': '/',
          '192.168.56.1': '/',
          '172.20.10.3': '/',
        },
        cookieSameSite: 'none',
        cookieSecure: true,
        hostRewrite: {
          '*': 'localhost',
          '192.168.56.1': '192.168.56.1',
          '172.20.10.3': '172.20.10.3',
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
        },
      },
    },
    host: true,
    allowedHosts: 'all',
  }
})
