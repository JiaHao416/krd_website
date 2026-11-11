# Phase 6 — 測試盤點（TEST-06）

## 基準

- 基準：215 項／17 個檔（2026-11-11）
- 來源指令：`npx vitest list`（`it.each` 已逐項展開，每個展開項各佔一列，D-02、D-03）
- 本文件涵蓋全部 17 個檔、215 列：資料層 8 個 unit 檔與 5 個低影響 component 檔（157 列），加重設計高影響的 4 個檔（SideMenu、NavBar、FeaturedCarousel、ProductCard，58 列）；另有 accessible name 契約清單。
- 名稱比對與列數驗證：

```bash
# 列數
grep -c '^| src/' .planning/phases/06-design-lock/06-TEST-INVENTORY.md
# 名稱 diff（須無差異）
diff <(npx vitest list 2>/dev/null | sed 's/^\[[^]]*\] //' | LC_ALL=C sort) \
     <(grep '^| src/' .planning/phases/06-design-lock/06-TEST-INVENTORY.md | sed -e 's/^| //' -e 's/ | .*$//' | LC_ALL=C sort)
```

## 欄位說明與分類規則

逐條清單每列欄位：測試（vitest list 全名）、分類（契約／呈現）、契約類型、影響 phase、預定處置、備註。

- D-05 契約範圍：role、accessible name、aria 狀態、路由／href、錯誤狀態、狀態機／計時、資料轉換、憑證掃描。
- D-06：unit 檔預設全為契約。
- D-07：文案斷言依 UI-SPEC Copywriting Contract 是否保留原字串判定；保留者為契約，被改字串者為呈現（或歸混合型）。
- D-08：className 與 data-testid 斷言為呈現；`data-testid="product-description"` 標「保留」。
- D-09：混合型歸契約，並在備註列出可隨設計調整的斷言。
- D-10：UI-SPEC 已規劃的改寫照抄於備註。
- 預定處置值：`保留`、`調整斷言`、`改寫為新元件同語意測試`。

**分類為契約的列，後續 phase 不得刪除其斷言；只能保留、調整斷言或改寫為新元件同語意測試。**

## 後續 phase 使用方式

- Phase 7–11 每個 phase 的 VERIFICATION 須執行 `npm test` 並記錄總數 ≥ 215，且對照本文件確認契約列沒有被刪除（D-12：人工對照，不在 repo 加自動化數量檢查腳本）。
- 測試改名時，在對應 phase 的 SUMMARY 記錄「舊名 → 新名」。

## 各檔摘要

| 檔案 | project | 項數 | 契約 | 呈現 | 影響 phase |
|---|---|---|---|---|---|
| `src/services/products.test.ts` | unit | 30 | 30 | 0 | 無 |
| `src/services/transform.test.ts` | unit | 18 | 18 | 0 | 無 |
| `src/services/errors.test.ts` | unit | 17 | 17 | 0 | 無 |
| `src/services/catalog.test.ts` | unit | 14 | 14 | 0 | 無 |
| `src/services/format.test.ts` | unit | 10 | 10 | 0 | 無 |
| `src/services/client.test.ts` | unit | 6 | 6 | 0 | 無 |
| `src/config/navigation.test.ts` | unit | 4 | 4 | 0 | 無 |
| `src/noAirtable.test.ts` | unit | 7 | 7 | 0 | 無 |
| `src/pages/ProductPageTemplate.test.tsx` | component | 17 | 16 | 1 | 8、10 |
| `src/hooks/useProducts.test.tsx` | component | 13 | 13 | 0 | 無 |
| `src/App.test.tsx` | component | 11 | 11 | 0 | 8 |
| `src/pages/HomePage.test.tsx` | component | 7 | 6 | 1 | 8 |
| `src/pages/AboutPage.test.tsx` | component | 3 | 3 | 0 | 8 |
| `src/components/SideMenu.test.tsx` | component | 5 | 3 | 2 | 8 |
| `src/components/NavBar.test.tsx` | component | 14 | 13 | 1 | 8 |
| `src/components/FeaturedCarousel.test.tsx` | component | 18 | 18 | 0 | 8、10 |
| `src/components/ProductCard.test.tsx` | component | 21 | 12 | 9 | 8、10 |
| **合計** | — | 215 | 201 | 14 | — |

## 逐條清單：資料層與低影響檔案

