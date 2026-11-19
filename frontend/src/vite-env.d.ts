/// <reference types="vite/client" />

interface ImportMetaEnv {
  // The Laravel backend's address, such as http://127.0.0.1:8000
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
