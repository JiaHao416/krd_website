---
phase: 07-detail-data
plan: 02
subsystem: services
tags: [service, tdd, product-detail, error-classification]
requires: [07-01]
provides:
  - isUuid、classifyDetailError、DetailErrorClass
  - fetchProductDetail、FetchProductDetailOptions
affects: [07-03, phase-09]
tech-stack:
  added: []
  patterns: [非 UUID 不發請求、normalizeError 後再分類、type guard 失敗拋 invalid_response]
key-files:
  created:
    - src/services/productDetail.ts
    - src/services/productDetail.test.ts
  modified: []
key-decisions:
  - "只有 http 404/400 為 notFound；429、5xx、網路、invalid_response 皆 retryable"
  - "非 UUID 不發請求，直接拋 http 400 ApiError，分類為 notFound"
requirements-completed: [TEST-05]
duration: 約 10 分鐘
completed: 2026-11-11
---

# Phase 7 Plan 02: 詳情 service 與錯誤分類 Summary

新增 `productDetail.ts`：UUID 預檢、`classifyDetailError`（notFound／retryable）與 `fetchProductDetail`，沿用 products.ts 風格，未動任何既有 services 檔。

## 完成內容

- Task 1（commit `ebb8a31`）：isUuid 與 classifyDetailError，23 項測試。
- Task 2（commit `503a906`）：fetchProductDetail，追加 23 項測試（檔案共 46 項）。

## RED 證據

Task 1：實作前執行 `npx vitest run src/services/productDetail.test.ts`，因 `./productDetail` 模組不存在而整檔無法載入：

```
import { classifyDetailError, isUuid } from "./productDetail";
 Test Files  1 failed (1)
      Tests  no tests
```

Task 2：追加測試、實作前：

```
Failed Tests 23
FAIL ... fetchProductDetail > 回傳轉換後的商品詳情並請求正確路徑
TypeError: fetchProductDetail is not a function
```

GREEN 後：46 passed。

## 驗證結果

- `npm test`：19 個檔案、293 項通過（Plan 01 後基準 247，新增 46）
- `npm run lint`：無問題
- `npm run build`：成功，dist 掃描通過
- 非 UUID 測試斷言 adapter 呼叫次數為 0；測試涵蓋 "../admin"
- 既有 services 檔與既有測試檔未改動；與 5e13f35 相比測試檔差異僅 transformDetail.test.ts、productDetail.test.ts

## Deviations from Plan

None - 依計畫執行。Task 1 的測試檔先只匯入 Task 1 用到的項目，Task 2 再補 import，以免 Task 1 commit 出現未使用 import 的 lint 錯誤。未遇到 guard 拒絕。

## Known Stubs

無。

## Self-Check: PASSED

- productDetail.ts、productDetail.test.ts 存在；commit ebb8a31、503a906 存在。