### src/services/products.test.ts（30 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/products.test.ts > fetchProducts > 回傳轉換後的商品列表 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 回傳後端的商品總數 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 價格皆為 null 的商品顯示價格洽詢 | 契約 | 資料轉換 | 無 | 保留 | 價格洽詢字串屬資料層文案，常數是否更動見〈待 Phase 8 決定〉A1 |
| src/services/products.test.ts > fetchProducts > 商品已轉成 camelCase 的 Product | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 缺圖商品的 imageUrl 為 null | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 查無商品時回傳空結果而不拋錯 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 請求打到 /products 並帶上查詢參數 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 串接 buildProductParams 後中文分類正確 encode | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 串接首頁熱銷查詢帶上 featured=2 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > HTTP 429 拋出 rate_limited | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > HTTP 500 拋出 http 並帶 status | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 失敗時拋出 ApiError 實例 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 網路錯誤拋出 network | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 請求被取消時拋出 canceled | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 200 但 success:false 拋出 invalid_response | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 200 但回傳 HTML（SPA fallback）拋出 invalid_response | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 200 但 items 不是陣列拋出 invalid_response | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > name 為 null 的商品被略過，其餘商品照常回傳 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 元素為 null 時被略過而不拋出 TypeError | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > in_stock 不是布林值的商品被略過 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 價格欄位缺漏或為字串時視為價格洽詢，不顯示 NaN | 契約 | 資料轉換 | 無 | 保留 | 價格洽詢字串屬資料層文案，常數是否更動見〈待 Phase 8 決定〉A1 |
| src/services/products.test.ts > fetchProducts > image_url 不是字串時視為缺圖 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > 略過格式不符的商品時 console.warn 一次 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > HTTP 500 時只發出一次請求（不自動重試） | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > total 大於取得筆數時 console.warn 一次 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > total 大於取得筆數時 truncated 為 true | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > total 等於筆數時 truncated 為 false | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts > total 等於筆數時不 console.warn | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts 取消支援 > 傳入 signal 時會原樣傳給 axios adapter | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/products.test.ts > fetchProducts 取消支援 > signal 已 abort 時拋出 kind 為 canceled 的 ApiError | 契約 | 錯誤狀態 | 無 | 保留 |  |

### src/services/transform.test.ts（18 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/transform.test.ts > toProduct 欄位對應 > image_url 對應為 imageUrl | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > published_at 對應為 publishedAt | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > featured_group 為 null 時 featuredGroup 為 null | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > featured_group 為 2 時對應為 featuredGroup | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > warranty_period_months 對應為 warrantyPeriodMonths | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > in_stock 對應為 inStock | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 欄位對應 > category 原樣保留 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 價格 > 價格皆為 null 時 priceText 為價格洽詢 | 契約 | 資料轉換 | 無 | 保留 | 價格洽詢字串，見〈待 Phase 8 決定〉A1 |
| src/services/transform.test.ts > toProduct 價格 > 價格區間產生 priceText | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 價格 > priceMin 保留後端原始分值 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > image_url 為 null 時 imageUrl 為 null | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > image_url 為空字串時 imageUrl 為 null | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > name 為空字串時退回 brand 與 model | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > name 只有空白且 model 為 null 時只用 brand | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > 有名稱時不使用 fallback | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > name 前後有空白時回傳 trim 後的名稱 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > name 空白且 brand 與 model 皆為 null 時使用保底文案 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/transform.test.ts > toProduct 缺圖與名稱 fallback > name 空白且 brand 與 model 只有空白時使用保底文案 | 契約 | 資料轉換 | 無 | 保留 |  |

### src/services/errors.test.ts（17 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/errors.test.ts > normalizeError > 無 response 的網路錯誤歸類為 network | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 無 response 的 timeout 歸類為 network | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 被取消的請求歸類為 canceled 而非 network | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 429 歸類為 rate_limited | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 429 保留 status | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 500 歸類為 http 並保留 status | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 404 歸類為 http 並保留 status | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 優先採用後端 error.message 作為 ApiError.message | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 既有 ApiError 回傳同一個實例 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 一般 Error 歸類為 invalid_response | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 字串歸類為 invalid_response | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > normalizeError > 任意值也會回傳 ApiError 且為 Error 實例 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > getErrorMessage > rate_limited 回傳限流訊息 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > getErrorMessage > network 回傳連線訊息 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > getErrorMessage > http 回傳通用訊息 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > getErrorMessage > invalid_response 回傳通用訊息 | 契約 | 錯誤狀態 | 無 | 保留 |  |
| src/services/errors.test.ts > getErrorMessage > 原始 429 AxiosError 也能轉成限流訊息 | 契約 | 錯誤狀態 | 無 | 保留 |  |

