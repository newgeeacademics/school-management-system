import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { appPwa } from './shared/vite-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    appPwa({
      name: 'NewGee École',
      shortName: 'NewGee',
      description: 'Gestion scolaire — tableau de bord établissement',
      themeColor: '#1d4ed8',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // 5173 is often taken by another local app (e.g. Coopec) — use next free port.
    strictPort: false,
  },
});

