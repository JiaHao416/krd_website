---
phase: 02-api
reviewed: 2026-11-10T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - .nvmrc
  - package.json
  - vite.config.ts
  - src/test/setup.ts
  - src/services/products.ts
  - src/services/products.test.ts
  - src/hooks/useProducts.ts
  - src/hooks/useProducts.test.tsx
  - src/config/productPageViews.tsx
  - src/components/ImagePlaceholder.tsx
  - src/components/ProductCard.tsx
  - src/components/ProductCard.test.tsx
  - src/components/FeaturedCarousel.tsx
  - src/components/FeaturedCarousel.test.tsx
  - src/pages/ProductPageTemplate.tsx
  - src/pages/ProductPageTemplate.test.tsx
  - src/pages/HomePage.tsx
  - src/pages/HomePage.test.tsx
  - src/App.tsx
  - src/App.test.tsx
findings:
  critical: 0
  warning: 6
  info: 3
  total: 9
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-11-10
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

本次審查涵蓋商品改讀後端 API 的服務層、hook、卡片、輪播與頁面。整體結構清楚，未發現憑證外洩或注入類問題。
主要問題集中在三處：回應驗證不完整（價格欄位）、價格顯示與樣式判斷不一致、輪播缺少圖片載入失敗處理。
測試檔僅就可靠性掃描，未逐一細讀。

## Warnings

### WR-01: isPublicProduct 未驗證價格與圖片欄位，壞資料會顯示 "NT$NaN"

**File:** `src/services/products.ts:45-54`
**Issue:** 型別守衛只檢查 id、name、category、in_stock。`price_min`、`price_max` 缺漏（undefined）或為字串時會通過驗證。`formatPriceRange(undefined, undefined)` 因為 `undefined !== null`，最後會走到 `formatPrice(undefined)`，輸出 "NT$NaN"。`image_url` 若非字串，`api.image_url || null`（`transform.ts`）會把非字串原樣放進 `<img src>`。
**Fix:** 在守衛中加入欄位檢查：
```ts
const isNullableNumber = (x: unknown) => x === null || (typeof x === "number" && Number.isFinite(x));
const isNullableString = (x: unknown) => x === null || typeof x === "string";
// ...
&& isNullableNumber(v.price_min) && isNullableNumber(v.price_max)
&& (v.image_url === undefined || isNullableString(v.image_url))
```
也可在 `formatPriceRange` 以 `== null` 判斷。

### WR-02: 只有 priceMax 有值時價格被顯示但樣式與徽章判斷為「無價」

**File:** `src/components/ProductCard.tsx:17`
**Issue:** `hasPrice = product.priceMin !== null`，但 `formatPriceRange` 在 min 為 null、max 有值時會輸出價格文字。結果是價格以灰色低調樣式顯示，grid 版也不會出現價格徽章，與有價商品不一致。
**Fix:** `const hasPrice = product.priceMin !== null || product.priceMax !== null;`，或改為比對 `priceText !== PRICE_ON_REQUEST`。

### WR-03: 輪播圖片沒有 onError 處理，圖片載入失敗會顯示破圖

**File:** `src/components/FeaturedCarousel.tsx:131-136`
**Issue:** `ProductCard` 有處理圖片載入失敗並退回佔位圖，輪播直接渲染 `<img>`，沒有同樣處理。網址失效時，首頁會出現破圖圖示，而不是 `ImagePlaceholder`。
**Fix:** 比照 `ProductCard` 記錄 `failedImageUrl`，失敗時渲染 `<ImagePlaceholder />`。

### WR-04: 截斷提示文字寫死 100，與 PRODUCT_LIMIT 脫鉤；console.warn 訊息數字錯誤

**File:** `src/pages/ProductPageTemplate.tsx:276`、`src/services/products.ts:95-97`
**Issue:** 畫面文字寫死「僅顯示前 100 項商品」，未引用 `PRODUCT_LIMIT`。實際顯示數是 `items.length`，後端若回傳較少筆數（例如後端上限低於 100），文字就不符。warn 訊息把 `items.length` 稱為「單次上限」，也不準確。
**Fix:** 讓 `ProductListResult` 附帶實際取得筆數，畫面顯示 `僅顯示前 ${items.length} 項商品`，warn 訊息改為「總數 X，僅取得 Y 筆」。

### WR-05: 每次 retry 或排序切換失敗時，錯誤狀態保留舊 items，狀態轉換有殘留風險

**File:** `src/hooks/useProducts.ts:58, 80`
**Issue:** 排序切換後請求失敗，`items` 仍是舊排序的列表，但畫面被 ErrorCard 取代，使用者看不到列表。這在目前 UI 沒有問題，但 `UseProductsResult` 的文件寫「失敗時會保留上一次成功的結果」，消費端若同時渲染 items 與錯誤，會顯示與選取排序不符的資料。此外下拉選單在 error 狀態下仍可操作，使用者可能切換排序來「重試」，行為不明確。
**Fix:** 在文件中明確標註「error 時 items 可能過期」，或在錯誤時清空 items。

### WR-06: 輪播自動播放無法暫停，也未考慮 prefers-reduced-motion

**File:** `src/components/FeaturedCarousel.tsx:36-42`
**Issue:** 自動輪播每 5 秒切換，沒有 hover 或 focus 暫停，也沒有尊重減少動態的設定。使用者操作箭頭時，計時器仍照原節奏跑，可能剛點擊就被切走，也是 WCAG 2.2.2 的無障礙問題。
**Fix:** 在 hover 與 focus-within 時暫停，並在 `matchMedia("(prefers-reduced-motion: reduce)")` 符合時不啟動 interval。

## Info

### IN-01: ProductCard 內重複的 JSX 與 `as string` 型別斷言

**File:** `src/components/ProductCard.tsx:71, 133`
**Issue:** `product.imageUrl as string` 是因為 `showImage` 無法讓 TypeScript 收窄型別。可改為先取出 `const imageUrl = showImage ? product.imageUrl : null`，省去斷言。
**Fix:** 用區域變數收窄型別。

### IN-02: ErrorCard 的 handleRetry 為多餘包裝

**File:** `src/pages/ProductPageTemplate.tsx:25`
**Issue:** `const handleRetry = () => onRetry();` 只是轉呼叫，可直接傳 `onRetry`（注意 `onClick` 會傳入 event，若 `retry` 簽章日後改變才需要包裝）。
**Fix:** `onClick={onRetry}`。

### IN-03: 首頁按鈕「聯絡我們」導向 /abouts，與文案不符；多處 SVG 重複

**File:** `src/pages/HomePage.tsx:55-58`、`src/config/productPageViews.tsx`
**Issue:** 按鈕文案為「聯絡我們」但導向關於頁（既有行為）。首頁區塊標題圖示 SVG 與 `PRODUCT_PAGE_VIEWS["/new-products"]` 的星形 path 重複。
**Fix:** 確認需求後調整文案或目的地；將共用 path 抽成常數。

---

_Reviewed: 2026-11-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