### src/services/catalog.test.ts（14 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/catalog.test.ts > PRODUCT_PAGES 設定 > 8 個商品頁路徑順序即導覽順序 | 契約 | 路由／href | 無 | 保留 |  |
| src/services/catalog.test.ts > PRODUCT_PAGES 設定 > PRODUCT_LIMIT 為 100 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 全部商品無使用者排序只送 limit | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 全部商品使用者選名稱排序會送 sort=name | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 新品頁鎖定 newest，使用者排序不覆蓋 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > MICGO 品牌頁送 brand=MICGO | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > KRD 品牌頁搭配使用者排序 newest | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 有線麥克風分類的中文會被 percent-encode | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 無線麥克風分類的中文會被 percent-encode | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 喇叭分類的中文會被 percent-encode | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 頁面 → 查詢字串 > 配件分類的中文會被 percent-encode | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 首頁熱銷查詢 > 熱銷 1 有 featured 時不送 sort | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > 首頁熱銷查詢 > 熱銷 2 只送 featured 與 limit | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/catalog.test.ts > buildProductParams > 空字串的 brand 與 category 不會送出 | 契約 | 資料轉換 | 無 | 保留 |  |

### src/services/format.test.ts（10 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/format.test.ts > formatPrice > 整數價格顯示千分位且無小數 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPrice > 有小數時最多顯示 2 位 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPrice > 小數不補零 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPrice > 0 元顯示 NT$0 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPriceRange > 最低與最高不同時顯示區間（en dash） | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPriceRange > 最低與最高相同時只顯示一個價格 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPriceRange > 只有最低價時顯示最低價 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPriceRange > 只有最高價時顯示最高價 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/format.test.ts > formatPriceRange > 兩邊皆 null 時顯示價格洽詢 | 契約 | 資料轉換 | 無 | 保留 | 價格洽詢字串，見〈待 Phase 8 決定〉A1 |
| src/services/format.test.ts > formatPriceRange > PRICE_ON_REQUEST 文案為「價格洽詢」 | 契約 | 資料轉換 | 無 | 保留 | 常數值是否更動為 Phase 8 決定，見〈待 Phase 8 決定〉A1 |

### src/services/client.test.ts（6 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/services/client.test.ts > resolveBaseUrl > 未設定環境變數時回傳 production 預設網址 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/client.test.ts > resolveBaseUrl > 空字串視同未設定，回傳預設網址 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/client.test.ts > resolveBaseUrl > 有設定時直接使用設定值 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/client.test.ts > createApiClient > 使用傳入的 baseURL | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/client.test.ts > createApiClient > timeout 為 10000 毫秒 | 契約 | 資料轉換 | 無 | 保留 |  |
| src/services/client.test.ts > createApiClient > 新 client 不帶憑證 header | 契約 | 憑證掃描 | 無 | 保留 |  |

### src/config/navigation.test.ts（4 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/config/navigation.test.ts > NAV_ITEMS > 路徑等於 PRODUCT_PAGES | 契約 | 路由／href | 無 | 保留 | UI-SPEC：navigation.test.ts 不受影響 |
| src/config/navigation.test.ts > NAV_ITEMS > 標題等於 PRODUCT_PAGE_VIEWS | 契約 | 路由／href | 無 | 保留 | UI-SPEC：navigation.test.ts 不受影響 |
| src/config/navigation.test.ts > NAV_ITEMS > 順序符合現行選單 | 契約 | 路由／href | 無 | 保留 | UI-SPEC：navigation.test.ts 不受影響 |
| src/config/navigation.test.ts > NAV_ITEMS > 不含商店介紹 | 契約 | 路由／href | 無 | 保留 | UI-SPEC：navigation.test.ts 不受影響 |

