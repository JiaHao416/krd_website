---
phase: 08-shell-redesign
plan: 04
subsystem: ui-list-page
tags: [product-card, list-page, skeleton, image-modal, tdd, a11y]
requires: [08-01, 08-02]
provides:
  - C5a 商品卡（grid／list、PriceTag、洽詢交期 tag、傾斜、hover ring）
  - ProductCardSkeleton（同尺寸載入骨架）
  - 白底 ImagePlaceholder（accent-ink 圖示與文字）
  - 改版分類頁（h1＋副行、膠囊控制列、空狀態、錯誤卡、結尾「找不到想要的？」）
  - ImageModal 新配色（行為不變）
affects: [08-05, 08-06, 08-08, phase-10]
tech-stack:
  added: []
  patterns: [傾斜角度以靜態陣列取 class、價格判斷集中於 PriceTag、列表區以 renderProducts 依狀態分支]
key-files:
  created:
    - src/components/ProductCardSkeleton.tsx
  modified:
    - src/components/ProductCard.tsx
    - src/components/ProductCard.test.tsx
    - src/components/ImagePlaceholder.tsx
    - src/components/ImageModal.tsx
    - src/pages/ProductPageTemplate.tsx
    - src/pages/ProductPageTemplate.test.tsx
    - src/config/productPageViews.tsx
decisions:
  - "初次載入時標題區與 chip 列照常渲染，只有列表區換成文字＋8 張骨架（不再整頁 spinner）"
  - "結尾詢問區與副行只在有商品時顯示（重新整理淡化期間仍保留）"
  - "格狀／列表鈕加上可見文字「格狀」「列表」，aria-label 不變（label-in-name 成立）"
metrics:
  duration: "約 12 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 8
---

# Phase 8 Plan 04: 分類頁改版（商品卡、骨架、列表頁）Summary

商品卡改為 C5a 外觀：正方形白底圖、品牌、兩行名稱、標籤列（PriceTag 價格文字或「價格請來電」＋缺貨時「洽詢交期」），grid 卡依位置輪流傾斜、hover／active 用 inset ring；燈箱用的 role=button、onImageClick 原樣保留（D-06）。分類頁換成 h1＋「共 N 項」副行、44px 膠囊控制列、8 張同尺寸骨架、新空狀態／錯誤卡與「找不到想要的？」電話區；ImageModal 只換配色，productPageViews 移除 icon 設定。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1 | ProductCard／ProductCardSkeleton／ImagePlaceholder 改版，ProductCard.test 21→25、Template.test 價格斷言 | 84cdf00 |
| 2 | ProductPageTemplate 版面、ImageModal 配色、移除 productPageViews icon，Template.test 17→21 | 0b8ac92 |

## 測試數（D-10）

- 起點（08-03 結束）：`npx vitest list | wc -l` = **357**
- Task 1 後：361（ProductCard 21 → 25；Template 維持 17）
- 結束：**365**（Template 17 → 21），= 357 + 8，符合「≥ 前一個 plan + 8」
- 每個 commit 前 `npm test`、`npm run lint`、`npm run build` 皆全綠（365 passed、ESLint 無問題、dist 掃描通過）。

## RED 證據

**Task 1**：`npx vitest run src/components/ProductCard.test.tsx src/pages/ProductPageTemplate.test.tsx`（舊元件）
- `Tests 17 failed | 25 passed (42)`
- ProductCard 16 項 ×：grid 有價／區間價／只有 priceMax（出現 2 次而非 1 次）、grid 無價、list 無價、block-2 tag、無價判斷看 priceMin/priceMax、grid 不渲染說明、卡內距 p-2 md:p-4、標籤列（有價、無價）、aspect-square 白底、契約列（品牌未顯示）、洽詢交期 ×2、loading=lazy／decoding=async
- Template 1 項 ×：「同時顯示有價商品的 priceText 與無價商品的『價格請來電』」
- 實作後 42 passed。RED 未提交。

