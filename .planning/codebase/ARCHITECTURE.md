<!-- refreshed: 2026-11-10 -->
# Architecture

**Analysis Date:** 2026-11-10

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
         │ 皆包在 Layout       │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Layout: NavBar + (SideMenu) + main + Footer                 │
│  `src/components/Layout.tsx`                                 │
└─────────────────────────────────────────────────────────────┘
         │ airTable(tableName, "data")
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Service: axios instance + airTable() helper                 │
│  `src/services/index.ts`                                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  外部 CMS: Airtable REST API (api.airtable.com)              │
└─────────────────────────────────────────────────────────────┘
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

**Overall:** 純前端 SPA，Airtable 當 headless CMS；頁面元件自行抓取資料（無全域 state 管理）。

**Key Characteristics:**
- 內容（導覽、Logo、商品、關於）全部來自 Airtable，資料表名稱即 CMS 的內容類型。
- 產品頁以「單一 Template + 路由 props」複用：新增分類只需在 `src/App.tsx` 加一條 Route。
- 每個元件在 `useEffect` 內自行呼叫 `airTable()`，各自管理 `useState` 的 loading/資料。
- 樣式以 Tailwind utility class 為主（深色 slate 漸層主題）。

## Layers

**Entry/Routing:**
- Purpose: 啟動與路由對應
- Location: `src/main.tsx`, `src/App.tsx`
- Depends on: pages
- Used by: `index.html`

**Pages:**
- Purpose: 一個路由一個頁面，組合 Layout 與內容
- Location: `src/pages/`
- Depends on: `components/Layout`, `services`
- Used by: `src/App.tsx`

**Components:**
- Purpose: 共用 UI（導覽、頁尾、燈箱）
- Location: `src/components/`
- Depends on: `services`, `react-router-dom`
- Used by: pages

**Services:**
- Purpose: 對 Airtable 的 HTTP 存取
- Location: `src/services/index.ts`
- Depends on: `axios`
- Used by: pages、components

## Data Flow

### Primary Request Path

1. 使用者造訪路由，`src/App.tsx` 比對 `<Route>` 並渲染頁面。
2. 頁面包 `<Layout>`；NavBar 掛載後 `useEffect` 呼叫 `airTable("logo","data")` 與 `airTable("navigation","data")`。
3. 頁面本身 `useEffect` 呼叫 `airTable(tableName,"data")`（`src/pages/ProductPageTemplate.tsx`）。
4. `airTable()` 以 axios GET `https://api.airtable.com/v0/{BASE_ID}/{table}?view=data`，回傳 `records`。
5. 呼叫端自行 `filter`（必要欄位如 `img_url`）後 `setState` 並渲染。

**State Management:**
- 僅元件內 `useState`；沒有 Context、Redux 或快取。同一資料（如 `navigation`）由 NavBar 與 SideMenu 各自重複抓取。

## Key Abstractions

**airTable(tableName, viewName="data"):**
- Purpose: 通用 Airtable 讀取，錯誤時回傳 `[]` 讓 UI 顯示空狀態
- Examples: `src/services/index.ts`
- Pattern: Thin API wrapper + axios response interceptor

**ProductPageTemplate props (`title`, `tableName`, `description`, `icon`):**
- Purpose: 以設定驅動的產品列表頁
- Examples: `src/App.tsx`（`/all-products`, `/new-products`, `/micgo-products`, `/krd-products`, `/wired-micphone`, `/wireless-micphone`, `/trumpet`, `/accessories`）

**Airtable 型別 (`ProductRecord`, `NavigationRecord`, `LogoRecord`, `ServiceRecord`):**
- 定義於 `src/services/index.ts`，欄位皆含 `[key: string]: any`。

## Entry Points

**Browser entry:**
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

**What happens:** `src/services/index.ts` 將 Airtable Personal Access Token 與 `BASE_ID` 直接寫在原始碼（token 值不在此文件記錄）。
**Why it's wrong:** token 隨 bundle 公開且已進入 git 歷史，可被任何人取用。
**Do this instead:** 改用 `import.meta.env.VITE_*` 並限制 token 為唯讀/單一 base，或加一層 proxy/serverless；並輪替既有 token。

### 元件內重複的資料抓取與轉型

**What happens:** `NavBar.tsx`、`SideMenu.tsx`、`HomePage.tsx`、`AboutPage.tsx`、`ProductPageTemplate.tsx` 直接呼叫 `airTable()` 並各自 filter/map，而 `getProducts/getNavigation/getLogo/getServices` 已存在卻未被使用。
**Why it's wrong:** 邏輯重複、`navigation` 被重複請求、型別各頁重複宣告。
**Do this instead:** 呼叫 `src/services/index.ts` 的專用函式，必要時抽成 custom hook。

### App.tsx 內嵌大量重複 SVG

**What happens:** 每條產品 Route 內嵌 SVG icon。
**Do this instead:** 以設定陣列（path/title/tableName/icon）`map` 產生 Route。

## Error Handling

**Strategy:** 在 service 層吞掉錯誤並回傳空陣列。

**Patterns:**
- axios interceptor 將錯誤正規化為 `{message, data, status}`（`src/services/index.ts`）。
- 元件另包 `try/catch` 並 `console.error`。
- 沒有 Error Boundary、沒有使用者可見的錯誤訊息；無資料時顯示空狀態。

## Cross-Cutting Concerns

**Logging:** `console.error` / `console.warn`。
**Validation:** 僅檢查必要欄位是否存在（`img_url`、`title`+`path`、`img`）。
**Authentication:** 無使用者認證；僅 Airtable Bearer token（硬編碼）。

---

*Architecture analysis: 2026-11-10*
