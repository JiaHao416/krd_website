# Phase 2: 商品頁與首頁熱銷改讀後端 API - Research

**Researched:** 2026-11-10
**Domain:** React 19 資料載入 hook + 元件測試環境（Vitest 4 + jsdom + Testing Library），brownfield 重構
**Confidence:** HIGH（測試環境已在 scratchpad 實際安裝並跑過；程式碼面為直接閱讀 repo）

## Summary

Phase 1 資料層（`fetchProducts`、`buildProductParams`、`PRODUCT_PAGES`、`HOME_FEATURED_QUERIES`、`getErrorMessage`）已就緒，本 phase 主要是：(1) 寫 `useProducts` hook，(2) 重寫 `ProductPageTemplate` 與 `HomePage` 的資料來源與三種狀態畫面，(3) 把 `App.tsx` 的 8 條 Route 改由設定產生，(4) 建立元件測試環境。UI 契約已由 02-UI-SPEC.md 核准，本文件不重複。

**研究發現三個會讓計畫出錯的事實：**
1. **`fetchProducts` 目前不接受 `AbortSignal`**（簽名 `fetchProducts(params, client)`，`client.get("/products", { params })`）。D-01 要求用 AbortController，必須先擴充資料層（建議加第三個參數 `options?: { signal?: AbortSignal }`，轉給 axios `signal`）。這是 Wave 0／第一個 task。`errors.ts` 的 `canceled` 分類已能辨識 axios 的 CanceledError。
2. **`jsdom` 不能裝最新的 31／30**：它們要求 Node `^22.22.2 || ^24.15.0`，本機是 Node 24.13.0。應使用 **`jsdom@^29.1.1`**（engines `^20.19||^22.13||>=24`），已實測可跑。
3. **Vitest 設定 `globals: false`（預設）時 RTL 不會自動 cleanup**：實測第二個測試看到前一個測試殘留的 DOM。必須在 setup 檔明確 `afterEach(() => cleanup())`。

另外：`Layout` 內含 `NavBar`／`SideMenu`，它們仍呼叫 Airtable（含寫死 token 的真實網路請求，Phase 3 才移除）。元件測試**必須 `vi.mock("../components/Layout")`**，否則測試會打 Airtable。

**Primary recommendation:** 以 Vitest `projects`（unit=node 跑 `*.test.ts`、component=jsdom 跑 `*.test.tsx` + setup 檔）隔離環境；`vi.mock("../services/products")` 注入 `fetchProducts`；hook 以序列化後的 API 參數當 effect 依賴、`reloadToken` 做 retry；Route 的 `ProductPageTemplate` 一定要 `key={path}`。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
D-01～D-18（全文見 `.planning/phases/02-api/02-CONTEXT.md`，規劃時必須逐條遵守）。摘要：
- **D-01** 共用 hook `useProducts(query, sort)` 回傳 `{ status: "loading"|"error"|"success", items, error, retry }`；effect 用 AbortController；`kind === "canceled"` 忽略。
- **D-02** 商品頁失敗：錯誤卡片（圖示 + `getErrorMessage(error)` + 「重新載入」），Header 與控制列保留。
- **D-03** 空狀態文字「目前沒有商品」，說明「此分類目前沒有上架的商品」，不得寫「請稍後再試」。
- **D-04** 首頁兩組輪播獨立載入／失敗／空狀態（空：「目前沒有精選商品」）；修正現有「永遠卡在載入中」。
- **D-05** 同時 429 各自顯示，不合併。
- **D-06** 價格顯示 `priceText`；grid 徽章只在有價格時；名稱下方一行價格，`null` 顯示「價格洽詢」。
- **D-07** 首頁不顯示價格。 **D-08** 缺圖佔位圖、缺圖不開燈箱。 **D-09** 描述沿用，不顯示 in_stock/品牌/型號。
- **D-10** `truncated` 時顯示「僅顯示前 100 項商品」。
- **D-11** `/new-products` 隱藏排序下拉；其他頁預設 `name`，切換時以新 `sort` 重打 API；移除前端 `localeCompare`。
- **D-12** 切換排序保留舊列表並淡化；首次進入才整頁載入。 **D-13** 路由切換重設為首次載入、排序重設 `name`。
- **D-14** 頁面 title/description/icon 搬進設定（services 不得依賴 React 元件）。 **D-15** 8 條商品 Route 由設定 `.map()` 產生，路徑不變，加測試斷言。 **D-16** props 改接頁面設定，移除 `accentColor`、不再引用 `airTable`。
- **D-17** 安裝 jsdom + `@testing-library/react`（+ jest-dom / user-event 視需要）；per-file docblock 或 environment 設定皆可；既有 node 測試不受影響。
- **D-18** 必測行為（mock/注入 `fetchProducts`，不打真實 API）：hook 六項、商品頁六項、首頁兩項、路由八路徑。

