/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_APP_URL: string | undefined;
  readonly VITE_USER_PORTAL_URL: string | undefined;
  readonly VITE_API_URL: string | undefined;
  readonly VITE_BACKEND_BASE_URL: string | undefined;
  readonly VITE_CLOUDINARY_UPLOAD_URL: string | undefined;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string | undefined;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
