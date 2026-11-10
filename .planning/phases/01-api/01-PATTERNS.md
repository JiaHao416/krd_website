# Phase 1: 測試與 API 資料層基礎 - Pattern Map

**Mapped:** 2026-11-10
**Files analyzed:** 18（新增 16、修改 3 含 package.json／vite.config.ts／vite-env.d.ts）
**Analogs found:** 6 / 18（其餘為全新類型：測試檔、純函式、env 檔；改採 RESEARCH.md 的範例）

> 安全提醒：`src/services/index.ts` 內含硬編碼的 Airtable token 與 Base ID。本文件所有引用皆已遮蔽（`<REDACTED>`），新程式碼不得複製這些值，也不得放入 `Authorization` header。

## File Classification

| 新增／修改檔案 | Role | Data Flow | Closest Analog | Match Quality |
|----------------|------|-----------|----------------|---------------|
| `src/services/client.ts` | service（axios factory） | request-response | `src/services/index.ts` L20-25 | role-match（只仿 instance 建立方式，不共用） |
| `src/services/errors.ts` | utility（錯誤類別 + 正規化） | transform | `src/services/index.ts` L5-46（interceptor / handleError） | role-match |
| `src/services/products.ts` | service | request-response | `src/services/index.ts` L116-158（`airTable` / `getProducts`） | role-match（錯誤策略相反） |
| `src/services/format.ts` | utility | transform | 無 | no analog |
| `src/services/transform.ts` | utility（型別 + 轉換） | transform | `src/services/index.ts` L69-111（Field／Record 型別） | partial |
| `src/services/catalog.ts` | config + utility | transform | `src/App.tsx` 路由設定（本 phase 不動） | partial |
| `src/services/errors.test.ts` | test | transform | 無（專案沒有測試） | no analog |
| `src/services/format.test.ts` | test | transform | 無 | no analog |
| `src/services/transform.test.ts` | test | transform | 無 | no analog |
| `src/services/catalog.test.ts` | test | transform | 無 | no analog |
| `src/services/products.test.ts` | test | request-response（adapter 注入） | 無 | no analog |
| `vite.config.ts`（修改） | config | — | 自身 L1-7 | exact（就地擴充） |
| `src/vite-env.d.ts`（修改） | config | — | 自身 L1 | exact |
| `package.json`（修改） | config | — | 自身 scripts／devDependencies | exact |
| `.env.development`（新增） | config | — | 無 | no analog |
| `.env.example`（新增） | config | — | 無 | no analog |

## Pattern Assignments

### `src/services/client.ts`（service, request-response）

**Analog:** `src/services/index.ts`（僅參考結構，不得 import 或共用該 instance）

**Imports 與 instance 建立**（index.ts L2-3、L20-25；schema 沿用但 baseURL 與 headers 全部改掉）：
```typescript
import axios from "axios";
import type { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: "https://api.airtable.com",   // 新 client 改用 VITE_API_BASE_URL
  headers,                                // <REDACTED：舊 headers 含 Authorization，新 client 不得帶任何憑證>
  timeout: 10000,                         // 沿用 10000ms
});
```

**新檔應採用的寫法**（來自 RESEARCH Pattern 2、Pattern 3；`verbatimModuleSyntax` 要求型別用 `import type`）：
```typescript
import axios from "axios";
import type { AxiosAdapter, AxiosInstance } from "axios";

// 預設 production；dev 由 .env.development 覆寫為 /api/v1/public
export const DEFAULT_BASE_URL = "https://api.krd.com.tw/api/v1/public";

/**
 * 建立公開 API 的 axios instance
 * @param baseURL - API 根網址，預設讀 VITE_API_BASE_URL
 * @param adapter - 測試用注入點；未提供時 axios 使用預設 adapter
 */
export function createApiClient(
  baseURL: string = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  adapter?: AxiosAdapter
): AxiosInstance {
  return axios.create({ baseURL, timeout: 10000, adapter });
}

export const apiClient = createApiClient();
```
注意：不要加 response interceptor 把錯誤轉成 `{message,data,status}`（舊寫法），錯誤統一由 `errors.ts` 的 `normalizeError` 處理，避免二次包裝。

