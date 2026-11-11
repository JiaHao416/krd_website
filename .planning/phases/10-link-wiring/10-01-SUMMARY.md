---
phase: 10-link-wiring
plan: 01
subsystem: ui
tags: [react-router, link, a11y, product-card, vitest]
requires:
  - phase: 09-product-detail
    provides: "/products/:id 路由與詳情頁"
  - phase: 08-shell-redesign
    provides: "ProductCard 新外觀（grid／list）、ProductPageTemplate 新版面"
provides:
  - "分類頁商品卡（grid／list）整張為連到 /products/{id} 的單一 Link"
  - "分類列表頁不再有燈箱（ImageModal 只留給詳情頁）"
affects: [10-02, 10-UAT, 11]
tech-stack:
  added: []
  patterns:
    - "測試檔內 render 包 MemoryRouter wrapper（rerender 沿用）"
    - "MemoryRouter + Routes + useParams 探針斷言導向路徑"
key-files:
  created: []
  modified:
    - src/components/ProductCard.tsx
    - src/components/ProductCard.test.tsx
    - src/pages/ProductPageTemplate.tsx
    - src/pages/ProductPageTemplate.test.tsx
key-decisions:
  - "ProductCard 不加 aria-label，連結名稱由卡內文字組成，h3 回到無障礙樹（修正 08-REVIEW IN-02）"
  - "ProductCard.test 以檔內 render 包 MemoryRouter 作為 harness，既有斷言不改"
requirements-completed: [LINK-01]
duration: 15min
completed: 2026-11-11
---

# Phase 10 Plan 01: 商品卡連到詳情頁 Summary

**分類頁 ProductCard（grid／list）改為 react-router `<Link to="/products/{id}">` 單一連結，移除 role=button／鍵盤處理／onImageClick 與列表頁 ImageModal；卡片語意測試改寫為導向詳情頁，測試 525 → 529。**

## Performance

- **Duration:** 約 15 分鐘
- **Completed:** 2026-11-11
- **Tasks:** 2
- **Files modified:** 4（＋本 SUMMARY）

## Accomplishments

- ProductCard grid 與 list 根元素皆為 `Link`（grid 加 `block`，list 保留 `flex`），移除 `cursorClass`；hover inset ring、傾斜、破圖佔位、tag 列不變；無任何 outline class，焦點環由全域 `:focus-visible` 提供
- ProductPageTemplate 刪除 ImageModal import、兩個 state、兩個 handler、`onImageClick` 傳遞與燈箱渲染
- 新增導向詳情頁、無 dialog、單一互動元素、accessible name、href 對應 id 的測試

## Task Commits

1. **Task 1：商品卡改 Link、移除燈箱、連帶測試改寫** - `b8dff61`（feat）
2. **Task 2：列表檢視導向與 href 對應回歸測試＋SUMMARY** - 見本 commit（test）

## 測試數

| 時點 | 總數（`npx vitest list \| wc -l`） | ProductCard.test | ProductPageTemplate.test |
|---|---|---|---|
| 起點（Phase 9 結束） | 525 | 25 | 22 |
| Task 1 後 | 527 | 27 | 22 |
| Task 2 後 | 529 | 27 | 24 |

## RED 證據（Task 1，未提交）

先改測試、元件未動時執行 `npx vitest run src/components/ProductCard.test.tsx src/pages/ProductPageTemplate.test.tsx`：**11 failed | 38 passed (49)**。

- ProductCard（8）：有圖整張卡為連結、Tab＋Enter 導向、list 單一連結無 button、缺圖仍為連結、破圖仍為連結、grid 與 list 只有一個互動元素（新增）、accessible name 由卡內文字組成（新增）、grid 卡內距 p-2 md:p-4（找不到 link）
- ProductPageTemplate（3）：點有圖卡片導向、缺圖點擊導向、Enter 導向（皆找不到探針文字／link）

實作後同指令 49 passed；全套 527 passed，lint、build（含 dist 掃描）全綠後才提交。

## 舊名／舊斷言 → 新名／新斷言（D-07）

