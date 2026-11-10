---
phase: 01-api
plan: 03
subsystem: api-data-layer
tags: [catalog, query-params, encoding]
requires: [01-01]
provides:
  - "src/services/catalog.ts：PRODUCT_PAGES、HOME_FEATURED_QUERIES、PRODUCT_LIMIT、buildProductParams"
affects: [01-04]
key-files:
  created:
    - src/services/catalog.ts
    - src/services/catalog.test.ts
  modified: []
requirements-completed: [TEST-03]
completed: 2026-11-10
---

# Phase 1 Plan 03：商品頁查詢設定與 buildProductParams Summary

以 `PRODUCT_PAGES`（8 頁）與 `HOME_FEATURED_QUERIES` 集中「路徑 → 查詢條件」，`buildProductParams` 固定 `limit=100`、頁面鎖定排序優先、有 featured 不送 sort，並以 `getUri` 斷言最終序列化字串（含中文 percent-encode）。

## TDD
- RED：先寫 catalog.test.ts，`vitest run` 失敗（./catalog 模組不存在，測試檔無法載入）；依計畫未 commit。
- GREEN：實作後 `npm test` 23 項全過（本檔 14 項），測試與實作同一個 feat commit。

## Commits
- 283460b feat(01-03)：新增商品頁查詢設定與參數建構

## Deviations from Plan
None - 依計畫執行。worktree 啟動時 base 不符，已依指示 `git reset --hard` 到指定 base。

## Deferred Issues
- 全專案 `npm run lint` 仍有 11 個 pre-existing `no-explicit-any` 錯誤（舊檔），未處理；本 plan 檔案 eslint 通過。

## Known Stubs
無。

## Threat Flags
無新增。T-01-10、T-01-11 已依計畫緩解（白名單鍵、空值不送、固定 limit）。

## Self-Check: PASSED
