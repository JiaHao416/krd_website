---
phase: 09-product-detail
plan: 04
subsystem: product-detail
tags: [page, routing, react19-metadata, lightbox, clipboard, tdd]
requires: [09-01, 09-02, 09-03]
provides:
  - ProductDetailView（src/components/ProductDetailView.tsx）
  - ProductDetailPage（src/pages/ProductDetailPage.tsx）
  - /products/:id 路由（src/App.tsx）
affects: [09-05, 10]
tech-stack:
  added: []
  patterns: [單一 Layout + mobileBar 依狀態切換、ProductDetailView key=product.id 重設變體、React 19 原生 title／meta]
key-files:
  created:
    - src/components/ProductDetailView.tsx
    - src/components/ProductDetailView.test.tsx
    - src/pages/ProductDetailPage.tsx
    - src/pages/ProductDetailPage.test.tsx
  modified:
    - src/App.tsx
    - src/App.test.tsx
decisions:
  - "loading／error 不渲染 title（維持 KRD）；只有 success 傳入雙鈕固定列，其餘狀態用預設單鈕列"
  - "複製文字在頁面層以 window.location.href 組成，useCopyInquiry 無條件呼叫（非 success 傳 null）"
metrics:
  duration: 約 10 分鐘
  completed: 2026-11-11
---

# Phase 9 Plan 04: 商品詳情頁組裝與 /products/:id 路由 Summary

`ProductDetailView` 組裝成功態（原生 title／description、麵包屑、兩種返回、傾斜相框主圖＋燈箱、價格／變體／現貨／CTA／純文字說明／規格表，變體切換同步價格、現貨、SKU 與主圖）；`ProductDetailPage` 讀 `:id`、依 `useProductDetail` 切換骨架／成功／找不到商品／可重試錯誤，只用一個 Layout 並在成功時以 `DetailMobileBar` 取代單鈕列；App 新增 `/products/:id`。直接輸入網址即可進入詳情頁。

## 測試數

- 開始：`npx vitest list | wc -l` = 484（= 09-03 結束值）
- Task 1 後：504（ProductDetailView 20）
- 結束：516（ProductDetailPage 10、App +2）；≥ 484 + 25

## RED 證據

- Task 1：`npx vitest run src/components/ProductDetailView.test.tsx` → `Test Files 1 failed (1)`、`Tests no tests`，`Failed to resolve import "./ProductDetailView"`。
- Task 2：`npx vitest run src/pages/ProductDetailPage.test.tsx src/App.test.tsx` → `Test Files 2 failed (2)`；ProductDetailPage 為 `Failed to resolve import "./ProductDetailPage"`；App 兩項新測試失敗 `Unable to find role="heading" and name "UHF 雙頻無線手持麥克風組"`／`"找不到這個商品"`（路由尚未加入，落到全域 NotFound）。

## Commits

| Task | Commit | 說明 |
|------|--------|------|
| 1 | 99c4efb | feat(09-04): 新增商品詳情成功態畫面 |
| 2 | 3da43a0 | feat(09-04): 新增商品詳情頁路由與載入、找不到、錯誤狀態 |

每個 commit 前 `npm test`、`npm run lint`、`npm run build` 全綠；designTokens 掃描通過。

## 既有測試變更（舊 → 新）

- `src/App.test.tsx`：只新增，既有 13 項未改（`git diff` 無刪除行）；13 → 15。新增內容：import `fetchProductDetail` 與 `ProductDetail` 型別、`./services/productDetail` partial mock、`DETAIL` fixture，以及 2 項測試：
  - 「/products/:uuid 顯示詳情且不呼叫商品列表 API」（斷言 mockFetch 未呼叫、mockDetail 第一參數為 uuid）
  - 「/products/not-a-uuid 顯示找不到商品且不發詳情請求」
- ImageModal、ProductPageTemplate、Layout 的測試與 `ImageModal.tsx` 無 diff；`src/services/`、`src/hooks/` 零改動。

## Deviations from Plan

- 骨架色塊的共用 class 抽成檔內常數 `SKELETON_CLASS`（`bg-sand motion-safe:animate-pulse`），數值與計畫相同。
- ProductDetailPage 的複製測試以 `try/finally` 還原 `navigator.clipboard` 的原始 property descriptor，並在 afterEach 呼叫 `vi.restoreAllMocks()` 還原 writeText spy；title 的 afterEach 沿用 09-02 的「先 `cleanup()` 再移除 title」寫法。

除此之外依計畫執行。

## Known Stubs

無。分類頁卡片連到詳情頁屬 Phase 10（計畫內延後）。

## Threat Flags

無新增表面。說明以純文字節點輸出（T-09-07，測試斷言 `<b>` 不產生元素）；非 UUID 不發請求（T-09-10，頁面與 App 測試皆斷言）。

## Self-Check: PASSED

- 4 個新檔與 2 個修改檔皆存在；commits 99c4efb、3da43a0 存在於 git log。
