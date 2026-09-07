import { existsSync } from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const sharedDir = existsSync(path.resolve(__dirname, 'shared'))
  ? path.resolve(__dirname, 'shared')
  : path.resolve(__dirname, '../shared');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['newgee-logo.png'],
      manifest: {
        name: 'NewGee Transport',
        short_name: 'Transport',
        description: 'Suivi bus scolaire en direct',
        theme_color: '#ea580c',
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
      injectManifest: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
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
    port: 5179,
    strictPort: true,
  },
});
