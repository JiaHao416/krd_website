import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 第三參數 "" 載入所有變數，結果只存在於此檔（node 端）。
  // proxy 設定刻意不用 VITE_ 前綴：Vite 會把所有 VITE_ 變數放進前端 import.meta.env，
  // 改用 KRD_ 前綴才能確保它不會進入瀏覽器或 bundle
  const env = loadEnv(mode, ".", "");
  const proxyTarget = env.KRD_PROXY_TARGET || "https://api.krd.com.tw";

  return {
    plugins: [react()],
    server: {
      proxy: {
        // 後端只在瀏覽器端擋 CORS，伺服器端不依 Origin 拒絕，故不需改寫 Origin；
        // 若日後後端加入伺服器端 Origin 檢查，再加 headers: { Origin: "https://www.krd.com.tw" }
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
