---
phase: quick-261111-ibb
plan: 01
status: complete
subsystem: ui-copy
tags: [contact, price, a11y, copywriting]
requires: []
provides:
  - "hasListedPrice 共用判斷（src/components/price.ts）"
  - "營業時間：週一至週五 09:00 - 17:30／見紅休（週六、週日及國定假日）"
affects: [ContactBlock, Footer, HomePage 戳章, AboutPage, ProductCard, FeaturedCarousel, VariantSelector, ProductDetailView]
tech-stack:
  added: []
  patterns: ["無價時元件回傳 null，由呼叫端決定是否保留外框"]
key-files:
  created:
    - src/components/price.ts
  modified:
    - src/config/contact.ts
    - src/components/ContactBlock.tsx
    - src/components/PriceTag.tsx
    - src/components/PriceBlock.tsx
    - src/components/ProductCard.tsx
    - src/components/FeaturedCarousel.tsx
    - src/components/VariantSelector.tsx
    - src/components/ProductDetailView.tsx
decisions:
  - "ContactBlock 拿掉 closedNote 外層全形括號（新備註自帶括號），md+ 以 md:ml-2 隔開"
  - "詳情頁缺貨時整個 stock-status 區塊不渲染，避免 flex-col 留下空白間距"
  - "hasListedPrice 放在 src/components/price.ts（避免 react-refresh 警告、且不得改 services）"
metrics:
  completed: 2026-11-11
  tests_before: 541
  tests_after: 543
---

# Quick 261111-ibb：移除價格請來電與洽詢交期、營業時間改週一至週五見紅休 Summary

營業時間改為「週一至週五 09:00 - 17:30」＋「見紅休（週六、週日及國定假日）」；全站移除「洽詢交期」與「價格請來電」，無價商品不渲染任何價格元素（含詳情頁整個價格區塊），無價卡的連結名稱只剩商品名稱。

## Commits

| Task | Commit | 說明 |
|------|--------|------|
| 1 | 90dad43 | fix(quick-261111-ibb): 營業時間改為週一至週五，休息備註改為見紅休 |
| 2 | 908c005 | feat(quick-261111-ibb): 全站移除洽詢交期標籤 |
| 3 | 5da6efc | feat(quick-261111-ibb): 全站移除價格請來電，無價商品不顯示價格元素 |

每個 commit 前皆通過 `npm test`、`npm run lint`、`npm run build`。

## RED 紀錄（未 commit）

**Task 1** — `npx vitest run src/config src/components/ContactBlock.test.tsx src/components/Footer.test.tsx src/components/Layout.test.tsx`：4 failed / 29 passed
- contact.test.ts > CONTACT > 必填欄位與 UI-SPEC 完全一致
- ContactBlock.test.tsx > 顯示營業時間與休息備註
- Footer.test.tsx > address 變體預設顯示 CONTACT 的地址與營業時間
- Layout.test.tsx > footer=address 顯示地址頁尾

（splitBusinessHours 只換輸入字串，屬純函式，舊實作即通過；新增的「不出現雙層括號」測試在舊字串下自然通過，是防回歸用，config 改字串後若未拿掉外層括號就會失敗。）

**Task 2** — `npx vitest run src/components/ProductCard.test.tsx src/components/VariantSelector.test.tsx src/components/ProductDetailView.test.tsx`：5 failed / 54 passed
- ProductCard > 缺圖卡 accessible name 不以「暫無圖片」開頭，佔位契約不變
- ProductCard > 缺貨時 grid 不顯示洽詢交期
- ProductCard > 缺貨時 list 也不顯示洽詢交期
- ProductDetailView > 切換到缺貨且無圖的變體時不顯示洽詢交期與有現貨，並回到商品圖
- VariantSelector > 選項文字為屬性值組合，缺貨選項不附洽詢交期

