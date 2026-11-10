# Technology Stack

**Analysis Date:** 2026-11-10

## Languages

**Primary:**
- TypeScript ~5.8.3 - 全部前端程式碼（`src/**/*.ts`、`src/**/*.tsx`）

**Secondary:**
- CSS（Tailwind directives）- `src/index.css`、`src/App.css`
- JavaScript (ESM) - 僅設定檔（`eslint.config.js`、`tailwind.config.js`、`postcss.config.js`）

## Runtime

**Environment:**
- 瀏覽器端 SPA（純靜態前端，無自有後端）
- 建置需 Node.js（未指定版本；無 `.nvmrc`、`package.json` 無 `engines`）

**Package Manager:**
- npm
- Lockfile: present（`package-lock.json`）

## Frameworks

**Core:**
- React ^19.1.0 / react-dom ^19.1.0 - UI
- react-router-dom ^6.30.1 - 路由，`src/main.tsx` 使用 `BrowserRouter`
- Tailwind CSS ^3.4.0 - 樣式（`tailwind.config.js`，字型 sans 為微軟正黑體，自訂 fade-in/slide-up/pulse-slow 動畫）

**Testing:**
- Not detected（無測試框架、無測試檔）

**Build/Dev:**
- Vite ^6.3.5 + `@vitejs/plugin-react` ^4.4.1 - dev server 與 bundler（`vite.config.ts`，僅啟用 react plugin）
- PostCSS ^8.5.3 + autoprefixer ^10.4.21（`postcss.config.js`，使用 `tailwindcss` 與 `autoprefixer`）
- ESLint ^9.25.0 flat config（`eslint.config.js`）+ typescript-eslint ^8.30.1、eslint-plugin-react-hooks、eslint-plugin-react-refresh

## Key Dependencies

**Critical:**
- axios ^1.9.0 - HTTP client，`src/services/client.ts` 建立共用 `apiClient`（timeout 10000ms，不帶任何憑證）
- react-router-dom ^6.30.1 - 頁面導覽

**Infrastructure:**
- `@tailwindcss/postcss` ^4.1.7 - 已安裝但未被 `postcss.config.js` 使用（實際用 v3 的 `tailwindcss` plugin），與 tailwindcss ^3.4.0 版本不一致
- `@types/react-router-dom` ^5.3.3 - 過時型別（router 為 v6，自帶型別）

## Configuration

**Environment:**
- 未使用環境變數（`import.meta.env` 無任何引用，無 `.env*` 檔）
- 前端不含任何憑證；API base URL 由 `VITE_API_BASE_URL` 設定（見 `INTEGRATIONS.md`）

**Build:**
- `tsconfig.json` -> `tsconfig.app.json`（target ES2020、strict、noUnusedLocals/Parameters、`verbatimModuleSyntax`、`erasableSyntaxOnly`、bundler resolution、`jsx: react-jsx`）與 `tsconfig.node.json`
- `vite.config.ts`、`tailwind.config.js`、`postcss.config.js`、`eslint.config.js`
- npm scripts（`package.json`）：`dev`（vite）、`build`（`tsc -b && vite build && node scripts/check-dist.mjs`）、`lint`（`eslint .`）、`preview`（`vite preview`）
- 入口：`index.html` -> `src/main.tsx`

## Platform Requirements

**Development:**
- Node.js + npm；`npm install`、`npm run dev`

**Production:**
- Cloudflare Pages（GitHub 整合自動部署；專案 `krd-website`，正式網域 `www.krd.com.tw`）
- 建置指令 `npm run build`，輸出目錄 `dist`
- 使用 `BrowserRouter`，SPA fallback 需由 Cloudflare Pages 處理（`public/` 內無 `_redirects`，依 Pages 預設 SPA 行為）

---

*Stack analysis: 2026-11-10*
