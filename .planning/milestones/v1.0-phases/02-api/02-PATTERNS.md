# Phase 2: 商品頁與首頁熱銷改讀後端 API - Pattern Map

**Mapped:** 2026-11-10
**Files analyzed:** 17（新增 11、修改 6）
**Analogs found:** 15 / 17（2 個無直接 analog，以 RESEARCH.md 的 Pattern 為準）

## File Classification

| 新增／修改檔案 | Role | Data Flow | Closest Analog | Match Quality |
|----------------|------|-----------|----------------|---------------|
| `src/services/products.ts`（改：加 `options.signal`） | service | request-response | 自身（Phase 1） | exact（原地擴充） |
| `src/services/products.test.ts`（改：加 signal 測試） | test | request-response | 自身 `createMockAdapter` | exact |
| `src/hooks/useProducts.ts`（新） | hook | request-response（含取消／重試） | `src/pages/ProductPageTemplate.tsx` 的 `useEffect` 抓取區（舊）＋ RESEARCH Pattern 2 | role-match |
| `src/hooks/useProducts.test.tsx`（新） | test | request-response | `src/services/products.test.ts`（結構）＋ RESEARCH Pattern 4 | partial |
| `src/config/productPageViews.tsx`（新） | config | transform | `src/App.tsx` 現有 Route 的 title/description/icon；`src/services/catalog.ts` 的 `PRODUCT_PAGES` | exact（內容搬遷） |
| `src/components/ImagePlaceholder.tsx`（新） | component | transform | `src/pages/HomePage.tsx` 的 `aspect-video` 佔位框（載入中區塊） | role-match |
| `src/components/ProductCard.tsx`（新，建議抽出） | component | transform | `src/pages/ProductPageTemplate.tsx` 的 grid/list 卡片 JSX | exact（搬遷） |
| `src/components/LoadError.tsx`（新，可選） | component | transform | `ProductPageTemplate.tsx` 的「暫無產品」空狀態區塊 | role-match |
| `src/components/FeaturedCarousel.tsx`（新，建議從 HomePage 拆出） | component | request-response | `HomePage.tsx` 的 `renderEnhancedCarousel` | exact（搬遷） |
| `src/pages/ProductPageTemplate.tsx`（改） | component（頁面） | request-response | 自身 | exact |
| `src/pages/HomePage.tsx`（改） | component（頁面） | request-response | 自身 | exact |
| `src/App.tsx`（改） | config（路由） | transform | 自身；`PRODUCT_PAGES`（`catalog.ts`） | exact |
| `vite.config.ts`（改：`projects`） | config | — | 自身 `test` 區塊 | exact |
| `src/test/setup.ts`（新） | config／test | — | 無 | no analog |
| `src/pages/ProductPageTemplate.test.tsx`（新） | test | request-response | `products.test.ts` 結構＋RESEARCH Pattern 3 | partial |
| `src/pages/HomePage.test.tsx`（新） | test | request-response | 同上 | partial |
| `src/App.test.tsx`（新，8 路徑） | test | request-response | `catalog.test.ts`（路徑清單斷言）＋RESEARCH Pattern 6 | partial |
| `package.json`（改：devDependencies） | config | — | 自身 | exact |

---

## Pattern Assignments

### `src/services/products.ts`（service，request-response）— 擴充 signal

**Analog:** 自身，`src/services/products.ts` 第 56-69 行（簽名與 `client.get`）。

**現況（要改的位置）：**
```typescript
export async function fetchProducts(
  params: ProductQueryParams,
  client: AxiosInstance = apiClient
): Promise<ProductListResult> {
  let body: unknown;
  try {
    const response = await client.get<unknown>("/products", { params });
    body = response.data;
  } catch (error: unknown) {
    throw normalizeError(error);
  }
```

**改法：** 照 RESEARCH Pattern 1 加第三參數 `options: FetchProductsOptions = {}`，`client.get("/products", { params, signal: options.signal })`。`catch` 已經 `normalizeError`，而 `normalizeError` 在 `errors.ts` 第 59-62 行已以 `axios.isCancel` 分類為 `canceled`，不必動。JSDoc 沿用中文 `@param` 風格，補上 `@param options`。