**Task 2**：`npx vitest run src/pages/ProductPageTemplate.test.tsx`（舊模板）
- `Tests 5 failed | 16 passed (21)`
- ×：點重新載入（找不到「這裡還沒有商品」）、空狀態、h1 副行「共 2 項…」、結尾「找不到想要的？」、8 張 skeleton
- 「chip 列存在且目前頁 chip 有 aria-current」在 RED 時已通過：08-02 已把 CategoryChips 插入模板，此項為回歸保護。
- 實作後 21 passed；`App.test.tsx` 11 項全綠。

## ProductCard.test.tsx 舊 → 新對照（21 → 25）

| 舊名／舊斷言 | 新名／新斷言 | 類型 |
|---|---|---|
| grid 有價：徽章與價格行各顯示一次 priceText（長度 2），不出現價格洽詢 | grid 有價：priceText 只顯示一次（長度 1），不出現價格洽詢 | 呈現（徽章移除） |
| grid 區間價：長度 2 | 同名，長度 1 | 呈現 |
| 只有 priceMax 有值時 grid 仍顯示價格徽章（長度 2） | 只有 priceMax 有值時 grid 仍顯示價格文字（長度 1） | 呈現 |
| grid 無價：顯示價格洽詢且沒有徽章 | grid 無價：顯示價格請來電，`queryByText(PRICE_ON_REQUEST)` 為 null | 文案（D-01） |
| list 有價：只顯示一次 priceText 且沒有徽章 | 不變 | — |
| list 無價：顯示價格洽詢 | list 無價：顯示價格請來電 | 文案 |
| 價格洽詢使用灰色而非 accent 色（`text-gray-500`） | 價格請來電 tag 使用 block-2 底而非 accent（`bg-block-2`、not `bg-accent`） | 呈現 |
| 燈箱 5 項（有圖點擊、Enter、Space、缺圖、破圖） | 不變（D-06，Phase 10 處理） | — |
| 破圖後換成新圖片網址會重新顯示 img | 不變 | — |
| 描述為 null 時（grid 與 list）都不渲染描述段落 | 不變 | — |
| grid 描述只顯示一行（line-clamp-1） | grid 不渲染說明段落（`queryByTestId("product-description")` 為 null） | 呈現（UI-SPEC grid 卡無說明） |
| list 描述維持兩行（line-clamp-2） | 不變 | — |
| grid 資訊區使用縮小的內距 py-4 px-5 | grid 卡內距 p-2 md:p-4（取 role=button 根元素） | 呈現 |
| grid 價格行間距為 mb-1，list 維持 mb-2（有價） | 價格行位於標籤列（flex-wrap gap-2）：有價（grid、list 各一次） | 呈現 |
| grid 價格洽詢行間距為 mb-1，list 為 mb-2 | 價格行位於標籤列（flex-wrap gap-2）：無價 | 呈現 |
| grid 長名稱：卡片 h-96、圖片 h-64、名稱 line-clamp-2，提示仍存在 | 圖片容器為 aspect-square 白底、名稱 line-clamp-2、無『點擊查看大圖』 | 呈現 |
| **契約**：有描述時顯示，且不顯示品牌、型號、現貨 | 有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期 | **經 UI-SPEC 授權的調整（A6）** |
| — | 無價判斷看 priceMin/priceMax 皆 null（priceText 不是 PRICE_ON_REQUEST 也一樣） | 新增 |
| — | inStock=false 時 grid 顯示洽詢交期（`bg-block-3`） | 新增 |
| — | list 也顯示洽詢交期 | 新增 |
| — | img 有 loading=lazy 與 decoding=async | 新增 |

**契約列（A6）理由：** UI-SPEC（權威文件，核准晚於 06-TEST-INVENTORY）要求 grid／list 卡皆顯示品牌（Label、ink-muted）。調整後仍保留 `getByTestId("product-description")` 說明斷言與「型號乙」的 `queryByText(...)).toBeNull()`；「現貨」改為驗證現貨商品不出現「洽詢交期」。

## ProductPageTemplate.test.tsx 舊 → 新對照（17 → 21）

