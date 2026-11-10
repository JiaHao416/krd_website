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
├── public/                 # 靜態資源（logo.png, brand-logo.png, abouts/）
├── scripts/                # check-dist.mjs（build 後掃描 dist/）
├── .planning/codebase/     # GSD 程式碼地圖文件
└── src/
    ├── main.tsx            # React 入口 + BrowserRouter
    ├── App.tsx             # 路由表
    ├── App.css, index.css  # 全域樣式（Tailwind）
    ├── vite-env.d.ts
    ├── assets/             # 打包資源（react.svg）
    ├── components/         # 共用 UI
    ├── config/             # navigation.ts（NAV_ITEMS）、productPageViews
    ├── content/            # abouts.ts（關於我們靜態內容）
    ├── pages/              # 路由頁面
    └── services/           # 後端公開 API 存取（client / products / catalog）
```

## Directory Purposes

**`src/pages/`:**
- Purpose: 路由層級頁面
- Contains: `HomePage.tsx`, `AboutPage.tsx`, `ProductPageTemplate.tsx`

**`src/components/`:**
- Purpose: 可重用 UI
- Contains: `Layout.tsx`, `NavBar.tsx`, `SideMenu.tsx`, `Footer.tsx`, `ImageModal.tsx`

**`src/services/`:**
- Purpose: 後端公開 API client
- Contains: `client.ts`（axios instance）、`products.ts`、`catalog.ts`、`transform.ts`、`errors.ts`

## Key File Locations

**Entry Points:**
- `index.html`, `src/main.tsx`: 啟動
- `src/App.tsx`: 所有路由

**Configuration:**
- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `tsconfig.app.json`

**Core Logic:**
- `src/services/client.ts`、`products.ts`: 資料存取
- `src/config/navigation.ts`、`src/content/abouts.ts`: 靜態內容
- `src/pages/ProductPageTemplate.tsx`: 產品列表頁邏輯

**Testing:**
- Vitest；`src/**/*.test.ts(x)` 與原始碼同層，另有 `src/noAirtable.test.ts`（見 `TESTING.md`）。

## Naming Conventions

**Files:**
- React 元件與頁面：PascalCase `.tsx`（`NavBar.tsx`、`HomePage.tsx`）
- 服務/工具：小寫 `.ts`（`client.ts`、`products.ts`）
- 頁面檔以 `Page` 結尾（`AboutPage.tsx` 內的元件名為 `Abouts`、`HomePage.tsx` 內為 `Home`，屬不一致，新程式碼請讓元件名與檔名相同）

**Directories:**
- 小寫複數：`components`, `pages`, `services`

**Routes:**
- Route 路徑為 kebab-case（`/new-products`）。

**Code:**
- 預設匯出元件；props 以 `interface XxxProps` 定義；註解使用繁體中文。

## Where to Add New Code

**新增產品分類頁:**
- 在 `src/services/catalog.ts` 的 `PRODUCT_PAGES` 與 `src/config/productPageViews.tsx` 各加一筆；路由與導覽會自動衍生。

**新增頁面:**
- 實作：`src/pages/XxxPage.tsx`，以 `<Layout>` 包裹；於 `src/App.tsx` 註冊路由。

**新增共用元件:**
- `src/components/Xxx.tsx`

**新增後端資料類型:**
- 在 `src/services/` 下新增檔案，沿用 `apiClient`。

**Utilities / hooks:**
- 共用 hooks 放 `src/hooks/`。

**Tests:**
- 與原始碼同層 `*.test.ts(x)`。

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
