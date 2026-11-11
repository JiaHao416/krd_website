---
phase: 09-product-detail
plan: 02
subsystem: shell-routing
tags: [layout, not-found, routing, react19-metadata, focus, tdd]
requires: [09-01]
provides:
  - Layout mobileBar slot（預設 MobileCallBar）
  - NotFoundState（src/components/NotFoundState.tsx）
  - NotFoundPage 與全域 * 路由
  - 焦點去框規則收斂為 main
affects: [09-04]
tech-stack:
  added: []
  patterns: [React 19 原生 title（無新依賴）、Layout slot prop 取代 variant]
key-files:
  created:
    - src/components/NotFoundState.tsx
    - src/components/NotFoundState.test.tsx
    - src/pages/NotFoundPage.tsx
    - src/pages/NotFoundPage.test.tsx
  modified:
    - src/components/Layout.tsx
    - src/components/Layout.test.tsx
    - src/index.css
    - src/App.tsx
    - src/App.test.tsx
decisions:
  - "Layout 以 mobileBar slot（預設單鈕列）讓詳情頁替換固定列，MobileCallBar 本身不改"
  - "NotFoundState 不含分頁標題，由頁面決定（全域版「找不到頁面 | KRD」）"
metrics:
  duration: 約 8 分鐘
  completed: 2026-11-11
---

# Phase 9 Plan 02: Layout 固定列插槽、NotFound 面板與全域路由 Summary

Layout 新增 `mobileBar` 插槽（預設仍為單鈕「打電話問問」）、焦點去框只作用於 `main`，並以可重用的 `NotFoundState` 加上 `NotFoundPage` 與 `<Route path="*">`，讓 `/whatever-404`、`/products` 顯示「找不到這一頁」與「找不到頁面 | KRD」分頁標題。

## 測試數

- 開始：`npx vitest list | wc -l` = 446（= 09-01 結束值）
- Task 1 後：448（Layout +2）
- 結束：456（NotFoundState 3、NotFoundPage 3、App +2）；≥ 446 + 10

## RED 證據

- Task 1：`npx vitest run src/components/Layout.test.tsx` → `Tests 1 failed | 6 passed (7)`，「傳入 mobileBar 時取代預設列」`Unable to find an element by: [data-testid="custom-bar"]`；`tsc -b` 報 `Property 'mobileBar' does not exist on type 'IntrinsicAttributes & LayoutProps'`。（「未傳時顯示預設單鈕列」為既有行為的特性測試，RED 階段即通過。）
- Task 2：`npx vitest run src/components/NotFoundState.test.tsx src/pages/NotFoundPage.test.tsx src/App.test.tsx` → `Test Files 3 failed (3)`；NotFoundState／NotFoundPage 為 `Failed to resolve import`，App 兩項新測試為 `Unable to find role="heading" and name "找不到這一頁"`。

## Commits

| Task | Commit | 說明 |
|------|--------|------|
| 1 | 0460e1e | feat(09-02): Layout 新增手機固定列插槽並收斂焦點去框規則 |
| 2 | 44fcb37 | feat(09-02): 新增 NotFound 面板與全域找不到頁面路由 |

每個 commit 前 `npm test`、`npm run lint`、`npm run build` 全綠。

## 既有測試變更（舊 → 新）

- `src/components/Layout.test.tsx`：只新增 2 項，既有 5 項與 `renderLayout` 未改（`git diff` 無刪除行）；5 → 7。
- `src/App.test.tsx`：只新增 2 項，既有 11 項未改（`git diff HEAD~2` 無刪除行）；11 → 13。
- `MobileCallBar.tsx`／`MobileCallBar.test.tsx` 無 diff。

## Deviations from Plan

**1. [Rule 1 - Bug] NotFoundPage 測試的 afterEach 需先 cleanup 再移除 title**
- **Found during:** Task 2（GREEN 階段）
- **Issue:** vitest 的 after hook 以堆疊順序執行，測試檔的 afterEach 先於 setup.ts 的 `cleanup()`；先移除 head 內所有 title 會把 React 插入的 title 一起拔掉，卸載時 `Cannot read properties of null (reading 'removeChild')`，並連帶讓下一項的標題還原斷言失敗。
- **Fix:** 測試檔 afterEach 先呼叫 `cleanup()`（讓 React 自行移除它的 title），再清掉模擬的站名 title。只改新測試檔，元件不變。09-04 詳情頁的 title 測試應沿用同一寫法。
- **Files modified:** src/pages/NotFoundPage.test.tsx
- **Commit:** 44fcb37

除此之外依計畫執行。`src/services/` 與既有 hooks 零改動。

## Known Stubs

無。

## Self-Check: PASSED

- 4 個新檔與 5 個修改檔皆存在；commits 0460e1e、44fcb37 存在於 git log。
