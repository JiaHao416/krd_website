<!-- refreshed: 2026-11-10 -->
# Architecture

**Analysis Date:** 2026-11-10（Phase 3 更新：已停用 Airtable）

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
- Airtable service 與未使用的商品卡片元件已於 Phase 3 刪除；`src/noAirtable.test.ts`（`npm test`）與 `npm run check:dist`（build 後）防止回歸。
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
- **前端不得含憑證：** repo 與 bundle 皆公開；以 `src/noAirtable.test.ts` 與 `npm run check:dist` 檢查。
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

---

*Architecture analysis: 2026-11-10（Phase 3 更新）*
