import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable rollup chunk splitting
    chunkSizeWarningLimit: 1000, // Optional: adjust limit
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Create a vendor chunk for all node_modules
            return 'vendor';
          }
          // You can add more specific chunking rules here
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [], // No need to exclude lucide-react anymore
  },
});