**Task 3** — `npx vitest run src/components src/pages`：15 failed / 247 passed
- FeaturedCarousel > 便條卡有價顯示 priceText、無價不顯示價格元素
- PriceBlock > 沒有標價時整個價格區塊不渲染
- PriceTag > 最低與最高價皆為 null 時不渲染任何元素
- ProductCard > grid 無價：不顯示任何價格元素（無價格請來電、無價格洽詢）
- ProductCard > list 無價：不顯示任何價格元素
- ProductCard > 無價時卡片內沒有 block-2 價格 tag
- ProductCard > grid 卡 accessible name 不因圖片 alt 重複念商品名稱
- ProductCard > 無價卡連結的 aria-labelledby 只含一個 id，且指向存在的名稱 h3（新增）
- ProductCard > 無價時 grid 與 list 都不渲染空的標籤列
- ProductDetailView > 預設選中預設變體，顯示對應價格與 SKU
- ProductDetailView > 沒有變體時視為無價，規格表不含 SKU
- HomePage > 便條卡有價顯示 priceText、無價不顯示價格請來電，且不出現價格洽詢
- ProductPageTemplate > 顯示有價商品的 priceText，無價商品不顯示價格元素
- ProductPageTemplate > 有圖卡片以 Enter 導向 /products/{id}
- ProductPageTemplate > 每張卡的連結 href 對應各自的 id

（「priceText 有值但 priceMin/priceMax 皆 null 時仍不顯示價格」在舊實作下也通過——舊版顯示的是「價格請來電」而非 priceText——保留作防回歸。）

## 舊斷言 → 新斷言

### Task 1
| 檔案／測試 | 舊 | 新 |
|---|---|---|
| contact.test.ts 必填欄位 | businessHours "週一至週六 09:00 - 17:30"、closedNote "週日及國定假日休息" | "週一至週五 09:00 - 17:30"、"見紅休（週六、週日及國定假日）" |
| contact.test.ts splitBusinessHours | 輸入「週一至週六 …」→ ["週一至週六", "09:00 - 17:30"] | 輸入「週一至週五 …」→ ["週一至週五", "09:00 - 17:30"]（全年無休案例保留） |
| ContactBlock 顯示營業時間與休息備註 | /週一至週六 09:00 - 17:30/、/週日及國定假日休息/ | /週一至週五 09:00 - 17:30/、/見紅休（週六、週日及國定假日）/ |
| ContactBlock（新增） | — | 休息備註不再外包一層：textContent 不含「（見紅休」 |
| Footer address 變體 | 「…・週一至週六 09:00 - 17:30」 | 「…・週一至週五 09:00 - 17:30」 |
| Layout footer=address | 同上 | 同上 |

### Task 2
| 檔案／測試 | 舊 | 新 |
|---|---|---|
| ProductCard「inStock=false 時 grid 顯示洽詢交期」 | getByText("洽詢交期") 有 bg-block-3 | 「缺貨時 grid 不顯示洽詢交期」：queryByText 為 null |
| ProductCard「list 也顯示洽詢交期」 | getByText("洽詢交期") 存在 | 「缺貨時 list 也不顯示洽詢交期」：queryByText 為 null |
| ProductCard 缺圖卡 accessible name | toHaveAccessibleDescription("洽詢交期") | not.toHaveAttribute("aria-describedby")；名稱與佔位斷言不變 |
| VariantSelector 選項文字 | radios[2] toHaveTextContent("洽詢交期") | 「缺貨選項不附洽詢交期」：radios[2] 文字精確為 /^紅色$/ 且 not.toHaveTextContent("洽詢交期") |
| ProductDetailView 切換到缺貨變體 | stock 區 getByText("洽詢交期")、無「有現貨」 | queryByText("洽詢交期")、queryByText("有現貨") 皆為 null；主圖斷言不變 |

