---
phase: 06-design-lock
plan: 01
subsystem: testing
tags: [test-inventory, vitest, contract-tests]
requires: []
provides:
  - "06-TEST-INVENTORY.md：基準、分類規則與 157 列逐條清單（資料層 + 低影響 component 檔）"
affects: [06-04, phase-07, phase-08, phase-09, phase-10, phase-11]
key-files:
  created:
    - .planning/phases/06-design-lock/06-TEST-INVENTORY.md
  modified: []
key-decisions:
  - "A1（PRICE_ON_REQUEST 常數值）、A2（載入中／截斷提示新字串）以「待 Phase 8 決定」註記，不自行決定"
requirements-completed: [TEST-06]
duration: 20min
completed: 2026-11-11
---

# Phase 6 Plan 01: 測試盤點（資料層與低影響檔案）Summary

建立 `06-TEST-INVENTORY.md`，含基準「215 項／17 個檔（2026-11-11）」、分類規則、後續 phase 使用方式、各檔摘要與 157 列逐條清單（8 個 unit 檔 106 列 + 5 個 component 檔 51 列），第一欄與 `npx vitest list` 去前綴後一字不差。

## Commits
- 82c7776 docs(06): 新增測試盤點文件（資料層 unit 檔）
- 5cd4eb8 docs(06): 測試盤點補上低影響 component 檔與待 Phase 8 決定事項

## 結果
- 157 列名稱 diff（排除 SideMenu／NavBar／FeaturedCarousel／ProductCard）無差異
- 契約 155、呈現 2（HomePage「不顯示價格」、ProductPageTemplate「價格洽詢」文字）
- ProductPageTemplate 3 項燈箱測試備註 LINK-01（Phase 10）
- `src/` 未修改；`npm test` 17 檔 215 項全綠
- 06-04 需補：4 個高影響檔 58 列、摘要表的 4 列與合計、accessible name 清單

## Deviations from Plan
None - plan executed exactly as written。逐條分類以暫存腳本（放 `$TMPDIR`，不進 repo）依檔案與測試名規則產生，再人工檢視輸出。

## Self-Check: PASSED
