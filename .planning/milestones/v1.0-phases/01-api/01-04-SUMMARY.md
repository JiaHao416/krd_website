---
phase: 01-api
plan: 04
subsystem: api-data-layer
tags: [errors, axios, api-client]
requires: [01-01, 01-02, 01-03]
provides:
  - "src/services/errors.ts（ApiErrorKind、ApiError、ERROR_MESSAGES、normalizeError、getErrorMessage）"
  - "src/services/products.ts 完整 fetchProducts（回應驗證、toProduct 轉換、錯誤拋出、D-09 warn）與 ProductListResult"
affects: [phase-02]
key-files:
  created:
    - src/services/errors.ts
    - src/services/errors.test.ts
  modified:
    - src/services/products.ts
    - src/services/products.test.ts
key-decisions:
  - "使用者文字只來自 ERROR_MESSAGES，後端 error.message 僅存於 ApiError.message"
  - "pagination 缺漏時 total 以 items 筆數代替，不視為錯誤"
requirements-completed: [TEST-04, TEST-02, TEST-03]
completed: 2026-11-10
---

# Phase 1 Plan 04：ApiError 與完整 fetchProducts Summary

以 `ApiError`（network／rate_limited／http／invalid_response）與固定中文訊息收斂所有失敗路徑，`fetchProducts` 以型別守衛驗證回應、轉成 `Product[]`、失敗一律拋出、不自動重試，total 超過筆數時 `console.warn`。

## TDD
- RED（errors）：先寫 errors.test.ts，`vitest run` 因 ./errors 不存在而無法載入（Tests: no tests）；依計畫未 commit。
- GREEN：16 項通過，lint、build 通過，測試與實作同一個 feat commit。
- RED（products）：擴充 products.test.ts 後 11 項失敗（尚未轉換、未驗證、未包裝錯誤、無 warn）；未 commit。
- GREEN：`npm test` 6 檔 80 項全通過，lint（變更檔）與 build 通過。

## Commits
- 009b202 feat(01-04)：新增 ApiError 錯誤分類與中文訊息
- c342984 feat(01-04) 完成 fetchProducts 回應驗證、轉換與錯誤處理

## Deviations from Plan
None - plan executed exactly as written。啟動時 worktree base 與預期不符（HEAD 落後），依指示 `git reset --hard 4857b14`。測試 mock adapter 為對 status >= 400 自行拋出 AxiosError（計畫已述明）。

## Deferred Issues
- 全專案 `npm run lint` 仍有 11 個 pre-existing `no-explicit-any` 錯誤（src/services/index.ts、HomePage.tsx、ProductView.tsx、ProductPageTemplate.tsx），未處理；本 plan 新增與修改檔案 eslint 全部通過。

## Known Stubs
無。

## Threat Flags
無新增。T-01-13～T-01-17 已緩解：型別守衛與測試、固定中文文案、無重試（500 只請求 1 次）、無 `return []`、新 services 檔案無 airtable/Bearer/authorization 字樣。既有 src/services/index.ts、pages、components、App.tsx 零修改。

## Self-Check: PASSED
