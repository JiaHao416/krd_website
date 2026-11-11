<!-- GSD:project-start source:PROJECT.md -->
## Project

**KRD 官網（krd_website）**

KRD 音響／麥克風盤商的品牌官網（`www.krd.com.tw`），給客戶瀏覽品牌、商品分類與熱銷商品。Vite + React 19 單頁應用，部署在 Cloudflare Pages（push 到 GitHub `main` 自動部署）。目前內容全部來自 Airtable；本輪要把它改成「商品讀後端公開 API、其餘內容為 repo 內靜態檔」，完全停用 Airtable。

**Core Value:** 官網顯示的商品必須與家人在 KRD-Inventory App 維護的後端資料一致，且前端程式中不再含任何憑證。

### Constraints

- **Tech stack**: 沿用 Vite 6 + React 19 + TypeScript + Tailwind + axios — 專案既有選擇
- **Compatibility**: 維持現有網址路徑（`/all-products`、`/wired-micphone`、`/trumpet`…）— 避免舊連結失效
- **Security**: 前端不得含任何憑證 — repo 公開，打包後也公開
- **Dependencies**: 依賴後端公開 API 的 CORS 白名單與限流；預覽網址 `*.pages.dev` 不在白名單內
- **Deployment**: push `main` 即上線 — 每次提交都必須 `npm run build` 成功（含 `tsc -b` 與 dist 憑證掃描）
- **Sequencing**: 必須在撤銷 Airtable token 前抓好靜態內容
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ~5.8.3 - 全部前端程式碼（`src/**/*.ts`、`src/**/*.tsx`）
- CSS（Tailwind directives）- `src/index.css`、`src/App.css`
- JavaScript (ESM) - 僅設定檔（`eslint.config.js`、`tailwind.config.js`、`postcss.config.js`）
## Runtime
- 瀏覽器端 SPA（純靜態前端，無自有後端）
- 建置需 Node.js（未指定版本；無 `.nvmrc`、`package.json` 無 `engines`）
- npm
- Lockfile: present（`package-lock.json`）
## Frameworks
- React ^19.1.0 / react-dom ^19.1.0 - UI
- react-router-dom ^6.30.1 - 路由，`src/main.tsx` 使用 `BrowserRouter`
- Tailwind CSS ^3.4.0 - 樣式（`tailwind.config.js`，字型 sans 為微軟正黑體，自訂 fade-in/slide-up/pulse-slow 動畫）
- Not detected（無測試框架、無測試檔）
- Vite ^6.3.5 + `@vitejs/plugin-react` ^4.4.1 - dev server 與 bundler（`vite.config.ts`，僅啟用 react plugin）
- PostCSS ^8.5.3 + autoprefixer ^10.4.21（`postcss.config.js`，使用 `tailwindcss` 與 `autoprefixer`）
- ESLint ^9.25.0 flat config（`eslint.config.js`）+ typescript-eslint ^8.30.1、eslint-plugin-react-hooks、eslint-plugin-react-refresh
## Key Dependencies
- axios ^1.9.0 - HTTP client，`src/services/client.ts` 建立共用 `apiClient`（timeout 10000ms，不帶任何憑證）
- react-router-dom ^6.30.1 - 頁面導覽
- `@types/react-router-dom` ^5.3.3 - 過時型別（router 為 v6，自帶型別）
## Configuration
- 未使用環境變數（`import.meta.env` 無任何引用，無 `.env*` 檔）
- 前端不含任何憑證；API base URL 由 `VITE_API_BASE_URL` 設定（見 `INTEGRATIONS.md`）
- `tsconfig.json` -> `tsconfig.app.json`（target ES2020、strict、noUnusedLocals/Parameters、`verbatimModuleSyntax`、`erasableSyntaxOnly`、bundler resolution、`jsx: react-jsx`）與 `tsconfig.node.json`
- `vite.config.ts`、`tailwind.config.js`、`postcss.config.js`、`eslint.config.js`
- npm scripts（`package.json`）：`dev`（vite）、`build`（`tsc -b && vite build && node scripts/check-dist.mjs`）、`lint`（`eslint .`）、`preview`（`vite preview`）
- 入口：`index.html` -> `src/main.tsx`
## Platform Requirements
- Node.js + npm；`npm install`、`npm run dev`
- Cloudflare Pages（GitHub 整合自動部署；專案 `krd-website`，正式網域 `www.krd.com.tw`）
- 建置指令 `npm run build`，輸出目錄 `dist`
- 使用 `BrowserRouter`，SPA fallback 需由 Cloudflare Pages 處理（`public/` 內無 `_redirects`，依 Pages 預設 SPA 行為）
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React 元件與頁面使用 PascalCase `.tsx`：`src/components/NavBar.tsx`、`src/pages/ProductPageTemplate.tsx`
- 非元件模組使用 `.ts`，目錄名稱小寫：`src/services/client.ts`
- 頁面檔案以 `Page` 結尾（`HomePage.tsx`、`AboutPage.tsx`），可複用頁面以 `Template` 結尾
- 元件使用 PascalCase 的 arrow function：`const NavBar = () => {...}`，並於檔尾 `export default NavBar;`
- 資料函式使用 camelCase 動詞開頭：`getProducts`、`getNavigation`、`getLogo`、`getServices`（`src/services/`）
- effect 內的非同步函式為區域 `async function getLogo()` / `fetchProducts()`，在 effect 中呼叫
- 事件處理以 `handle` 開頭：`handleScroll`、`handleEscape`、`handleError`
- camelCase；state 使用 `[value, setValue]`，布林以 `is`/`show` 開頭（`isMenuOpen`、`scrolled`、`show`）
- 模組層常數目前為 `BASE_ID` 這類 UPPER_SNAKE_CASE
- 使用 `interface`，PascalCase；Props 命名為 `XxxProps`（`ImageModalProps`、`ProductPageProps`）
- API 資料型別集中於 `src/services/apiTypes.ts` 與 `transform.ts`
- 後端 API 欄位的命名以 `src/services/apiTypes.ts` 為準，不要改名
## Code Style
- 未設定 Prettier/Biome；實際風格為雙引號、分號、2 空格縮排、多行結構尾逗號（ES5 style）
- 新程式碼沿用此風格
- ESLint 9 flat config：`eslint.config.js`
- 規則：`js.configs.recommended`、`tseslint.configs.recommended`、`react-hooks` recommended、`react-refresh/only-export-components`（warn）
- 指令：`npm run lint`
- TypeScript 嚴格：`tsconfig.app.json` 啟用 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`、`erasableSyntaxOnly`（不可用 enum / namespace）
- Tailwind CSS 3 utility class 直接寫在 `className`（`tailwind.config.js`），不使用 CSS modules
## Import Organization
## Error Handling
- 服務層以 `ApiError` 向上拋出（`src/services/errors.ts`），由頁面顯示錯誤狀態
- axios response interceptor 將錯誤正規化為 `{ message, data, status }` 後 `Promise.reject`
- 元件端的 fetch 也各自 `try/catch` + `console.error("Error fetching xxx:", error)`（`src/components/NavBar.tsx`、`src/components/SideMenu.tsx`、`src/pages/HomePage.tsx`、`src/pages/AboutPage.tsx`、`src/pages/ProductPageTemplate.tsx`）
- 資料載入使用 `loading` state，沒有錯誤 state 或 Error Boundary
- 注意：因服務層不拋錯，元件的 catch 實際上很少觸發；新程式碼應決定單一錯誤策略（見 CONCERNS）
## Logging
## Comments
- 註解以繁體中文為主（`// 定義導航項目的類型`、`// 防止背景滾動`），符合全域規範
- JSX 區塊用 `{/* Company Info Section */}`（部分為英文）；新註解請用繁體中文
- 服務層函式使用 `/** ... */` 中文說明，含 `@param`、`@returns`（`src/services/`）
## Function Design
## Module Design
## 已知偏離（新程式碼不要仿效）
- `[key: string]: any` 與 `catch (error: any)` 使用 `any`（`src/pages/ProductPageTemplate.tsx`）
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser SPA (Vite + React 19 + react-router-dom v6)         │
│  `src/main.tsx` -> BrowserRouter -> `src/App.tsx` (Routes)   │
├──────────────────┬──────────────────┬───────────────────────┤
│   HomePage       │   AboutPage      │ ProductPageTemplate   │
│ `src/pages/      │ `src/pages/      │ `src/pages/           │
│  HomePage.tsx`   │  AboutPage.tsx`  │  ProductPageTemplate` │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │ 皆包在 Layout       │ 靜態內容            │ fetchProducts()
         ▼                  ▼                     ▼