### src/noAirtable.test.ts（7 項，unit）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 掃描檔案數量合理（避免 glob 失效而空轉） | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 不含 airtable 字樣 | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 不含 Airtable API 網址 | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 不含 Base ID 格式 | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 不含 PAT 格式 | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 原始碼不得含 Airtable 痕跡 > 不含 舊式 API key 格式 | 契約 | 憑證掃描 | 無 | 保留 |  |
| src/noAirtable.test.ts > 規則與 scripts/check-dist.mjs 一致 > 兩邊的 FORBIDDEN 清單逐條相同（名稱、regex 與 flags） | 契約 | 憑證掃描 | 無 | 保留 |  |

### src/pages/ProductPageTemplate.test.tsx（17 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 基本載入與卡片 > 請求進行中顯示「正在載入產品資訊...」 | 契約 | 狀態機／計時 | 8 | 調整斷言 | 文案可隨設計調整；新字串由 Phase 8 決定，見〈待 Phase 8 決定〉A2 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 基本載入與卡片 > 顯示兩筆商品名稱 | 契約 | 資料轉換 | 8 | 保留 | 商品名稱顯示 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 基本載入與卡片 > 有圖商品的 img alt 為商品名稱、src 為 imageUrl | 契約 | role、accessible name | 8 | 保留 | img alt 為商品名稱 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 基本載入與卡片 > 點有圖卡片會開燈箱顯示該圖 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 改為整張卡連到 /products/{id}，燈箱移到詳情頁主圖 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 基本載入與卡片 > 缺圖商品顯示「暫無圖片」佔位圖，點擊不開燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 改為整張卡連到 /products/{id}，燈箱移到詳情頁主圖 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 排序 > query 鎖定 newest 時不顯示排序下拉 | 契約 | role、狀態機／計時 | 8 | 保留 |  |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 排序 > 一般頁面選「最新優先」會以 sort=newest 重新呼叫後端 | 契約 | role、狀態機／計時 | 8 | 保留 |  |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > rate_limited 顯示錯誤卡片與友善文案，不洩漏後端原文 | 契約 | 錯誤狀態 | 8 | 調整斷言 | 不洩漏後端原文為契約；429 文案可調整，新字串「現在逛的人有點多，等幾秒再試一次。」 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > 點「重新載入」會再呼叫一次 API | 契約 | 錯誤狀態 | 8 | 保留 | 重新載入 button 為 UI-SPEC 保留的 accessible name；空狀態文案可調整（新字串「這裡還沒有商品」） |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > 查詢成功但沒有商品顯示空狀態，不出現「請稍後再試」 | 契約 | 錯誤狀態 | 8 | 調整斷言 | 文案可隨設計調整；空狀態新字串「這裡還沒有商品」 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > 切換排序時保留舊列表並淡化，不顯示整頁 spinner | 契約 | aria 狀態、狀態機／計時 | 8 | 保留 | aria-busy 為契約；淡化樣式斷言為呈現成分，可調整 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > 切換排序後失敗顯示錯誤卡片 | 契約 | 錯誤狀態 | 8 | 保留 |  |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > truncated 為 true 時顯示截斷提示，false 時不顯示 | 契約 | 狀態機／計時 | 8 | 調整斷言 | 截斷提示存在與否為契約；新字串由 Phase 8 決定，見〈待 Phase 8 決定〉A2 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 錯誤、空、淡化與截斷狀態 > network 錯誤顯示連線文案 | 契約 | 錯誤狀態 | 8 | 調整斷言 | 連線文案可隨設計調整；錯誤狀態為契約 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 價格、檢視切換與鍵盤 > 同時顯示有價商品的 priceText 與無價商品的「價格洽詢」 | 呈現 | — | 8 | 調整斷言 | 價格洽詢文字斷言；UI-SPEC 新字串「價格請來電」；priceText（NT$…）保留 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 價格、檢視切換與鍵盤 > 切換列表檢視後 aria-pressed 更新，且仍顯示價格行 | 契約 | role、accessible name、aria 狀態 | 8 | 保留 | 格狀檢視／列表檢視為 UI-SPEC 保留功能；Phase 8 驗證 aria-label 沿用 |
| src/pages/ProductPageTemplate.test.tsx > ProductPageTemplate 價格、檢視切換與鍵盤 > 有圖卡片以 Enter 開啟燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 改為整張卡連到 /products/{id}，燈箱移到詳情頁主圖 |