ProductCard 的 describe 由「ProductCard 圖片與燈箱」改名為「ProductCard 圖片與連結」（同 describe 內未改寫的「破圖後換成新圖片網址會重新顯示 img」全名因此變動，斷言不變）。

| # | 舊名／舊斷言 | 新名／新斷言 | 06-TEST-INVENTORY 對應列 | 類型 |
|---|---|---|---|---|
| 1 | 有圖：img src 為 imageUrl，點擊呼叫 onImageClick 一次（點 `button /查看/`，onImageClick 被呼叫一次並帶 imageUrl） | 有圖：img src 為 imageUrl，整張卡為 href=/products/p1 的連結（img alt／src 斷言保留；`getByRole("link")` href=`/products/p1`） | 351 ProductCard 圖片與燈箱 > 有圖…onImageClick 一次 | 卡片語意 |
| 2 | 鍵盤 Enter 開燈箱（Tab 聚焦 `button /查看/`，Enter 呼叫 onImageClick） | 鍵盤 Tab 聚焦卡片連結，Enter 導向 /products/p1（link toHaveFocus，Enter 後出現「詳情頁 p1」） | 352 鍵盤 Enter 開燈箱 | 卡片語意 |
| 3 | 鍵盤 Space 開燈箱（list，Space 呼叫 onImageClick） | list：卡片為單一連結，沒有 role=button（button 0、link 1、href=/products/p1） | 353 鍵盤 Space 開燈箱 | 卡片語意 |
| 4 | 缺圖：顯示佔位、無按鈕、無放大提示，點擊不開燈箱 | 缺圖：顯示佔位、無 button、無放大提示，卡仍為連到 /products/p1 的連結（暫無圖片 role=img、無 button、無「點擊查看大圖」三斷言保留；「不呼叫 onImageClick」→ link href） | 354 缺圖… | 卡片語意 |
| 5 | 破圖：onError 後顯示佔位且點擊不開燈箱 | 破圖：onError 後顯示佔位，卡仍為連到 /products/p1 的連結（佔位斷言保留） | 355 破圖… | 卡片語意 |
| 6 | grid 卡內距 p-2 md:p-4（`getByRole("button", { name: /查看/ })`） | 同名（`getByRole("link")`；p-2、md:p-4 不變） | 360 grid 資訊區使用縮小的內距 py-4 px-5（Phase 8 依 08-04-SUMMARY 改名為「grid 卡內距 p-2 md:p-4」） | 卡片語意（查詢 role） |
| 7 | Template：點有圖卡片會開燈箱顯示該圖（卡片＋「產品詳細圖片」兩張同 src） | 點有圖卡片導向 /products/{id}，不出現 dialog（「詳情頁 a」、`queryByRole("dialog")` null） | 215 | 卡片語意＋harness（renderPageWithDetailRoute） |
| 8 | Template：缺圖商品顯示「暫無圖片」佔位圖，點擊不開燈箱（頁面無帶 src 的 img） | 缺圖商品顯示「暫無圖片」佔位圖，點擊導向 /products/{id} 且不出現 dialog（佔位 role=img 保留） | 216 | 卡片語意＋harness |
| 9 | Template：有圖卡片以 Enter 開啟燈箱（`button /查看 甲商品/`，燈箱 img src） | 有圖卡片以 Enter 導向 /products/{id}（`link /甲商品/` focus＋Enter，出現探針文字） | 228 | 卡片語意＋harness |

**只改 harness 的測試（斷言一字不改）：** ProductCard.test 其餘 19 項——價格顯示 8 項、破圖後換網址、描述與其他欄位 10 項（扣除卡內距）。改動僅為：檔內 `render` 改包 `MemoryRouter` wrapper（`rerender` 沿用），移除 `onImageClick={vi.fn()}` 屬性。ProductPageTemplate.test 其餘 19 項完全未動（`renderPage` 本來就包 MemoryRouter）。

