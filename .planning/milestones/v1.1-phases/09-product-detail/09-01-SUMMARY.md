---
phase: 09-product-detail
plan: 01
subsystem: product-detail
tags: [pure-functions, hooks, clipboard, tdd]
requires: []
provides:
  - findCategoryPage / CategoryPageLink（src/config/categoryPage.ts）
  - buildInquiryText、buildMetaDescription、variantLabel、formatWarranty、buildBrandModelLine、buildSpecRows、SpecRow（src/pages/productDetailText.ts）
  - useCopyInquiry / CopyStatus（src/hooks/useCopyInquiry.ts）
  - CopyIcon、CheckIcon（src/components/icons.tsx）
affects: [09-03, 09-04]
tech-stack:
  added: []
  patterns: [可注入依賴的 hook（writeText 參數）、mountedRef 擋卸載後 setState]
key-files:
  created:
    - src/config/categoryPage.ts
    - src/config/categoryPage.test.ts
    - src/pages/productDetailText.ts
    - src/pages/productDetailText.test.ts
    - src/hooks/useCopyInquiry.ts
    - src/hooks/useCopyInquiry.test.tsx
  modified:
    - src/components/icons.tsx
    - src/components/icons.test.tsx
decisions:
  - "分類反查只比對 PRODUCT_PAGES 的 query.category，找不到退回 /all-products「所有商品」"
  - "useCopyInquiry 在 copy() 內同步呼叫 writeText，保留使用者手勢；失敗狀態保持到下次嘗試"
metrics:
  duration: 約 10 分鐘
  completed: 2026-11-11
---

# Phase 9 Plan 01: 詳情頁純函式、複製詢價 hook 與圖示 Summary

以 TDD 建立詳情頁的介面契約：由商品頁設定反查分類頁的 `findCategoryPage`、6 個詳情頁文字純函式、可注入寫入函式的 `useCopyInquiry`（2 秒還原、卸載清計時器），以及 `CopyIcon`／`CheckIcon`。

## 測試數

- 開始：`npx vitest list | wc -l` = 413
- Task 1 後：437（+24：categoryPage 7、productDetailText 17）
- 結束：446（+9：useCopyInquiry 7、icons 2）

## RED 證據

- Task 1：`npx vitest run src/config/categoryPage.test.ts src/pages/productDetailText.test.ts` → `Test Files 2 failed (2)`、`Tests no tests`，原因 `Failed to resolve import "./categoryPage"`／`"./productDetailText"`（模組不存在）。
- Task 2：`npx vitest run src/hooks/useCopyInquiry.test.tsx src/components/icons.test.tsx` → `Test Files 2 failed (2)`、`Tests 2 failed | 10 passed (12)`；useCopyInquiry 為 `Failed to resolve import "./useCopyInquiry"`，icons 的 CopyIcon／CheckIcon 為 `Element type is invalid ... got: undefined`。

## Commits

| Task | Commit | 說明 |
|------|--------|------|
| 1 | d7f5331 | feat(09-01): 新增分類反查與詳情頁文字純函式 |
| 2 | 748472a | feat(09-01): 新增複製詢價 hook 與複製、勾選圖示 |

每個 commit 前 `npm test`、`npm run lint`、`npm run build` 全綠。

## 既有測試變更（舊 → 新）

- `src/components/icons.test.tsx`：只新增 import 兩行與 `ICONS` 陣列兩筆（`["CopyIcon", CopyIcon]`、`["CheckIcon", CheckIcon]`），既有 10 項未改；10 項 → 12 項。

## Deviations from Plan

- 「說明前 80 字」原先以模組常數表示，為符合 acceptance（字面 `slice(0, 80)`）改為直接寫數字並加註解；行為不變。
- `clearTimer` 寫成模組層函式（參數為 ref），避免 react-hooks lint 對 effect 依賴與 cleanup 內讀 `ref.current` 的警告；行為與計畫相同。

除此之外依計畫執行。`src/services/` 與既有 hooks 零改動（`git diff --stat HEAD~2` 無輸出）。

## Known Stubs

無。

## Self-Check: PASSED

- 6 個新檔與 2 個修改檔皆存在；commits d7f5331、748472a 存在於 git log。
