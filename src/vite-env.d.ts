/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID: string
  readonly VITE_VIEWER_URL: string
  readonly VITE_UPPER_DOMAIN_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
