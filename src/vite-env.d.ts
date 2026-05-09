/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_DUMMY_AUTH: string | undefined;
  readonly VITE_API_URL: string | undefined;
  readonly VITE_GEMINI_API_URL: string | undefined;
}

 interface ImportMeta {
  readonly env: ImportMetaEnv;
}