**新增測試：**
- ProductCard：「grid 與 list 卡內只有一個互動元素：根連結」、「accessible name 由卡內文字組成：含商品名稱與價格文字，不含大圖」（含 h3 heading 可查到，IN-02）——RED 新增
- ProductPageTemplate「連到詳情頁」describe：「列表檢視點卡片導向 /products/{id}，不出現 dialog」、「每張卡的連結 href 對應各自的 id」——**非 RED 新增，屬回歸測試**（Task 1 後直接通過）

## 契約列確認

inventory 中 ProductCard／Template 標為「契約」的列，目前對應測試全名（皆在 `npx vitest list` 中）：

| inventory 列 | 目前測試全名 |
|---|---|
| 344 grid 有價… | ProductCard 價格顯示 > grid 有價：priceText 只顯示一次，不出現價格洽詢 |
| 345 grid 區間價 | ProductCard 價格顯示 > grid 區間價：價格行為 formatPriceRange 的輸出 |
| 346 只有 priceMax | ProductCard 價格顯示 > 只有 priceMax 有值時 grid 仍顯示價格文字 |
| 348 list 有價 | ProductCard 價格顯示 > list 有價：只顯示一次 priceText 且沒有徽章 |
| 351–355 圖片與燈箱 | ProductCard 圖片與連結 > 上表 #1–#5 新名 |
| 356 破圖後換網址 | ProductCard 圖片與連結 > 破圖後換成新圖片網址會重新顯示 img |
| 357 描述為 null | ProductCard 描述與其他欄位 > 描述為 null 時（grid 與 list）都不渲染描述段落 |
| 364 有描述時顯示… | ProductCard 描述與其他欄位 > 有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期 |
| 212 請求進行中 | ProductPageTemplate 基本載入與卡片 > 請求進行中顯示「正在載入產品資訊...」 |
| 213 顯示兩筆 | ProductPageTemplate 基本載入與卡片 > 顯示兩筆商品名稱 |
| 214 img alt | ProductPageTemplate 基本載入與卡片 > 有圖商品的 img alt 為商品名稱、src 為 imageUrl |
| 215／216／228 | 上表 #7／#8／#9 新名 |
| 217／218 排序 | ProductPageTemplate 排序 > query 鎖定 newest 時不顯示排序下拉；一般頁面選「最新優先」會以 sort=newest 重新呼叫後端 |
| 219–225 錯誤／空／淡化／截斷 | ProductPageTemplate 錯誤、空、淡化與截斷狀態 > 7 項全名未變（rate_limited…不洩漏後端原文、點「重新載入」…、查詢成功但沒有商品…、切換排序時保留舊列表並淡化…、切換排序後失敗…、truncated…、network…） |
| 227 aria-pressed | ProductPageTemplate 價格、檢視切換與鍵盤 > 切換列表檢視後 aria-pressed 更新，且仍顯示價格行 |

## D-02 檢查

`git diff --stat $BASE -- src/components/ImageModal.tsx src/components/ImageModal.test.tsx src/services src/hooks package.json package-lock.json` → 無輸出（ImageModal 兩檔、services、hooks、依賴皆未變）。

## Acceptance 檢查結果

- ProductCard 非註解行 `role="button"|tabIndex|onImageClick|onKeyDown|大圖|cursorClass` = 0、`outline-none` = 0、`/products/${product.id}` = 1
- ProductPageTemplate 非註解行 `ImageModal|selectedImage|showImageModal|handleImageClick|onImageClick` = 0
- ProductCard.test 無 `getByRole("button", { name: /查看/ })`；Template.test 無「產品詳細圖片」；`queryByRole("dialog")` = 3
- Task 1 commit 恰含 4 檔

## Deviations from Plan

None - plan executed exactly as written.（實作細節：路徑字串抽為區域常數 `detailPath` 後兩個 Link 共用，acceptance 字串仍在原始碼中。）

## Known Stubs

None.

## Next Phase Readiness

10-02（便條卡改 Link）可直接開始；總測試數起點 529。

## Self-Check: PASSED

- FOUND: src/components/ProductCard.tsx、src/pages/ProductPageTemplate.tsx 與兩測試檔
- FOUND: b8dff61
