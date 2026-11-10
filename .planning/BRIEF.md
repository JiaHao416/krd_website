# 官網改版交接摘要（來自 KRD-Inventory-Backend session，2026-11-10）

> 給 `/gsd-new-project` 用的背景資料。以下「已定案」項目由 Owner 在後端 session 確認過，規劃時直接沿用，不必重新討論。

## 目標

官網停止使用 Airtable：

1. 商品資料改接後端公開 API（`https://api.krd.com.tw/api/v1/public/*`）。
2. Logo、導覽列、關於我們改成官網 repo 內的靜態檔。
3. 完成後由 Owner 撤銷 Airtable token。

## 為什麼

- 官網目前在瀏覽器直接呼叫 `api.airtable.com`，token 會跟著打包進前端程式，等於公開。
- 商品資料的唯一來源已改為後端：家人在 KRD-Inventory App 維護，Airtable 不再更新。

## 已定案

| 項目 | 決定 |
| ---- | ---- |
| 商品資料 | 改接後端公開 API，不再讀 Airtable 的商品表 |
| Logo | 圖片放 `public/`，元件直接引用 |
| 導覽列 | 在程式內定義選單清單（標題 + 路徑），與 `App.tsx` 路由同一份來源 |
| 關於我們 | 文字與圖片寫成 repo 內的內容檔 |
| 網址 | 維持現有路徑（`/wired-micphone`、`/trumpet`…），避免舊連結失效 |
| 部署 | Cloudflare Pages（git push 自動部署） |

## 後端公開 API

- 不需登入。CORS 只允許 `https://www.krd.com.tw`、`https://krd.com.tw`。
  - 本機開發用 Vite proxy，或連本機後端。
- 限流：每個 IP 每分鐘 60 次。
- 回應格式：`{ success: true, data: ... }`。
- 端點：
  - `GET /public/categories`：`data.items` 是分類字串陣列
  - `GET /public/brands`：同上，品牌
  - `GET /public/products?brand=&category=&featured=1|2&sort=name|newest&limit=1..100`（`limit` 預設 20）
  - `GET /public/products/:id`：詳情，含 `variants`
- 列表欄位：`id, name, brand, model, category, description, image_url, warranty_period_months, published_at, featured_group, price_min, price_max, in_stock`
- 價格是**含稅整數「分」**，顯示時除以 100。`show_price=false` 的商品價格欄位為 `null`，要顯示「洽詢」之類的文字。
- 只回 `in_stock` 布林值，不回庫存數量。
- 圖片網址都在 `https://img.krd.com.tw/…`（Cloudflare R2）。

## 現有頁面 → API 對照

| 官網路由 | 現在讀的 Airtable 表 | 改成 |
| -------- | -------------------- | ---- |
| `/all-products` | all-product | `/public/products` |
| `/new-products` | new-product | `/public/products?sort=newest` |
| `/micgo-products` | micgo | `?brand=MICGO` |
| `/krd-products` | krd | `?brand=KRD` |
| `/wired-micphone` | wired-micphone | `?category=有線麥克風` |
| `/wireless-micphone` | wireless-micphone | `?category=無線麥克風` |
| `/trumpet` | trumpet | `?category=喇叭` |
| `/accessories` | accessories | `?category=配件` |
| 首頁熱銷 1 / 2 | hot-products-1 / 2 | `?featured=1` / `?featured=2` |
| Logo | logo | 靜態檔 |
| 導覽列（NavBar、SideMenu） | navigation | 靜態清單 |
| `/abouts` | abouts | 靜態內容檔 |

注意：分類值是中文。URL 的 query string 要用 `encodeURIComponent`。

## Production 現況（2026-11-10）

- 20 筆商品，分 4 類：喇叭 7、有線麥克風 5、無線麥克風 5、配件 3。全部已公開，都有圖。
- 價格都還沒填，全部 `show_price=false`，所以價格欄位都是 `null`。
- 配件、開關、線材各是一筆商品（分類「配件」），照原本官網樣子搬入。

## 待 Owner 處理

- 從 Airtable 匯出 `logo`、`navigation`、`abouts` 三張表的內容（CSV 或截圖），當靜態檔的來源。
- 官網上線並確認後，到 Airtable 撤銷官網使用的 token。
