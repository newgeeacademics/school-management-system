/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_PORTAL_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
