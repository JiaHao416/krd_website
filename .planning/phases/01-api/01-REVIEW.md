---
phase: 01-api
reviewed: 2026-11-10T03:33:04Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - .env.development
  - .env.example
  - package.json
  - vite.config.ts
  - src/vite-env.d.ts
  - src/services/apiTypes.ts
  - src/services/client.ts
  - src/services/client.test.ts
  - src/services/errors.ts
  - src/services/errors.test.ts
  - src/services/format.ts
  - src/services/format.test.ts
  - src/services/transform.ts
  - src/services/transform.test.ts
  - src/services/catalog.ts
  - src/services/catalog.test.ts
  - src/services/products.ts
  - src/services/products.test.ts
findings:
  critical: 1
  warning: 5
  info: 4
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-11-10T03:33:04Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

這次審查 Phase 01 新增的公開 API 資料層，範圍包括 client、errors、format、transform、catalog、products、環境變數與 Vite/Vitest 設定。`vitest run` 的 80 個測試全部通過，`tsc -b` 也沒有錯誤；舊的 Airtable 檔案不在範圍內。

整體結構清楚，錯誤分類與參數組裝都符合規劃。主要問題是 `fetchProducts` 只驗證回應的外層結構，沒有驗證每一筆商品。只要有一筆商品格式不對，`toProduct` 就會拋出 `TypeError` 而不是 `ApiError`，違反 JSDoc 寫的 `@throws {ApiError}`，也沒做到 RESEARCH V5「轉換層對 null/缺欄位容錯，不信任回應型別」。

其他問題：
- `.env.example` 複製成 `.env` 會讓 production 打包壞掉
- 被取消的請求會被歸類成網路錯誤
- `VITE_PROXY_TARGET` 的註解誤導
- 名稱 fallback 可能產生空字串

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: 單筆商品格式不符時拋出 TypeError，不是 ApiError，而且整頁失敗

**File:** `src/services/products.ts:21-30, 53-68`；`src/services/transform.ts:33`
**Issue:** `isProductListResponse` 只確認 `data.items` 是陣列，元素完全沒驗證。`items.map(toProduct)` 在 try/catch 外執行，而 `toProduct` 第一行就是 `api.name.trim()`。

- 只要任一筆的 `name` 是 `null` 或缺少，或某個元素是 `null`，就會丟出原生 `TypeError: Cannot read properties of null`。
- 結果是 `fetchProducts` 的 `@throws {ApiError}` 契約失效，呼叫端用 `instanceof ApiError` 或讀 `err.kind` 判斷時會判錯。雖然 `getErrorMessage` 最後會把它歸成 `invalid_response`，但呼叫端沒經過它時拿到的是原生 `TypeError`。
- 一筆壞資料就讓整頁商品都無法顯示，和核心價值「與後端一致」衝突。
- 這也直接違反 RESEARCH 的 V5 要求：「轉換層對 `null`/缺欄位容錯，不信任回應型別」。
- 測試沒有涵蓋 `name: null` 或 item 為非物件的情況。

**Fix:** 逐筆驗證必要欄位（至少 `id`、`name`、`category` 是 string，`in_stock` 是 boolean）。不合格的項目可以略過並 `console.warn`，或統一轉成 ApiError。轉換也要放進錯誤正規化的範圍：

```ts
// 驗證單筆商品的必要欄位
function isPublicProduct(value: unknown): value is PublicProductApi {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    typeof v.in_stock === "boolean"
  );
}

// fetchProducts 內
const valid = items.filter(isPublicProduct);
if (valid.length !== items.length) {
  console.warn(`略過 ${items.length - valid.length} 筆格式不符的商品`);
}
return { items: valid.map(toProduct), total };
```

另外補測試：`name: null`、item 為 `null` 時，結果仍可預期（被略過，或拋 `ApiError("invalid_response")`）。

## Warnings

### WR-01: `.env.example` 照慣例複製成 `.env` 會讓 production 打包改打相對路徑

**File:** `.env.example:3`
**Issue:** 範例檔的 `VITE_API_BASE_URL=/api/v1/public` 是 dev proxy 才能用的相對路徑。
- 開發者常照慣例 `cp .env.example .env`，而 `.env` 在所有 mode 都會載入（包括 `vite build` 的 production 與 vitest 的 test mode）。
- 這樣打出來的 bundle 會請求 `www.krd.com.tw/api/v1/public/products`，被 Cloudflare Pages 的 SPA fallback 回傳 HTML，全站商品變成 `invalid_response`。
- 檔案第 2 行註解寫「Cloudflare Pages 不需設定」，但第 3 行的值和這句話衝突。

**Fix:** 範例檔預設註解掉這行，或改填 production 網址：

```dotenv
# 只在需要覆寫時設定；勿在 .env（全 mode）中填相對路徑
# VITE_API_BASE_URL=https://api.krd.com.tw/api/v1/public
```

### WR-02: 請求被取消（AbortController/unmount）時被歸類為 network 錯誤

