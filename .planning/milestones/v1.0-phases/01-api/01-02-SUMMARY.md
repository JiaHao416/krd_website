---
phase: 01-api
plan: 02
subsystem: api-data-layer
tags: [transform, price, intl]
requires: [01-01]
provides:
  - "src/services/format.ts（PRICE_ON_REQUEST、formatPrice、formatPriceRange）"
  - "src/services/transform.ts（Product、toProduct）"
affects: [01-04]
key-files:
  created:
    - src/services/format.ts
    - src/services/format.test.ts
    - src/services/transform.ts
    - src/services/transform.test.ts
key-decisions:
  - "name 有值時保留原字串（不 trim 輸出），僅空白時才 fallback"
requirements-completed: [TEST-02]
completed: 2026-11-10
---

# Phase 1 Plan 02：價格格式與商品轉換 Summary

以 Intl.NumberFormat("zh-TW") 將「分」轉為 `NT$1,200`（含區間與「價格洽詢」），並提供 `toProduct` 把後端 snake_case 商品轉為 camelCase `Product`（含 priceText、缺圖 null、name fallback）。

## TDD
- RED（format）：先寫 format.test.ts，`vitest run` 因 ./format 不存在而無法載入（Tests: no tests）；依計畫未 commit。
- GREEN：實作後 `npm test` 通過，測試與實作同一個 feat commit。
- RED（transform）：先寫 transform.test.ts，因 ./transform 不存在而無法載入；未 commit。
- GREEN：`npm test` 4 檔 34 項全通過、build 通過。

## Commits
- ea2959f feat(01-02)：實作價格格式化
- a4960ed feat(01-02)：實作商品資料轉換

## Deviations from Plan
None - plan executed exactly as written。僅在開頭因 worktree base 與預期不符，依指示 `git reset --hard 46dab4f`。

## Deferred Issues
- 全專案 `npm run lint` 仍有 11 個 pre-existing `no-explicit-any` 錯誤（src/services/index.ts、HomePage.tsx、ProductView.tsx、ProductPageTemplate.tsx），未處理；本 plan 新增檔案 eslint 全部通過。

## Known Stubs
無。

## Threat Flags
無新增。

## Self-Check: PASSED