---

### `src/services/errors.ts`（utility, transform）

**Analog:** `src/services/index.ts` L5-46

**舊模式（要取代而非仿效）**：
```typescript
interface ApiError { message?: string; data?: any; status?: number; }   // L6-10，含 any
const handleError = ({ message, data, status }: ApiError): Promise<never> => {
  return Promise.reject({ message, data, status });                      // L28-30
};
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const { response } = error;
    if (response) { return handleError({ data: response.data, status: response.status, message: error.message }); }
    return handleError({ message: error.message });                      // 無 response 分支 -> 新版對應 "network"
  }
);
```
可沿用的概念：以「有無 `error.response`」區分網路錯誤與 HTTP 錯誤；`import type { AxiosError }` 的型別匯入風格。

**新檔要求**（D-05、Pitfall 3；`erasableSyntaxOnly` 禁用 enum 與 constructor parameter properties，需手動賦值）：
```typescript
import axios from "axios";

export type ApiErrorKind = "network" | "rate_limited" | "http" | "invalid_response";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;            // 避免二次包裝
  if (axios.isAxiosError(error)) {
    if (!error.response) return new ApiError("network", error.message);       // 含 timeout / ECONNABORTED
    if (error.response.status === 429) return new ApiError("rate_limited", error.message, 429);
    return new ApiError("http", error.message, error.response.status);
  }
  return new ApiError("invalid_response", error instanceof Error ? error.message : "未知錯誤");
}
```
`getErrorMessage` 的三句中文文案照 D-07 原文。避免 `catch (error: any)`，一律 `unknown`。

---

### `src/services/products.ts`（service, request-response）

**Analog:** `src/services/index.ts` L116-158（`airTable` + `getProducts`）

**JSDoc 風格**（L116-121、L152-155，中文 `/** */` 含 `@param`、`@returns`）：
```typescript
/**
 * 從 AirTable 獲取資料
 * @param tableName - 資料表名稱
 * @param viewName - 視圖名稱
 * @returns Promise<AirTableRecord[]>
 */
async function airTable(tableName: string, viewName: string = "data"): Promise<AirTableRecord[]> {
```

**核心模式：泛型 GET + 回應檢查**（L131-137；新版要改成嚴格驗證，不回 `[]`）：
```typescript
const response = await api.get<AirTableResponse>(apiUrl);
if (response.data && response.data.records) {
  return response.data.records;
}
console.warn(`No records found for table: ${tableName}, view: ${viewName}`);
return [];
```

**錯誤處理：必須反向**（L139-149 為「不要仿效」）：
```typescript
} catch (error: any) {
  console.error(`Error fetching data from Airtable (${tableName}):`, {...});
  // 返回空陣列而不是錯誤，讓 UI 可以正常顯示空狀態
  return [];     // D-06 禁止：新版改為 throw normalizeError(error)
}
```

**新檔要求**：
- 簽章 `fetchProducts(query, client = apiClient)`，依賴注入（Pitfall 4、RESEARCH Pattern 2）。
- 成功路徑驗證 `typeof data === "object" && data.success === true && Array.isArray(data.data?.items)`，否則 `throw new ApiError("invalid_response", ...)`（Pitfall 2，涵蓋 data 是 HTML 字串）。
- `pagination.total > items.length` 時 `console.warn`（D-09）。這是沿用 L137 `console.warn` 的風格。
- 沿用舊檔的 `console.error` 前綴英文風格並不必要，新註解一律繁體中文。

---

### `src/services/transform.ts`（utility, transform）

**Analog:** `src/services/index.ts` L69-111（型別宣告區）