**File:** `src/services/errors.ts:49-53`
**Issue:** axios 的 `CanceledError` 也算 `isAxiosError` 而且沒有 `response`，所以會被正規化成 `kind: "network"`，`getErrorMessage` 會顯示「無法連線，請檢查網路後重試」。Phase 2 的元件在 effect cleanup 時取消請求是常見寫法（React 19 StrictMode 開發時一定會觸發），會出現誤報的錯誤訊息。
**Fix:** 先判斷 `axios.isCancel(error)`，另外處理：可以新增 `"canceled"` kind 讓 UI 忽略，或讓 `fetchProducts` 直接重新拋出原錯誤，由呼叫端略過。

```ts
if (axios.isCancel(error)) {
  return new ApiError("canceled", "請求已取消");
}
```

### WR-03: `VITE_PROXY_TARGET` 使用 `VITE_` 前綴，註解「不會進入前端 bundle」不正確

**File:** `vite.config.ts:7-9`；`.env.example:5-7`
**Issue:** Vite 會把所有 `VITE_` 前綴的變數放進 client 端的 `import.meta.env`。
- dev 模式下可以在瀏覽器讀到它。
- build 時只要有程式碼整個引用 `import.meta.env`（例如 debug 時 `console.log(import.meta.env)`），它就會被內嵌進 bundle。
- 目前的值不是機密，但註解給了錯誤的安全保證。日後如果有人照這個模式放敏感的 proxy 設定（例如帶 token 的內部網址），就會外洩。這和專案「前端不得含任何憑證」的限制有關。

**Fix:** 改用沒有 `VITE_` 前綴的名稱，並讓 `loadEnv` 載入全部前綴：

```ts
const env = loadEnv(mode, process.cwd(), ""); // 第三參數 "" 載入所有變數，僅限 node 端
const proxyTarget = env.KRD_PROXY_TARGET || "https://api.krd.com.tw";
```

### WR-04: name 與 brand/model 全部缺值時，商品名稱是空字串

**File:** `src/services/transform.ts:33-37`
**Issue:** `name` 是空白，而且 `brand`、`model` 都是 `null` 時，fallback 會得到 `""`，畫面上會出現沒有標題的卡片，也影響排序與 `alt` 文字。另外 `trimmedName` 不是空的時候回傳的是未 trim 的 `api.name`，前後空白會原樣保留，和 fallback 分支行為不一致。
**Fix:** 回傳 `trimmedName`，並在最後提供保底文案（例如 `"未命名商品"`）或改用 `model`/`id`；補上全部缺值的測試。

### WR-05: total 超過 items 時只在 console 警告，呼叫端無法得知資料被截斷

**File:** `src/services/products.ts:59-66`
**Issue:** 後端 `limit` 上限是 100。商品超過 100 筆時，前端會默默只顯示前 100 筆，只有 `console.warn`，訪客和維護者在正式環境都看不到。這和核心價值「官網顯示的商品必須與後端資料一致」直接衝突。`total` 雖然有回傳，但沒有對應的旗標或文件，提醒 UI 去比對。
**Fix:** 在 `ProductListResult` 加 `truncated: boolean`（`total > items.length`），讓 Phase 2 UI 至少能提示，或在規劃中加上分頁抓取的觸發條件。

## Info

### IN-01: console.warn 文字把實際筆數誤稱為「單次上限」

**File:** `src/services/products.ts:63-65`
**Issue:** 訊息顯示「超過單次上限 ${items.length} 筆」，但 `items.length` 是這次拿到的筆數，不是上限（上限是 `PRODUCT_LIMIT`），除錯時容易誤會。
**Fix:** 改成「`商品總數 ${total} 筆，本次僅取得 ${items.length} 筆，需實作分頁`」。

### IN-02: `buildProductParams` 的 `params` 變數多餘

**File:** `src/services/catalog.ts:54, 67`
**Issue:** `params` 只用來保存 `limit`，最後又展開重建，讀起來像是有其他用途。
**Fix:** 直接 `return { ...ordered, limit: PRODUCT_LIMIT };`，移除 `params`。

### IN-03: `PRODUCT_LIMIT` 註解語意混亂

**File:** `src/services/catalog.ts:18`
**Issue:** 「API 上限；目前 production 僅 20 筆」把「API 允許的 limit 上限（100）」和「目前資料量（20 筆）」混在一起，容易誤讀成 API 上限是 20。
**Fix:** 改成「後端 limit 允許的上限（1..100）；目前 production 約 20 筆，暫不做分頁」。

### IN-04: `formatPriceRange` 使用 `as number` 型別斷言

**File:** `src/services/format.ts:32`
**Issue:** 前面的分支已排除兩者都是 null 的情況，但 TS 無法推導，於是用 `as` 斷言。以後調整分支順序時可能悄悄失效。
**Fix:** 改寫成不需要斷言的形式，例如 `if (maxCents === null) return formatPrice(minCents as ...)` 這類重排，或用 `const single = minCents ?? maxCents; if (single !== null && (minCents === null || maxCents === null || minCents === maxCents)) return formatPrice(single);`。

---

_Reviewed: 2026-11-10T03:33:04Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
