import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/organigrama-cong/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React into its own chunk
          'react-vendor': ['react', 'react-dom'],
          // Separate drag-and-drop library
          'dnd-vendor': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities'
          ],
          // Separate database library
          'db-vendor': ['dexie', 'dexie-react-hooks'],
          // Separate window resize library
          'rnd-vendor': ['react-rnd']
        }
      }
    },
    // Increase chunk size warning limit after optimizations
    chunkSizeWarningLimit: 300
  }
})
