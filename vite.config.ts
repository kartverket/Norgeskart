import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // CORS proxy for development
    proxy: {
      '/api/styles': {
        target: 'https://dnl.kartverket.no',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
