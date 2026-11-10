# Phase 1: 測試與 API 資料層基礎 - Research

**Researched:** 2026-11-10
**Domain:** Vitest 導入 + axios API 資料層（Vite 6 / React 19 / TS 5.8 SPA）
**Confidence:** HIGH（後端行為已讀原始碼並以 production 實測交叉驗證；Vitest 版本相容性以 npm registry 驗證）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 價格顯示格式為 `NT$1,200`：用 `Intl.NumberFormat("zh-TW")` 加千分位，「分」÷100 後整數不顯示小數，有小數時最多 2 位。
- **D-02:** `price_min ≠ price_max` 時顯示 `NT$1,200 – NT$1,500`；兩者相等時只顯示單一價格；只有一邊非 `null` 時顯示那一個；兩邊都是 `null` 時顯示「價格洽詢」（集中定義成一個常數）。
- **D-03:** 轉換後的畫面型別用 camelCase（例如 `imageUrl`、`publishedAt`、`featuredGroup`、`inStock`），另附預先算好的 `priceText`。API 原始型別保留 snake_case，和 API 文件對得起來。
- **D-04:** 商品不因缺圖被過濾掉，跟舊的 Airtable 邏輯不同，因為核心價值是與後端一致。缺圖時 `imageUrl` 為 `null`，佔位圖在 Phase 2 處理。`name` 是空字串時，退回用 `${brand} ${model}`。
- **D-05:** 新增 `ApiError`（繼承 `Error`），帶 `kind` 與可選的 `status`。`kind` 分四類：`"network"`（含 timeout、沒有回應）、`"rate_limited"`（HTTP 429）、`"http"`（其他非 2xx）、`"invalid_response"`（`success:false` 或回應格式不符）。
- **D-06:** 錯誤一律往上拋，**不再吞成 `[]`**。「查無商品」是成功回傳空陣列，與失敗分開。
- **D-07:** 資料層提供 `getErrorMessage(error)`，回傳給使用者看的中文訊息：`rate_limited` →「瀏覽太頻繁，請稍候一分鐘再重試」；`network` →「無法連線，請檢查網路後重試」；其他 →「商品資料暫時無法載入，請稍後再試」。
- **D-08:** 資料層不自動重試。重試交給 Phase 2 的「重試」按鈕。
- **D-09:** 每次請求固定帶 `limit=100`（API 上限），不做多頁抓取。如果 `pagination.total` 大於拿到的筆數，就 `console.warn`。
- **D-10:** 排序交給後端（`sort=name|newest`），不在前端排序。頁面設定若鎖定排序（`/new-products` 固定 `newest`），以頁面設定為準。
- **D-11:** 8 個商品頁的「路徑 → 查詢條件」寫成一份設定陣列（`path` + `query`），放獨立模組，不寫在 `App.tsx`。首頁熱銷 `featured=1`、`featured=2` 也定義在同一模組。標題、描述、圖示本 phase 不搬。
- **D-12:** query string 用 axios `params` 或 `URLSearchParams` 產生。測試要斷言最後序列化出來的字串，確認中文分類有被正確 encode。
- **D-13:** 環境變數用 `VITE_API_BASE_URL`；沒設定時預設 `https://api.krd.com.tw/api/v1/public`。Cloudflare Pages 不需要設任何變數。
- **D-14:** 新增並 commit `.env.development`（`VITE_API_BASE_URL=/api/v1/public`）。`vite.config.ts` 用 `loadEnv` 讀 `VITE_PROXY_TARGET`（預設 `https://api.krd.com.tw`）作為 `/api` 的 proxy target，`changeOrigin: true`。本機後端用 `.env.development.local` 覆寫。
- **D-15:** 新增 `.env.example` 說明兩個變數。`.gitignore` 已含 `.env`、`*.local`，不用改。
- **D-16:** 研究確認後端是否依 `Origin` 在伺服器端拒絕；若會，proxy 需把 `Origin` 改寫成 `https://www.krd.com.tw`。

