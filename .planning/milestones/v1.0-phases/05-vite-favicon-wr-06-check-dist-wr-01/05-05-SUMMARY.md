---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
plan: 05
subsystem: ui
tags: [react, carousel, touch, a11y, gap-closure]
requires: []
provides:
  - 觸控點擊輪播後自動播放不再停住
affects: [src/components/FeaturedCarousel.tsx]
tech-stack:
  added: []
  patterns: ["指標點擊序列旗標：pointerdown 設定，focus/click/pointercancel 清除，pointerup 只對滑鼠清除"]
key-files:
  modified:
    - src/components/FeaturedCarousel.tsx
    - src/components/FeaturedCarousel.test.tsx
decisions:
  - "採「click 清旗標」方案，不採 keydown 偵測或 :focus-visible（jsdom 無法區分）"
metrics:
  duration: 約 5 分鐘
  completed: 2026-11-10
---

# Phase 5 Plan 05: 觸控點擊後輪播停住修正 Summary

修正 UAT test 3：觸控 focus 發生在 pointerup 之後，原本 pointerup 已清旗標導致被誤判為鍵盤焦點；改為 pointerup 只對滑鼠清旗標，並於 click／pointercancel 清除。

## 完成的 Task

| Task | 內容 | Commit |
|------|------|--------|
| 1 | RED：新增觸控測試 A～D（不單獨 commit） | 併入 f4c22ef |
| 2 | GREEN：修正旗標處理，三道 gate 通過 | f4c22ef |

## RED 證據

直接執行 `npx vitest run src/components/FeaturedCarousel.test.tsx`，exit code 為 1，18 個測試中 2 失敗、16 通過。

- 紅燈（修正前失敗）：
  - A「觸控點擊按鈕取得焦點時不暫停，仍會自動切換」：找不到「商品3」（輪播停住）。
  - C「觸控被取消（pointercancel）後鍵盤焦點仍會暫停」：找不到「商品1」（旗標殘留，鍵盤焦點被誤判為指標焦點而未暫停）。
- 修正前即通過、屬防回歸：B「觸控點擊後再以鍵盤讓焦點進入，仍會暫停」、D「觸控點在非按鈕區域後鍵盤焦點仍會暫停」。

## GREEN 結果

`npm test` 17 個檔案、215 個測試全過；`npm run lint` 無問題；`npm run build`（含 tsc -b 與 dist 掃描）成功。Commit：f4c22ef，只含 FeaturedCarousel.tsx 與 FeaturedCarousel.test.tsx，無 AI 署名，未 push。

## 已知取捨

滑鼠在輪播非可聚焦區按下後拖出放開，旗標可能殘留，最多讓下一次鍵盤焦點不暫停一次。依 checker 備註，刻意不在 onPointerLeave 清旗標：觸控點擊時瀏覽器在 pointerup 之後、相容 mousedown／focus 之前就會送 pointerout／pointerleave，若在此清除會讓本次觸控修正失效。

## Deviations from Plan

None - plan executed exactly as written。（既有滑鼠測試補上 pointerType: "mouse"，為計畫內容。）

## Known Stubs

None。

## Self-Check: PASSED

- f4c22ef 存在；兩個修改檔案存在。