### Claude's Discretion
- hook 名稱、檔案位置（`src/hooks/` 或 `src/services/`）、狀態型別確切形狀。
- 佔位圖 SVG 樣式、錯誤卡片確切 Tailwind class（需與深色 slate 主題一致）。
- 是否把商品卡片抽成獨立元件（建議抽出）。
- 輪播自動播放在 `status !== "success"` 時不啟動。

### Deferred Ideas (OUT OF SCOPE)
- 多頁抓取（超過 100 筆）；商品卡片現貨狀態（PROD-V2-02）；跨頁快取；NavBar／SideMenu 改讀同一份頁面設定（Phase 3）。
- 不在本 phase：Logo、NavBar、SideMenu、關於我們仍讀 Airtable；`src/services/index.ts` 與 `ProductView.tsx` 不刪；商品詳情頁（v2）。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-01 | 8 分類頁商品與 API 對照一致 | `PRODUCT_PAGES` + `buildProductParams` 已在 Phase 1；hook 以序列化參數驅動；Route 由設定產生 |
| PROD-02 | 首頁兩組輪播 = featured=1／2 | `HOME_FEATURED_QUERIES[0/1]` 各自一個 `useProducts` |
| PROD-03 | 卡片顯示名稱與圖片，點圖放大 | `Product.name`/`imageUrl`；缺圖不開燈箱；`ImageModal` 沿用 |
| PROD-04 | 含稅價／區間／null 洽詢 | `Product.priceText` 已算好；`priceMin !== null` 判斷有價 |
| PROD-05 | 「最新」排序依後端 | sort 傳 API（hook 參數）；移除前端排序 |
| PROD-06 | 後台修改後重新整理即見 | 無快取層；每次掛載重抓（Pitfall 6：不要自行加快取） |
| PROD-07 | 舊網址不失效 | `PRODUCT_PAGES` 路徑單一來源 + 路由測試 |
| UX-01 | 載入狀態 | hook `status: "loading"` |
| UX-02 | 失敗訊息 + 重試 | hook `error` + `retry`；`getErrorMessage` |
| UX-03 | 空狀態 | `success && items.length === 0` |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 商品資料取得／分類／排序 | API / Backend（`api.krd.com.tw`） | Browser（hook 發請求） | D-11：排序交給後端，前端不再排序 |
| 載入／錯誤／空狀態判斷 | Browser / Client（`useProducts`） | — | 純 SPA，無 SSR |
| 價格文字、名稱保底、缺圖 null | Browser 資料層（`transform.ts`，Phase 1） | — | 已完成，元件只讀 `Product` |
| 路由與頁面設定 | Browser（`App.tsx` + 設定檔） | — | PROD-07 路徑單一來源 |
| SPA fallback | CDN / Static（Cloudflare Pages 預設） | — | 已確認，不需 `_redirects` |
| 限流（429） | API / Backend | Browser 顯示訊息 | 前端不自動重試，由按鈕重試 |

## Standard Stack

### Core（既有，沿用）
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | ^19.1.0 | UI | 專案既有 |
| react-router-dom | ^6.30.1 | 路由 | 專案既有；`MemoryRouter` 供測試 |
| axios | ^1.9.0 | HTTP，原生支援 `signal` | 專案既有 [VERIFIED: codebase] |
| vitest | ^4.1.12（已裝 4.1.12） | 測試 | Phase 1 已建立；注意 registry 最新為 5.1.0，**不要升級**，本 phase 不在範圍 |

