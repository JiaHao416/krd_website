---
phase: 07-detail-data
plan: 01
subsystem: services
tags: [types, transform, tdd, product-detail]
requires: []
provides:
  - PublicVariantApi、PublicProductDetailApi、PublicProductDetailResponse
  - ProductDetail、ProductVariant、toProductDetail
  - 07-API-SAMPLES.md（真實 API 樣本）
affects: [07-02, 07-03, phase-09]
tech-stack:
  added: []
  patterns: [逐筆驗證壞資料略過並 console.warn, 價格 null 不產生文字]
key-files:
  created:
    - .planning/phases/07-detail-data/07-API-SAMPLES.md
    - src/services/transformDetail.test.ts
  modified:
    - src/services/apiTypes.ts
    - src/services/transform.ts
key-decisions:
  - "詳情名稱規則同列表（trim name、brand+model、UNNAMED_PRODUCT），另寫 resolveDetailName，不重用 resolveName"
  - "description 保留原文換行，只在整段空白時為 null"
requirements-completed: [TEST-05]
duration: 約 10 分鐘
completed: 2026-11-11
---

# Phase 7 Plan 01: 詳情型別與 toProductDetail Summary

追加詳情原始型別與 `toProductDetail` 轉換（價格為 null 時 priceInclTax／priceText 皆為 null，不產生 NT$NaN），並落檔真實 API 樣本。

## 完成內容

- Task 1：`07-API-SAMPLES.md`。本 task curl 重驗 3 次（詳情 200、不存在 UUID 404、非 UUID 400），加研究階段 6 次共 9 次，結果與研究樣本及 ARCHITECTURE.md §三完全一致，無需調整型別。
- Task 2：型別、轉換與 32 項測試，單一 commit `46b944a`（依 tdd_commit_policy，RED 不 commit）。

## RED 證據

撰寫測試後、實作前執行 `npx vitest run src/services/transformDetail.test.ts`：

```
FAIL |unit| src/services/transformDetail.test.ts > toProductDetail 商品層 > 結果不含列表專用欄位
TypeError: toProductDetail is not a function
 Test Files  1 failed (1)
      Tests  32 failed (32)
```

GREEN 後：32 passed。

## 驗證結果

- `npm test`：18 個檔案、247 項通過（基準 215，新增 32）
- `npm run lint`：無警告
- `npm run build`：成功，dist 掃描通過
- `git diff -- src/services/transform.ts src/services/apiTypes.ts` 刪除行數為 0（只追加）
- products.ts／format.ts／errors.ts／client.ts／catalog.ts 與既有測試檔未改動

## Deviations from Plan

None - 依計畫執行。新增的 `formatPrice` import 另起一行，沿用同模組兩行 import（lint 通過）。未遇到 guard 拒絕。

## Known Stubs

無。

## Self-Check: PASSED

- 07-API-SAMPLES.md、transformDetail.test.ts 存在；commit 46b944a 存在。
