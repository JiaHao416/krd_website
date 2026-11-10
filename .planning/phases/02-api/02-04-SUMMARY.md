---
phase: 02-api
plan: 04
subsystem: product-card
tags: [product-card, price, a11y, image-fallback]
requires: [02-02]
provides:
  - ProductCard 元件（grid／list、價格、佔位圖、破圖 fallback、鍵盤開燈箱）
  - 商品頁檢視切換 aria-label／aria-pressed
affects: [02-05]
key-files:
  created: [src/components/ProductCard.tsx, src/components/ProductCard.test.tsx]
  modified: [src/pages/ProductPageTemplate.tsx, src/pages/ProductPageTemplate.test.tsx]
key-decisions:
  - "破圖以 failedImageUrl state 比對 imageUrl，換網址自動重試，不使用 effect"
requirements-completed: [PROD-04, PROD-03]
duration: 約 10 分鐘
completed: 2026-11-10
---

# Phase 2 Plan 04: 商品卡片價格與破圖佔位 Summary

抽出 `ProductCard`：有價顯示含稅價（grid 另有右上角徽章），無價顯示灰色「價格洽詢」且無徽章；缺圖或 onError 顯示佔位圖，有圖卡片可用 Tab 聚焦並以 Enter／Space 開燈箱。商品頁改用 ProductCard，檢視切換按鈕補上 aria 屬性。

## 完成的任務
| Task | 說明 | Commit |
|------|------|--------|
| 1 | ProductCard 元件與 14 項測試 | feb01ff（另有格式化 commit） |
| 2 | 商品頁改用 ProductCard、檢視切換 aria、3 項新頁面測試 | fedbd4d |

## 驗證
- `npm test`：10 個檔案、148 個測試通過；`npm run build` 成功
- ProductCard、ProductPageTemplate 與其測試 eslint 0 問題

## Deviations from Plan
- **TDD 紅燈**：Task 1 的元件檔尚不存在，紅燈僅為 import 失敗；Task 2 有觀察到 4 項失敗後才實作。
- **acceptance grep 字面差異**：`onError` 出現 2 行（grid、list 各一個 img，plan 預期 1）；`tabIndex={0}` 以 `tabIndex: 0` 寫在共用 `interactiveProps` 物件中，grep 字面不符，行為一致。
- **既有測試調整**：「點有圖卡片會開燈箱」原以 `getAllByRole("img")` 查詢，卡片變 role=button 後內部 img 屬 presentational，改以 alt 文字（卡片商品名、燈箱「產品詳細圖片」）查詢，案例未刪除。
- 頁面測試數為 17（plan 預期 ≥16）。
- 以 `prettier --trailing-comma es5` 格式化變更檔案。
- `npm run lint` 全專案仍有 `ProductView.tsx`、`HomePage.tsx` 的既有 `no-explicit-any` 錯誤，非本 plan 檔案，未處理（HomePage 屬 02-03）。
- 工作樹基底與指定基底不符，依指示 `git reset --hard 52047d8` 後開始；sandbox 曾拒絕複合 git 指令，改用單純指令，未繞過守衛。
- `npm install` 造成的 package-lock.json 變動已還原未提交。

## Known Stubs
無。

## Self-Check: PASSED