### 新增（devDependencies）
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| jsdom | **^29.1.1** | DOM 環境 | D-17。**不要用 30/31**（需 Node ≥24.15／22.22.2，本機 24.13.0）[VERIFIED: npm registry engines + 本機 `node --version`] |
| @testing-library/react | ^16.3.3 | render/screen/cleanup | peer 支援 React 19、`@testing-library/dom@^10` [VERIFIED: npm registry] |
| @testing-library/dom | ^10.4.2 | RTL 的 **peer dependency** | RTL 16 不再內建 dom，需明確安裝（npm 7+ 會自動裝 peer，仍建議明列以固定版本）[VERIFIED: npm registry peerDependencies] |
| @testing-library/jest-dom | ^7.0.1 | `toBeInTheDocument` 等 matcher | peer `vitest>=0.32`、`dom >=10<11`；匯入路徑 `@testing-library/jest-dom/vitest` [VERIFIED: 實測] |
| @testing-library/user-event | ^14.6.9 | 模擬點擊／鍵盤（重試按鈕、排序選單、Enter/Space） | 比 `fireEvent` 接近真實；peer 僅需 dom [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom | happy-dom | 較快但 User 已決策 jsdom（D-17），且 a11y role 查詢較成熟 |
| `vi.mock` 模組 | hook 第三參數注入 fetcher | DI 免 mock hoisting，但要多一層 props／參數；`vi.mock` 對頁面層更省事（見 Pattern 3） |

**Installation:**
```bash
npm install -D jsdom@^29.1.1 @testing-library/react@^16.3.3 @testing-library/dom@^10.4.2 @testing-library/jest-dom@^7.0.1 @testing-library/user-event@^14.6.9
```

**Version verification（2026-11-10 執行）：** `npm view` 回傳最新 jsdom 31.0.0／RTL 16.3.3／jest-dom 7.0.1／user-event 14.6.9／dom 10.4.2；jsdom 因 engines 改選 29.1.1。已在 scratchpad 以 vitest@4.1.12 + vite@6.3.5 + react@19 實際安裝並執行測試通過（StrictMode、user-event、jest-dom matcher、projects 設定）。

## Package Legitimacy Audit

slopcheck 不可用（本機無 `pip`），改以 registry 手動檢查：全部無 `postinstall`／`install` script、有官方 GitHub repo、每週下載量極高。

| Package | Registry | Age | Downloads/wk | Source Repo | slopcheck | Disposition |
|---------|----------|-----|--------------|-------------|-----------|-------------|
| jsdom | npm | 10+ yrs | ~154M | github.com/jsdom/jsdom | unavailable | Approved（User D-17 指定）|
| @testing-library/react | npm | 7+ yrs | ~92M | github.com/testing-library/react-testing-library | unavailable | Approved（User D-17 指定）|
| @testing-library/dom | npm | 6+ yrs | 高（RTL peer） | github.com/testing-library/dom-testing-library | unavailable | Approved（RTL 官方 peer）|
| @testing-library/jest-dom | npm | 6+ yrs | ~95M | github.com/testing-library/jest-dom | unavailable | [ASSUMED] 由 D-17 文字「視需要」提及，見 A1 |
| @testing-library/user-event | npm | 5+ yrs | ~85M | github.com/testing-library/user-event | unavailable | [ASSUMED] 同上 |

**Packages removed:** none。**Flagged [SUS]:** none。因 slopcheck 未跑，planner 在「安裝依賴」task 前建議放一個 `checkpoint:human-verify`（成本極低，套件皆為 Testing Library 官方組織）。

## Architecture Patterns

### System Architecture Diagram

```
瀏覽器網址 ──> BrowserRouter (main.tsx) ──> App.tsx <Routes>
                                              │
        ┌─────────────────────────────────────┼───────────────────────────┐
        ▼                                      ▼                           ▼
   "/" HomePage                  PRODUCT_PAGE_VIEWS.map(...)          "/abouts"(不動)
   ├ useProducts(HOME_FEATURED[0])   <ProductPageTemplate key={path} {...config}/>
   └ useProducts(HOME_FEATURED[1])        │ useProducts(query, sort)
        │  (各自獨立)                      │
        └──────────────┬──────────────────┘
                       ▼
        useProducts: params = buildProductParams(query, sort)
          effect[paramsKey, reloadToken]:
            AbortController ─> fetchProducts(params, apiClient, { signal })
                                   │ axios GET /products?...  (Phase 1)
                 ┌─────────────────┴───────────────┐
                 ▼ success                          ▼ ApiError
          setState{success, items, truncated}   kind==="canceled" ? 忽略
                                                  : setState{error}
        cleanup: controller.abort()
                       │
                       ▼
        元件依 status 畫：loading / error 卡片(getErrorMessage + retry) / 空 / 列表
        缺圖 → ImagePlaceholder，不開 ImageModal
```

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useProducts.ts          # hook（新）
│   └── useProducts.test.tsx    # renderHook，jsdom project
├── config/
│   └── productPageViews.tsx    # path → { title, description, icon }（JSX icon，所以是 .tsx，放 services 外）
├── components/
│   ├── ImagePlaceholder.tsx    # 新（商品頁與首頁共用）
│   ├── ProductCard.tsx         # grid/list 卡片（建議抽出，便於測試）
│   └── ErrorNotice? / LoadError # 可選：錯誤卡片共用
├── pages/ProductPageTemplate.tsx, HomePage.tsx（改）
├── services/products.ts        # 擴充 signal
├── test/setup.ts               # jest-dom + cleanup（新）
└── App.tsx                     # Route 由設定產生
```

注意 `react-refresh/only-export-components` 為 warn：`productPageViews.tsx` 若只匯出常數（含 JSX）會被警告（它不是元件檔）。建議該檔只匯出常數並接受 warn，或把 icon 改成「元件函式」（`const NewIcon = () => <svg…/>`，檔尾只匯出元件與常數的混合仍會 warn）。**最簡單：設定檔匯出 `Record<path, {title, description, icon: ReactNode}>`，lint warn 不阻擋 build**；若要零 warn，把設定檔改 `.ts` 並讓 icon 用 `icon: "new" | "micgo"...` 字串 key、由元件對應 SVG（較囉嗦，不建議）。

### Pattern 1: `fetchProducts` 擴充 signal（第一個 task，TDD）
**What:** 加第三參數，不破壞既有呼叫與測試（既有測試用 `captured.config` 檢查 params，新增 signal 是額外欄位）。
```typescript
// src/services/products.ts（修改片段）
export interface FetchProductsOptions {
  /** 取消請求用；abort 後 fetchProducts 拋出 kind 為 canceled 的 ApiError */
  signal?: AbortSignal;
}

export async function fetchProducts(
  params: ProductQueryParams,
  client: AxiosInstance = apiClient,
  options: FetchProductsOptions = {}
): Promise<ProductListResult> {
  // ...
  const response = await client.get<unknown>("/products", {
    params,
    signal: options.signal,
  });
```
新測試：以自訂 adapter 的 `captured.config.signal` 斷言傳入的 signal 被帶入；另測 `AbortController.abort()` 後 axios 預設行為拋 `CanceledError` → `normalizeError` 得 `canceled`（可用 axios 預設 adapter 搭配 `vi.spyOn`，或直接在自訂 adapter 內檢查 `config.signal?.aborted` 並 `throw new axios.CanceledError()`）。[VERIFIED: codebase — `errors.ts` 已以 `axios.isCancel` 處理]

### Pattern 2: `useProducts` hook
**What:** 以序列化參數做 effect 依賴（避免呼叫端傳 inline 物件造成無限重抓）、`reloadToken` 做 retry、切換參數時保留舊 `items`（D-12）。
```typescript
// src/hooks/useProducts.ts
import { useCallback, useEffect, useState } from "react";
import { buildProductParams } from "../services/catalog";
import type { ProductPageQuery } from "../services/catalog";
import type { ProductSort } from "../services/apiTypes";
import { ApiError } from "../services/errors";
import { fetchProducts } from "../services/products";
import type { Product } from "../services/transform";

export type ProductsStatus = "loading" | "error" | "success";

export interface UseProductsResult {
  status: ProductsStatus;
  items: Product[];          // 切換參數／重試期間保留上一次成功的結果
  truncated: boolean;
  error: unknown;            // status === "error" 時才有值
  retry: () => void;
}

export function useProducts(query: ProductPageQuery, sort?: ProductSort): UseProductsResult {
  const [state, setState] = useState<{ status: ProductsStatus; items: Product[]; truncated: boolean; error: unknown }>(
    { status: "loading", items: [], truncated: false, error: null }
  );
  const [reloadToken, setReloadToken] = useState(0);
  // 以序列化結果當依賴，呼叫端傳新物件也不會重抓
  const paramsKey = JSON.stringify(buildProductParams(query, sort));

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    fetchProducts(JSON.parse(paramsKey), undefined, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", items: result.items, truncated: result.truncated, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.kind === "canceled") return;
        setState((prev) => ({ ...prev, status: "error", error }));
      });
    return () => controller.abort();
  }, [paramsKey, reloadToken]);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);
  return { ...state, retry };
}
```
- `JSON.parse(paramsKey)` 避免 effect 依賴 `query` 物件又不觸發 `exhaustive-deps` 警告；也可改用 `useMemo`。
- 錯誤時保留 `items`（`...prev`）：D-12「切換排序後失敗顯示錯誤卡片」，元件以 `status === "error"` 優先於 items。
- 每次參數變動 `setState` 在 effect 內同步呼叫：`eslint-plugin-react-hooks@^5.2` 不含 `set-state-in-effect` 規則，不會報錯。
- hook 不 import axios（`ApiError` 判斷即可），保持可測。

### Pattern 3: 元件測試注入 `fetchProducts`
```typescript
// src/pages/ProductPageTemplate.test.tsx
// @vitest-environment jsdom   ← 若採 projects 設定（見下）可省略
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { ApiError } from "../services/errors";
import { fetchProducts } from "../services/products";
import ProductPageTemplate from "./ProductPageTemplate";

