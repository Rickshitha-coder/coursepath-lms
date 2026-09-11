import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Express backend runs on :5000 (see /server/server.js). In dev, Vite
// proxies /api so the React app can call same-origin '/api/...' just like
// the vanilla frontend does, with no CORS setup needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
