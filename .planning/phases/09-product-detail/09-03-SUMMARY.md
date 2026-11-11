---
phase: 09-product-detail
plan: 03
subsystem: product-detail
tags: [components, a11y, roving-tabindex, aria-live, tdd]
requires: [09-01, 09-02]
provides:
  - VariantSelector（src/components/VariantSelector.tsx）
  - PriceBlock（src/components/PriceBlock.tsx）
  - SpecTable（src/components/SpecTable.tsx）
  - DetailCta（src/components/DetailCta.tsx）
  - DetailMobileBar（src/components/DetailMobileBar.tsx）
affects: [09-04]
tech-stack:
  added: []
  patterns: [受控元件（狀態由頁面持有）、roving tabindex radiogroup、純 CSS 切換 md+ 行內／base 固定列]
key-files:
  created:
    - src/components/VariantSelector.tsx
    - src/components/VariantSelector.test.tsx
    - src/components/PriceBlock.tsx
    - src/components/PriceBlock.test.tsx
    - src/components/SpecTable.tsx
    - src/components/SpecTable.test.tsx
    - src/components/DetailCta.tsx
    - src/components/DetailCta.test.tsx
    - src/components/DetailMobileBar.tsx
    - src/components/DetailMobileBar.test.tsx
  modified: []
decisions:
  - "複製失敗提示在 base 放在固定列內、按鈕上方跨兩欄（研究 Open Question 2）"
  - "selectedId 不在變體清單內時，第一個選項 tabIndex 0，確保群組仍可 Tab 進入"
metrics:
  duration: 約 6 分鐘
  completed: 2026-11-11
---

# Phase 9 Plan 03: 詳情頁呈現子元件 Summary

5 個受控子元件：變體 radiogroup（方向鍵／Home／End 循環切換並移動焦點、缺貨附「洽詢交期」）、價格色塊（無價「價格請來電」、有價加「含稅」，不碰 format.ts）、規格 `<dl>`（無列不渲染）、md+ 行內 CTA 與 base 雙鈕固定列（只收 `status`／`onCopy`，共用頁面的複製狀態）。

## 測試數

- 開始：`npx vitest list | wc -l` = 456（= 09-02 結束值）
- Task 1 後：471（VariantSelector 9、PriceBlock 3、SpecTable 3）
- 結束：484（DetailCta 7、DetailMobileBar 6）；≥ 456 + 25

## RED 證據

- Task 1：`npx vitest run src/components/VariantSelector.test.tsx src/components/PriceBlock.test.tsx src/components/SpecTable.test.tsx` → `Test Files 3 failed (3)`、`Tests no tests`，原因 `Failed to resolve import "./VariantSelector"`／`"./PriceBlock"`／`"./SpecTable"`（元件不存在）。
- Task 2：`npx vitest run src/components/DetailCta.test.tsx src/components/DetailMobileBar.test.tsx` → `Test Files 2 failed (2)`、`Tests no tests`，原因 `Failed to resolve import "./DetailCta"`／`"./DetailMobileBar"`。

## Commits

| Task | Commit | 說明 |
|------|--------|------|
| 1 | 8807236 | feat(09-03): 新增變體選擇、價格區塊與規格表元件 |
| 2 | a796a50 | feat(09-03): 新增詳情頁行內 CTA 與手機雙鈕固定列 |

每個 commit 前 `npm test`、`npm run lint`、`npm run build` 全綠；designTokens 掃描通過。

## 既有測試變更（舊 → 新）

無。只新增檔案；`src/services/` 與既有 hooks 零改動（`git diff --stat HEAD~2 -- src/services src/hooks` 無輸出）。

## Deviations from Plan

- VariantSelector 的按鍵對應抽成模組層純函式 `nextIndex(key, index, last)`（計畫為巢狀三元式），行為相同、較易讀；`preventDefault` 仍只出現一次。

除此之外依計畫執行。

## Known Stubs

無（元件尚未被頁面使用，由 09-04 組裝）。

## Threat Flags

無新增表面；LINE 連結 `rel="noopener noreferrer"` 有測試（T-09-05），變體文字以 React 文字節點輸出（T-09-06）。

## Self-Check: PASSED

- 10 個新檔皆存在；commits 8807236、a796a50 存在於 git log。
