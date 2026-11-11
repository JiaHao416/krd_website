---
phase: 07-detail-data
reviewed: 2026-11-11T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/services/apiTypes.ts
  - src/services/transform.ts
  - src/services/productDetail.ts
  - src/hooks/useProductDetail.ts
  - src/services/transformDetail.test.ts
  - src/services/productDetail.test.ts
  - src/hooks/useProductDetail.test.tsx
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-11-11
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

整體實作紮實，且符合 CONTEXT D-01..D-14：

- 型別守衛與 null 處理：價格一律經 `Number.isFinite` 過濾，不會產生 `NT$NaN`。
- 錯誤分類：404/400 為 notFound，429/5xx/網路/invalid_response 為 retryable，canceled 由 hook 先行忽略。
- 非 UUID 不發請求。UUID regex 與後端 zod 4 的 `.uuid()` 嚴格度一致，已對照 `KRD-Inventory-Backend` 確認。
- 未發現憑證，也沒有 airtable 形狀的字串。
- hook 以 render 時比對 `requestKey` 衍生狀態，沒有在 effect 內同步 setState，符合 hooks 規則。
- 取消處理同時檢查 `signal.aborted` 與 `kind === "canceled"`，沒有 setState-after-unmount 的路徑。

沒有 BLOCKER。以下為仍需處理的 WARNING 與 INFO。

## Warnings

### WR-01: A → B → A 快速切換時，會瞬間顯示過期的 A 結果（違反「不殘留舊資料」）

**File:** `src/hooks/useProductDetail.ts:42-81`
**Issue:** `stored` 只保存最近一次完成的結果，`requestKey` 為 `id#reloadToken`。
情境：先載入 A 成功，`stored.requestKey` 為 `A#0`。切到 B，B 尚未完成時 `stored` 仍是 A。再切回 A 時，`requestKey` 又是 `A#0`，與 `stored` 吻合。

- hook 第一個 render 就回傳舊的 A `success`，而不是 `loading`。
- 同時 effect 重新請求 A，完成後才被覆蓋。
- 這與 hook 文件註解「切換 id 的第一次 render 就是 loading」不符。
- 對 Phase 9 來說，A 若在這段時間內被後台改價或下架，使用者會短暫看到舊資料。
- 這也違反 D-11「不做快取」的精神。

現有測試只覆蓋 A→B，沒有 A→B→A，所以沒抓到。

**Fix:** 讓每次 effect 執行都有唯一的請求鍵。例如用 `useRef` 遞增的 nonce 配合 state：

```ts
const [attempt, setAttempt] = useState(0); // effect 開始時 setAttempt 會違反規則，改用 ref+render 衍生
```

較單純的做法是在 effect cleanup 中清掉已存結果：

```ts
return () => {
  controller.abort();
  setStored(null);
};
```

`setStored(null)` 在 cleanup 中呼叫，不受 `react-hooks/set-state-in-effect` 規範。

另外請新增測試：A 成功 → 切 B（pending）→ 切回 A，斷言第一個 render 為 `loading`。

### WR-02: 負價格會產生 `NT$-xx` 文字

**File:** `src/services/transform.ts:158-168`
**Issue:** `toFiniteNumberOrNull` 只擋 NaN 與 Infinity。後端若回傳負值（例如資料錯誤的 `-100`），會格式化成 `NT$-1`。這不是 `NT$NaN`，但同屬「不可信回應產生怪異價格文字」。保固月數已有 `> 0` 防護，價格卻沒有對應的下限檢查，處理不一致。價格 `0` 會輸出 `NT$0`，是否應視為「請來電」也沒有被明確決策。
**Fix:** 在 `toDetailVariant` 中，價格小於 0 視為 null：

```ts
const rawPrice = toFiniteNumberOrNull(v.price_incl_tax);
const priceInclTax = rawPrice !== null && rawPrice >= 0 ? rawPrice : null;
```

並補一則測試。價格 `0` 的語意請在 Phase 8/9 決定並記錄。

## Info

### IN-01: transform.ts 重複 import

**File:** `src/services/transform.ts:1-4`
**Issue:** 兩次從 `./apiTypes` 匯入、兩次從 `./format` 匯入，是追加內容時留下的痕跡。
**Fix:** 合併為：

```ts
import type { PublicProductApi, PublicProductDetailApi } from "./apiTypes";
import { formatPrice, formatPriceRange } from "./format";
```

### IN-02: `canceled` 的 hook 測試斷言過弱

**File:** `src/hooks/useProductDetail.test.tsx:121-128`
**Issue:** 測試只 `await Promise.resolve()` 一次就斷言仍為 loading。若實作改成晚幾個 microtask 才 setState，測試仍會通過，無法證明「canceled 不改狀態」。
**Fix:** 改成 `await act(async () => { await new Promise((r) => setTimeout(r, 0)); })` 後再斷言，或先確認 mock 的 promise 已被消化。

### IN-03: 測試以 `as ProductDetail` 轉型建立不完整物件

**File:** `src/hooks/useProductDetail.test.tsx:23-25`
**Issue:** `{ id, name } as ProductDetail` 繞過 TypeScript 嚴格檢查。若 `ProductDetail` 增加欄位，測試不會報錯。
**Fix:** 建立完整的最小合法物件（`brand: null`、`variants: []` 等），不要轉型。

### IN-04: 404 同時涵蓋「路徑／base URL 設定錯誤」的情況

**File:** `src/services/productDetail.ts:35-44`
**Issue:** 這是 D-08 已決策的行為。但若 `VITE_API_BASE_URL` 設錯或 CDN 回 404，所有商品都會顯示「找不到」而非可重試。
**Fix:** 不需修改。建議 Phase 9 在 notFound 路徑加 `console.warn`，方便上線後排查。

---

_Reviewed: 2026-11-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
