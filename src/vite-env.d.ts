/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAIN_APP_URL: string;
  readonly VITE_USER_PORTAL_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
