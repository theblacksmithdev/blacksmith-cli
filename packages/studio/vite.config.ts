import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 3940,
    proxy: {
      '/api': 'http://localhost:3939',
      '/socket.io': {
        target: 'http://localhost:3939',
        ws: true,
      },
    },
  },
})