┌──────────────────────────────┐  ┌──────────────────────────┐
│ Layout: NavBar + SideMenu +  │  │ Service: `src/services/` │
│ main + Footer                │  │ client / products /      │
│ 導覽 `src/config/navigation` │  │ catalog / transform      │
│ 關於 `src/content/abouts.ts` │  └────────────┬─────────────┘
└──────────────────────────────┘               ▼
                                 KRD 後端公開 API（api.krd.com.tw）
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| 入口 | 掛載 React、StrictMode、BrowserRouter | `src/main.tsx` |
| App | 最外層背景與路由定義（由 `PRODUCT_PAGES` 產生商品頁路由） | `src/App.tsx` |
| HomePage | 首頁，輪播熱銷商品（讀後端 API） | `src/pages/HomePage.tsx` |
| AboutPage | 關於我們，讀 `ABOUT_SERVICES` 靜態內容 | `src/pages/AboutPage.tsx` |
| ProductPageTemplate | 通用商品列表頁，由 `query` prop 決定查詢條件 | `src/pages/ProductPageTemplate.tsx` |
| Layout | 頁面骨架，`showSideMenu` 決定是否顯示 SideMenu | `src/components/Layout.tsx` |
| NavBar | 頂部導覽，Logo 為 `public/brand-logo.png`，選單讀 `NAV_ITEMS` | `src/components/NavBar.tsx` |
| SideMenu | 商品頁側邊選單，讀 `NAV_ITEMS` | `src/components/SideMenu.tsx` |
| Footer / ImageModal | 頁尾、圖片放大燈箱 | `src/components/` |
| 導覽設定 | `NAV_ITEMS`（衍生自 `PRODUCT_PAGES` 與 `PRODUCT_PAGE_VIEWS`） | `src/config/navigation.ts` |
| 關於我們內容 | `ABOUT_SERVICES` 與 `public/abouts/*.png` | `src/content/abouts.ts` |
| API service | axios client、商品查詢、轉換、錯誤處理 | `src/services/client.ts`、`products.ts`、`catalog.ts`、`transform.ts`、`errors.ts` |

