---
phase: 08-shell-redesign
plan: 06
subsystem: ui-home
tags: [homepage, hero, category-cards, featured-carousel, contact-block, tdd, a11y]
requires: [08-05]
provides:
  - C5a 首頁（hero＋店面照片預留位＋營業中戳章、分類貼紙卡、「這陣子大家都在問」兩組輪播、ContactBlock）
affects: [08-08, phase-10]
tech-stack:
  added: []
  patterns: [分類卡以靜態 class 陣列設定傾斜與底色、兩組輪播外包 role=group 命名、戳章 aria-hidden、聯絡資料只讀 contact.ts]
key-files:
  created: []
  modified:
    - src/pages/HomePage.tsx
    - src/pages/HomePage.test.tsx
decisions:
  - "CATEGORY_CARDS 以 interface CategoryCard（path: ProductPagePath、Icon: ComponentType）宣告，取代 plan 的 as const，讓 PRODUCT_PAGE_VIEWS[path] 型別直接成立"
  - "兩組輪播不顯示子標題，只以 group aria-label 命名（Open Q1）"
metrics:
  duration: "約 8 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 2
---

# Phase 8 Plan 06: 首頁改版 Summary

首頁改為 C5a 版面：hero（tag、h1 含 tape 螢光筆底線、導言、md+「逛逛商品 →」與電話連結、店面照片虛線預留位、xl 才顯示的營業中戳章）→ 「想找什麼？」4 張傾斜分類貼紙卡（整張 Link）→ 「這陣子大家都在問」下兩組獨立 FeaturedCarousel（role=group）→ ContactBlock。電話、營業時間皆讀 `CONTACT`，檔內無寫死聯絡字串。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1+2 | HomePage 測試 7→13（RED 未提交）＋首頁重寫 | ed78c72 |

## 測試數（D-10）

- 起點（08-05 結束）：378
- 結束：`npx vitest list | wc -l` = **384**（= 378 + 6）
- commit 前 `npm test`（384 passed）、`npm run lint`（無問題）、`npm run build`（dist 掃描通過）全綠
- `git diff HEAD~1 --stat -- src/services src/hooks` 無輸出（D-08）

## RED 證據

`npx vitest run src/pages/HomePage.test.tsx`（舊首頁）：`Tests 10 failed | 3 passed (13)`
- 4 項既有契約失敗：舊頁面沒有 `role="group"`，`getByRole("group", { name: "熱門推薦系列" })` 找不到（兩組區塊各自顯示、一組失敗另一組仍顯示、兩組 429、兩組空狀態）
- 6 項新測試失敗：無「來問我們就對了」h1、無「逛逛商品」連結、無 hero region／電話連結、無「想找什麼？」region、無店面照片預留位、無「這陣子大家都在問」h2
- 實作後 HomePage＋FeaturedCarousel 38 passed。

## HomePage.test.tsx 舊 → 新對照（7 → 13）

| # | 測試（名稱不變） | 舊斷言 → 新斷言 | 類型 |
|---|---|---|---|
| — | `getSection(title)` helper | `getByText(title).closest("div.space-y-8")` → `getByRole("group", { name })` | harness 調整，斷言語意不變 |
| 1 | 分別以 featured=1 與 featured=2 呼叫 fetchProducts | 不變 | 契約 |
| 2 | 兩組區塊各自顯示對應 featured 的商品 | 斷言不變，區塊改由 group 取得 | 契約 |
| 3 | 便條卡有價顯示 priceText、無價顯示價格請來電… | 已於 08-05 改寫，本 plan 不動 | 呈現 |
| 4 | 沒有圖片的熱銷商品顯示暫無圖片佔位 | 不變 | 契約 |
| 5 | 一組失敗時另一組仍顯示商品 | 斷言不變，區塊改由 group 取得 | 契約 |
| 6 | 兩組同時 429 時各自在自己的區塊顯示錯誤 | 斷言不變，區塊改由 group 取得 | 契約 |
| 7 | 兩組都沒有商品時各自顯示空狀態 | `getByText("熱門推薦系列"/"頂級精選系列")` → `getByRole("group", { name: … })` | 呈現（標題文字不再顯示，改為 group 名稱） |

新增 6 項：h1 含來問我們就對了、逛逛商品連到 /all-products、hero 電話連結 href 為 tel:04-22798787（限 hero region 內）、4 張分類貼紙卡 href 順序、店面照片預留位 role=img、熱銷 h2 為這陣子大家都在問。

## A5 註記（待 UAT）

兩組輪播各自有控制列（箭頭＋指示點），與示意稿「按鈕與 h2 同列」不同；08-08 UAT 截圖時提醒使用者確認。

## Deviations from Plan

- **[型別] CATEGORY_CARDS 改用 interface 宣告**：plan 寫 `as const`；改為 `readonly CategoryCard[]`（`Icon: ComponentType<{ className?: string }>`），行為與 class 字串完全相同，且直接以解構出的 PascalCase `Icon` 渲染。
- Task 1 與 Task 2 合併為單一 commit（plan 即規定 RED 不提交、Output 為 1 個 commit）。

無 guard 拒絕、無驗證閘門。

## Threat 對應

- T-08-12：hero tel 連結只用 `CONTACT.phoneHref`，測試斷言 href。
- T-08-13：營業中戳章 `aria-hidden="true"`。

## Known Stubs

- 店面照片預留位「店面照片（待提供）」：D-15 明定無素材即正式呈現。

## Self-Check: PASSED

- FOUND: src/pages/HomePage.tsx、src/pages/HomePage.test.tsx
- FOUND: ed78c72
