---
phase: 02-api
plan: 03
subsystem: homepage
tags: [homepage, carousel, featured, states]
requires: [02-01, 02-02]
provides:
  - FeaturedCarousel 元件（載入／失敗重試／空／成功四種狀態、自動播放）
  - 首頁兩組熱銷輪播改讀後端 featured=1／2
affects: [02-05]
key-files:
  created: [src/components/FeaturedCarousel.tsx, src/components/FeaturedCarousel.test.tsx, src/pages/HomePage.test.tsx]
  modified: [src/pages/HomePage.tsx]
key-decisions:
  - "accent 漸層 class 以 ACCENT_CLASSES 靜態字串表達，避免 Tailwind purge"
requirements-completed: [PROD-02, PROD-03, PROD-06, UX-01, UX-02, UX-03]
duration: 約 15 分鐘
completed: 2026-11-10
---

# Phase 2 Plan 03: 首頁熱銷輪播改讀後端 Summary

首頁兩組輪播由兩個 `useProducts` 驅動，分別顯示後台熱銷 1／熱銷 2 的商品，各自處理載入、失敗重試與沒有商品，一組失敗不影響另一組。

## 完成的任務
| Task | 說明 | Commit |
|------|------|--------|
| 1 | FeaturedCarousel 元件、HomePage 改讀 featured=1／2、缺圖佔位、不顯示價格（4 項測試） | 95d73ae |
| 2 | 錯誤（getErrorMessage + 重新載入）、空狀態、兩組獨立與 429 測試（+10 項） | 9d62d8f |

## 驗證
- `npm test`：11 個檔案、145 個測試通過；`npm run build` 成功；變更檔案 eslint 0 問題
- 兩個 task 都先觀察到紅燈（Task 1 為 4 失敗、Task 2 為 5 失敗）才實作
- 錯誤框只渲染 `getErrorMessage(error)`，測試斷言後端原文不出現；無 `dangerouslySetInnerHTML`

## Deviations from Plan
- **[Rule 1 - 重複] 手機版箭頭不再另建重複按鈕**：原 JSX 有桌機與手機兩組箭頭，會造成重複的 aria-label 按鈕。改為單一組箭頭，手機常駐顯示（`w-12 h-12 md:w-16 md:h-16`、`md:opacity-0 md:group-hover:opacity-100`），視覺行為等同。
- 使用 `prettier --trailing-comma es5` 格式化變更檔案（專案未設定 Prettier）。
- 工作樹基底與指定基底不符，依指示 `git reset --hard 52047d8` 後開始。`npm install` 造成的 package-lock.json 變更已還原，未提交。
- sandbox 曾拒絕複合 git 指令，改拆成單純指令，未繞過守衛。

## Known Stubs
無。

## Self-Check: PASSED