## Pattern Overview

**Overall:** 純前端 SPA；商品讀後端公開 API，其餘內容（導覽、Logo、關於我們）為 repo 內靜態檔，不含任何憑證。

**Key Characteristics:**
- 商品頁以「單一 Template + `PRODUCT_PAGES` 設定」複用，新增分類在設定加一筆即可。
- 導覽只有一個來源（`NAV_ITEMS`），首屏即顯示，不需等待網路。
- Airtable service 與未使用的商品卡片元件已於 Phase 3 刪除；`src/noAirtable.test.ts`（`npm test`）與 `npm run build` 內建的 dist 掃描（`scripts/check-dist.mjs`，亦可 `npm run check:dist` 單獨執行）防止回歸。
- 樣式以 Tailwind utility class 為主（深色 slate 漸層主題）。

## Layers

**Entry/Routing:** `src/main.tsx`, `src/App.tsx`，依賴 pages。

**Pages:** `src/pages/`，組合 Layout 與內容，依賴 `components/Layout`、`services`、`content`。

**Components:** `src/components/`，共用 UI，依賴 `config`、`react-router-dom`。

**Config / Content:** `src/config/`、`src/content/`，靜態資料，無副作用。

**Services:** `src/services/`，對後端公開 API 的 HTTP 存取（axios）。

## Data Flow

1. 使用者造訪路由，`src/App.tsx` 比對 `<Route>` 並渲染頁面。
2. 頁面包 `<Layout>`；NavBar／SideMenu 直接由 `NAV_ITEMS` 渲染。
3. 商品頁 `useEffect` 呼叫 `fetchProducts(query)`，由 `apiClient` GET 後端公開 API，經 `transform` 轉為前端 `Product`。
4. 關於我們頁直接渲染 `ABOUT_SERVICES`。

**State Management:** 僅元件內 `useState`；沒有 Context、Redux 或快取。

## Key Abstractions

**`apiClient`（`src/services/client.ts`）:** 不帶任何 headers 與憑證的 axios instance，base URL 取自 `VITE_API_BASE_URL`。

**`PRODUCT_PAGES` / `PRODUCT_PAGE_VIEWS`:** 商品頁的查詢條件與顯示設定；`NAV_ITEMS` 由其衍生。

## Entry Points

**Browser entry:** `index.html` -> `src/main.tsx`，建立 root、包 BrowserRouter。

## Architectural Constraints

- **Threading:** 瀏覽器單執行緒，資料抓取為 client-side async。
- **Global state:** 無模組級可變狀態；`src/services/client.ts` 匯出共用 `apiClient` 單例。
- **前端不得含憑證：** repo 與 bundle 皆公開；以 `src/noAirtable.test.ts` 與 build 內建的 dist 掃描檢查。
- **SPA 路由：** 使用 BrowserRouter，部署時需 fallback 到 `index.html`。
- **測試：** Vitest（unit 為 node、component 為 jsdom），見 `TESTING.md`。

## Anti-Patterns

### 把憑證寫進前端

**Why it's wrong:** repo 公開，打包後也公開。
**Do this instead:** 只呼叫後端公開 API；機密一律留在後端。

## Error Handling

**Strategy:** service 層以 `ApiError`（`src/services/errors.ts`）向上拋出，頁面顯示錯誤狀態。

## Cross-Cutting Concerns

**Logging:** `console.error` / `console.warn`。
**Authentication:** 無使用者認證；公開 API 不需憑證。
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
