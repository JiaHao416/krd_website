---
phase: 07-detail-data
plan: 03
subsystem: hooks
tags: [hook, tdd, product-detail, abort]
requires: [07-01, 07-02]
provides:
  - useProductDetail、ProductDetailState、UseProductDetailResult
affects: [phase-09]
tech-stack:
  added: []
  patterns: [render 衍生 requestKey 狀態、abort 防競態、不產生訪客文案]
key-files:
  created:
    - src/hooks/useProductDetail.ts
    - src/hooks/useProductDetail.test.tsx
  modified:
    - .planning/STATE.md
key-decisions:
  - "以 requestKey 在 render 衍生 loading，切換 id／retry 不殘留舊資料，effect 內不同步 setState"
  - "hook 只回 ApiError 與 isRateLimited，訪客文案留給 Phase 9"
requirements-completed: [TEST-05]
duration: 約 10 分鐘
completed: 2026-11-11
---

# Phase 7 Plan 03: useProductDetail hook 與收尾 Summary

新增 `useProductDetail(id)`，提供 loading／success／notFound／error（含 isRateLimited）與 retry；非 UUID 不發請求，切換 id／卸載會 abort，舊結果不覆蓋新 id。

## 完成內容

- Task 1（commit `a5ce985`）：hook 與 18 項測試。
- Task 2：收尾檢查並於 STATE.md 記錄測試總數（隨 docs commit）。

## RED 證據

實作前執行 `npx vitest run src/hooks/useProductDetail.test.tsx`，因 `./useProductDetail` 模組不存在而整檔無法載入：

```
Test Files  1 failed (1)
     Tests  no tests
```

GREEN 後：18 passed。

## 收尾檢查

- `npm test`：20 個檔、311 項通過（> 215）；`npx vitest list | wc -l` = 311，一致。
- `npm run lint`：無問題；`npm run build`：成功，dist 掃描通過。
- noAirtable glob `/src/**/*.{ts,tsx}`（src/noAirtable.test.ts 第 7 行）涵蓋新檔 productDetail.ts、useProductDetail.ts。
- 與 5e13f35 相比測試檔差異恰為三個新檔：useProductDetail.test.tsx、productDetail.test.ts、transformDetail.test.ts。
- 基準 215 項名稱比對（comm -13）輸出為空，無一消失。
- apiTypes.ts／transform.ts 刪除行數 0；products／errors／format／client／catalog 未變。
- main 同步：`git fetch origin main` 成功；`HEAD..origin/main` 與 `HEAD..main` 皆空，main 無新 commit，不需 merge。
- 實際 git 指令：add、commit、diff、log、fetch（唯讀）；未執行 push。

## Deviations from Plan

None - 依計畫執行。未遇到 guard 拒絕。

## Known Stubs

無。

## Self-Check: PASSED

- 兩個新檔存在；commit a5ce985 存在。
