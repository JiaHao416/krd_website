---
phase: 02-api
plan: 02
subsystem: product-page
tags: [routing, product-page, states, react-router]
requires: [02-01]
provides:
  - 8 個商品分類頁改讀後端公開 API（路由由 PRODUCT_PAGES 產生）
  - ProductPageTemplate 的載入／錯誤（可重試）／空／淡化／截斷狀態
  - ImagePlaceholder 缺圖佔位元件、PRODUCT_PAGE_VIEWS UI 設定
affects: [02-03, 02-04, 02-05]
key-files:
  created: [src/config/productPageViews.tsx, src/components/ImagePlaceholder.tsx, src/App.test.tsx, src/pages/ProductPageTemplate.test.tsx]
  modified: [src/App.tsx, src/pages/ProductPageTemplate.tsx]
key-decisions:
  - "圖示 SVG 以 makeIcon(path) 輔助函式產生，而非 7 份重複 inline SVG"
requirements-completed: [PROD-01, PROD-03, PROD-05, PROD-06, PROD-07, UX-01, UX-02, UX-03]
duration: 約 15 分鐘
completed: 2026-11-10
---

# Phase 2 Plan 02: 商品分類頁改讀後端 Summary

8 個舊網址改由 `PRODUCT_PAGES.map` 產生路由，頁面透過 `useProducts` 讀後端商品，並具備載入中、錯誤卡片（可重新載入）、空狀態、排序淡化與截斷提示。

## 完成的任務
| Task | 說明 | Commit |
|------|------|--------|
| 1 | 設定產生路由、ImagePlaceholder、Template 改讀後端、App／頁面測試 | 7ef07ec |
| 2 | 錯誤卡片、空狀態、排序淡化、截斷提示與 7 項狀態測試 | f0fe8dc |

## 驗證
- `npm test`：9 個檔案、131 個測試通過；`npm run build` 成功；變更檔案 eslint 0 問題
- 兩個 task 都先觀察到紅燈（Task 1 為 15 失敗、Task 2 為 7 失敗）才實作
- 錯誤卡片只顯示 `getErrorMessage(error)`，測試斷言後端原文不出現

## Deviations from Plan
- **[Rule 1 - 重複程式碼] 圖示改用 `makeIcon(path)`**：`productPageViews.tsx` 中 `<svg` 只有 1 處，不符 acceptance「7 處」的字面數值；渲染結果（class、path d、文案）與舊 App.tsx 完全相同，僅消除 7 份重複 SVG。
- 測試中的後端錯誤種類使用實際存在的 `"http"`（plan 範例未指定種類）。
- 使用 `prettier --trailing-comma es5` 格式化變更檔案以符合專案風格（專案未設定 Prettier）。
- `npm install` 使 `package-lock.json` 在工作樹出現變更，非本 plan 產物，未提交。
- 工作樹基底與指定基底不符，依指示 `git reset --hard 4769d4c` 後開始。
- sandbox 曾拒絕複合 shell 指令（`&&`／heredoc／`>>`），改用 Edit／Write 與單純指令，未繞過守衛。

## 注意事項
- PROD-04（價格顯示）待 02-04 完成；卡片目前移除舊 Airtable 的 price 行、尚無價格行。Phase 2 全部 plan 完成並通過 02-05 驗收前不要 push main（push main 即部署 production）。

## Known Stubs
無。

## Self-Check: PASSED
