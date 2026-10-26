import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    host: true,
    allowedHosts: true, // Render serves from <name>.onrender.com
    // allowedHosts: ['sentineliq-mm6y.onrender.com'], // stricter alternative
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})