### src/hooks/useProducts.test.tsx（13 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/hooks/useProducts.test.tsx > useProducts > 請求進行中 status 為 loading | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 成功時回傳商品與 truncated | 契約 | 資料轉換 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 失敗時 status 為 error 並保留 ApiError | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 空結果仍是 success 且 items 為空 | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > retry 會再次呼叫 fetchProducts 並回到 loading | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > retry 後第二次成功會變成 success | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > canceled 錯誤不會讓 status 變成 error | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 參數改變時重新抓取，等待期間保留舊 items | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > unmount 後前一次請求的 signal 已 abort | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 以 buildProductParams 的結果呼叫 fetchProducts 且不傳 client | 契約 | 資料轉換 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 不快取：同參數重新掛載會再抓一次 | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > 每次 render 傳入內容相同的新 query 物件不會重抓 | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |
| src/hooks/useProducts.test.tsx > useProducts > StrictMode 下最終為 success，且第一次請求已被 abort | 契約 | 狀態機／計時 | 無 | 保留 | 與 UI 無關 |

### src/App.test.tsx（11 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/App.test.tsx > App 商品路由 > PRODUCT_PAGES 的路徑集合與舊網址完全相同 | 契約 | 路由／href | 8 | 保留 | 版面改但路由不變 |
| src/App.test.tsx > App 商品路由 > 每個路徑都有非空 title 的 UI 設定 | 契約 | 路由／href | 8 | 保留 | 版面改但路由不變 |
| src/App.test.tsx > App 商品路由 > /all-products 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /new-products 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /krd-products 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /micgo-products 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /wireless-micphone 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /wired-micphone 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /trumpet 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > /accessories 顯示頁面標題並以對應查詢呼叫後端 | 契約 | 路由／href | 8 | 保留 | 同一個 it.each；頁面標題文字取自 title，路由不變 |
| src/App.test.tsx > App 商品路由 > 從一個商品頁切到另一個商品頁時排序回到 name | 契約 | 路由／href、狀態機／計時 | 8 | 保留 | 排序控制 combobox；版面改但路由不變 |

### src/pages/HomePage.test.tsx（7 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/pages/HomePage.test.tsx > HomePage 熱銷輪播資料來源 > 分別以 featured=1 與 featured=2 呼叫 fetchProducts | 契約 | 資料轉換 | 無 | 保留 | 資料來源契約 |
| src/pages/HomePage.test.tsx > HomePage 熱銷輪播資料來源 > 兩組區塊各自顯示對應 featured 的商品 | 契約 | 資料轉換 | 8 | 調整斷言 | 區塊標題取得方式隨新標題「這陣子大家都在問」調整，featured 對應的商品內容為契約 |
| src/pages/HomePage.test.tsx > HomePage 熱銷輪播資料來源 > 首頁不顯示價格與價格洽詢 | 呈現 | — | 8 | 調整斷言 | UI-SPEC 便條卡底列顯示價格或「價格請來電」，與此斷言衝突 |
| src/pages/HomePage.test.tsx > HomePage 熱銷輪播資料來源 > 沒有圖片的熱銷商品顯示暫無圖片佔位 | 契約 | role、accessible name | 8 | 保留 | UI-SPEC Copywriting Contract 保留「暫無圖片」 |
| src/pages/HomePage.test.tsx > HomePage 兩組輪播互相獨立 > 一組失敗時另一組仍顯示商品 | 契約 | 錯誤狀態 | 8 | 保留 | role=alert 與空狀態為契約；區塊標題改為「這陣子大家都在問」，需確認查詢區塊的方式 |
| src/pages/HomePage.test.tsx > HomePage 兩組輪播互相獨立 > 兩組同時 429 時各自在自己的區塊顯示錯誤 | 契約 | 錯誤狀態 | 8 | 保留 | role=alert 與空狀態為契約；區塊標題改為「這陣子大家都在問」，需確認查詢區塊的方式 |
| src/pages/HomePage.test.tsx > HomePage 兩組輪播互相獨立 > 兩組都沒有商品時各自顯示空狀態 | 契約 | 錯誤狀態 | 8 | 保留 | role=alert 與空狀態為契約；區塊標題改為「這陣子大家都在問」，需確認查詢區塊的方式 |