**測試 analog**（`products.test.ts` 第 1-31 行）：沿用 `createMockAdapter` 記錄 `captured.config`，新增斷言 `captured.config?.signal === controller.signal`；取消案例用 `CanceledError`（該檔第 2 行已 import）：
```typescript
import { AxiosError, CanceledError } from "axios";
const adapter: AxiosAdapter = async (config) => {
  captured.config = config;
  captured.calls += 1;
  ...
};
```
測試命名為中文句子、`describe("fetchProducts", ...)`、`afterEach(() => vi.restoreAllMocks())`。注意：此檔是 `.test.ts`，跑在 node project。

---

### `src/hooks/useProducts.ts`（hook，request-response）

**Analog：** 舊的抓取邏輯在 `src/pages/ProductPageTemplate.tsx` 第 41-67 行；hook 完整骨架直接用 RESEARCH.md Pattern 2（行 198-245），不需另找。

**舊寫法（要被取代、不要仿效的部分）：**
```typescript
useEffect(() => {
  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await airTable(tableName, "data");
      ...
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }
  fetchProducts();
}, [tableName]);
```

**Imports 慣例**（`products.ts` 第 1-9 行）：型別一律分開 `import type`（`verbatimModuleSyntax`）：
```typescript
import { ApiError, normalizeError } from "./errors";
import { toProduct } from "./transform";
import type { Product } from "./transform";
```

**必須遵守：**
- 以 `JSON.stringify(buildProductParams(query, sort))` 當 effect 依賴（`buildProductParams` 在 `catalog.ts` 第 52-71 行，鍵順序固定，序列化結果穩定）。
- `error instanceof ApiError && error.kind === "canceled"` 忽略。
- 狀態用字串聯集 `"loading" | "error" | "success"`（`erasableSyntaxOnly` 禁 enum）。
- `catch (error: unknown)`，不得用 `any`。

---

### `src/hooks/useProducts.test.tsx`（test）

**Analog：** `src/services/products.test.ts`（中文測試名稱、每測試一個斷言、`setup()` 輔助函式）。環境與 mock 方式用 RESEARCH Pattern 3、4：
```typescript
import { renderHook, waitFor, act } from "@testing-library/react";
import { StrictMode } from "react";
import { vi } from "vitest";
vi.mock("../services/products");   // 其餘（ApiError、errors.ts）用真的
```
- 一律 `.test.tsx`（component project 才有 jsdom）。每檔明確 `import { describe, it, expect, vi } from "vitest"`（`globals: false`）。
- 必測六項見 CONTEXT D-18：成功、失敗、空結果、retry 再呼叫、canceled 不進錯誤、參數變更重抓。

---

### `src/config/productPageViews.tsx`（config，transform）

**Analog：** `src/App.tsx` 現有 8 條 Route 的 `title`／`description`／`icon`（原樣搬，文案不得改）；以 `path` 對齊 `src/services/catalog.ts` 的 `PRODUCT_PAGES`。

**搬遷來源範例**（`App.tsx` 第 10-16、17-47 行）：
```tsx
<ProductPageTemplate
  title="所有商品"
  tableName="all-product"
  description="瀏覽我們完整的產品系列，包含各種專業音響設備"
/>
...
title="最新商品"
description="探索我們最新推出的音響產品，體驗最前沿的技術"
icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c..." />
</svg>}
```
**形狀：**`export const PRODUCT_PAGE_VIEWS: Record<string, { title: string; description: string; icon?: ReactNode }>`，`import type { ReactNode } from "react"`。`/all-products` 原本無 icon，保持無 icon。`react-refresh/only-export-components` 會 warn，可接受。加測試斷言 `PRODUCT_PAGES` 每個 path 都有 view。

---

### `src/App.tsx`（路由，transform）

**Analog：** 自身第 1-9 行（頭部）保留；`/` 與 `/abouts` 兩條手寫保留；8 條商品 Route 以 RESEARCH Pattern 6 的 `.map()` 取代：
```tsx
{PRODUCT_PAGES.map((page) => {
  const view = PRODUCT_PAGE_VIEWS[page.path];
  return (
    <Route
      key={page.path}
      path={page.path}
      element={<ProductPageTemplate key={page.path} query={page.query} {...view} />}
    />
  );
})}
```
`ProductPageTemplate` 上的 `key={page.path}` 不可省（D-13）。

---

### `src/pages/ProductPageTemplate.tsx`（頁面，request-response）

**Analog：** 自身，版面全保留，只換資料來源。可沿用的現有區塊：

**載入畫面**（第 77-90 行）— 原樣保留作首次載入畫面：
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
  <div className="text-center">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin"></div>
      <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-400 mt-6 text-lg">正在載入產品資訊...</p>
