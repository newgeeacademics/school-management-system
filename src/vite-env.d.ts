/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCHOOL_APP_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
