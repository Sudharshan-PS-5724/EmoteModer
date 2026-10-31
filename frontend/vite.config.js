// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/@firebase\/auth\//.test(id)) return 'firebase-auth';
          if (/node_modules\/@firebase\/firestore\//.test(id) || /node_modules\/idb\//.test(id)) return 'firebase-firestore';
          if (/node_modules\/(firebase|@firebase)\//.test(id)) return 'firebase-core';
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          if (/node_modules\/(react-router|react-router-dom|@remix-run)\//.test(id)) return 'router';
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        }
      }
    }
  }
});