```

**空狀態／錯誤卡片視覺**（第 193-214 行）— 錯誤卡片沿用同樣的圓形圖示 + h3 + p 結構，空狀態只改文字為「目前沒有商品」、「此分類目前沒有上架的商品」：
```tsx
<div className="text-center py-20">
  <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
    <svg className="w-16 h-16 text-gray-400" ...>
  </div>
  <h3 className="text-3xl font-bold text-gray-300 mb-4">暫無產品</h3>
  <p className="text-gray-500 text-lg">此分類目前沒有可用的產品，請稍後再試</p>
</div>
```

**排序下拉**（第 142-153 行）— 以 `query.sort === undefined` 才渲染；`onChange` 型別已是 `"name" | "newest"`，可改成 `ProductSort`（`apiTypes.ts`）。移除 `sortedProducts` useMemo（第 69-79 行）、`localeCompare`、`Product` 本地介面（第 6-17 行）、`accentColor`、`tableName`、`airTable` import。

**卡片改法：**
- 名稱：`product.name`（Phase 1 已保底 `UNNAMED_PRODUCT`），不再 `index + 1` 補名。
- 圖片：`product.imageUrl`；為 `null` 時渲染 `ImagePlaceholder` 且不綁 `onClick` 開燈箱（D-08）。
- 價格徽章（第 253-257 行）：改成 `product.priceMin !== null` 才顯示，內容 `product.priceText`。名稱下方一行價格，`null` 顯示「價格洽詢」。
- 注意 Pitfall 2：grid 卡片 `h-96` + 圖 `h-64`，加價格行後描述改 `line-clamp-1`。
- `key={product.id}`（取代 `product.id || index`）。

**Imports 慣例**（`ImageModal.tsx` 第 1 行、`HomePage.tsx` 第 1-4 行）：函式 import 與 `import type` 分行；元件 arrow function + 檔尾 `export default`。

---

### `src/pages/HomePage.tsx` + `FeaturedCarousel.tsx`

**Analog：** 自身 `renderEnhancedCarousel`（第 78-253 行）。建議整段搬成 `FeaturedCarousel` 元件，內含 `currentSlide` state 與計時器，props 為 `{ result: UseProductsResult; accent: "blue" | "purple"; intervalMs: number }`。

**載入中佔位框**（第 85-94 行）— 載入中原樣保留；失敗與空狀態放在同一個 `aspect-video` 容器內：
```tsx
<div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
  <div className="text-center">
    <div className="animate-pulse w-16 h-16 bg-white/10 rounded-full mx-auto mb-4"></div>
    <p className="text-gray-400">載入產品中...</p>
  </div>
</div>
```

**計時器**（第 66-80 行）— 保留 5000／5500 ms；條件改 `status === "success" && items.length > 1`（UI-SPEC：單筆不計時）；index 越界防護 `currentSlide % items.length`：
```tsx
useEffect(() => {
  if (hotProduct1.length > 0) {
    const interval1 = setInterval(() => {
      setCurrentSlide1((prev) => (prev + 1) % hotProduct1.length);
    }, 5000);
    return () => clearInterval(interval1);
  }
}, [hotProduct1.length]);
```

**必修的現況 bug**（第 112、116、167 行）：動態 class 會被 Tailwind purge：
```tsx
`... from-${accentColor}-500/30 ...`
`... from-${accentColor}-500 to-purple-500 ...`
```
改為 RESEARCH Pitfall 1 的 `ACCENT_CLASSES` 完整字串對照表。

**資料來源：**
```tsx
const featured1 = useProducts(HOME_FEATURED_QUERIES[0]);
const featured2 = useProducts(HOME_FEATURED_QUERIES[1]);
```
欄位對應：`fields.img_url` → `imageUrl`、`fields.name` → `name`、`fields.description` → `description`。缺圖用 `ImagePlaceholder`。Hero、標題區、CTA 區（第 255 行起）全部不動，`useNavigate` 與兩個標題 SVG 保留。

---

### `src/components/ImagePlaceholder.tsx`（component，transform）

**Analog：** `HomePage.tsx` 佔位框（見上）的樣式（深色漸層 `from-slate-800 to-slate-900`、置中、`text-gray-400`）。元件慣例取自 `ImageModal.tsx`：
```tsx
interface ImageModalProps { show: boolean; onHide: () => void; img: string; }
const ImageModal = ({ show, onHide, img }: ImageModalProps) => { ... };
export default ImageModal;
```
`Props` 命名 `ImagePlaceholderProps`。根元素 `role="img"` + `aria-label="暫無圖片"`（RESEARCH Pitfall 4）。麥克風 SVG path 可用 `App.tsx` `/micgo-products` 的 icon：`d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"`。

