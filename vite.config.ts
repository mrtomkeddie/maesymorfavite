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
      // Add shim for next/image to support reusing Next.js components in Vite
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      // Shims for Next.js client-side APIs used by reused components
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.ts'),
      'next/font/google': path.resolve(__dirname, './src/shims/next-font-google.ts'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
  },
  optimizeDeps: {
    entries: ['src/main.tsx'],
  },
})