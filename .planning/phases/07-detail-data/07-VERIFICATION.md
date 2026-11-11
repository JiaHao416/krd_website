---
phase: 07-detail-data
verified: 2026-11-11T09:40:00Z
status: passed
score: 4/4 roadmap 成功標準；D-01..D-14 全數符合
overrides_applied: 0
re_verification: false
---

# Phase 7：詳情資料層 驗證報告

**Phase 目標：** 前端能以真實後端契約取得單一商品詳情，並把成功、找不到、限流、網路錯誤四種結果分得清楚
**需求：** TEST-05（REQUIREMENTS.md 已勾選，對應 Phase 7，無孤立需求）
**結論：** passed。未發現 BLOCKER，也無需人工驗證項目（本 phase 不含 UI）。

## 獨立重跑結果（非採信 SUMMARY）

| 指令 | 結果 |
|---|---|
| `npm test` | 20 檔／311 項全數通過 |
| `npm run lint` | 無錯誤、無警告 |
| `npm run build` | `tsc -b`、vite build、`check-dist` 全綠（dist 無 Airtable 網址、token、Base ID） |

## 成功標準

| # | 標準 | 狀態 | 證據 |
|---|---|---|---|
| 1 | 以真實 API 實測欄位；詳情型別與 transform 不重用 `toProduct`；價格 null 不出現 `NT$NaN` | VERIFIED | `07-API-SAMPLES.md` 記載 production 200／404／400 實測（總請求 9 次，不超過 10 次），含 null 邊界（model、description、warranty、price_incl_tax、空 attributes），與 ARCHITECTURE §三比對無差異。`transform.ts` 新增 `toProductDetail`、`resolveDetailName`，未呼叫 `toProduct`。`toFiniteNumberOrNull` 將非有限數字視為 null，null 時 `priceText: null`，不產生文字。`transformDetail.test.ts` 有 NaN 相關斷言。 |
| 2 | 404／400 → 找不到；429、5xx、網路 → 可重試；有單元測試 | VERIFIED | `productDetail.ts` 的 `classifyDetailError`：僅 `kind==="http"` 且 status 為 404 或 400 回傳 notFound，其餘皆 retryable。`productDetail.test.ts`（46 項）涵蓋分類、isUuid、fetch 流程。 |
| 3 | hook 四種狀態；切換或卸載會 abort；每次造訪只發一個請求 | VERIFIED | `useProductDetail.ts` 為判別聯合（loading／success／notFound／error + `isRateLimited`）加 `retry`。effect 內建立 `AbortController`，cleanup 呼叫 `abort()`；aborted 或 `canceled` 不改狀態。`useProductDetail.test.tsx`（18 項）涵蓋：呼叫次數為 1 且帶 signal、切換 id abort 前一個、舊結果晚到不覆蓋、卸載後 resolve 不報錯、retry、StrictMode 只有一個有效請求、非 UUID 不發請求。 |
| 4 | 測試總數 > 215；`noAirtable.test.ts` 掃描涵蓋新檔 | VERIFIED | 總數 311（+96，> 215）。`noAirtable.test.ts` 以 `import.meta.glob("/src/**/*.{ts,tsx}")` 掃描，新增的 `productDetail*.ts`、`useProductDetail*`、`transformDetail.test.ts` 自動涵蓋；該檔相對 5e13f35 無任何變更。 |

## 基準與「只追加」檢查

- 215 項基準測試：以 `npx vitest list`（去前綴排序）對照 `06-TEST-INVENTORY.md`，遺失 0 項、新增 96 項。
- 相對 commit `5e13f35`，`src/` 的差異只有 7 個檔：4 個新增（`productDetail.ts`、`productDetail.test.ts`、`useProductDetail.ts`、`transformDetail.test.ts`，另 `useProductDetail.test.tsx`），`apiTypes.ts`（+33）與 `transform.ts`（+132）僅有新增行，**刪除行為 0**。`errors.ts`、`format.ts`、`products.ts`、`client.ts`、`noAirtable.test.ts` 差異為 0（D-12 符合）。

## CONTEXT 決策核對

| 決策 | 狀態 | 備註 |
|---|---|---|
| D-01 實測先行、請求 ≤10 | 符合 | 見 API-SAMPLES |
| D-02 fixture 手寫、不觸發 noAirtable | 符合 | noAirtable 測試在 311 項中通過 |
| D-03 型別 snake_case 追加 | 符合 | `apiTypes.ts` 僅追加 |
| D-04 `ProductDetail`／`ProductVariant`／`toProductDetail` 形狀；0 或 null 保固為 null；attributes 字串化 | 符合 | 欄位與規則逐項對照程式碼 |
| D-05 價格 null 不產生文字、不改 `PRICE_ON_REQUEST` | 符合 | format.ts 未動 |
| D-06 預設變體 `find(isDefault) ?? variants[0] ?? null`、不排序 | 符合 | |
| D-07 壞 variant 略過並 warn；商品層壞資料 `invalid_response` | 符合 | variant 在 `toDetailVariant`，商品層在 `isPublicProductDetail` 與回應守衛 |
| D-08 `classifyDetailError` 僅 404／400 為 notFound | 符合 | |
| D-09 非 UUID 不發請求 | 符合 | service 與 hook 皆預檢 |
| D-10 不產生訪客文案、不改 `ERROR_MESSAGES` | 符合 | hook 只回 `ApiError` 與 `isRateLimited` |
| D-11 hook 介面與取消行為 | 符合 | 以 requestKey 在 render 衍生 loading，避免殘留舊資料 |
| D-12 新檔配置、不改既有 services 內容 | 符合 | 見上 |
| D-13 必測項目 | 符合 | 逐項對照測試名稱皆有覆蓋 |
| D-14 總數 > 215、215 項不刪改 | 符合 | 311；遺失 0 |

## 反模式掃描

新增或修改的 `productDetail.ts`、`useProductDetail.ts`、`transform.ts`、`apiTypes.ts` 無 TBD／FIXME／XXX／TODO。`console.warn` 僅用於略過壞 variant，屬設計。無 stub：所有新增 export 皆有實作與測試。

## 備註（非阻擋，資訊性）

- 後端實際只有 `price_incl_tax: null` 的商品資料，非 null 價格、非空 attributes、warranty 正數、空 variants、`image_url: null` 為依契約手寫的 fixture，API-SAMPLES 已標註為 [ASSUMED]。這屬計畫既定範圍，不構成缺口。
- 新增的 hook 與 service 尚無 UI 消費端（Phase 9 才接），為預期狀態，不算 ORPHANED。
- `fetchProductDetail` 對非 UUID 拋出 `http 400` 的 `ApiError`，與 hook 的預檢重複，屬防禦性設計。

## 缺口

無。
