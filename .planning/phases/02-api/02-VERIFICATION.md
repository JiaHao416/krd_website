---
phase: 02-api
verified: 2026-11-10T13:30:00Z
status: human_needed
score: 5/5 roadmap success criteria verified in code (SC4 後半「後台修改後重新整理即見變更」待人工)
overrides_applied: 0
human_verification:
  - test: "PROD-06：在 production 後台修改一筆商品（名稱／上下架／熱銷），等後端快取過期後重新整理官網"
    expected: "官網分類頁與首頁輪播顯示變更後的資料"
    why_human: "需改動 production 後台資料，且受後端快取時間限制；程式碼面已確認無前端快取（useProducts 每次掛載重新請求），但端到端未實測"
  - test: "push main 後確認 Cloudflare Pages 建置成功，且 Node 版本為 .nvmrc（24）"
    expected: "Pages build 綠燈、使用 Node 24、線上 *.krd.com.tw 商品正常載入"
    why_human: "push main 即上線，須由使用者操作；本機 npm test（168 通過）與 npm run build（成功）已驗證"
---

# Phase 2: 商品頁與首頁熱銷改讀後端 API 驗證報告

**Phase Goal:** 訪客在所有商品頁與首頁看到的商品，與家人在後台維護的資料一致，且載入、失敗、無資料都有明確畫面
**Status:** human_needed（無 gap；兩項需使用者執行）
**Re-verification:** 否（初次驗證）

## Observable Truths（ROADMAP Success Criteria）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 8 個分類頁商品與 BRIEF 對照表一致，現有網址可開 | VERIFIED | `src/services/catalog.ts` PRODUCT_PAGES 定義 8 條路徑與 brand/category/sort 查詢；`App.tsx` 由此產生 Route，路徑與舊版相同；UAT 測試 2：8 頁卡片集合與 API 完全一致（20/20/5/12/5/5/7/3） |
| 2 | 首頁兩組輪播為 featured=1／2，卡片顯示後端名稱與圖片，點圖放大 | VERIFIED | `HomePage.tsx` 以 `useProducts(HOME_FEATURED_QUERIES[0/1])` 驅動兩個 FeaturedCarousel；`buildProductParams` 送 featured=1/2；UAT 測試 1、4 通過（含鍵盤開燈箱） |
| 3 | 有價格顯示含稅價與區間；null 顯示「洽詢」 | VERIFIED | `format.ts`：分 ÷100、min≠max 顯示區間、雙 null 為 `PRICE_ON_REQUEST`（「價格洽詢」）；format.test.ts 與 ProductCard.test.tsx 涵蓋；UAT 以攔截回應重現邊界情況 |
| 4 | 「最新」排序依後端 published_at；修改後重新整理即見變更 | VERIFIED（程式碼）／人工待驗（端到端） | `buildProductParams` 送 `sort=newest`；/new-products 鎖定 newest；useProducts 無快取、每次掛載重新請求；UAT 測試 5 通過；端到端見 human_verification #1 |
| 5 | 載入／失敗（網路、5xx、429）／空狀態皆有畫面，含重試按鈕 | VERIFIED | `useProducts` 三態 loading/error/success；`fetchProducts` 失敗一律拋 ApiError（不吞成空陣列）；ProductPageTemplate ErrorCard 含重試；UAT 測試 6 通過；空狀態僅元件測試覆蓋（目前無空分類） |

**Score:** 5/5（SC4 端到端部分列人工）

## Required Artifacts / Wiring

| Artifact | Status | Details |
|----------|--------|---------|
| `src/services/products.ts`、`catalog.ts`、`format.ts`、`apiTypes.ts` | VERIFIED | 實質實作、被 hook 使用 |
| `src/hooks/useProducts.ts` | VERIFIED | 被 ProductPageTemplate 與 HomePage 呼叫；AbortController 處理取消 |
| `ProductCard.tsx`、`FeaturedCarousel.tsx`、`ImagePlaceholder.tsx` | VERIFIED | 已接線；資料經 hook 來自真實 API（Level 4 FLOWING） |
| `ProductPageTemplate.tsx`、`HomePage.tsx`、`App.tsx` | VERIFIED | 商品頁與首頁已不使用 `airTable`（僅 AboutPage／NavBar／SideMenu 仍用，屬 Phase 3 範圍） |

## Key Links

