---
phase: 01-api
verified: 2026-11-10T11:40:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
gaps: []
warnings:
  - "CR-01: 單筆商品 name 為 null 或 item 非物件時，toProduct 拋原生 TypeError 而非 ApiError（建議 Phase 2 開始前修）"
  - "WR-01..WR-05 見 01-REVIEW.md，皆非 roadmap 成功條件"
---

# Phase 1: 測試與 API 資料層基礎 驗證報告

**Phase Goal:** 開發者能用 `npm test` 跑測試，並在本機 `npm run dev` 透過 proxy 讀到後端商品資料；API 呼叫與資料轉換邏輯已有測試保護
**Status:** passed（附警告）
**Re-verification:** 否，初次驗證

## 成功條件驗證

| # | 條件 | 狀態 | 證據 |
|---|------|------|------|
| 1 | `npm test` 跑 Vitest 且全過 | VERIFIED | 實跑：6 files / 80 tests passed；`package.json` 有 `"test": "vitest run"` |
| 2 | dev 透過 Vite proxy 取得後端商品 JSON | VERIFIED | `vite.config.ts` 設 `/api` proxy（changeOrigin）；`.env.development` 設 `VITE_API_BASE_URL=/api/v1/public`。我實際啟動 vite（port 5199）並 curl `/api/v1/public/products?limit=2`，帶 Origin header，回傳 `{"success":true,"data":{"items":[...` 真實商品，已關閉 server |
| 3 | base URL 由 `VITE_` 控制，預設 production | VERIFIED | `src/services/client.ts`：`resolveBaseUrl(import.meta.env.VITE_API_BASE_URL)`，預設 `https://api.krd.com.tw/api/v1/public`；`client.test.ts` 有測試 |
| 4 | 單元測試涵蓋轉換（價格 ÷100、null）、分類對照（中文 encode）、錯誤轉換 | VERIFIED | `format.test.ts`、`transform.test.ts`、`catalog.test.ts`（斷言 `%E6%9C%89%E7%B7%9A...` 等完整 encode 查詢字串、featured=1/2）、`errors.test.ts`、`products.test.ts`（network／非 2xx／`success:false`／HTML fallback）。80 個測試皆存在且通過 |
| 5 | `npm run build` 成功，網站行為不變 | VERIFIED | 實跑 `tsc -b && vite build` 成功；新程式碼僅新增 `src/services/*` 與設定，未被現有頁面引用，行為不變 |

**Score:** 5/5

## 需求覆蓋

| 需求 | 狀態 | 證據 |
|------|------|------|
| TEST-01 | SATISFIED | `npm test` 可執行 |
| TEST-02 | SATISFIED | `transform.test.ts`、`format.test.ts` |
| TEST-03 | SATISFIED | `catalog.test.ts` |
| TEST-04 | SATISFIED | `errors.test.ts`、`products.test.ts` |
| SEC-02 | SATISFIED | `client.ts` + `.env.example` |
| SEC-03 | SATISFIED | `vite.config.ts` proxy，實測通過 |

REQUIREMENTS.md 對應到 Phase 1 的 6 個 ID（SEC-02、SEC-03、TEST-01..04）全部被計畫認領，無孤立需求。追蹤表仍標 Pending，建議勾選。

## 關於 orchestrator 提出的問題

- **Lint 失敗（11 個 `no-explicit-any`）：** 位於未動的舊 Airtable 檔案（`src/services/index.ts`、HomePage、ProductView、ProductPageTemplate）。Phase 1 的需求與成功條件都不含 lint，新檔案 lint 乾淨，Phase 3 會移除這些檔案。判定不影響本 phase。
- **CR-01：** 不違反任何 roadmap 成功條件。TEST-04 要求的是網路／非 2xx／`success:false` 的錯誤可辨識，這三類已完成並有測試。但單筆壞資料會讓整頁失敗，且 `@throws {ApiError}` 契約在此情況不成立，與 RESEARCH V5 的容錯期望不符。屬警告，建議在 Phase 2 接 UI 前修掉（逐筆驗證並補測試）。
- **WR-01（`.env.example` 複製成 `.env` 會讓 production build 打相對路徑）：** 屬風險，Cloudflare Pages 不受影響。建議盡快修正。
- **WR-03（`VITE_PROXY_TARGET` 命名）：** 目前值非機密，屬衛生問題，不阻擋。

## 反模式掃描

新 phase 檔案中未發現 TBD／FIXME／XXX 標記，也沒有空實作。`products.ts` 與 `transform.ts` 屬真實邏輯。

## 需要人工確認

無。proxy 已由我實測，其餘皆可由自動化測試證實。

## 結論

Phase 1 目標已達成。警告項（尤其 CR-01、WR-01）建議在 Phase 2 前處理，但不阻擋進入下一階段。
