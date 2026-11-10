# Coding Conventions

**Analysis Date:** 2026-11-10

## Naming Patterns

**Files:**
- React 元件與頁面使用 PascalCase `.tsx`：`src/components/NavBar.tsx`、`src/pages/ProductPageTemplate.tsx`
- 非元件模組使用 `.ts`，目錄名稱小寫：`src/services/client.ts`
- 頁面檔案以 `Page` 結尾（`HomePage.tsx`、`AboutPage.tsx`），可複用頁面以 `Template` 結尾

**Functions:**
- 元件使用 PascalCase 的 arrow function：`const NavBar = () => {...}`，並於檔尾 `export default NavBar;`
- 資料函式使用 camelCase 動詞開頭：`getProducts`、`getNavigation`、`getLogo`、`getServices`（`src/services/`）
- effect 內的非同步函式為區域 `async function getLogo()` / `fetchProducts()`，在 effect 中呼叫
- 事件處理以 `handle` 開頭：`handleScroll`、`handleEscape`、`handleError`

**Variables:**
- camelCase；state 使用 `[value, setValue]`，布林以 `is`/`show` 開頭（`isMenuOpen`、`scrolled`、`show`）
- 模組層常數目前為 `BASE_ID` 這類 UPPER_SNAKE_CASE

**Types:**
- 使用 `interface`，PascalCase；Props 命名為 `XxxProps`（`ImageModalProps`、`ProductPageProps`）
- API 資料型別集中於 `src/services/apiTypes.ts` 與 `transform.ts`
- 後端 API 欄位的命名以 `src/services/apiTypes.ts` 為準，不要改名

## Code Style

**Formatting:**
- 未設定 Prettier/Biome；實際風格為雙引號、分號、2 空格縮排、多行結構尾逗號（ES5 style）
- 新程式碼沿用此風格

**Linting:**
- ESLint 9 flat config：`eslint.config.js`
- 規則：`js.configs.recommended`、`tseslint.configs.recommended`、`react-hooks` recommended、`react-refresh/only-export-components`（warn）
- 指令：`npm run lint`
- TypeScript 嚴格：`tsconfig.app.json` 啟用 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`、`erasableSyntaxOnly`（不可用 enum / namespace）
- Tailwind CSS 3 utility class 直接寫在 `className`（`tailwind.config.js`），不使用 CSS modules

## Import Organization

**Order:**
1. React / 第三方（`react`、`react-router-dom`、`axios`）
2. 相對路徑元件（`../components/Layout`）
3. 服務層（`../services/products` 等）
4. 樣式（`./App.css`，置於 `src/App.tsx` 最前）

**型別匯入:** 因 `verbatimModuleSyntax`，型別必須用 `import type { ... }`（見 `src/services/client.ts`）。

**Path Aliases:** 無，一律相對路徑。

## Error Handling

**Patterns:**
- 服務層以 `ApiError` 向上拋出（`src/services/errors.ts`），由頁面顯示錯誤狀態
- axios response interceptor 將錯誤正規化為 `{ message, data, status }` 後 `Promise.reject`
- 元件端的 fetch 也各自 `try/catch` + `console.error("Error fetching xxx:", error)`（`src/components/NavBar.tsx`、`src/components/SideMenu.tsx`、`src/pages/HomePage.tsx`、`src/pages/AboutPage.tsx`、`src/pages/ProductPageTemplate.tsx`）
- 資料載入使用 `loading` state，沒有錯誤 state 或 Error Boundary
- 注意：因服務層不拋錯，元件的 catch 實際上很少觸發；新程式碼應決定單一錯誤策略（見 CONCERNS）

## Logging

**Framework:** 直接使用 `console`（`console.error` / `console.warn`），無 logger 抽象，錯誤訊息為英文。

## Comments

**When to Comment:**
- 註解以繁體中文為主（`// 定義導航項目的類型`、`// 防止背景滾動`），符合全域規範
- JSX 區塊用 `{/* Company Info Section */}`（部分為英文）；新註解請用繁體中文

**JSDoc/TSDoc:**
- 服務層函式使用 `/** ... */` 中文說明，含 `@param`、`@returns`（`src/services/`）

## Function Design

**Size:** 元件偏大（`src/components/NavBar.tsx` 約 300 行、`src/pages/ProductPageTemplate.tsx` 約 390 行），UI 與資料抓取混在同一元件。

**Parameters:** 元件 props 直接解構於參數列；服務函式使用預設參數（`viewName = "data"`）。

**Return Values:** 服務函式回傳已過濾必要欄位的 `Promise<XxxRecord[]>`，過濾以 `record.fields?.xxx` 判斷。

## Module Design

**Exports:** 元件用 `export default`；服務層用具名匯出（`export async function`、`export interface`）。

**Barrel Files:** 不使用。

## 已知偏離（新程式碼不要仿效）

- `[key: string]: any` 與 `catch (error: any)` 使用 `any`（`src/pages/ProductPageTemplate.tsx`）

---

*Convention analysis: 2026-11-10*
