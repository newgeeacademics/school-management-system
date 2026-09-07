import { VitePWA } from 'vite-plugin-pwa';

export type AppPwaOptions = {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
};

export function appPwa({ name, shortName, description, themeColor }: AppPwaOptions) {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['newgee-logo.png'],
    manifest: {
      name,
      short_name: shortName,
      description,
      theme_color: themeColor,
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
  });
}