// 1) 不要讓 NavBar/SideMenu 在測試中打 Airtable（Phase 3 前仍會呼叫）
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
// 2) 取代資料層；其餘（errors.ts 的 getErrorMessage、ApiError）用真的
vi.mock("../services/products");

beforeEach(() => { vi.resetAllMocks(); });

it("失敗時顯示錯誤卡片，點重新載入會再抓一次", async () => {
  vi.mocked(fetchProducts)
    .mockRejectedValueOnce(new ApiError("rate_limited", "x", 429))
    .mockResolvedValueOnce({ items: [], total: 0, truncated: false });
  render(<ProductPageTemplate /* props 為頁面設定 */ />);
  expect(await screen.findByRole("alert")).toHaveTextContent("瀏覽太頻繁");
  await userEvent.click(screen.getByRole("button", { name: "重新載入" }));
  expect(await screen.findByText("目前沒有商品")).toBeInTheDocument();
  expect(fetchProducts).toHaveBeenCalledTimes(2);
});
```
- `vi.mock` 會被 hoist 到 import 之前；factory 內不可引用外部變數（除 `vi`）。`React.ReactNode` 型別使用需 `import type { ReactNode } from "react"`（`verbatimModuleSyntax`）。
- `vi.mock("../components/Layout")` 的路徑相對於**測試檔**，且要與被測元件 import 解析到同一個模組檔。
- 建議用「永遠 pending 的 Promise」測載入畫面：`mockReturnValue(new Promise(() => {}))`。
- 拿 signal：`vi.mocked(fetchProducts).mock.calls[0][2]?.signal`，unmount 後斷言 `signal.aborted === true`。

### Pattern 4: StrictMode、canceled、參數變更測試（hook 層）
```typescript
// renderHook 可傳 wrapper: StrictMode
const { result, rerender, unmount } = renderHook(
  ({ sort }) => useProducts({ brand: "KRD" }, sort),
  { initialProps: { sort: "name" as const }, wrapper: StrictMode }
);
// StrictMode 在 React 19 dev 會「掛載→cleanup→再掛載」：fetchProducts 被呼叫 2 次，
// 第一次的 signal 已 aborted，最終狀態只採第二次的結果（實測 vitest 下 StrictMode wrapper 有效）。
await waitFor(() => expect(result.current.status).toBe("success"));
expect(fetchProducts).toHaveBeenCalledTimes(2);
expect(vi.mocked(fetchProducts).mock.calls[0][2]?.signal?.aborted).toBe(true);
```
- canceled 不進錯誤：`mockRejectedValue(new ApiError("canceled", "x"))` 後 `status` 應仍為 `"loading"`；搭配 unmount 不應有 `act` 警告。
- 參數變更：`rerender({ sort: "newest" })` → 第二次呼叫的第一個參數 `sort: "newest"`；過程中 `items` 仍為舊值、`status === "loading"`（D-12）。
- retry：`act(() => result.current.retry())` → 呼叫次數 +1，期間 `status === "loading"`。
- `renderHook` 的 `act` 與 `waitFor` 皆來自 `@testing-library/react`。

### Pattern 5: Vitest `projects` 環境隔離（已實測）
```typescript
// vite.config.ts 的 test 區塊
test: {
  projects: [
    { extends: true, test: { name: "unit", environment: "node", include: ["src/**/*.test.ts"] } },
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
```
```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";   // 同時提供 matcher 的 TS 型別擴充（tsc -b 會編譯 src/）
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());                   // globals:false 時 RTL 不會自動 cleanup（實測）
```
理由：既有 `client.test.ts`／`products.test.ts` 依賴 node 環境與自訂 adapter；jsdom 環境下 axios 會選 xhr adapter，雖有注入 adapter 但不值得冒險。以副檔名分流（`.ts`=node、`.tsx`=jsdom）零成本，**命名規則寫進計畫**：需要 DOM 的測試一律 `.test.tsx`；hook 測試用 `renderHook` 也要 `.test.tsx`。
- 註：Vitest 4 已無 `environmentMatchGlobs`，要用 `projects`（`extends: true` 繼承根設定的 plugins）。[VERIFIED: 實測 vitest 4.1.12] 
- 單一檔案的替代：`// @vitest-environment jsdom` docblock（在檔案第一行；但 cleanup/jest-dom 仍須各檔 import 或另設 setupFiles，容易漏，故不採用）。

### Pattern 6: Route 由設定產生，並解決 state 重用
```tsx
{PRODUCT_PAGES.map((page) => {
  const view = PRODUCT_PAGE_VIEWS[page.path];
  return (
    <Route
      key={page.path}
      path={page.path}
      // key 必須有：不同 Route 的相同元件型別在同一位置會被 React 重用，排序與舊列表會殘留（D-13）
      element={<ProductPageTemplate key={page.path} query={page.query} {...view} />}
    />
  );
})}
```
- `PRODUCT_PAGE_VIEWS` 型別建議 `Record<string, ...>` 並加測試：`PRODUCT_PAGES` 每個 path 都有對應 view（避免 undefined 展開默默通過）。
- 8 路徑清單測試：硬寫舊路徑陣列 `["/all-products","/new-products","/micgo-products","/krd-products","/wired-micphone","/wireless-micphone","/trumpet","/accessories"]` 與 `PRODUCT_PAGES.map(p => p.path)` 比對（順序一致）；再以 `MemoryRouter initialEntries={[path]}` 渲染 `<App />`（App 本身只含 `Routes`，BrowserRouter 在 main.tsx）斷言每個路徑會呼叫 `fetchProducts` 且標題出現。渲染 App 會連帶 import HomePage／AboutPage（AboutPage 仍用 `airTable`，但 import 本身不發請求），Layout 已 mock 即可。

### Anti-Patterns to Avoid
- **把 `Layout` 留在元件測試中：** 會真的呼叫 Airtable（含 token）。必 mock。
- **用 `query` 物件或 `buildProductParams()` 的回傳物件直接當 effect 依賴：** 每次 render 新物件 → 無限重抓、打爆 60/min 限流。
- **在 `ProductPageTemplate` 保留前端排序或 `sortedProducts` useMemo：** D-11 要求移除。
- **渲染 `error.message`：** 只能 `getErrorMessage(error)`（Phase 1 安全稽核）。
- **為 StrictMode 雙請求加快取或 `useRef` 防重複旗標：** 會破壞 PROD-06；abort + 忽略 canceled 即正解（production build 沒有雙 effect）。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 取消過期請求 | 自製 request id／mounted ref | `AbortController` + axios `signal` | axios 原生支援，`errors.ts` 已分類 canceled |
| 價格格式／區間 | 元件內自算 | `Product.priceText`（Phase 1） | 已測試 |
| 錯誤文字 | 元件內判斷 status code | `getErrorMessage` | 防洩漏後端訊息 |
| 查詢參數序列化 | 手組 query string | `buildProductParams` + axios params | 中文分類 encode、鍵順序已測 |
| DOM 查詢／互動模擬 | 自寫 `document.querySelector` | Testing Library（role 查詢） | UI-SPEC 已設計 role／aria 鉤子 |
| 載入 hook | 引入 SWR／TanStack Query | 自寫 ~40 行 `useProducts` | D-01 已決定；專案規模不需快取層 |

## Common Pitfalls

### Pitfall 1: Tailwind 動態 class 被 purge（HomePage）
**What goes wrong:** `from-${accentColor}-500/30`、`from-${accentColor}-500 to-purple-500` 為字串組合，Tailwind 只掃描完整字串，產出 CSS 不含 → 輪播指示點與遮罩漸層失效（現況 bug）。
**How to avoid:** 用完整字串對照表：
```tsx
const ACCENT_CLASSES = {
  blue: { overlay: "from-blue-500/30", dot: "from-blue-500" },
  purple: { overlay: "from-purple-500/30", dot: "from-purple-500" },
} as const;
// className={`absolute inset-0 bg-gradient-to-tr ${ACCENT_CLASSES[accent].overlay} via-transparent to-purple-500/20`}
```
`accent` 型別為 `keyof typeof ACCENT_CLASSES`。驗證：`npm run build` 後 `grep -c "from-purple-500/30" dist/assets/*.css`（或 grep 原始碼確認無 `${` 組出的顏色 class：`grep -nE 'from-\$\{|to-\$\{|bg-\$\{' src`）。`tailwind.config.js` content 已含 `./src/**/*.{js,ts,jsx,tsx}`，完整字串寫在 `.tsx` 內即可被掃到，不需 safelist。

### Pitfall 2: grid 卡片 `h-96` 溢出
**What goes wrong:** 卡片固定 `h-96`(384px)，圖 `h-64`(256px)，資訊區僅剩 ~128px 含 padding；現有名稱 `min-h-[2.5rem]` + `line-clamp-2`、描述 `line-clamp-2`，再加一行價格（`text-sm` ≈ 20px + `mb-2`）會溢出。
**How to avoid:** 依 UI-SPEC：價格行放名稱與描述之間，描述改 `line-clamp-1`（或移除 `min-h`）；卡片根容器加 `overflow-hidden`（`.product-card-new` 是否已含請 executor 檢查 `src/index.css`）。`.line-clamp-2` 是 `index.css` 自訂 class；Tailwind 3.4 內建 `line-clamp-1` 可用。jsdom 無法驗證版面，需人工在 `npm run dev` 以「無價格／有價格（可暫時 mock）／長名稱／缺描述」四種情況目視（列入 manual-only 驗證）。
**Warning signs:** 卡片底部描述被切到一半、價格與「點擊查看大圖」重疊。

### Pitfall 3: `tsc -b` 嚴格度（測試檔也會被編譯）
`tsconfig.app.json` 的 `include: ["src"]` 含所有 `.test.ts(x)` 與 `src/test/setup.ts`：
- `verbatimModuleSyntax`：型別一律 `import type`（含 `ReactNode`、`AxiosInstance`、`Product`）；混合 import 要寫 `import { ApiError } from …; import type { … } from …`。
- `erasableSyntaxOnly`：狀態用字串聯集；不可用 enum、`namespace`、建構子參數屬性（`constructor(private x)`）。`class ApiError` 已用顯式欄位，OK。
- `noUnusedLocals/Parameters`：移除 `accentColor` prop、`tableName`、舊的 `airTable` import；測試內未使用的 `rerender`/`unmount` 解構會失敗。
- `noUncheckedSideEffectImports`：`import "@testing-library/jest-dom/vitest"` 必須能解析（已實測可）。
- 無 vitest globals：每個測試檔 `import { describe, it, expect, vi } from "vitest"`；若未開 `globals`，jest-dom 型別靠 `@testing-library/jest-dom/vitest` 的模組擴充，需該檔被 tsc 納入（在 `src/test/setup.ts`，OK）。
- 非 null 斷言 `mock.calls[0][2]?.signal`：`noUncheckedIndexedAccess` 未開，直接索引可行。
- `catch (error: unknown)`，禁止 `any`（CONVENTIONS）。
- 每個 task commit 前跑 `npm run build`（PROJECT 約束：push main 即上線）；`vite build` 不含測試檔，但 `tsc -b` 會，故測試型別錯誤也會讓 build 失敗。

### Pitfall 4: 缺圖／圖片載入失敗
jsdom 不載入圖片，`onError` 不會自動觸發 → 用 `fireEvent.error(screen.getByAltText(name))` 測 fallback。`ImagePlaceholder` 有 `role="img"`，同時真實 `<img alt>` 也是 role img，查詢用 `getByRole("img", { name: "暫無圖片" })` 帶 name 區分。圖片失敗後需把「已失敗」記在卡片的 state（以 `product.id` 或 `imageUrl` 為 key，imageUrl 變動時要重置）。

### Pitfall 5: 輪播計時器與測試
`setInterval` 自動播放（5000/5500ms）。其他測試不需要 fake timers；測自動播放才用 `vi.useFakeTimers()` 並以 `act(() => vi.advanceTimersByTime(5000))`。RTL 的 `waitFor/findBy` 在 vitest fake timers 下可能卡住（RTL 只自動偵測 jest），所以 fake timers 只用在單一測試且結束 `vi.useRealTimers()`。輪播 index 在 items 數量縮減時要防越界：`items.length` 改變（retry 後換資料）時以 `currentSlide % items.length` 或在 effect 重設為 0。`items.length === 1` 時 UI-SPEC 要求不計時、不顯示箭頭／指示點。

### Pitfall 6: 429 與雙請求
首頁一次兩個請求、dev StrictMode 再 ×2 = 4 次；限流 60/min 足夠但別加自動重試。使用者連點「重新載入」：每次 retry 都 abort 上一次，不會堆疊。重試按鈕在 `loading` 時元件不渲染，天然防連點。後端有快取（PROD-06 備註），不要在前端加 `Cache-Control` 繞過。

### Pitfall 7: 路由切換 state 殘留
見 Pattern 6：不加 `key={path}`，從 `/new-products` 切到 `/trumpet` 時 `sortBy`、`viewMode` 與舊列表會殘留（D-13 失敗）。`SideMenu` 的 `Link` 切換是同一個 `Routes` 位置。也要在測試中以 `rerender` 切換 path 驗證。

### Pitfall 8: ImageModal 在 jsdom
`ImageModal` 開啟時改 `document.body.style.overflow`；`cleanup` 後 effect cleanup 會還原為 `"unset"`。測試多個案例間不會互相影響，但若測「點圖開燈箱」，斷言以 `getByAltText`／modal 內 img 為主。缺圖卡片「不開燈箱」的斷言：點擊後 `queryByRole("dialog")`（若 ImageModal 無 role 則以其 `img` src 不存在判斷，executor 看實作決定）。

## Code Examples

### 排序下拉隱藏與 hook 參數
```tsx
// query.sort 有值（/new-products）→ 鎖定，不渲染下拉；buildProductParams 已讓頁面排序優先
const sortLocked = query.sort !== undefined;
const [sortBy, setSortBy] = useState<ProductSort>("name");
const { status, items, truncated, error, retry } = useProducts(query, sortLocked ? undefined : sortBy);
const isRefreshing = status === "loading" && items.length > 0;   // D-12：淡化
const isInitialLoading = status === "loading" && items.length === 0;
```
注意：首次載入失敗後按 retry，`items` 仍為空 → 走整頁載入畫面（符合 UI-SPEC）；排序切換失敗後 retry，`items` 非空 → 走淡化。`status==="error"` 一律先渲染錯誤卡片。

### 首頁兩組獨立
```tsx
const featured1 = useProducts(HOME_FEATURED_QUERIES[0]);
const featured2 = useProducts(HOME_FEATURED_QUERIES[1]);
// renderCarousel(featured1, "blue") / renderCarousel(featured2, "purple")
```
`renderEnhancedCarousel` 內部有 hooks 以外的 `currentSlide` state 在父層；建議拆成 `FeaturedCarousel` 元件（內含 slide state 與計時器），避免在 render function 內使用 hook，也使「一組失敗不影響另一組」更易測。`renderCarousel` 若維持函式，兩組 state 仍在 `Home` 內，可行但較難測計時器。

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vitest `environmentMatchGlobs` | `test.projects`（`extends: true`） | Vitest 3.x/4 | 以 projects 分環境 [VERIFIED: 實測 4.1.12] |
| RTL 內建 `@testing-library/dom` | 需另裝 peer `@testing-library/dom@^10` | RTL 16 | 明列安裝 |
| jest-dom `import "@testing-library/jest-dom"` | `import "@testing-library/jest-dom/vitest"` | jest-dom 6+ | vitest 專用入口 |
| Vitest 最新 5.1.0 | 本專案固定 ^4.1.12 | — | 不升級，避免本 phase 外溢 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@testing-library/jest-dom`、`user-event` 值得安裝（D-17 說「視需要」） | Standard Stack | 低；兩者為 RTL 標配，不裝則斷言與互動較冗長 |
| A2 | `.product-card-new` 是否已 `overflow-hidden` 未逐行確認 | Pitfall 2 | 低；executor 實作時目視確認 |
| A3 | `react-refresh/only-export-components` 對 `productPageViews.tsx` 會 warn（僅 warn 不擋 build） | Architecture | 低；lint 為 warn |
| A4 | Cloudflare Pages 建置環境可安裝 jsdom 29（devDependency 會在 CI install；jsdom 29 engines `>=24` 或 `^22.13`/`^20.19`） | Standard Stack | 中；若 Pages 的 Node 版本為 18，`npm install` 會出 EBADENGINE 警告（預設不致命）。建議計畫中確認 Pages 的 Node 版本（預設已 ≥22，未驗證）；必要時加 `.nvmrc`/`NODE_VERSION` env |

## Open Questions (RESOLVED)

1. **Cloudflare Pages 建置 Node 版本**
   - 已知：專案無 `.nvmrc`、無 `engines`；本機 24.13.0；jsdom 29 要求 `^20.19||^22.13||>=24`。
   - 不明：Pages 目前預設 Node 版本。
   - 建議：把「確認或鎖定 Node 版本」列為 Phase 2 安裝依賴 task 的人工確認項；備案是 jsdom 26.1.0（engines `>=18`），但 26 較舊。部署前以 push 前 `npm ci` 驗證。
   - RESOLVED: 02-01 Task 1（blocking-human checkpoint）由使用者確認 Node 版本策略，02-01 Task 2 新增 `.nvmrc`（`24`）；02-05 Task 2 於 push 後確認 Pages 建置記錄的 Node 版本與結果。
2. **`fetchProducts` 簽名擴充方式**
   - 建議第三參數 `options`；若 planner 偏好把 signal 併入第二參數 client 之前，會影響 Phase 1 測試呼叫，不建議。
   - RESOLVED: 02-01 Task 2 採第三參數 `options: FetchProductsOptions = {}`（`{ signal?: AbortSignal }`），前兩個參數不變，並以測試驗證 signal 傳遞與 canceled 分類。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test | ✓ | 24.13.0 | — |
| npm | 安裝依賴 | ✓ | (隨 Node) | — |
| 後端 API（api.krd.com.tw） | `npm run dev` 手動驗證 | ✓（Phase 1 已驗證） | — | 測試不依賴 |
| pip/slopcheck | 套件驗證 | ✗ | — | 以 npm registry 手動檢查（已做） |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2/V3/V4 認證／Session／存取控制 | no | 公開唯讀 API，無登入 |
| V5 Input Validation | yes（輸出面） | Phase 1 `isProductListResponse`/`isPublicProduct` 驗證；元件不信任欄位型別 |
| V6 Cryptography | no | — |
| V14 Config | yes | 前端不得含憑證；`VITE_API_BASE_URL` 僅公開值（Phase 1 已完成） |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 後端錯誤原文顯示給訪客（資訊洩漏） | Information Disclosure | 只顯示 `getErrorMessage()`；測試斷言 `error.message` 不出現在 DOM |
| 後台內容含 HTML/script（description、name） | Tampering/XSS | React 預設跳脫；**禁止** `dangerouslySetInnerHTML` |
| 圖片 URL 來自後端 | Tampering | 僅放入 `<img src>`；不要用於 `href`/`javascript:`；不 inline 動態 style |
| 測試意外打 Airtable（含 token） | Information Disclosure | `vi.mock` Layout；Phase 3 才移除 NavBar 的 Airtable 呼叫 |
| 限流被自動重試放大 | DoS | 不自動重試，僅手動按鈕 |

## Validation Architecture

`workflow.nyquist_validation` 為 `false`，依規定省略正式驗證架構段落。測試指令供規劃參考：快速 `npm test`（`vitest run`，兩個 project 皆跑）；單檔 `npx vitest run src/hooks/useProducts.test.tsx`；phase gate = `npm test && npm run lint && npm run build`。需人工驗證（manual-only）：卡片 `h-96` 版面溢出、輪播視覺、`npm run dev` 對 production API 的實際畫面、手機寬度的錯誤卡片。

## Sources

### Primary (HIGH confidence)
- 本 repo 原始碼（`src/services/*.ts`、`HomePage.tsx`、`ProductPageTemplate.tsx`、`App.tsx`、`Layout.tsx`、`vite.config.ts`、`tsconfig.app.json`）
- npm registry：`npm view` 各套件 version、peerDependencies、engines、scripts
- scratchpad 實測：vitest@4.1.12 + vite@6.3.5 + jsdom@29.1.1 + RTL 16.3.3 + jest-dom 7.0.1 + user-event 14.6.9 + React 19 — StrictMode、user-event、cleanup 行為、`projects` 分流皆通過

### Secondary (MEDIUM confidence)
- 02-CONTEXT.md、02-UI-SPEC.md、REQUIREMENTS.md（專案決策文件）

### Tertiary (LOW confidence)
- 無（未使用 Context7／WebSearch；關鍵行為皆以實測取代）

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — registry 與實測雙重確認；僅 slopcheck 不可用
- Architecture: HIGH — 直接依 repo 現況與 Phase 1 API
- Pitfalls: HIGH（版本、cleanup、Layout mock）／MEDIUM（版面溢出，需目視）

**Research date:** 2026-11-10
**Valid until:** 2026-12-10（套件版本變動快；jsdom 的 engines 以安裝當下為準）