### src/pages/AboutPage.test.tsx（3 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/pages/AboutPage.test.tsx > AboutPage 服務圖卡 > 首屏同步顯示 6 張圖卡，圖片 src 為 /abouts/*.png 且順序正確 | 契約 | 資料轉換 | 8 | 保留 | ABOUT_SERVICES 內容契約 |
| src/pages/AboutPage.test.tsx > AboutPage 服務圖卡 > 圖卡標題 h4 依序為 卡拉OK／KTV／酒店／PUB／遊覽車／維修 | 契約 | 資料轉換 | 8 | 保留 | ABOUT_SERVICES 內容契約；heading level 為呈現成分，可隨版面調整（D-09） |
| src/pages/AboutPage.test.tsx > AboutPage 服務圖卡 > 不再顯示載入骨架 | 契約 | 狀態機／計時 | 8 | 保留 | 不再顯示載入骨架（斷言 className，改版後同步調整） |

## 逐條清單：重設計高影響檔案

### src/components/SideMenu.test.tsx（5 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/components/SideMenu.test.tsx > SideMenu > 首屏依序顯示 8 個導覽項目 | 契約 | role、accessible name | 8 | 改寫為新元件同語意測試 | 改為 CategoryChips 同語意測試；role button→link，name 不變；8 項順序不變 |
| src/components/SideMenu.test.tsx > SideMenu > 目前頁面按鈕有 active 樣式 | 呈現 | — | 8 | 改寫為新元件同語意測試 | 改為 CategoryChips 同語意測試；role button→link，name 不變；僅斷言 className，改以 aria-current="page" 驗證現在位置 |
| src/components/SideMenu.test.tsx > SideMenu > 其他按鈕沒有 active 樣式 | 呈現 | — | 8 | 改寫為新元件同語意測試 | 改為 CategoryChips 同語意測試；role button→link，name 不變；僅斷言 className，改以非現在位置無 aria-current 驗證 |
| src/components/SideMenu.test.tsx > SideMenu > 點擊 KRD 後導向 /krd-products | 契約 | 路由／href | 8 | 改寫為新元件同語意測試 | 改為 CategoryChips 同語意測試；role button→link，name 不變；點擊後導向 /krd-products |
| src/components/SideMenu.test.tsx > SideMenu > 沒有骨架載入元素 | 契約 | 狀態機／計時 | 8 | 改寫為新元件同語意測試 | 改為 CategoryChips 同語意測試；role button→link，name 不變；無骨架載入元素（斷言 .animate-pulse，可隨設計調整） |

### src/components/NavBar.test.tsx（14 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/components/NavBar.test.tsx > NavBar Logo > 使用靜態 Logo 路徑與尺寸 | 契約 | accessible name | 8 | 保留 | Logo 兩項保留之一：/brand-logo.png 800×235 |
| src/components/NavBar.test.tsx > NavBar Logo > 載入失敗後改顯示文字並移除圖片 | 契約 | 狀態機／計時 | 8 | 保留 | Logo 兩項保留之一：失敗後文字備援 KRD MICGO |
| src/components/NavBar.test.tsx > NavBar Logo > 初次渲染不顯示文字備援 | 契約 | 狀態機／計時 | 8 | 保留 | 初次不顯示文字備援 |
| src/components/NavBar.test.tsx > NavBar 選單 > 所有商品 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 最新商品 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > KRD 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > MICGO 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 無線麥克風 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 有線麥克風 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 擴大機 / 喇叭 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 配件 在桌機與手機各有一個按鈕 | 契約 | accessible name | 8 | 改寫為新元件同語意測試 | 分類名改在 chip 列驗證；「桌機與手機各一個」為呈現結構，可隨設計調整；role button→link |
| src/components/NavBar.test.tsx > NavBar 選單 > 桌機選單依序為 8 項加商店介紹 | 契約 | role | 8 | 改寫為新元件同語意測試 | 改寫為頂列依序：逛商品、關於我們、打電話問問＋NAV_ITEMS 8 項在 chip 列 |
| src/components/NavBar.test.tsx > NavBar 選單 > 商店介紹按鈕存在 | 呈現 | — | 8 | 調整斷言 | D-07：UI-SPEC 改字串，新字串「關於我們」 |
| src/components/NavBar.test.tsx > NavBar 選單 > 點擊無線麥克風後導向 /wireless-micphone | 契約 | 路由／href | 8 | 改寫為新元件同語意測試 | 移到 chip 測試：點擊無線麥克風導向 /wireless-micphone |

Phase 8 需新增「打電話問問 href=tel:…」與「選單鈕 aria-expanded」測試以維持測試總數。