---

### `src/components/ProductCard.tsx` / `LoadError.tsx`

**Analog：** 見 `ProductPageTemplate.tsx` 卡片 JSX（list 第 218-269 行，grid 第 273-336 行）。props 傳 `Product`、`onImageClick`。`LoadError` 需 `role="alert"`，顯示 `getErrorMessage(error)`（`errors.ts`）與 `<button>重新載入</button>`；不得渲染 `error.message`。視覺 class 見 UI-SPEC。

---

### `vite.config.ts`（config）

**Analog：** 自身 `test` 區塊：
```typescript
test: {
  environment: "node",
  include: ["src/**/*.test.ts"],
},
```
改為 RESEARCH Pattern 5 的 `projects`（`unit`＝node／`*.test.ts`，`component`＝jsdom／`*.test.tsx`／`setupFiles`）。`defineConfig` 來自 `vitest/config`（已是）；`plugins`、`server.proxy` 不動。

---

### `package.json`（改）

devDependencies 新增 `jsdom@^29.1.1`（不要 30/31）、`@testing-library/react@^16.3.3`、`@testing-library/dom@^10.4.2`、`@testing-library/jest-dom@^7.0.1`、`@testing-library/user-event@^14.6.9`。`npm test` script 若已存在（`vitest run`）沿用。

---

## Shared Patterns

### 錯誤訊息只能來自 `getErrorMessage`
**Source:** `src/services/errors.ts`（`ERROR_MESSAGES` 第 30-34 行、`getErrorMessage`）
**Apply to:** `ProductPageTemplate`、`FeaturedCarousel`／`LoadError`
```typescript
export const ERROR_MESSAGES = {
  rateLimited: "瀏覽太頻繁，請稍候一分鐘再重試",
  network: "無法連線，請檢查網路後重試",
  generic: "商品資料暫時無法載入，請稍後再試",
} as const;
```
禁止顯示 `error.message`；測試要斷言後端原文不出現在 DOM。

### TypeScript 嚴格模式
**Apply to:** 所有新檔（含測試）
- `import type` 分行（`verbatimModuleSyntax`）；不用 enum／namespace／建構子參數屬性。
- 不留未使用變數（`noUnusedLocals/Parameters`）；`tsc -b` 也編譯 `.test.tsx` 與 `src/test/setup.ts`。
- `catch (error: unknown)`，禁止 `any`、`[key: string]: any`。

### 程式風格
雙引號、分號、2 空格、物件／陣列多行結尾逗號（ES5）；註解用繁體中文；元件為 PascalCase arrow function + 檔尾 `export default`；事件處理 `handleXxx`；布林 state 以 `is`／`show` 開頭。

### 元件測試隔離
**Apply to:** 所有 `.test.tsx`
- `vi.mock("../components/Layout", ...)` 避免 NavBar／SideMenu 打 Airtable（Phase 3 才移除）。
- `vi.mock("../services/products")` 取代 `fetchProducts`，用 `mockResolvedValueOnce`／`mockRejectedValueOnce`／`new Promise(() => {})` 製造各狀態。
- setup 檔 `afterEach(() => cleanup())`；每檔明確 import vitest API。
- 命名規則：需要 DOM 的測試一律 `.test.tsx`，純邏輯維持 `.test.ts`。

### 資料層呼叫路徑
**Apply to:** hook
`PRODUCT_PAGES`／`HOME_FEATURED_QUERIES`（`catalog.ts`）→ `buildProductParams` → `fetchProducts(params, undefined, { signal })` → `Product`（`transform.ts`，已含 `priceText`、`imageUrl: string | null`）。元件不得再 import `src/services/index.ts` 的 `airTable`。

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/test/setup.ts` | config | — | repo 尚無 setup 檔；用 RESEARCH Pattern 5（jest-dom/vitest + cleanup） |
| `useProducts.test.tsx`／各元件測試 | test | request-response | repo 尚無 jsdom 元件測試；結構與命名沿用 `products.test.ts`，環境與 mock 用 RESEARCH Pattern 3／4 |

## Metadata

**Analog search scope:** `src/`（全部 28 個 tracked 檔）、`vite.config.ts`
**Files scanned:** 約 10 個（以 Read 完整讀取）
**Pattern extraction date:** 2026-11-10