| 舊 | 新 | 類型 |
|---|---|---|
| 同時顯示有價商品的 priceText 與無價商品的「價格洽詢」（`getByText("價格洽詢")`） | …與無價商品的「價格請來電」（`getByText("價格請來電")`）；priceText 斷言保留 | 文案（D-01，Task 1） |
| 點「重新載入」：`findByText("目前沒有商品")` | `findByText("這裡還沒有商品")`；呼叫 2 次斷言不變 | 文案 |
| 空狀態：「目前沒有商品」「此分類目前沒有上架的商品」 | 「這裡還沒有商品」「這個分類暫時沒東西，過幾天再來看看，或直接打電話問我們。」；「不出現請稍後再試」保留 | 文案 |
| — | h1 下方副行顯示共 N 項 | 新增 |
| — | 結尾「找不到想要的？」含電話連結（名稱 (04) 2279-8787、href tel:04-22798787） | 新增 |
| — | chip 列存在且目前頁 chip 有 aria-current（/trumpet） | 新增 |
| — | 載入中顯示 8 張 aria-hidden 的 skeleton | 新增 |

其餘 14 項（載入中文字、截斷、rate_limited、network、排序 2 項、aria-busy 淡化、排序後失敗、檢視切換 aria-pressed、燈箱 3 項等）斷言未動。

**Fixture 檢查（D-01）：** 有價 fixture（「有價商品」「切換列表檢視」）皆已設 `priceMin/priceMax: 120000`，無需修正；無價 fixture 的 `priceText: "價格洽詢"` 保留，用來證明 UI 判斷不看 priceText。

**Harness：** `renderPage(query, initialPath = "/all-products")` 新增第二參數；預設值沿用既有的 `/all-products`（計畫寫 `"/"`，見偏離 2）。

## D-06／D-08 檢查

- ProductCard 仍有 `role: "button"`、`tabIndex: 0`、`aria-label: 查看 ${product.name} 大圖`、onClick／onKeyDown；模板的 `selectedImage`／`showImageModal` 與 `<ImageModal>` 保留。
- `git diff --stat` 對 `src/services`、`src/hooks`、`src/App.tsx` 無輸出；`format.ts` 的 PRICE_ON_REQUEST 未動。
- `grep -rn dangerouslySetInnerHTML src` 無輸出（T-08-07）；錯誤卡文字只來自 getErrorMessage（T-08-08）。
- TOKEN_GREP 對 7 個元件／設定檔皆無輸出；dist CSS 含 `rotate-[0.4/0.6/0.8deg]` 與 `bg-surface/90`。

## Deviations from Plan

1. **[微調] 初次載入版面** — 計畫只要求「載入文字＋8 張骨架」；實作讓標題區、控制列與 chip 列在載入時照常顯示，只把列表區換成骨架（不再整頁替換），避免載入完成時版面跳動。「切換排序時保留舊列表並淡化」條件不變。
2. **[微調] renderPage 預設路徑** — 計畫寫 `initialPath = "/"`，實作沿用 08-02 既有的 `"/all-products"`，避免改動其他 17 項的執行環境。
3. **[微調] 檢視切換鈕** — 舊版為純圖示，新版加上可見文字「格狀」「列表」（aria-label 不變）；排序 `<select>` 補 `aria-label="排序方式"`（舊版是旁邊的可見文字，未關聯）。
4. **[微調] list 卡名稱** 加 `line-clamp-2 leading-card`，與 grid 卡一致，避免長名稱撐高列表卡。

未遇到權限守衛拒絕。

## Deferred Items

- `src/index.css` LEGACY 區塊的 `.product-card-new`、`.product-image(-container)`、`.product-overlay`、`.product-info`、`.product-title`、`.zoom-icon`、`.product-badge` 已無使用點（`glass-card` 仍被 HomePage／AboutPage 使用）。index.css 不在本 plan 檔案清單，留給收尾 plan（08-08）一併刪除。

## Known Stubs

無。`description` prop 保留在介面但不渲染，是新版面設計（UI-SPEC 列表頁不顯示分類描述），非資料未接線。

## Self-Check: PASSED

- src/components/ProductCardSkeleton.tsx 存在；7 個修改檔皆存在
- commits 84cdf00、0b8ac92 皆存在於 git log