### src/components/FeaturedCarousel.test.tsx（18 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 狀態 > 載入中顯示「載入產品中...」 | 契約 | 狀態機／計時 | 8、10 | 保留 | 載入中文案保留；A2 新字串由 Phase 8 決定 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 狀態 > 失敗時只顯示固定中文訊息，並可重新載入 | 契約 | 錯誤狀態 | 8、10 | 調整斷言 | 429 文案新字串「現在逛的人有點多，等幾秒再試一次。」；「不洩漏後端原文」「重新載入」仍為契約 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 狀態 > 成功但沒有商品時顯示「目前沒有精選商品」 | 契約 | 狀態機／計時 | 8、10 | 保留 | 空狀態「目前沒有精選商品」 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 操控 > 只有一筆時不顯示箭頭與指示點 | 契約 | accessible name | 8、10 | 保留 | 只有一筆不顯示下一張／第 1 張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 操控 > 三筆時有箭頭與指示點，點下一張顯示第二筆 | 契約 | accessible name | 8、10 | 調整斷言 | 改為「視窗第一張變成第二筆」；上一張／下一張／第 N 張 name 保留；Phase 10 新增 link 測試 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 圖片載入失敗 > 圖片載入失敗時改顯示佔位圖，不留破圖 | 契約 | role | 8、10 | 調整斷言 | 改為針對視窗內對應卡的佔位圖（暫無圖片 role=img 保留） |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 自動播放 > 成功且多筆時依 intervalMs 切換下一筆 | 契約 | 狀態機／計時 | 8、10 | 保留 | Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 自動播放 > 載入中推進時間不報錯也不切換 | 契約 | 狀態機／計時 | 8、10 | 保留 | 載入中不切換；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 系統偏好減少動態時不自動切換，手動仍可切換 | 契約 | 狀態機／計時 | 8、10 | 調整斷言 | 減少動態；視窗斷言依 UI-SPEC 調整；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 滑鼠移入時不自動切換，移出後恢復 | 契約 | 狀態機／計時 | 8、10 | 保留 | 指標類型暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 觸控進入輪播時不暫停，仍會自動切換 | 契約 | 狀態機／計時 | 8、10 | 保留 | 指標類型暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 焦點在輪播內時不自動切換，焦點離開後恢復 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 用滑鼠點擊按鈕取得焦點時不暫停，仍會自動切換 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 觸控點擊按鈕取得焦點時不暫停，仍會自動切換 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 觸控點擊後再以鍵盤讓焦點進入，仍會暫停 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 觸控被取消（pointercancel）後鍵盤焦點仍會暫停 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 觸控點在非按鈕區域後鍵盤焦點仍會暫停 | 契約 | 狀態機／計時 | 8、10 | 保留 | 焦點／指標暫停邏輯，狀態機不動；Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |
| src/components/FeaturedCarousel.test.tsx > FeaturedCarousel 暫停自動播放 > 手動切換後重新計時，不會在原排程時間被切走 | 契約 | 狀態機／計時 | 8、10 | 保留 | Phase 8 第一個 commit 先擴充 matchMedia mock 處理 max-width: 767px；商品N 文字斷言若視窗同時顯示多筆須改為視窗第一張 |

### src/components/ProductCard.test.tsx（21 項，component）