### Claude's Discretion
- 測試環境：Phase 1 只測純邏輯，用 Vitest `environment: "node"`。jsdom / testing-library 留到 Phase 2。
- HTTP mock 方式：優先依賴注入（傳 axios instance 或 adapter）或 `vi` mock axios，不引入 msw。由 planner 選。
- 檔案位置：新程式碼放 `src/services/` 新檔（`client.ts`、`products.ts`、`errors.ts`、`format.ts`、`catalog.ts`），不改 `src/services/index.ts`。測試檔與原始檔同目錄，`*.test.ts`。
- Vitest 設定寫在 `vite.config.ts` 或獨立 `vitest.config.ts`，以及 tsconfig 怎麼納入測試檔：只要 `npm run build`（`tsc -b`）與 `npm run lint` 通過即可。
- `npm test` 對應 `vitest run`，可另加 `test:watch`。

### Deferred Ideas (OUT OF SCOPE)
- 多頁抓取（offset 分頁）
- 元件層測試（jsdom + testing-library）：Phase 2
- 商品頁標題、描述、圖示搬進設定陣列：Phase 2／3
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | `npm test` 執行 Vitest | Vitest 4.1.x + `vitest run`；設定放 `vite.config.ts`（見 Standard Stack / Pattern 1） |
| TEST-02 | 回應 → 畫面資料轉換測試 | 後端實際欄位 schema（下節）；純函式 `toProduct` + `formatPrice` |
| TEST-03 | 頁面 → 查詢參數對照測試（含中文 encode） | 已實測 axios `getUri` 產生 `%E6%9C%89…` 大寫 percent-encoding |
| TEST-04 | 網路 / 非 2xx / `success:false` 錯誤轉換測試 | 實測錯誤 shape 與 axios 錯誤 code；自訂 adapter 注入測試法 |
| SEC-02 | `VITE_API_BASE_URL` 控制 base URL，預設 production | `import.meta.env` 型別宣告 + `createApiClient(baseURL)` |
| SEC-03 | dev proxy 讀得到商品資料 | `loadEnv` + `server.proxy`；D-16 結論：不需改寫 Origin |
</phase_requirements>

## Summary

後端公開 API（`../KRD-Inventory-Backend`，唯讀）已由原始碼與 production 實測確認：成功回應 `{ success:true, data:{ items, pagination:{offset,limit,total} } }`；錯誤回應一律 `{ success:false, error:{ code, message, details? } }`。**伺服器端不依 Origin 拒絕請求**——`publicCors` 對非白名單 Origin 只是不回 `Access-Control-Allow-Origin`（`cb(null, false)`），請求照常處理；`!origin` 也放行。實測帶 `Origin: https://evil.example` 的請求仍得到完整 400 驗證錯誤 JSON。因此 **D-16 結論：proxy 不需要改寫 Origin**，只需 `changeOrigin: true`（讓 Host 為 api.krd.com.tw，Cloudflare 才會正確路由）。

Vitest 版本：最新為 5.1.0，但其 peer `vite ^6.4.0 || ^7 || ^8`，而本 repo lockfile 的 vite 是 **6.3.5**（不滿足）。Vitest 4.1.x 的 peer 為 `vite ^6.0.0 || ^7 || ^8`，與 lockfile 相容，不必升級 vite。建議用 `vitest@^4.1.12`。注意：此環境尚未 `npm install`（`node_modules` 不存在），axios 以 lockfile 的 1.9.0 為準。

axios 以自訂 `adapter` 注入 mock 最簡單：`createApiClient(baseURL, adapter?)`，不需 `vi.mock`、不需 msw。中文 params 經 axios 序列化為 UTF-8 percent-encoding，與 `encodeURIComponent` 輸出一致（已實測）。

**Primary recommendation:** `vitest@^4.1.12`、設定寫進 `vite.config.ts`（改 import `defineConfig` 自 `vitest/config`，函式形式 `({ mode })` 以便 `loadEnv`）、測試檔明確 `import { describe, it, expect } from "vitest"`（不開 globals）、用 axios 自訂 adapter 做依賴注入，D-16 不改寫 Origin。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 商品資料來源 / 驗證 / 限流 / CORS | API / Backend（外部 repo，唯讀） | — | 後端是唯一資料來源 |
| API 呼叫、轉換、錯誤正規化 | Browser / Client（`src/services/`） | — | 純邏輯，無自有後端 |
| 本機 CORS 規避 | Dev server（Vite proxy） | — | 僅開發期；production 直連 API（白名單含 www.krd.com.tw） |
| Base URL 設定 | Build-time env（`VITE_*`） | Browser 預設值 | 公開值，非機密 |
| 頁面 → 查詢條件設定 | Browser / Client（`catalog.ts`） | — | 單一來源，Phase 2/3 沿用 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^4.1.12（registry 現有 5.1.0，見下） | 測試框架 | Vite 原生整合，共用 vite.config.ts [VERIFIED: npm registry `npm view vitest@4.1.12 peerDependencies.vite` = `^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0`] |
| axios | 1.9.0（lockfile，既有） | HTTP client | 專案既有 [VERIFIED: package-lock.json] |