**型別命名與匯出風格**：
```typescript
export interface ProductField {
  img_url: string;
  product_name?: string;
  ...
  [key: string]: any;      // 已知偏離：新型別不得使用 index signature 或 any
}
export interface ProductRecord extends AirTableRecord { fields: ProductField; }
```
新檔：`PublicProductApi`（snake_case，欄位 nullability 見 RESEARCH「後端實際回應」）與 `Product`（camelCase + `priceText`、`imageUrl: string | null`），皆用 `export interface`，不加 `[key: string]: any`。`toProduct` 為純函式，`name` 空字串時退回 `` `${brand} ${model}` ``（D-04），價格用 `format.ts`。不得像 L157 那樣用 `filter(img_url)` 過濾缺圖商品。

---

### `src/services/catalog.ts`（config + utility, transform）

**Analog:** 無直接程式碼；路由來源是 `src/App.tsx`（本 phase 不修改，僅以 BRIEF／RESEARCH「查詢條件對照」為準）。

**核心模式**（RESEARCH L287-288）：
```typescript
export interface ProductPageQuery {
  brand?: string;
  category?: string;
  featured?: 1 | 2;
  sort?: "name" | "newest";
}
export const PRODUCT_PAGES: { path: string; query: ProductPageQuery }[] = [
  { path: "/all-products", query: {} },
  { path: "/new-products", query: { sort: "newest" } },   // 鎖定排序
  { path: "/micgo-products", query: { brand: "MICGO" } },
  { path: "/krd-products", query: { brand: "KRD" } },
  { path: "/wired-micphone", query: { category: "有線麥克風" } },
  { path: "/wireless-micphone", query: { category: "無線麥克風" } },
  { path: "/trumpet", query: { category: "喇叭" } },
  { path: "/accessories", query: { category: "配件" } },
];
```
`buildProductParams(query, userSort?)`：固定 `limit: 100`；頁面鎖定 sort 時以頁面為準；不得送空字串或多餘 key（Pitfall 5）；有 `featured` 時不送 sort（Pitfall 6）。建構順序固定，測試才能斷言整串。模組層常數沿用 UPPER_SNAKE_CASE（`BASE_ID` 的慣例）。

---

### `src/services/format.ts`（utility, transform）

無 analog。依 D-01／D-02：`Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 })`，分 ÷100，匯出 `PRICE_ON_REQUEST = "價格洽詢"` 常數與 `formatPrice`／`formatPriceRange`，區間分隔符為 ` – `（en dash）。

---

### 測試檔 `*.test.ts`（test）

專案無任何測試，沒有 analog。共同規則（RESEARCH Pitfall 8）：
```typescript
import { describe, it, expect, vi } from "vitest";   // 不開 globals；未用到的匯入會觸發 noUnusedLocals
```
- 與原始檔同目錄、命名 `*.test.ts`，會被 `tsconfig.app.json` 的 `"include": ["src"]` 納入 `tsc -b`。
- `products.test.ts`：用 RESEARCH Pattern 2 的自訂 adapter（非 2xx 要自行 `throw new AxiosError(...)`，網路錯誤用 `AxiosError.ERR_NETWORK` 且無 response）。斷言 query 用 `client.getUri(config)` 取得字串，確認 `%E6%9C%89%E7%B7%9A...`（D-12）。
- 測試名稱用繁體中文描述情境，一個測試盡量一個斷言（全域規範）。

---

### `vite.config.ts`（config，修改）

**Analog:** 自身（現況 L1-7）：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```
改成 RESEARCH Pattern 1（`defineConfig, loadEnv` 皆自 `vitest/config` 匯入，函式形式取 `mode`，`server.proxy["/api"] = { target, changeOrigin: true }`，`test: { environment: "node", include: ["src/**/*.test.ts"] }`）。保留 `plugins: [react()]`。注意此檔現況為單引號、無分號（Vite 範本風格），與專案其餘程式碼不同，就地修改時可維持原檔風格或統一為雙引號加分號，擇一即可。`tsconfig.node.json` 的 `include` 只有此檔且 `lib` 為 ES2023、無 node types，`loadEnv(mode, ".")` 若 `tsc -b` 失敗再補 `@types/node` 並用 `process.cwd()`（Open Question 1，PLAN 第一個任務要先實測）。

### `src/vite-env.d.ts`（config，修改）

現況僅一行 `/// <reference types="vite/client" />`。保留該行並依 RESEARCH Pattern 3 追加 `ImportMetaEnv`（`readonly VITE_API_BASE_URL?: string;`）與 `ImportMeta`。

