/// <reference types="vite/client" />

interface ImportMetaEnv {
  // The Laravel backend's address, such as http://127.0.0.1:8000
  readonly VITE_API_URL?: string
  // "true" on the public demo (utils/demo.ts)
  readonly VITE_DEMO_MODE?: string
  readonly VITE_DEMO_ADMIN_EMAIL?: string
  readonly VITE_DEMO_ADMIN_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
