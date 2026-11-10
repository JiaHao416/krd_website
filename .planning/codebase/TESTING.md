# Testing Patterns

**Analysis Date:** 2026-11-10

## Test Framework

**Runner:**
- 未偵測到（Not detected）。`package.json` 無 jest / vitest / testing-library 依賴，也沒有 `test` script
- 無 `*.test.*` / `*.spec.*` 檔案，無 `jest.config.*` / `vitest.config.*`

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
npm run lint     # 目前唯一的自動化品質檢查（ESLint）
npm run build    # tsc -b && vite build，型別檢查兼建置驗證
```

## Test File Organization

**Location:** 尚無慣例。建議採 co-located：`src/components/NavBar.test.tsx`、`src/services/index.test.ts`。

**Naming:** 建議 `*.test.ts(x)`。

## Test Structure

目前無既有範例。依專案技術棧（Vite 6 + React 19 + TypeScript）新增時建議：
- Runner：Vitest（與 Vite 共用設定，需先說明理由並經使用者同意再引入）
- 元件：`@testing-library/react` + `jsdom`
- 遵循全域規範：每測試一個斷言、名稱描述情境、測試需確定性

## Mocking

**Framework:** 尚未建立。

**建議 Mock 的對象:**
- `src/services/index.ts` 的 `airTable` / `getProducts` / `getNavigation` / `getLogo` / `getServices`（外部 Airtable HTTP）
- `react-router-dom` 的 `useNavigate` / `useLocation`（或以 `MemoryRouter` 包裹）

**不應 Mock:**
- 純 UI 元件（`src/components/ImageModal.tsx`、`Footer.tsx`）本身邏輯

## Fixtures and Factories

**Test Data:** 無。Airtable 回應結構為 `{ records: [{ id, fields, createdTime }] }`（見 `src/services/index.ts` 的 `AirTableResponse`），測試資料請依此建立。

**Location:** 建議 `src/test/fixtures/`。

## Coverage

**Requirements:** None enforced。

## Test Types

**Unit Tests:** 無。優先候選：`getProducts` 等過濾邏輯（缺 `img_url` 的記錄應被剔除）、`airTable` 失敗時回傳 `[]`。

**Integration Tests:** 無。

**E2E Tests:** Not used。

## Common Patterns

**優先測試的行為（尚未實作）:**
- `src/components/ImageModal.tsx`：`show` 為 true 時 body `overflow` 為 hidden、按 Escape 呼叫 `onHide`、卸載時還原
- `src/services/index.ts`：API 失敗回傳空陣列、無 records 時 `console.warn`
- `src/pages/ProductPageTemplate.tsx`：loading 狀態、grid/list 切換

**注意:** 服務層目前硬編碼 token 與 BASE_ID，測試前建議先改為環境變數注入，方便替換為假值（不得在測試或文件中放入真實 token）。

---

*Testing analysis: 2026-11-10*
