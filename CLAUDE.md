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
- **Deployment**: push `main` 即上線 — 每次提交都必須 `npm run build` 成功（含 `tsc -b`）
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
- axios ^1.9.0 - HTTP client，`src/services/index.ts` 建立共用 instance（timeout 10000ms、response interceptor）
- react-router-dom ^6.30.1 - 頁面導覽
- `@tailwindcss/postcss` ^4.1.7 - 已安裝但未被 `postcss.config.js` 使用（實際用 v3 的 `tailwindcss` plugin），與 tailwindcss ^3.4.0 版本不一致
- `@types/react-router-dom` ^5.3.3 - 過時型別（router 為 v6，自帶型別）
## Configuration
- 未使用環境變數（`import.meta.env` 無任何引用，無 `.env*` 檔）
- Airtable token 與 Base ID 直接寫死於 `src/services/index.ts`、`src/services/AirTable.ts`（見 `INTEGRATIONS.md`）
- `tsconfig.json` -> `tsconfig.app.json`（target ES2020、strict、noUnusedLocals/Parameters、`verbatimModuleSyntax`、`erasableSyntaxOnly`、bundler resolution、`jsx: react-jsx`）與 `tsconfig.node.json`
- `vite.config.ts`、`tailwind.config.js`、`postcss.config.js`、`eslint.config.js`
- npm scripts（`package.json`）：`dev`（vite）、`build`（`tsc -b && vite build`）、`lint`（`eslint .`）、`preview`（`vite preview`）
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
- 非元件模組使用 `.ts`，目錄名稱小寫：`src/services/index.ts`
- 頁面檔案以 `Page` 結尾（`HomePage.tsx`、`AboutPage.tsx`），可複用頁面以 `Template` 結尾
- 元件使用 PascalCase 的 arrow function：`const NavBar = () => {...}`，並於檔尾 `export default NavBar;`
- 資料函式使用 camelCase 動詞開頭：`getProducts`、`getNavigation`、`getLogo`、`getServices`、`airTable`（`src/services/index.ts`）
- effect 內的非同步函式為區域 `async function getLogo()` / `fetchProducts()`，在 effect 中呼叫
- 事件處理以 `handle` 開頭：`handleScroll`、`handleEscape`、`handleError`
- camelCase；state 使用 `[value, setValue]`，布林以 `is`/`show` 開頭（`isMenuOpen`、`scrolled`、`show`）
- 模組層常數目前為 `BASE_ID` 這類 UPPER_SNAKE_CASE
- 使用 `interface`，PascalCase；Props 命名為 `XxxProps`（`ImageModalProps`、`ProductPageProps`）
- Airtable 欄位型別以 `XxxField` / `XxxRecord` 命名（`NavigationField`、`LogoRecord`），匯出自 `src/services/index.ts`
- Airtable 的資料欄位為 snake_case（`img_url`、`product_name`、`icon_name`），不要改名
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
- 服務層 `airTable()` 以 try/catch 吞掉錯誤，`console.error` 後回傳 `[]`，讓 UI 顯示空狀態（`src/services/index.ts`）
- axios response interceptor 將錯誤正規化為 `{ message, data, status }` 後 `Promise.reject`
- 元件端的 fetch 也各自 `try/catch` + `console.error("Error fetching xxx:", error)`（`src/components/NavBar.tsx`、`src/components/SideMenu.tsx`、`src/pages/HomePage.tsx`、`src/pages/AboutPage.tsx`、`src/pages/ProductPageTemplate.tsx`）
- 資料載入使用 `loading` state，沒有錯誤 state 或 Error Boundary
- 注意：因服務層不拋錯，元件的 catch 實際上很少觸發；新程式碼應決定單一錯誤策略（見 CONCERNS）
## Logging
## Comments
- 註解以繁體中文為主（`// 定義導航項目的類型`、`// 防止背景滾動`），符合全域規範
- JSX 區塊用 `{/* Company Info Section */}`（部分為英文）；新註解請用繁體中文
- 服務層函式使用 `/** ... */` 中文說明，含 `@param`、`@returns`（`src/services/index.ts`）
## Function Design
## Module Design
## 已知偏離（新程式碼不要仿效）
- `[key: string]: any` 與 `catch (error: any)` 使用 `any`（`src/pages/ProductPageTemplate.tsx`、`src/services/index.ts`）
- Airtable Token 與 `BASE_ID` 硬編碼於 `src/services/index.ts`，請改用 `import.meta.env.VITE_*` 環境變數；不得在文件或程式碼中複製 token 值
- 元件直接呼叫 `airTable()` 並自行過濾，與已有的 `getLogo` / `getNavigation` 重複；優先使用 `getXxx` 函式
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| 入口 | 掛載 React、StrictMode、BrowserRouter（啟用 v7 future flags） | `src/main.tsx` |
| App | 最外層背景與全部路由定義 | `src/App.tsx` |
| HomePage | 首頁，輪播 hot-products-1/2 | `src/pages/HomePage.tsx` |
| AboutPage | 關於我們，讀取 `abouts` 表 | `src/pages/AboutPage.tsx` |
| ProductPageTemplate | 通用產品列表頁（grid/list、排序、圖片放大），由 `tableName` prop 決定資料表 | `src/pages/ProductPageTemplate.tsx` |
| Layout | 頁面骨架，`showSideMenu` 決定是否顯示 SideMenu | `src/components/Layout.tsx` |
| NavBar | 頂部導覽，讀取 `logo`、`navigation` 表 | `src/components/NavBar.tsx` |
| SideMenu | 產品頁側邊選單，讀取 `navigation` 表 | `src/components/SideMenu.tsx` |
| Footer | 頁尾（靜態） | `src/components/Footer.tsx` |
| ImageModal | 圖片放大燈箱 | `src/components/ImageModal.tsx` |
| ProductView | 產品卡片網格 + ImageModal（目前未被任何檔案引用） | `src/components/ProductView.tsx` |
| Airtable service | axios instance、錯誤攔截器、`airTable()` 與 `getProducts/getNavigation/getLogo/getServices` | `src/services/index.ts` |
## Pattern Overview
- 內容（導覽、Logo、商品、關於）全部來自 Airtable，資料表名稱即 CMS 的內容類型。
- 產品頁以「單一 Template + 路由 props」複用：新增分類只需在 `src/App.tsx` 加一條 Route。
- 每個元件在 `useEffect` 內自行呼叫 `airTable()`，各自管理 `useState` 的 loading/資料。
- 樣式以 Tailwind utility class 為主（深色 slate 漸層主題）。
## Layers
- Purpose: 啟動與路由對應
- Location: `src/main.tsx`, `src/App.tsx`
- Depends on: pages
- Used by: `index.html`
- Purpose: 一個路由一個頁面，組合 Layout 與內容
- Location: `src/pages/`
- Depends on: `components/Layout`, `services`
- Used by: `src/App.tsx`
- Purpose: 共用 UI（導覽、頁尾、燈箱）
- Location: `src/components/`
- Depends on: `services`, `react-router-dom`
- Used by: pages
- Purpose: 對 Airtable 的 HTTP 存取
- Location: `src/services/index.ts`
- Depends on: `axios`
- Used by: pages、components
## Data Flow
### Primary Request Path
- 僅元件內 `useState`；沒有 Context、Redux 或快取。同一資料（如 `navigation`）由 NavBar 與 SideMenu 各自重複抓取。
## Key Abstractions
- Purpose: 通用 Airtable 讀取，錯誤時回傳 `[]` 讓 UI 顯示空狀態
- Examples: `src/services/index.ts`
- Pattern: Thin API wrapper + axios response interceptor
- Purpose: 以設定驅動的產品列表頁
- Examples: `src/App.tsx`（`/all-products`, `/new-products`, `/micgo-products`, `/krd-products`, `/wired-micphone`, `/wireless-micphone`, `/trumpet`, `/accessories`）
- 定義於 `src/services/index.ts`，欄位皆含 `[key: string]: any`。
## Entry Points
- Location: `index.html` -> `src/main.tsx`
- Triggers: 瀏覽器載入
- Responsibilities: 建立 root、包 BrowserRouter
## Architectural Constraints
- **Threading:** 瀏覽器單執行緒，所有資料抓取為 client-side async。
- **Global state:** 無模組級可變狀態；`src/services/index.ts` 匯出共用 axios `instance` 單例。
- **Circular imports:** 未偵測到。
- **無後端：** Airtable 直接由瀏覽器呼叫，憑證會進入前端 bundle。
- **SPA 路由：** 使用 BrowserRouter，部署時需 fallback 到 `index.html`。
- **未偵測到測試框架。**
## Anti-Patterns
### 前端寫死 Airtable 憑證
### 元件內重複的資料抓取與轉型
### App.tsx 內嵌大量重複 SVG
## Error Handling
- axios interceptor 將錯誤正規化為 `{message, data, status}`（`src/services/index.ts`）。
- 元件另包 `try/catch` 並 `console.error`。
- 沒有 Error Boundary、沒有使用者可見的錯誤訊息；無資料時顯示空狀態。
## Cross-Cutting Concerns
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
