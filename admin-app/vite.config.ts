import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { appPwa } from '../shared/vite-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    appPwa({
      name: 'NewGee Admin',
      shortName: 'Admin',
      description: 'Console d\'administration scolaire',
      themeColor: '#1e3a8a',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
  },
});
