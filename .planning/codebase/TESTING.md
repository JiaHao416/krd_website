# Testing Patterns

**Analysis Date:** 2026-11-10（Phase 3 更新）

## Test Framework

**Runner:** Vitest（設定於 `vite.config.ts`），兩個 project：
- `unit`：node 環境，`src/**/*.test.ts`
- `component`：jsdom 環境，`src/**/*.test.tsx`，setup 為 `src/test/setup.ts`

**Run Commands:**
```bash
npm test             # vitest run（含 src/noAirtable.test.ts）
npm run lint         # ESLint
npm run build        # tsc -b && vite build && node scripts/check-dist.mjs
npm run check:dist   # build 後掃描 dist/，確認無 Airtable 網址、token 或 Base ID 格式（build 已內建，單獨執行需先有 dist/）
```

## 防回歸檢查（Phase 3）

- `src/noAirtable.test.ts`：以 `import.meta.glob` 讀取 `src/**/*.{ts,tsx}` 原始碼（排除自身），斷言不含 airtable 字樣、API 網址、Base ID、PAT、舊式 key 格式；失敗時只列檔名。
- `scripts/check-dist.mjs`（`npm run check:dist`）：對 `dist/` 套用同一組規則，只輸出檔名與規則名；已串在 `npm run build` 最後一步（Phase 5 推翻 Phase 3 D-15），命中即 build 失敗、Cloudflare 不會部署。
- 兩者規則需保持一致；誤報時改名，不要放寬 regex。

## Test File Organization

**Location:** co-located，如 `src/components/NavBar.test.tsx`、`src/services/products.test.ts`。

**Naming:** `*.test.ts(x)`。

## Mocking

- 頁面測試以 `vi.mock` 取代 `../components/Layout` 與 `../services/products`。
- 路由相關元件以 `MemoryRouter` 包裹。
- API client 提供 adapter 注入點（`createApiClient`），測試不打真實網路。

## Coverage

**Requirements:** None enforced。

**E2E Tests:** Not used。

---

*Testing analysis: 2026-11-10（Phase 3 更新）*
