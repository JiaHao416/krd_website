---
phase: 02-api
plan: 06
subsystem: ui
tags: [product-card, layout, gap-closure]
requires: []
provides:
  - grid 卡片描述 line-clamp-1、資訊區 py-4 px-5、價格行 mb-1
affects: [02-UAT 第 3 項 gap]
key-files:
  modified:
    - src/components/ProductCard.tsx
    - src/components/ProductCard.test.tsx
decisions:
  - "以 Tailwind utility（py-4 px-5）覆寫 index.css 的 .product-info p-6，不改 index.css"
metrics:
  tasks: 1
  files: 2
completed: 2026-11-10
---

# Phase 2 Plan 06: grid 卡片溢出修正 Summary

縮小 grid 卡片資訊區內距（py-4 px-5）、價格行間距（mb-1）並把描述縮為 line-clamp-1，讓固定 h-96 的卡片底部「點擊查看大圖」列不再被裁切；list 卡片不變。

## 變更

- `ProductCard.tsx`：價格間距依 variant 決定（`priceMarginClass`）、grid 描述 `line-clamp-1`、grid `.product-info` 加 `py-4 px-5`、兩個描述 `<p>` 加 `data-testid="product-description"`。`h-96`、`h-64`、名稱、list 的 class 皆未動，`index.css` 未動。
- `ProductCard.test.tsx`：改寫「描述為 null」測試（改用 testid 精確選取），新增 grid／list 描述截斷、內距、價格間距（有價與價格洽詢）、版面高度 class 的測試。

## TDD

- RED：`ebc686d`（5 個新測試失敗）
- GREEN：見 fix(02-06) 提交，ProductCard 測試 20/20、全部 168/168 通過

## 驗證

- `npm test`、`npm run build` 通過，產物 CSS 含 `line-clamp-1`、`px-5`
- eslint 對本次修改的兩個檔案無問題；`npm run lint` 全專案仍有既有的 `no-explicit-any` 錯誤（`src/components/ProductView.tsx`、`src/services/index.ts`，與本計畫無關，未處理）
- 計畫的 acceptance grep 皆符合

## 備註

行動版（<768px）index.css 的未分層 `.product-info { p-4 }` 會勝過 utilities，結果四邊 16px：垂直內距與採用組合相同，水平內距更窄，內容不會變高，因此不需處理。

## 瀏覽器實測（orchestrator 填寫）

量測前 02-UAT 第 3 項 gap 不得標為 resolved。

- 視窗寬／卡片寬：1280px／192px（grid 4 欄）
- 有描述卡片底部列距卡片底（px）：8（長名＋價＋描述、短名＋價＋描述、長名＋描述三種皆 8；修正前為 -24）
- 無描述卡片底部列距卡片底（px）：17（長名＋價、長名、短名皆 17）
- 描述 computed `-webkit-line-clamp: 1`、`.product-info` padding `16px 20px`
- 375px 行動版（真實資料、無描述）：17px，`.product-info` padding 16px，無橫向溢出
- 量測方式：Chrome DevTools MCP 對本機 dev server，以 XHR 改寫注入 6 種組合（名稱長短 × 有無價格 × 有無描述）
- 量測日期：2026-11-10
- 結論：全部 ≥ 4px，02-UAT 第 3 項 gap resolved

## Deviations from Plan

無。計畫依原樣執行；全專案 lint 的既有錯誤屬範圍外。

## Self-Check: PASSED
