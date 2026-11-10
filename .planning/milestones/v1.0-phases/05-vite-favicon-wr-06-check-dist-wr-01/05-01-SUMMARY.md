---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
plan: 01
subsystem: ui
tags: [react, a11y, wcag-2.2.2, carousel, vitest]

requires:
  - phase: 02-api
    provides: FeaturedCarousel 與其 jsdom 測試
provides:
  - usePrefersReducedMotion hook
  - 輪播 reduced-motion 停用、hover／focus-within 暫停、手動切換重新計時
affects: [05-04 瀏覽器目視驗收]

tech-stack:
  added: []
  patterns:
    - "自動播放改為每次切換排一次 setTimeout，依賴 currentSlide 以達成重新計時"

key-files:
  created: [src/hooks/usePrefersReducedMotion.ts]
  modified: [src/components/FeaturedCarousel.tsx, src/components/FeaturedCarousel.test.tsx]

key-decisions:
  - "不新增可見暫停按鈕（D-05），外觀與 class 不變"
  - "觸控 mouseenter 殘留與點擊後焦點停留造成的暫停視為使用者主動互動，接受此取捨"

requirements-completed: []

duration: 8min
completed: 2026-11-10
---

# Phase 5 Plan 01: 輪播暫停與減少動態 Summary

**熱銷輪播在 reduced-motion、hover、focus-within 時不自動切換，手動切換後重新計時，無新增按鈕、外觀不變（WR-06）。**

## Accomplishments

- 新增 `usePrefersReducedMotion`（lazy 初值、監聽 change、無 matchMedia 回傳 false）
- `FeaturedCarousel` 自動播放由 setInterval 改為 setTimeout，依賴 `isPaused` 與 `currentSlide`
- 外層 div 加 onMouseEnter/Leave、onFocus/onBlur（blur 以 relatedTarget 判斷是否仍在輪播內）
- 新增 4 個 fake timers 測試（A reduced-motion、B hover、C focus-within、D 手動重計時）

## TDD 紅燈證據

實作前執行，四個新測試全部失敗，原 8 個測試通過：
- 系統偏好減少動態時不自動切換，手動仍可切換
- 滑鼠移入時不自動切換，移出後恢復
- 焦點在輪播內時不自動切換，焦點離開後恢復
- 手動切換後重新計時，不會在原排程時間被切走

綠燈後：`npm test` 17 檔 209 測試通過、`npm run lint`、`npm run build` 皆通過。

## Commits

- 1a01d06: fix(05-01): 熱銷輪播 hover／focus 暫停並尊重減少動態設定（WR-06）
（測試與實作依計畫合併為單一 commit，以維持每個 commit 皆能通過 `npm test`，故無獨立 test commit。）

## 已知取捨

- 觸控裝置點按後可能殘留 mouseenter，暫停至點擊他處為止。
- 滑鼠點擊按鈕後焦點停留於按鈕，輪播維持暫停至焦點離開。
- 兩者皆為使用者主動互動，符合 WCAG 2.2.2，不另做 pointerType／:focus-visible 判斷。

## Deviations from Plan

None - plan executed exactly as written。

## Self-Check: PASSED

- FOUND: src/hooks/usePrefersReducedMotion.ts
- FOUND: commit 1a01d06
- `<button` 數量維持 4
