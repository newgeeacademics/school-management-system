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
      name: 'NewGee Transport',
      shortName: 'Transport',
      description: 'Suivi bus scolaire en direct',
      themeColor: '#ea580c',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5179,
    strictPort: true,
  },
});
