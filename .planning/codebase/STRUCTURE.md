# Codebase Structure

**Analysis Date:** 2026-11-10

## Directory Layout

```
krd_website/
├── index.html              # Vite HTML 入口，掛載 #root
├── package.json            # 腳本：dev / build / lint / preview
├── vite.config.ts          # Vite + @vitejs/plugin-react
├── tailwind.config.js      # Tailwind 設定
├── postcss.config.js       # PostCSS 設定
├── eslint.config.js        # ESLint flat config
├── tsconfig*.json          # TS 設定（app / node）
├── public/                 # 靜態資源（logo.png, vite.svg）
├── .planning/codebase/     # GSD 程式碼地圖文件
└── src/
    ├── main.tsx            # React 入口 + BrowserRouter
    ├── App.tsx             # 路由表
    ├── App.css, index.css  # 全域樣式（Tailwind）
    ├── vite-env.d.ts
    ├── assets/             # 打包資源（react.svg）
    ├── components/         # 共用 UI
    ├── pages/              # 路由頁面
    └── services/           # Airtable API 存取
```

## Directory Purposes

**`src/pages/`:**
- Purpose: 路由層級頁面
- Contains: `HomePage.tsx`, `AboutPage.tsx`, `ProductPageTemplate.tsx`

**`src/components/`:**
- Purpose: 可重用 UI
- Contains: `Layout.tsx`, `NavBar.tsx`, `SideMenu.tsx`, `Footer.tsx`, `ImageModal.tsx`, `ProductView.tsx`（目前未使用）

**`src/services/`:**
- Purpose: 外部 API client
- Contains: `index.ts`（axios instance、`airTable`、型別、`getProducts` 等）。檔內含硬編碼憑證，修改時勿複製或輸出其值。

## Key File Locations

**Entry Points:**
- `index.html`, `src/main.tsx`: 啟動
- `src/App.tsx`: 所有路由

**Configuration:**
- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `tsconfig.app.json`

**Core Logic:**
- `src/services/index.ts`: 資料存取
- `src/pages/ProductPageTemplate.tsx`: 產品列表頁邏輯

**Testing:**
- 未偵測到測試檔或測試框架。

## Naming Conventions

**Files:**
- React 元件與頁面：PascalCase `.tsx`（`NavBar.tsx`、`HomePage.tsx`）
- 服務/工具：小寫 `index.ts`
- 頁面檔以 `Page` 結尾（`AboutPage.tsx` 內的元件名為 `Abouts`、`HomePage.tsx` 內為 `Home`，屬不一致，新程式碼請讓元件名與檔名相同）

**Directories:**
- 小寫複數：`components`, `pages`, `services`

**Routes / Airtable 表:**
- Route 路徑為 kebab-case（`/new-products`）；Airtable 表名也是 kebab-case（`all-product`, `hot-products-1`）。

**Code:**
- 預設匯出元件；props 以 `interface XxxProps` 定義；註解使用繁體中文。

## Where to Add New Code

**新增產品分類頁:**
- 在 `src/App.tsx` 新增 `<Route path="/xxx" element={<ProductPageTemplate title tableName description icon />} />`，並在 Airtable 建立對應資料表與 `navigation` 記錄。

**新增頁面:**
- 實作：`src/pages/XxxPage.tsx`，以 `<Layout>` 包裹；於 `src/App.tsx` 註冊路由。

**新增共用元件:**
- `src/components/Xxx.tsx`

**新增 Airtable 資料類型:**
- 在 `src/services/index.ts` 加型別與 `getXxx()` 函式（沿用 `airTable()`）；或拆出 `src/services/` 下新檔。

**Utilities / hooks:**
- 目前沒有；建議建立 `src/hooks/`（如 `useAirtable`）與 `src/utils/`。

**Tests:**
- 尚無慣例；建議與原始碼同層 `*.test.tsx`（需先引入 Vitest）。

## Special Directories

**`public/`:**
- Purpose: 原樣提供的靜態檔
- Generated: No
- Committed: Yes

**`dist/`, `node_modules/`:**
- Purpose: 建置輸出與依賴
- Generated: Yes
- Committed: No（見 `.gitignore`）

**`.planning/`:**
- Purpose: GSD 規劃與程式碼地圖
- Generated: Yes
- Committed: 由 orchestrator 決定

---

*Structure analysis: 2026-11-10*