### `package.json`（config，修改）

現況 scripts（L6-11）：`dev`、`build`、`lint`、`preview`。新增 `"test": "vitest run"`、`"test:watch": "vitest"`；devDependencies 加 `"vitest": "^4.1.12"`（不可取 5.x，因 peer vite ^6.4.0 與 lockfile 6.3.5 衝突；Pitfall 1）。安裝前加 `checkpoint:human-verify` 確認套件合法性（A1）。

### `.env.development` 與 `.env.example`（config，新增）

無 analog。`.env.development` 內容 `VITE_API_BASE_URL=/api/v1/public`（可 commit；`.gitignore` 只排除 `.env`、`*.local`、`.env.development.local` 等，不會擋掉它）。`.env.example` 說明 `VITE_API_BASE_URL` 與 `VITE_PROXY_TARGET`，僅放公開 URL，不得含任何 token。

## Shared Patterns

### 嚴格 TypeScript 限制
**Source:** `tsconfig.app.json` L13、L19-22
**Apply to:** 所有新 `.ts` 檔（含測試）
- `verbatimModuleSyntax`：型別一律 `import type { ... }` 或 inline `type`。
- `erasableSyntaxOnly`：不可用 enum、namespace、constructor parameter properties（`ApiError` 要手動賦值欄位）。
- `noUnusedLocals`／`noUnusedParameters`：測試中不留未用變數或匯入。
- 不得使用 `any`（舊檔 L9、L76、L139 為已知偏離）。

### 程式風格
**Source:** `src/services/index.ts` 全檔
**Apply to:** 所有新檔
雙引號、分號、2 空格縮排、多行結構尾逗號（ES5 style）；中文 `/** */` JSDoc 含 `@param`、`@returns`；行內註解用繁體中文；函式 camelCase 動詞開頭；介面 PascalCase；模組常數 UPPER_SNAKE_CASE。

### 錯誤策略（與舊檔相反）
**Source（反例）:** `src/services/index.ts` L139-149
**Apply to:** `products.ts`、`errors.ts`
舊檔 try/catch 吞錯回 `[]`；新版一律 `throw normalizeError(error)`，「查無商品」只代表成功回傳空陣列（D-06）。不自動重試（D-08）。

### 憑證與環境變數
**Source:** CLAUDE.md、D-13～D-15
**Apply to:** 所有新檔與 env 檔
不得出現 Authorization header、token、Base ID；`VITE_*` 只放公開 URL；`VITE_PROXY_TARGET` 只在 `vite.config.ts` 使用。舊 `src/services/index.ts` 與 `src/pages/*`、`src/components/*` 本 phase 完全不動。

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/services/format.ts` | utility | transform | 專案無格式化工具，改用 RESEARCH Standard Stack（`Intl.NumberFormat`） |
| `src/services/*.test.ts`（5 個） | test | transform／request-response | 專案無測試框架與測試檔；採 RESEARCH Pattern 2（自訂 adapter） |
| `.env.development`、`.env.example` | config | — | 專案無任何 `.env*` 檔 |
| `src/services/catalog.ts` | config | transform | 只有 `App.tsx` 內嵌路由，無設定陣列先例；採 BRIEF／RESEARCH 對照表 |

## Metadata

**Analog search scope:** `src/`（`services`、`App.tsx`、`vite-env.d.ts`）、根目錄設定檔（`vite.config.ts`、`tsconfig.*.json`、`package.json`、`.gitignore`）
**Files scanned:** 8
**Pattern extraction date:** 2026-11-10