**版本決策：** vitest 5.1.0 peer `vite ^6.4.0 || ^7 || ^8`、engines Node `^22.12 || ^24 || >=26`；lockfile vite = 6.3.5 不符 [VERIFIED: npm view + package-lock.json]。選 4.1.12（engines `^20 || ^22 || >=24`，peer 含 vite 6.0+）可避免同時升級 vite（超出本 phase 範圍）。若 planner 偏好 5.x，必須同步把 vite 升到 ^6.4.0 並重跑 build。

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 自訂 adapter 注入 | `vi.mock("axios")` | 需 mock 整個模組與 `create`、`isAxiosError`，脆弱；不選 |
| 自訂 adapter 注入 | msw | 多一依賴，CONTEXT 已排除 |
| 設定寫 `vite.config.ts` | 獨立 `vitest.config.ts` | 獨立檔需另納入 tsconfig.node.json include 且要重複 plugin/設定；不選 |

**Installation:**
```bash
npm install -D vitest@^4.1.12
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| vitest | npm | 多年（vitest-dev 官方，v5.1.0 存在） | 極高（主流） | github.com/vitest-dev/vitest | 未執行（本 session 未安裝 slopcheck） | [ASSUMED] 知名官方套件；planner 在安裝前加一個 `checkpoint:human-verify`（確認套件名為 `vitest`、無 postinstall）即可 |

**Packages removed:** none。其餘（axios）為既有依賴，不新增。僅新增 vitest 一個 devDependency。

## Architecture Patterns

### System Architecture Diagram

```
 頁面設定 catalog.ts (path + query{brand|category|featured|sort})
        │ buildProductParams(query, userSort?)   ← 純函式；limit=100 固定；sort 鎖定時以頁面為準
        ▼
 products.ts: fetchProducts(query, client = defaultClient)
        │ client.get("/products", { params })
        ▼
 client.ts: createApiClient(baseURL, adapter?)  ── baseURL = VITE_API_BASE_URL ?? production
        │                                         dev: "/api/v1/public" → Vite proxy → api.krd.com.tw
        │                                         prod: 直連 https://api.krd.com.tw（CORS 白名單）
        ▼
   HTTP 回應 / axios 錯誤
        │ normalizeError(err) → ApiError(kind,status)   [network | rate_limited | http | invalid_response]
        │ 成功：檢查 success===true 且 data.items 為陣列，否則 invalid_response
        ▼
 format.ts / transform: toProduct(apiItem) → Product(camelCase, priceText)
        │ total > items.length → console.warn（D-09）
        ▼
 回傳 { items: Product[], total }   （Phase 2 接畫面；錯誤用 getErrorMessage(err) 取中文）
