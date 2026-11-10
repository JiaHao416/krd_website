/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API base URL；未設定時使用 production 預設值。
  // 所有 VITE_ 變數都會打包進前端，只能放公開值
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
