import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 只載入 VITE_ 前綴的變數；VITE_PROXY_TARGET 僅在此檔（node 端）使用，不會進入前端 bundle
  const env = loadEnv(mode, ".");
  const proxyTarget = env.VITE_PROXY_TARGET || "https://api.krd.com.tw";

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
