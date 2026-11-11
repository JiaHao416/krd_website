---
phase: 08-shell-redesign
plan: 01
subsystem: ui-foundation
tags: [tailwind, design-tokens, tdd, icons, contact, hooks]
requires: []
provides:
  - C5a 語意 token（tailwind.config.js extend 版）
  - token 版 index.css base 與全域 :focus-visible
  - src/components/icons.tsx（10 個圖示）
  - src/config/contact.ts（CONTACT、hasText、splitBusinessHours）
  - src/hooks/useMediaQuery.ts
  - src/components/PriceTag.tsx
  - FeaturedCarousel 測試的 mockMatchMedia({ reducedMotion, base })
affects: [08-02, 08-03, 08-04, 08-05, 08-06, 08-07, 08-08]
tech-stack:
  added: []
  patterns: [語意 token 單一色碼來源、CSS 變數響應式字級、全域焦點樣式、依賴注入用 ContactInfo 介面]
key-files:
  created:
    - src/components/icons.tsx
    - src/components/icons.test.tsx
    - src/config/contact.ts
    - src/config/contact.test.ts
    - src/hooks/useMediaQuery.ts
    - src/hooks/useMediaQuery.test.tsx
    - src/components/PriceTag.tsx
    - src/components/PriceTag.test.tsx
  modified:
    - src/components/FeaturedCarousel.test.tsx
    - src/test/setup.ts
    - tailwind.config.js
    - src/index.css
    - src/App.tsx
  deleted:
    - src/App.css
decisions:
  - "tailwind.config.js 本階段用 theme.extend 與舊 class 並存，收尾 plan 08-08 改覆寫"
  - "仍有使用點的舊樣式集中於 index.css LEGACY 區塊，原樣保留至遷移完成"
  - "icons 的 stroke=\"currentColor\" 寫在各元件上而非共用物件，便於檢索與明確表意"
metrics:
  duration: "約 10 分鐘"
  completed: 2026-11-11
  tasks: 3
  files: 14
---

# Phase 8 Plan 01: 基礎層（token、字型、共用模組）Summary

以 tailwind `theme.extend` 建立 C5a 17 個語意色、4 級字級、圓角與實色陰影，字型改為 PingFang TC／微軟正黑體／Noto Sans TC 系統堆疊；index.css 從 528 行精簡為 158 行（token 版 base + 全域焦點 + LEGACY 區塊）；新增 icons、contact、useMediaQuery、PriceTag 四個共用模組，含 22 項 TDD 測試。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1 | 擴充輪播 matchMedia mock、setup.ts 補 scrollIntoView polyfill（Phase 8 第一個 commit，只含 2 檔） | 22bb424 |
| 2 | C5a token、字型堆疊、精簡 index.css、刪除 App.css | 9457207 |
| 3 | icons／contact／useMediaQuery／PriceTag 與測試 | fc32663 |

## 測試數（D-10）

- 起點：`npx vitest list | wc -l` = 314
- Task 1 後：314（FeaturedCarousel 18 項全綠，數量不變）
- Task 2 後：314
- 結束：**336**（+icons 10、contact 5、useMediaQuery 4、PriceTag 3）
- 每個 commit 前 `npm test`、`npm run lint`、`npm run build` 皆全綠。

## RED 證據（Task 3）

先寫 4 個測試檔，執行 `npx vitest run src/components/icons.test.tsx src/config/contact.test.ts src/hooks/useMediaQuery.test.tsx src/components/PriceTag.test.tsx`：

- `src/config/contact.test.ts` FAIL：`Error: Cannot find module './contact'`
- `src/components/PriceTag.test.tsx` FAIL：`Failed to resolve import "./PriceTag"`
- `src/components/icons.test.tsx` FAIL：`Failed to resolve import "./icons"`
- `src/hooks/useMediaQuery.test.tsx` FAIL：`Failed to resolve import "./useMediaQuery"`
- 結果：`Test Files 4 failed (4)`；RED 未提交。實作後 `Tests 22 passed (22)`，全套 336 passed。

Task 1 為測試 harness 重構（mock 改名＋擴充），非新行為，無 RED 階段；改動後 18 項維持全綠。

## 舊斷言 → 新斷言

無斷言變更。Task 1 只把 `mockReducedMotion(true)` 改為 `mockMatchMedia({ reducedMotion: true })`（harness），斷言與 `accent="blue"` 未動。

## index.css 處置

**搬入 LEGACY 區塊（仍有使用點）：** `.glass-card`、`.product-card-new`（含 :hover、::before 規則）、`.product-image-container`、`.product-image`、`.product-overlay`、`.product-info`、`.product-title`、`.zoom-icon`、`.product-badge`、`.text-shadow`、`.text-shadow-lg`、`.animate-fade-in`、`.animate-slide-up` 與 `fadeIn`／`slideUp` keyframes。

**刪除（grep src 的 .ts/.tsx 使用點皆為 0）：** base `*`／`a`／`h1`／`button`、`.gradient-text`、`.gradient-button`、`.hover-card`、`.nav-link`、`.sidebar-link`、`.product-price`、`.logo-enhanced`、`.logo-text-enhanced`、`.modal-backdrop`、`.loading-spinner`、`.heart-button`、`.scrollbar-hide`、`.line-clamp-2/3`（自訂版）、`.glass-effect`、`.animate-float`、`.animate-slide-in-left`、`.animate-shimmer`、`*-modern` 系列、`float`／`slideInFromLeft`／`shimmer`／`gradientShift` keyframes、`@media (max-width: 768px)`、`prefers-color-scheme`、`prefers-contrast` 區塊。tailwind 舊 `animation`／`keyframes`（含未使用的 pulse-slow）一併移除。

**line-clamp 確認（假設 A1）：** 刪除自訂版後 build，`grep -c "line-clamp-2" dist/assets/*.css` = 1，Tailwind 內建版本有效；dist CSS 無 `@font-face`。

## D-08 檢查

`git diff --stat 68d4671..HEAD -- src/services src/hooks/usePrefersReducedMotion.ts src/hooks/useProducts.ts src/hooks/useProductDetail.ts` 無輸出；`src/services/format.ts` 未修改。`src/App.tsx` 只移除 `import "./App.css";`，8 條路由不變。

## Deviations from Plan

1. **[微調] tailwind.config.js 字型註解** — 計畫建議的註解「Mac→PingFang TC」會讓 `grep -c "PingFang TC"` 變成 2，與 acceptance「為 1」衝突，註解改寫為「Mac→蘋方」。
2. **[微調] icons.tsx 的 stroke 屬性位置** — 共用屬性物件不含 `stroke`，改在每個 `<svg>` 上明寫 `stroke="currentColor"`，以符合 acceptance 的 grep（≥10），渲染結果相同。
3. **[微調] contact.test 的 splitBusinessHours 無空白案例** — 以「全年無休」作為輸入，與計畫行為一致。
4. **LEGACY 區塊保留各 class 的 :hover／::before 衍生規則**（屬「原樣搬入」範圍），但依計畫刪除其 `@media (max-width: 768px)` 覆寫。

除上述外，計畫照寫執行。未遇到權限守衛拒絕。

## Known Stubs

無。`CONTACT.lineUrl`／`email` 未設定為 D-15 的刻意決策。

## Self-Check: PASSED

- 8 個新檔皆存在；src/App.css 已刪除
- commits 22bb424、9457207、fc32663 皆存在於 git log
