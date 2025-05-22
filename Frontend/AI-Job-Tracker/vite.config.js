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
        secure: true,
        credentials: true,
       
      },
    },
    host: true,
    allowedHosts: 'all',
  }
})
