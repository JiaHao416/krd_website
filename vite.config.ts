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
      // 兩個 project：純邏輯（node，*.test.ts）與元件／hook（jsdom，*.test.tsx）
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "node",
            include: ["src/**/*.test.ts"],
            // Vitest 預設把 CSS 模組換成空字串；designTokens.test 需以 ?raw 讀 CSS 原文才能掃描
            css: { include: [/\.css\?raw$/] },
          },
        },
        {
          extends: true,
          test: {
            name: "component",
            environment: "jsdom",
            include: ["src/**/*.test.tsx"],
            setupFiles: ["./src/test/setup.ts"],
          },
        },
      ],
    },
  };
});
