import { existsSync } from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// `shared/` sits next to the app on the deploy branch and one level up in the monorepo.
const sharedDir = existsSync(path.resolve(__dirname, 'shared'))
  ? path.resolve(__dirname, 'shared')
  : path.resolve(__dirname, '../shared');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['newgee-logo.png'],
      manifest: {
        name: 'NewGee Admin',
        short_name: 'Admin',
        description: 'Console d\'administration scolaire',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: 'newgee-logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'newgee-logo.png', sizes: '512x512', type: 'image/png' },
          { src: 'newgee-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': sharedDir,
    },
  },
  server: {
    port: 5175,
    strictPort: true,
  },
});
