# Phase 7：詳情 API 實測樣本

## 實測紀錄

- 日期：2026-11-11
- 研究階段實測 6 次（列表 1、詳情 1、不存在 UUID 1、非 UUID 2、含 Origin 的 header 檢查 1）。
- 本 task 重驗 3 次（只打公開 API，不帶任何 header 或憑證），總數 9 次，未超過 D-01 的 10 次上限：

| # | 請求 | HTTP 狀態 |
|---|------|-----------|
| 1 | `GET /api/v1/public/products/6d660a71-98b6-4b18-95ee-a2175aeab9c8` | 200 |
| 2 | `GET /api/v1/public/products/00000000-0000-4000-8000-000000000001` | 404 |
| 3 | `GET /api/v1/public/products/not-a-uuid` | 400 |

三次重驗結果與研究樣本完全一致。

## 詳情 200 樣本

```json
{"success":true,"data":{"id":"6d660a71-98b6-4b18-95ee-a2175aeab9c8","name":"BB1","brand":"MICGO","model":null,"category":"喇叭","description":null,"image_url":"https://img.krd.com.tw/3384cbf9-db4f-4a2f-99a7-0350411e163d.jpg","warranty_period_months":null,"published_at":"2026-11-10T01:55:23.622Z","in_stock":false,"variants":[{"id":"4820b343-6944-48a7-bd39-6c27df0b858d","sku":"AT-99AE59705A78","attributes":{},"image_url":"https://img.krd.com.tw/3384cbf9-db4f-4a2f-99a7-0350411e163d.jpg","is_default":true,"in_stock":false,"price_incl_tax":null}]}}
```

- 商品層 11 個鍵：`id`、`name`、`brand`、`model`、`category`、`description`、`image_url`、`warranty_period_months`、`published_at`、`in_stock`、`variants`。
- variant 7 個鍵：`id`、`sku`、`attributes`、`image_url`、`is_default`、`in_stock`、`price_incl_tax`。
- 詳情的 `data` 直接是商品（不是 `data.items`），沒有 `featured_group`、`price_min`、`price_max`。

## 錯誤樣本

404（不存在的 UUID）：

```json
{"success":false,"error":{"code":"PRODUCT_NOT_FOUND","message":"商品不存在"}}
```

400（非 UUID）：

```json
{"success":false,"error":{"code":"VALIDATION_FAILED","message":"輸入驗證失敗","details":{"fields":{"id":"Invalid UUID"}}}}
```

body 形狀為 `{success:false,error:{code,message}}`，與 `errors.ts` 的 `extractBackendMessage`（讀 `error.message`）相容，不需修改 errors.ts。

## null 邊界（實測到）

- `model`、`description`、`warranty_period_months`、`price_incl_tax` 為 `null`。
- `attributes` 為 `{}`（空物件）。
- variant 的 `image_url` 退回商品主圖。

## 未實測、依契約手寫的邊界 [ASSUMED，來源 ARCHITECTURE.md §三]

production 目前商品皆不公開價格，下列形狀未實測，fixture 需標註「依契約手寫，非實測」：

- 非 null 的 `price_incl_tax`（含稅整數「分」，例如 120000）。
- 非空 `attributes`（值可能為 string、number、boolean）。
- `warranty_period_months` 為 0 或正數。
- 空 `variants`。
- `image_url: null`。

## 與 ARCHITECTURE.md §三比對

結果：無差異。商品層與 variant 的鍵、型別、null 行為與 ARCHITECTURE.md §三一致；錯誤碼 `PRODUCT_NOT_FOUND`（404）、`VALIDATION_FAILED`（400）亦一致。型別不需調整。

## 對應前端型別

| 後端欄位 | `PublicProductDetailApi` 型別 | 前端 `ProductDetail` |
|----------|------------------------------|----------------------|
| id | string | id |
| name | string | name（trim → brand+model → 未命名商品） |
| brand | string \| null | brand |
| model | string \| null | model |
| category | string | category |
| description | string \| null | description |
| image_url | string \| null | imageUrl（空字串為 null） |
| warranty_period_months | number \| null | warrantyMonths（0 或 null 為 null） |
| published_at | string \| null | （不使用） |
| in_stock | boolean | inStock |
| variants | PublicVariantApi[] | variants、defaultVariantId |

| variant 欄位 | `PublicVariantApi` 型別 | 前端 `ProductVariant` |
|--------------|------------------------|-----------------------|
| id | string | id |
| sku | string | sku |
| attributes | Record<string, string \| number \| boolean> | attributes（key/value 字串陣列） |
| image_url | string \| null | imageUrl |
| is_default | boolean | isDefault |
| in_stock | boolean | inStock |
| price_incl_tax | number \| null | priceInclTax、priceText（null 時皆為 null） |
