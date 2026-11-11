# Phase 6 — 測試盤點（TEST-06）

## 基準

- 基準：215 項／17 個檔（2026-11-11）
- 來源指令：`npx vitest list`（`it.each` 已逐項展開，每個展開項各佔一列，D-02、D-03）
- 本文件目前涵蓋資料層 8 個 unit 檔與 5 個低影響 component 檔（共 157 列）；重設計高影響的 4 個檔（SideMenu、NavBar、FeaturedCarousel、ProductCard，共 58 項）與 accessible name 契約清單由 06-04 補上，補完後總列數為 215。
- 名稱比對與列數驗證：

```bash
# 列數
grep -c '^| src/' .planning/phases/06-design-lock/06-TEST-INVENTORY.md
# 名稱 diff（補完 215 列後；目前須排除 4 個高影響檔）
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

