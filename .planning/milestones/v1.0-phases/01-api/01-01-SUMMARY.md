---
phase: 01-api
plan: 01
subsystem: api-data-layer
tags: [vitest, axios, vite-proxy, env]
requires: []
provides:
  - "npm test（vitest run）"
  - "src/services/apiTypes.ts 契約型別"
  - "src/services/client.ts（resolveBaseUrl、createApiClient、apiClient）"
  - "src/services/products.ts fetchProducts happy path"
  - "Vite dev proxy /api"
affects: [01-02, 01-03, 01-04]
tech-stack:
  added: [vitest@4.1.12]
  patterns: [adapter 注入測試, VITE_API_BASE_URL 決定 base URL]
key-files:
  created:
    - .env.development
    - .env.example
    - src/services/apiTypes.ts
    - src/services/client.ts
    - src/services/client.test.ts
    - src/services/products.ts
    - src/services/products.test.ts
  modified:
    - package.json
    - package-lock.json
    - vite.config.ts
    - src/vite-env.d.ts
key-decisions:
  - "未安裝 @types/node：tsc -b 通過，loadEnv(mode, \".\") 即可"
  - "proxy 不改寫 Origin（D-16）"
requirements-completed: [TEST-01, SEC-02, SEC-03]
duration: 約 20 分鐘
completed: 2026-11-10
---

# Phase 1 Plan 01：Vitest、env 與商品 API 最薄切片 Summary

導入 Vitest 4.1.12，以 `VITE_API_BASE_URL` 決定新 axios client 的 base URL，`fetchProducts` 打 `GET /products`，並以 Vite dev proxy 實測讀到 production 商品 JSON。

## 實際版本與決策
- vitest 4.1.12，vite 仍為 6.3.5。
- 未安裝 `@types/node`（tsc -b 無需），`loadEnv(mode, ".")`。
- 本機 dev proxy 實測：`/api/v1/public/products?limit=1` 回應含 `"success":true`，結束後 5199 埠無殘留程序。

## TDD
- RED：先寫 client.test.ts 與 products.test.ts，`vitest run src/services` 失敗（./client、./products 模組不存在，兩個測試檔皆無法載入）；依計畫未 commit。
- GREEN：實作後 `npm test` 9 項全通過，測試與實作同一個 feat commit。

## Commits
- bfa4a74 chore(01-01)：導入 Vitest、環境變數與 Vite dev proxy
- b200a1b feat(01-01)：建立 API 型別、可注入 client 與 fetchProducts

## Deviations from Plan

**1. [Rule 1 - Bug] loadEnv 不從 vitest/config 匯出**
- Issue：計畫指示 `loadEnv` 自 `vitest/config` 匯入，`tsc -b` 報 TS2305。
- Fix：`loadEnv` 改自 `"vite"` 匯入，`defineConfig` 仍自 `vitest/config`。
- Files：vite.config.ts
- Commit：bfa4a74
- 附帶影響：acceptance 中 `grep -c 'from "vitest/config"'` 仍為 1，無衝突。

## Deferred Issues
- `npm run lint` 全專案有 11 個 `no-explicit-any` 錯誤，位於既有未修改檔案（src/services/index.ts、src/pages/HomePage.tsx、src/components/ProductView.tsx、src/pages/ProductPageTemplate.tsx）；屬 pre-existing，依範圍規則不處理。本 plan 新增與修改的檔案 eslint 全部通過。
- 因此成功條件「npm run lint 通過」在全專案層級不成立，需由後續 plan（移除 Airtable）處理。

## Auth gates／Guard 紀錄
- 無 auth gate。auto mode classifier 兩度因 hook 改寫指令（rtk）要求重送，已依指示重送後執行成功。

## Known Stubs
無。

## Threat Flags
無新增。

## Self-Check: PASSED
