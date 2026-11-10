---
phase: 02
fixed_at: 2026-11-10T00:00:00Z
review_path: .planning/phases/02-api/02-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 5
skipped: 1
status: partial
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-11-10
**Source review:** .planning/phases/02-api/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 5
- Skipped: 1

每次提交前皆執行 `npm run build` 與 `npm test`，全部通過（最終 172 項測試）。

## Fixed Issues

### WR-01: isPublicProduct 未驗證價格與圖片欄位，壞資料會顯示 "NT$NaN"

**Files modified:** `src/services/products.ts`, `src/services/products.test.ts`
**Commit:** c8719ea
**Applied fix:** 沿用既有「單筆壞資料不拖垮整頁」的設計，新增 `sanitizeProduct`：價格欄位非有限數字一律視為 null（顯示「價格洽詢」），`image_url` 非字串視為 null。未改動型別守衛，因此不會讓整筆商品消失。新增兩個測試（價格缺漏或字串、image_url 非字串）。

### WR-02: 只有 priceMax 有值時價格被顯示但樣式與徽章判斷為「無價」

**Files modified:** `src/components/ProductCard.tsx`, `src/components/ProductCard.test.tsx`
**Commit:** 9475d00
**Applied fix:** `hasPrice` 改為 `product.priceText !== PRICE_ON_REQUEST`，與 `formatPriceRange` 語意一致。新增只有 priceMax 時 grid 顯示徽章的測試。

### WR-03: 輪播圖片沒有 onError 處理，圖片載入失敗會顯示破圖

**Files modified:** `src/components/FeaturedCarousel.tsx`, `src/components/FeaturedCarousel.test.tsx`
**Commit:** 22b4738
**Applied fix:** 比照 ProductCard 記錄 `failedImageUrl`，載入失敗時改渲染 `ImagePlaceholder`；換成其他網址會自動重試。新增 onError 測試。

### WR-04: 截斷提示文字寫死 100，與 PRODUCT_LIMIT 脫鉤；console.warn 訊息數字錯誤

**Files modified:** `src/pages/ProductPageTemplate.tsx`, `src/services/products.ts`, `src/services/products.test.ts`
**Commit:** 658183e
**Applied fix:** 提示文字改為 `` `僅顯示前 ${PRODUCT_LIMIT} 項商品` ``；warn 訊息改為「商品總數 X，僅取得 Y 筆，需實作分頁」，並在測試中斷言訊息內容。未採用審查建議的 `items.length`，依指示以 PRODUCT_LIMIT 為準。

### WR-05: 每次 retry 或排序切換失敗時，錯誤狀態保留舊 items

**Files modified:** `src/hooks/useProducts.ts`
**Commit:** 85b8223
**Applied fix:** 採審查建議的第一個選項，只更新文件註解，註明 error 時 items 可能過期、消費端不應同時渲染。未清空 items，因為「保留上一次結果供淡化顯示」是既有設計，目前 UI 在 error 時以 ErrorCard 取代列表，並無實際錯誤。

## Skipped Issues

### WR-06: 輪播自動播放無法暫停，也未考慮 prefers-reduced-motion

**File:** `src/components/FeaturedCarousel.tsx:36-42`
**Reason:** 需要產品或 UX 決策，無法從程式碼與 UI-SPEC 判斷。02-UI-SPEC 第 156 行明確規定自動播放條件，未含 hover 或 focus 暫停；第 199 行並說明 `prefers-reduced-motion` 非本 phase 範圍。暫停行為、是否在減少動態設定下完全停用自動播放、手動操作後是否重置計時器，都屬於設計取捨。建議另開需求或在 redesign 階段處理。
**Original issue:** 自動輪播每 5 秒切換，沒有 hover 或 focus 暫停，也沒有尊重減少動態設定（WCAG 2.2.2）。

---

_Fixed: 2026-11-10_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
