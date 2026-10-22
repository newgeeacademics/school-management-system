import { existsSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `shared/` sits next to the app on the deploy branch and one level up in the monorepo.
const sharedDir = existsSync(path.resolve(__dirname, 'shared'))
  ? path.resolve(__dirname, 'shared')
  : path.resolve(__dirname, '../shared');

const { appPwa } = await import(path.join(sharedDir, 'vite-pwa.ts'));

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
      '@shared': sharedDir,
    },
  },
  server: {
    port: 5926,
    strictPort: true,
  },
});
