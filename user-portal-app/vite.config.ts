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
      name: 'NewGee Portail',
      shortName: 'Portail',
      description: 'Portail parents, élèves et enseignants',
      themeColor: '#0f766e',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
});
