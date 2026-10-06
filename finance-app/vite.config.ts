import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { appPwa } from '../shared/vite-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    appPwa({
      name: 'NewGee Finance',
      shortName: 'Finance',
      description: 'Trésorerie et paie scolaire',
      themeColor: '#2e1065',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5926,
    strictPort: true,
  },
});
