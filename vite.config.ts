import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // 或者使用 '0.0.0.0'
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  base: process.env.VITE_BASE_PATH || './'
})
