/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAIN_APP_URL: string;
  readonly VITE_USER_PORTAL_URL: string | undefined;
  readonly VITE_MAPBOX_TOKEN: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
