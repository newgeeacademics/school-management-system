/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCHOOL_APP_URL: string | undefined;
  readonly VITE_MAIN_APP_URL: string | undefined;
  readonly VITE_ADMIN_APP_URL: string | undefined;
  readonly VITE_TRACKING_APP_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