| 測試（vitest list 全名） | 分類 | 契約類型 | 影響 phase | 預定處置 | 備註 |
|---|---|---|---|---|---|
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > grid 有價：徽章與價格行各顯示一次 priceText，不出現價格洽詢 | 契約 | 資料轉換 | 8 | 調整斷言 | 徽章與價格行各顯示一次：UI-SPEC 移除價格徽章，改為只顯示一次；「不出現價格洽詢」保留 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > grid 區間價：價格行為 formatPriceRange 的輸出 | 契約 | 資料轉換 | 8 | 調整斷言 | 價格文字為資料轉換契約；UI-SPEC 移除價格徽章，出現次數 2 改為 1 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > 只有 priceMax 有值時 grid 仍顯示價格徽章 | 契約 | 資料轉換 | 8 | 調整斷言 | 價格文字為資料轉換契約；UI-SPEC 移除價格徽章，出現次數 2 改為 1 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > grid 無價：顯示價格洽詢且沒有徽章 | 呈現 | — | 8 | 調整斷言 | D-07：卡片無價顯示 tag「價格請來電」；.product-badge 斷言隨徽章移除 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > list 有價：只顯示一次 priceText 且沒有徽章 | 契約 | 資料轉換 | 8 | 保留 | list 有價只顯示一次 priceText；.product-badge 斷言為呈現 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > list 無價：顯示價格洽詢 | 呈現 | — | 8 | 調整斷言 | D-07：新字串「價格請來電」 |
| src/components/ProductCard.test.tsx > ProductCard 價格顯示 > 價格洽詢使用灰色而非 accent 色 | 呈現 | — | 8 | 調整斷言 | className（text-gray-500）斷言為呈現（D-08）；新字串「價格請來電」 |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 有圖：img src 為 imageUrl，點擊呼叫 onImageClick 一次 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 改為整張卡連到 /products/{id}，燈箱移到詳情頁主圖；img alt／src 斷言保留 |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 鍵盤 Enter 開燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 改為整張卡連到 /products/{id}；Enter 啟動 link |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 鍵盤 Space 開燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | Phase 10 依 LINK-01 移除 role=button／Space 開燈箱（onImageClick 移除） |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 缺圖：顯示佔位、無按鈕、無放大提示，點擊不開燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | 暫無圖片 role=img 保留；「無按鈕」與「點擊查看大圖」提示隨 LINK-01 與 UI-SPEC 刪除提示調整 |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 破圖：onError 後顯示佔位且點擊不開燈箱 | 契約 | role、accessible name | 10 | 調整斷言 | 破圖佔位「暫無圖片」保留；點擊不開燈箱依 LINK-01 改寫（Phase 10） |
| src/components/ProductCard.test.tsx > ProductCard 圖片與燈箱 > 破圖後換成新圖片網址會重新顯示 img | 契約 | 資料轉換 | 8 | 保留 | 破圖後換網址重新顯示 img |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > 描述為 null 時（grid 與 list）都不渲染描述段落 | 契約 | 資料轉換 | 8 | 保留 | 保留（D-08）：data-testid="product-description" 不渲染斷言 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > grid 描述只顯示一行（line-clamp-1），避免卡片溢出 | 呈現 | — | 8 | 調整斷言 | className（line-clamp-1）斷言為呈現（D-08）；data-testid="product-description" 保留 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > list 描述維持兩行（line-clamp-2） | 呈現 | — | 8 | 調整斷言 | className（line-clamp-2）斷言為呈現（D-08）；data-testid="product-description" 保留 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > grid 資訊區使用縮小的內距 py-4 px-5 | 呈現 | — | 8 | 調整斷言 | className（py-4 px-5）斷言為呈現（D-08） |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > grid 價格行間距為 mb-1，list 價格行維持 mb-2（有價） | 呈現 | — | 8 | 調整斷言 | className（mb-1／mb-2）與 .product-badge 斷言為呈現；UI-SPEC 移除價格徽章 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > grid 價格洽詢行間距為 mb-1，list 為 mb-2 | 呈現 | — | 8 | 調整斷言 | className（mb-1／mb-2）斷言為呈現；新字串「價格請來電」 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > grid 長名稱＋有價＋長描述：卡片 h-96、圖片 h-64、名稱兩行截斷皆不變，提示仍存在 | 呈現 | — | 8 | 調整斷言 | UI-SPEC 取消固定 h-96，grid 改 aspect-square；「點擊查看大圖」提示刪除；data-testid 保留 |
| src/components/ProductCard.test.tsx > ProductCard 描述與其他欄位 > 有描述時顯示，且不顯示品牌、型號、現貨 | 契約 | 資料轉換 | 8 | 保留 | 有描述時顯示、不顯示品牌／型號／現貨；data-testid="product-description" 保留（D-08） |

## 待 Phase 8 決定

- A1：`PRICE_ON_REQUEST` 常數值（目前「價格洽詢」）是否更動 — UI-SPEC 只在卡片顯示「價格請來電」tag；本盤點暫將 `format.test.ts` 常數斷言列為契約保留，Phase 8 決定後更新對應列。
- A2：列表頁載入中（「正在載入產品資訊...」）與截斷提示（「僅顯示前 100 項商品」）的新字串 UI-SPEC Copywriting Contract 未列；本盤點把字串視為呈現、`aria-busy` 與截斷提示的存在視為契約，新字串由 Phase 8 決定。