```

### Recommended Project Structure
```
src/services/
├── client.ts        # createApiClient(baseURL?, adapter?) + 預設 instance
├── errors.ts        # ApiError、normalizeError、getErrorMessage
├── errors.test.ts
├── format.ts        # formatPrice / formatPriceRange、PRICE_ON_REQUEST 常數
├── format.test.ts
├── transform.ts     # PublicProductApi 型別、Product 型別、toProduct
├── transform.test.ts
├── catalog.ts       # PRODUCT_PAGES 設定陣列、FEATURED 設定、buildProductParams
├── catalog.test.ts
├── products.ts      # fetchProducts（組合以上）
└── products.test.ts # 用自訂 adapter 測 HTTP 層（成功/429/500/網路/success:false/HTML）
```
（檔名沿用 CONTEXT 的 Claude's Discretion；`src/services/index.ts` 不動。）

### Pattern 1: vite.config.ts（Vitest + loadEnv + proxy）
**What:** 單一檔案；`defineConfig` 改從 `vitest/config` 匯入以取得 `test` 欄位型別，函式形式取得 `mode`。
```typescript
// Source: https://vitest.dev/config/ ；https://vite.dev/config/server-options.html#server-proxy
import { defineConfig, loadEnv } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // 第三參數預設只載入 VITE_ 前綴；"." 避免依賴 process.cwd() 的 node 型別（planner 以 tsc -b 驗證）
  const env = loadEnv(mode, ".");
  const target = env.VITE_PROXY_TARGET || "https://api.krd.com.tw";
  return {
    plugins: [react()],
    server: {
      proxy: {
        // 只代理 /api；changeOrigin 讓 Host 變成目標網域
        "/api": { target, changeOrigin: true },
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
```
替代寫法 `/// <reference types="vitest/config" />` + vite 的 `defineConfig` 亦可；二選一，上面較簡單。若 `loadEnv(mode, ".")` 在 tsc 或實際行為上有問題，改為安裝 `@types/node`（devDependency）並用 `process.cwd()`——這是唯一需要實測的點。[CITED: vitest.dev/config]

### Pattern 2: 依賴注入 axios adapter 測試
```typescript
// Source: axios 官方文件 adapter 選項（config.adapter）；行為已於 axios 1.9.0 實測
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

export function createApiClient(baseURL = DEFAULT_BASE_URL, adapter?: AxiosAdapter) {
  return axios.create({ baseURL, timeout: 10000, adapter });
}

// 測試：回傳固定資料；非 2xx 要自己丟 AxiosError（自訂 adapter 不會套用 validateStatus）
const okAdapter = (data: unknown, status = 200): AxiosAdapter => async (config) => {
  const response = { data, status, statusText: "", headers: {}, config };
  if (status >= 200 && status < 300) return response;
  throw new AxiosError(`HTTP ${status}`, AxiosError.ERR_BAD_RESPONSE, config, null, response);
};
// 斷言 query string：捕捉 config 後用 client.getUri(config)
let captured: InternalAxiosRequestConfig | undefined;
```
網路錯誤測試：adapter 內 `throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)`（無 response）。timeout：`AxiosError.ECONNABORTED`。`adapter: undefined` 時 axios 用預設，故 production 不受影響。

### Pattern 3: 型別 `src/vite-env.d.ts`
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API base URL；未設定時使用 production 預設值
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```
`VITE_PROXY_TARGET` 只在 vite.config.ts（node 端）使用，不需宣告於客戶端型別。設為 optional 以便 `?? DEFAULT` 型別正確。`.env.development` 只在 `vite`（dev）載入；`vite build` 為 production mode 不會載入，所以 build 產物用絕對 production URL；`vitest` 為 `test` mode，也不載入。[CITED: vite.dev/guide/env-and-mode]

### Anti-Patterns to Avoid
- **共用舊 axios instance：** 舊 instance 帶 Airtable baseURL 與 Authorization header，必須另建。
- **吞錯回傳 `[]`：** D-06 禁止；空陣列只代表「查無商品」。
- **只檢查 HTTP 狀態：** 200 但 body 不是 `{success:true,data:{items:[]}}` 也要轉 `invalid_response`。
- **在 `.env.*` 放機密：** `VITE_*` 全部會進 bundle；本 phase 的值全是公開 URL。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| query string 序列化 | 手拼 `?category=` + encode | axios `params` / `client.getUri` | 已實測正確 percent-encode，且自動略過 `undefined` |
| 千分位格式 | 自寫正則 | `Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 })` | D-01 |
| 判斷 axios 錯誤 | `err.isAxiosError` 手判 | `axios.isAxiosError(err)` | 官方 type guard |
| HTTP mock | 自架 mock server / msw | 自訂 adapter | 無新依賴 |

## Common Pitfalls

### Pitfall 1: Vitest 5.x 與 vite 6.3.5 peer 衝突
**What goes wrong:** `npm i -D vitest`（取得 5.1.0）因 peer `vite ^6.4.0` 與鎖定的 6.3.5 衝突（ERESOLVE 或悄悄升 vite）。
**How to avoid:** 明確 `vitest@^4.1.12`。**Warning signs:** npm 輸出 ERESOLVE、package-lock 中 vite 版本改動。

### Pitfall 2: 背景 SPA fallback 回 HTML
**What goes wrong:** 若 base URL 為相對路徑 `/api/v1/public` 卻沒有 proxy（例如誤在 production 使用），Cloudflare Pages 的 SPA fallback 回 `200 text/html`，`response.data` 是字串。
**How to avoid:** 成功路徑一律驗證 `typeof data === "object" && data.success === true && Array.isArray(data.data?.items)`，否則 `invalid_response`；測試涵蓋「data 是字串」。

### Pitfall 3: 錯誤分類順序
**What goes wrong:** 把 429 歸入 `http`，或把 timeout 當成 `http`。
**How to avoid:** `axios.isAxiosError(e)`：`e.response` 為 `undefined` → `network`（含 `ECONNABORTED`/`ETIMEDOUT`/`ERR_NETWORK`；實測連線被拒為 `ECONNREFUSED`、timeout 為 `ECONNABORTED`，皆 `response` 為 undefined）；`status===429` → `rate_limited`；其他 `status` → `http`。非 axios 錯誤（含 `ApiError` 本身）原樣處理：已是 `ApiError` 就直接回傳，避免二次包裝。
**注意：** 後端 `{success:false}` 通常伴隨非 2xx，被 axios 當 `http` 丟出；D-05 的 `invalid_response` 針對「HTTP 2xx 但 `success:false` 或格式不符」。若非 2xx 的 body 內有 `error.message`，可放進 `ApiError.message` 供 log，但給使用者的字串只來自 `getErrorMessage`。

### Pitfall 4: 自訂 adapter 不套用 validateStatus
測試用 adapter 要自行丟 `AxiosError`（見 Pattern 2），否則 500 也會被當成功。

### Pitfall 5: 嚴格 query schema
後端 `listPublicProductsQuerySchema` 是 `.strict()`：未知參數一律 400；`brand`/`category` 為空字串（`min(1)`）也 400；`featured` 只接受 `"1"`/`"2"`；`sort` 只接受 `name|newest`；`limit` 1..100。建構 params 時**不得送空字串或多餘 key**，undefined 會被 axios 省略。

### Pitfall 6: `featured` 優先於 `sort`
有 `featured` 時後端忽略 sort（OpenAPI 摘要與 D-18）。首頁熱銷不必送 sort。

### Pitfall 7: 瀏覽器快取
成功回應帶 `Cache-Control: public, max-age=60`（錯誤不帶）。重試按鈕在 429 後一分鐘內再按，成功回應之後 60 秒內由瀏覽器快取，不會多耗限流額度。

### Pitfall 8: lint / tsc 對測試檔
`tsconfig.app.json` 的 `include: ["src"]` 會把 `*.test.ts` 納入 `tsc -b`；`noUnusedLocals`、`verbatimModuleSyntax` 同樣適用：型別用 `import type`（或 inline `type`），測試中不要留未用變數。使用明確 `import { describe, it, expect, vi } from "vitest"`，不要開 `globals`，這樣不需動 tsconfig `types`。`eslint.config.js` 的 `files: **/*.{ts,tsx}` 已涵蓋測試檔且 TS 的 `no-undef` 預設關閉，無需改動。

## Code Examples

### 後端實際回應（production 實測 2026-11-10）
```json
{"success":true,"data":{"items":[{"id":"6d660a71-…","name":"BB1","brand":"MICGO","model":null,
 "category":"喇叭","description":null,"image_url":"https://img.krd.com.tw/….jpg",
 "warranty_period_months":null,"published_at":"2026-11-10T01:55:23.622Z","featured_group":null,
 "price_min":null,"price_max":null,"in_stock":false}],
 "pagination":{"offset":0,"limit":1,"total":20}}}
```
欄位 nullability（來自 `public.paths.ts`）：`id` string(uuid)；`name` string；`brand`/`model`/`description`/`image_url` string|null；`category` string；`warranty_period_months`、`featured_group`、`price_min`、`price_max` number|null（價格為含稅整數分）；`published_at` ISO string|null；`in_stock` boolean。[VERIFIED: backend 原始碼 + curl]

### 錯誤回應 shape（實測）
```json
// 400（sort=bad）
{"success":false,"error":{"code":"VALIDATION_FAILED","message":"輸入驗證失敗","details":{"fields":{"sort":"Invalid option: expected one of \"name\"|\"newest\""}}}}
// 404（未知子路徑）
{"success":false,"error":{"code":"NOT_FOUND","message":"路徑不存在"}}
// 429（原始碼 handler429；code = RATE_LIMIT_EXCEEDED）
{"success":false,"error":{"code":"RATE_LIMIT_EXCEEDED","message":"請求次數超過限制,請稍後再試"}}
// 500
{"success":false,"error":{"code":"INTERNAL_ERROR","message":"系統錯誤"}}
```
429 未實測（避免觸發限流），來自原始碼 `src/middleware/rate-limit.ts`。回應含 `RateLimit: "60-in-1min"; r=59; t=60` 標頭（draft-8）。[VERIFIED: backend 原始碼 + curl]

### axios params 序列化（axios 1.9.0 實測）
```
params {category:"有線麥克風",limit:100,sort:"name"}, baseURL "/api/v1/public"
→ /api/v1/public/products?category=%E6%9C%89%E7%B7%9A%E9%BA%A5%E5%85%8B%E9%A2%A8&limit=100&sort=name
encodeURIComponent("有線麥克風") → %E6%9C%89%E7%B7%9A%E9%BA%A5%E5%85%8B%E9%A2%A8   （完全一致）
```
差異：空白被編成 `+`（`A B&C` → `A+B%26C`），與 `encodeURIComponent` 的 `%20` 不同，但後端 Express 都能解碼；現有分類值不含空白。測試斷言以中文分類為準。key 順序依 params 物件插入順序，測試斷言整串時要固定建構順序（或用 `new URL(...).searchParams` 比對）。

### 查詢條件對照（BRIEF，D-10/D-11）
`/all-products` → `{}`；`/new-products` → `{sort:"newest"}`（鎖定）；`/micgo-products` → `{brand:"MICGO"}`；`/krd-products` → `{brand:"KRD"}`；四個分類頁 `{category:"有線麥克風"|"無線麥克風"|"喇叭"|"配件"}`；首頁熱銷 `{featured:1|2}`（送出時轉成字串 `"1"`/`"2"`；axios 會把數字轉字串，後端 enum 吃得到）。

### Dev proxy 行為（D-16 結論）
後端 `publicCors`：`origin: (origin, cb) => cb(null, !origin || allowlist.includes(origin))`，非白名單只不回 ACAO（`Vary: Origin`），**不拒絕、不 throw**；公開鏈在全域 CORS 之前，故不會 500。實測 `Origin: https://evil.example` 仍收到正常處理結果。瀏覽器對同源（經 Vite proxy 的 `/api/...`）GET 也不送 Origin。**結論：不需改寫 Origin。** 若日後後端新增 server-side Origin 檢查，再於 proxy 加 `headers: { Origin: "https://www.krd.com.tw" }`。

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Jest + babel/ts-jest | Vitest（共用 Vite 設定） | 無需額外轉譯設定 |
| `/// <reference types="vitest" />` | `vitest/config` 的 `defineConfig` 或 `/// <reference types="vitest/config" />` | 新版型別入口 [CITED: vitest.dev/config] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | vitest 套件合法性未跑 slopcheck（知名官方套件，視為可信） | Package Legitimacy | 極低；planner 可加人工確認 |
| A2 | `loadEnv(mode, ".")` 的相對路徑解析等同 `process.cwd()` 且 `tsc -b` 通過 | Pattern 1 | 若不行，安裝 `@types/node` 並用 `process.cwd()` |
| A3 | 429 body 以原始碼為準，未實測 | Code Examples | 低；測試用 mock，不依賴 body |
| A4 | Cloudflare Pages 建置 Node 版本滿足 vitest 4（`^20 \|\| ^22 \|\| >=24`）；但 vitest 只在本機/CI 測試跑，`npm run build` 不執行 vitest，故不影響部署 | Standard Stack | 低；但 `npm ci` 仍會安裝 devDependencies，若 Pages Node 版本過舊（<20）安裝可能有 engines 警告 |

## Open Questions (RESOLVED)

1. **`loadEnv` 的 envDir 寫法（A2）**
   - 已知：官方範例用 `process.cwd()`。
   - 不確定：本 repo 未裝 `@types/node`，tsconfig.node.json 可能報 `process` 找不到。
   - 建議：Plan 中第一個任務實測 `npm run build`；失敗即補 `@types/node`（該套件為 vite 的 optional peer，加為 devDependency 屬低風險，但需於 PLAN 說明理由）。
   - RESOLVED: 於 01-01 Task 1 條件式處理——先用 `loadEnv(mode, ".")` 跑 `tsc -b`，僅在報錯時才安裝 `@types/node` 並改用 `process.cwd()`，理由記錄於 SUMMARY。

2. **vitest 4 vs 5**：預設選 4.1.12 以免動 vite；若使用者想要最新，需另立任務升 vite。
   - RESOLVED: 01-01 Task 1 鎖定 `vitest@^4.1.12`，禁止 `--force`／`--legacy-peer-deps`，並驗證 vite 仍為 6.x；升級 vite／vitest 5 不在本 phase 範圍。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 全部 | ✓ | v24.13.0 | — |
| npm / registry | 安裝 vitest | ✓ | — | — |
| `node_modules` | 測試/建置 | ✗（尚未 install） | — | 第一個任務 `npm ci` |
| 後端 production API | 實測/proxy | ✓（`https://api.krd.com.tw`） | 200 OK | 本機後端 via `VITE_PROXY_TARGET` |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2/V3 Authentication/Session | no | 公開 API，免登入 |
| V4 Access Control | no | 唯讀公開資料 |
| V5 Input Validation | yes | 後端 zod strict；前端只送白名單參數、不送空字串；轉換層對 `null`/缺欄位容錯，不信任回應型別 |
| V6 Cryptography | no | — |
| V14 Config | yes | `VITE_*` 只放公開值；不得放 token |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 憑證進 bundle | Information Disclosure | 本 phase 新程式碼無任何 token；`.env.example` 只含 URL；`.gitignore` 已排除 `.env`、`*.local` |
| `VITE_` 變數暴露 | Information Disclosure | 全部視為公開；`VITE_PROXY_TARGET` 僅在 vite.config.ts 讀取，未被客戶端程式碼引用故不會被內嵌 |
| Proxy 目標被改成內網位址（SSRF 風格） | Tampering | proxy 只存在於 dev server，且 target 來自開發者本機 env；production 不使用 proxy |
| 後端回應中的 HTML/字串注入 | Tampering/XSS | React 預設跳脫；Phase 2 不使用 `dangerouslySetInnerHTML` 渲染 `description` |
| 429 重試風暴 | DoS（自傷） | D-08 不自動重試 |

## Validation Architecture
已略過（nyquist 停用）。僅提供指令：`npm test` = `vitest run`；快速單檔 `npx vitest run src/services/format.test.ts`；phase gate：`npm test && npm run lint && npm run build`。

## Sources

### Primary (HIGH confidence)
- 後端原始碼（唯讀）：`src/middleware/public-cors.ts`、`rate-limit.ts`、`error-handler.ts`、`modules/public/schemas/public-catalog.schemas.ts`、`controllers/public-catalog.controller.ts`、`openapi/paths/public.paths.ts`、`app.ts`
- Production 實測：`curl https://api.krd.com.tw/api/v1/public/products`（共 4 次請求；成功、400、404；含一次假 Origin）
- npm registry：`npm view vitest` / `vitest@4.1.12` peerDependencies、engines
- axios 1.9.0 本機實驗（`getUri`、錯誤 code）
- repo：`vite.config.ts`、tsconfig*、`eslint.config.js`、`package-lock.json`

### Secondary (MEDIUM)
- Vitest / Vite 官方文件（config、env-and-mode、server.proxy）——來自訓練知識，未於本 session 逐頁重抓，視為 [ASSUMED] 的細節僅限 `loadEnv` 簽名與 `vitest/config` 匯出（planner 以 `tsc -b` 實測）

## Metadata

**Confidence breakdown:**
- 後端行為／schema／D-16：HIGH（原始碼 + 實測）
- Vitest 版本相容：HIGH（registry）
- vite.config 寫法：MEDIUM（A2 待實測）
- axios 序列化／錯誤 code：HIGH（實測）

**Research date:** 2026-11-10
**Valid until:** 2026-12-10
