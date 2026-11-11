---
phase: 06-design-lock
plan: 04
subsystem: testing
tags: [test-inventory, vitest, accessible-name, phase-gate]
requires: ["06-01", "06-02", "06-03"]
provides:
  - "06-TEST-INVENTORY.md：215 列完整逐條清單與 accessible name 契約清單"
  - "STATE.md 測試總數基準 215 項／17 個檔"
affects: [phase-07, phase-08, phase-09, phase-10, phase-11]
key-files:
  created: []
  modified:
    - .planning/phases/06-design-lock/06-TEST-INVENTORY.md
    - .planning/STATE.md
key-decisions:
  - "TEST-06 基準 215 項／17 個檔（2026-11-11）；Phase 7–11 VERIFICATION 人工對照，不加自動化腳本（D-11、D-12）"
requirements-completed: [TEST-06, DESIGN-01, MAINT-01]
duration: 25min
completed: 2026-11-11
---

# Phase 6 Plan 04: 測試盤點完成與 phase gate Summary

補上 SideMenu(5)、NavBar(14)、FeaturedCarousel(18)、ProductCard(21) 共 58 列，盤點達 215 列並與 `npx vitest list` 名稱 diff 無差異；新增 accessible name 契約清單；STATE.md 記錄基準；D-17 檢查 main 無新 commit。

## Commits
- bbb0b9a docs(06): 測試盤點補上重設計高影響元件（總數 215）
- ad661c4 docs(06): 新增 accessible name 契約清單並記錄測試總數基準 215

## 結果
- 逐條清單 215 列，契約 201、呈現 14；4 個高影響檔：SideMenu 3/2、NavBar 13/1、FeaturedCarousel 18/0、ProductCard 12/9（契約／呈現）
- SideMenu 5 列全標 CategoryChips 改寫；ProductCard 燈箱／role=button 列標 Phase 10 LINK-01；`data-testid="product-description"` 標保留
- accessible name 清單含 `開啟選單`（現有測試未引用，Phase 8 新增）與文案字串表
- `src/` 未修改；未新增任何腳本檔

## D-17
`git fetch origin` 後 `git rev-list --count redesign..main` 與 `redesign..origin/main` 皆為 0：main 無新 commit，無需合併，未執行 merge，未 push。

## 三項需求最終狀態
- DESIGN-01：06-UI-SPEC.md `status: approved`，REQUIREMENTS 已於 06-02 勾選
- TEST-06：215 列、名稱 diff 通過、STATE.md 已記錄基準
- MAINT-01：commit 5584cd0（移除 @tailwindcss/postcss）、1a9c815（移除 @types/react-router-dom）；CSS sha256 `9fee6d55ac2100ca088e96b33d691351c36901cf39da851e29bc4327f940b8cc`；package.json 已無兩套件字樣

## Phase gate
`npm test`（17 檔 215 項全綠）、`npm run lint`、`npm run build`（含 dist 掃描）皆通過；`npx vitest list` 為 215。

## Deviations from Plan
無偏離。備註：暫存產生腳本置於 `$TMPDIR`，不進 repo；首次產生時 `vitest list` 輸出順序與檔案順序不同導致備註錯位，已改依原始碼位置排序後重產並重新驗證，最終 commit 內容正確。

## Self-Check: PASSED