### Task 3
| 檔案／測試 | 舊 | 新 |
|---|---|---|
| PriceTag 皆 null | getByText("價格請來電") 有 bg-block-2 | 「不渲染任何元素」：container toBeEmptyDOMElement |
| PriceBlock 沒有標價 | 顯示「價格請來電」與說明、不顯示含稅 | 「整個價格區塊不渲染」：container 為空、無 /這個商品沒有標價/、無「含稅」 |
| ProductCard grid 無價 | getByText("價格請來電") | queryByText("價格請來電") 與 PRICE_ON_REQUEST 皆 null |
| ProductCard list 無價 | getByText("價格請來電") | queryByText("價格請來電") 與 PRICE_ON_REQUEST 皆 null |
| ProductCard 價格請來電 tag 使用 block-2 | tag 有 bg-block-2、無 bg-accent | 「無價時卡片內沒有 block-2 價格 tag」：querySelector(".bg-block-2") 為 null |
| ProductCard 無價判斷 | makeNoPrice({ priceText: "" }) 顯示「價格請來電」 | makeNoPrice({ priceText: "NT$999" })，queryByText("NT$999") 為 null |
| ProductCard grid accessible name | "商品一 價格請來電" | "商品一" |
| ProductCard 價格行位於標籤列：無價 | 「價格請來電」父層為 flex-wrap gap-2 | 「無價時 grid 與 list 都不渲染空的標籤列」：querySelector(".flex-wrap.gap-2") 為 null |
| ProductCard（新增） | — | 無價卡 aria-labelledby 只含 1 個 id，且對應元素為 H3 |
| FeaturedCarousel 便條卡 | getByText("價格請來電") | queryByText("價格請來電") 為 null；「查看詳情 →」兩張卡皆在 |
| HomePage 便條卡 | getAllByText("價格請來電").length > 0 | queryByText("價格請來電") 為 null（「價格洽詢」否定斷言保留） |
| ProductPageTemplate 有價／無價 | getByText("價格請來電") | queryByText("價格請來電")、queryByText("價格洽詢") 皆為 null |
| ProductPageTemplate Enter 導向 | 連結名稱 "甲商品 價格請來電" | "甲商品" |
| ProductPageTemplate 連結 href | "甲商品 價格請來電"、"乙商品 價格請來電" | "甲商品"、"乙商品" |
| ProductDetailView 預設變體 | getByText("價格請來電") | queryByText("含稅")、queryByText(/這個商品沒有標價/) 皆 null；SKU 不變 |
| ProductDetailView 沒有變體 | getByText("價格請來電") | 價格區塊不渲染；「複製詢價訊息」按鈕與「打電話問 {CONTACT.phone}」連結仍在 |

## ContactBlock 拿掉外層括號的理由

新的 closedNote「見紅休（週六、週日及國定假日）」本身已含全形括號，原本 span 內 `（{info.closedNote}）` 會顯示成「（見紅休（週六、週日及國定假日））」。依使用者核准的字串保留 closedNote 原文，改拿掉元件的外層括號；md 以上 span 為 inline，加 `md:ml-2` 與營業時間隔開（手機為 block 換行，不需間距）。

## Deviations from Plan

1. **[微調] ProductDetailView CTA 斷言名稱** — 計畫寫「打電話問問」，但 DetailCta 既有可及名稱為「打電話問 {CONTACT.phone}」，依計畫「以 DetailCta 既有的可及名稱查詢」使用後者。
2. **[微調] FeaturedCarousel 測試多加一條斷言** — 確認無價便條卡的「查看詳情 →」仍在（計畫行為描述有提及）。
3. Task 3 計畫列出的 `src/components/ProductDetailView.tsx` 無需修改（PriceBlock 自行回 null，現貨區已在 Task 2 處理），故未納入 Task 3 commit。

無 guard 拒絕、無 auth gate。未修改 `src/services/`、`src/hooks/`；未 stage `.planning/config.json` 與 `11-02-SUMMARY.md`；停留在 redesign、未 push。STATE.md 沒有「Quick Tasks Completed」表格，故未更新。

## 驗證

- `npm test`：543 passed（原 541，新增 2 則）
- `npm run lint`：無問題
- `npm run build`：成功，dist 掃描通過
- `grep -rn "價格請來電\|洽詢交期\|週一至週六\|週日及國定假日休息" src`：非測試檔 0 筆；測試檔僅剩否定斷言／測試名稱／註解

## Self-Check: PASSED

- src/components/price.ts 存在
- 90dad43、908c005、5da6efc 皆在 git log