| From | To | Status |
|------|----|--------|
| App.tsx | catalog PRODUCT_PAGES + PRODUCT_PAGE_VIEWS | WIRED |
| ProductPageTemplate / HomePage | useProducts -> fetchProducts -> apiClient `/products` | WIRED |
| fetchProducts | toProduct（transform）-> ProductCard price/image | WIRED |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 測試套件 | `npm test` | 12 檔、168 測試全數通過 | PASS |
| 建置 | `npm run build`（含 tsc -b） | 成功，產出 dist | PASS |
| 瀏覽器 UAT | 02-UAT.md | 5 pass、1 issue（已由 02-06 解決並重測）、1 skipped、1 blocked | 見人工項目 |

## Requirements Coverage

PLAN frontmatter 宣告 ID 的聯集（02-01 至 02-06）涵蓋全部 10 個 ID，REQUIREMENTS.md 對應 Phase 2 的 ID 亦為這 10 個，無 ORPHANED。

| Requirement | Source Plan | Status | Evidence |
|-------------|-------------|--------|----------|
| PROD-01 | 02-02, 02-05 | SATISFIED | catalog.ts + App.tsx；UAT 測試 2 |
| PROD-02 | 02-03, 02-05 | SATISFIED | HomePage featured=1/2；UAT 測試 1 |
| PROD-03 | 02-02, 02-03, 02-04, 02-05 | SATISFIED | ProductCard/FeaturedCarousel 顯示後端名稱與圖片、燈箱；UAT 測試 4 |
| PROD-04 | 02-04, 02-05, 02-06 | SATISFIED | format.ts；grid 溢出 gap 已由 02-06 修正並實測 |
| PROD-05 | 02-02, 02-05 | SATISFIED | sort=newest；UAT 測試 5 |
| PROD-06 | 02-01, 02-02, 02-03, 02-05 | NEEDS HUMAN | 無前端快取已確認；後台修改反映未實測（REQUIREMENTS.md 亦標 Pending，應維持 Pending 直到人工驗證） |
| PROD-07 | 02-02, 02-05 | SATISFIED | 8 路徑不變；UAT 測試 2 |
| UX-01 | 02-01, 02-02, 02-03, 02-05 | SATISFIED | useProducts loading 狀態 |
| UX-02 | 02-01, 02-02, 02-03, 02-05 | SATISFIED | ApiError + ErrorCard 重試；UAT 測試 6 |
| UX-03 | 02-02, 02-03, 02-05 | SATISFIED | 空狀態元件，由元件測試覆蓋（UAT 無空分類可實測） |

## Anti-Patterns

src 內無 TBD/FIXME/XXX。Airtable 殘留僅在 AboutPage、NavBar、SideMenu、services/index.ts，屬 Phase 3 範圍（STAT-01..03、SEC-01、SEC-04），不計為 gap。

## Code Review 警告評估（02-REVIEW.md，0 critical / 6 warnings）

| 警告 | 是否阻擋目標 | 判斷 |
|------|--------------|------|
| WR-01 價格欄位缺漏 -> NT$NaN | 否 | `apiTypes.ts` 與 Phase 1 契約皆定義 price_min/max 為 `number \| null`（必有欄位），缺漏屬契約外情況；建議加固，非 gap |
| WR-02 只有 priceMax 時樣式判斷 | 否 | 後端保證 min/max 成對，實務不觸發；建議修正 |
| WR-03 輪播圖片無 onError | 否（建議修） | 僅影響圖片 URL 失效時的外觀；production 現無破圖。與 PROD-03「點圖放大」無衝突；ProductCard 已有 fallback |
| WR-04 截斷提示寫死 100 | 否 | 文案準確度問題，不影響資料一致性 |
| WR-05 error 時 items 殘留 | 否 | 目前 UI 在 error 時以 ErrorCard 取代列表，行為正確 |
| WR-06 輪播自動播放無法暫停 | 否 | 無障礙改進，不屬 Phase 2 需求 |

建議後續以 quick task 處理 WR-01、WR-02、WR-03。

## Human Verification Required

1. **PROD-06 後台修改反映**：改動 production 後台商品，快取過期後重新整理官網，確認變更可見。
2. **Cloudflare Pages 建置**：push main 後確認建置成功、Node 24（.nvmrc），線上商品正常載入。

## Gaps Summary

無阻擋 gap。程式碼、測試（168）、建置與瀏覽器 UAT 均支持階段目標。僅 PROD-06 端到端與 Pages 建置須使用者執行；完成前 PROD-06 應維持 Pending。

---

_Verified: 2026-11-10T13:30:00Z_
_Verifier: Claude (gsd-verifier)_
