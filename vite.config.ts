import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5176,
    strictPort: true,
  },
  optimizeDeps: {
    entries: ['src/main.tsx'],
    include: ['react', 'react-dom'],
  },
})