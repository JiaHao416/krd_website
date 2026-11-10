# Phase 3: 靜態內容固化與移除 Airtable - Pattern Map

**Mapped:** 2026-11-10
**Files analyzed:** 21（新增 11、修改 7、刪除 2、資產 1 組）
**Analogs found:** 18 / 21（其餘為資產／刪除，無需 analog）

安全提醒：`src/services/index.ts` 內含寫死的憑證，本文件完全不節錄該檔；任何新檔案、測試、commit 訊息都不得出現 token 或 Base ID 值。

## File Classification

| 新增／修改檔案 | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/config/navigation.ts`（新） | config | transform（編譯期衍生） | `src/services/catalog.ts` + `src/config/productPageViews.tsx` | role-match |
| `src/config/navigation.test.ts`（新） | test（unit/node） | transform | `src/services/catalog.test.ts` | exact |
| `src/content/abouts.ts`（新） | config（純資料） | static | `src/services/catalog.ts`（`PRODUCT_PAGES`、`HOME_FEATURED_QUERIES`） | role-match |
| `src/services/catalog.ts`（改） | config | static | 自身（重排陣列＋改註解） | exact |
| `src/services/catalog.test.ts`（改） | test | — | 自身第 32–44 行 | exact |
| `src/App.test.tsx`（改） | test | — | 自身第 11–46 行 | exact |
| `src/pages/HomePage.test.tsx`、`src/pages/ProductPageTemplate.test.tsx`（改） | test | — | 自身第 11–12 行註解 | exact |
| `src/components/NavBar.tsx`（改） | component | request-response 改 static render | 自身（只換資料來源） | exact |
| `src/components/SideMenu.tsx`（改） | component | 同上 | 自身 | exact |
| `src/pages/AboutPage.tsx`（改） | component（page） | 同上 | 自身 | exact |
| `src/components/NavBar.test.tsx`（新） | test（component/jsdom） | event-driven | `src/components/ProductCard.test.tsx`、`src/App.test.tsx` | role-match |
| `src/components/SideMenu.test.tsx`（新） | test（component） | event-driven | 同上 | role-match |
| `src/pages/AboutPage.test.tsx`（新） | test（component） | static render | `src/components/ProductCard.test.tsx` | role-match |
| `src/noAirtable.test.ts`（新） | test（unit/node，原始碼掃描） | batch | `vite.config.ts` 的 unit project（`src/**/*.test.ts`） | 無直接 analog，用 RESEARCH 範例 |
| `scripts/check-dist.mjs`（新）、`package.json` `check:dist`（改） | utility／script | file-I/O | 無（repo 無 scripts/） | 無 analog |
| `public/brand-logo.png`、`public/abouts/*.png`（新） | 靜態資產 | file-I/O | `public/logo.png`（位置慣例，勿覆蓋） | — |
| `src/services/index.ts`、`src/components/ProductView.tsx`（刪） | — | — | — | — |
| `CLAUDE.md`、`.planning/codebase/*.md`（改，最後一個 plan） | docs | — | — | — |

## Pattern Assignments

### `src/config/navigation.ts`（config，transform）

**Analog：** `src/services/catalog.ts`（interface＋`readonly` 常數、中文 JSDoc）、`src/config/productPageViews.tsx`（`Record<string, ProductPageView>`）

**Imports／型別風格**（`catalog.ts` 第 1–25 行）：
```typescript
import type { FeaturedGroup, ProductQueryParams, ProductSort } from "./apiTypes";

/** 商品頁設定：路徑對應查詢條件 */
export interface ProductPageConfig {
  path: string;
  query: ProductPageQuery;
}

export const PRODUCT_PAGES: readonly ProductPageConfig[] = [
  { path: "/all-products", query: {} },
  ...
];
```

**核心（取自 RESEARCH，與上面風格一致）：**
```typescript
import { PRODUCT_PAGES } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

export interface NavItem { path: string; title: string }

/** 導覽項目：由商品頁設定衍生，不另外維護第二份路徑或標題 */
export const NAV_ITEMS: readonly NavItem[] = PRODUCT_PAGES.map((page) => ({
  path: page.path,
  title: PRODUCT_PAGE_VIEWS[page.path].title,
}));
```
注意：`erasableSyntaxOnly`（不可用 enum/namespace）、`verbatimModuleSyntax`（型別 import 要用 `import type`）、雙引號＋分號＋2 空格。

---

### `src/content/abouts.ts`（config 純資料）

**Analog：** `src/services/catalog.ts` 第 36–40 行的 `HOME_FEATURED_QUERIES` 寫法（`readonly` 陣列＋JSDoc）。內容直接用 RESEARCH 第 83–95 行的 `ABOUT_SERVICES`（`{ name, image }`，6 筆，順序：卡拉OK/KTV/酒店/PUB/遊覽車/維修）。純資料、不 import React。

---

### `src/services/catalog.ts`（改：重排）

**修改位置**：第 21–34 行。把陣列改為 all, new, **krd, micgo, wireless, wired**, trumpet, accessories；註解「順序同 App.tsx 路由」與「Phase 3 導覽列擴充…」改為「順序即導覽選單順序」。現行片段：
```typescript
  { path: "/micgo-products", query: { brand: "MICGO" } },
  { path: "/krd-products", query: { brand: "KRD" } },
  { path: "/wired-micphone", query: { category: "有線麥克風" } },
  { path: "/wireless-micphone", query: { category: "無線麥克風" } },
```
（`App.tsx` 的 `PRODUCT_PAGES.map` 與順序無關，不用動。）

### 順序相依測試（改）

- `src/services/catalog.test.ts` 第 32–44 行：`it("8 個商品頁路徑順序與路由一致"…)` 的 `toEqual([...])` 改新順序，標題改為「順序即導覽順序」。
- `src/App.test.tsx` 第 20–29 行 `LEGACY_PATHS` 與第 46 行 `toEqual(LEGACY_PATHS)`：建議改為集合比對，例如 `expect([...paths].sort()).toEqual([...LEGACY_PATHS].sort())`，語意是「路徑集合與舊網址相同」。
- Airtable 字樣註解需清掉（掃描測試會抓）：`src/App.test.tsx:11`、`src/pages/HomePage.test.tsx:12`、`src/pages/ProductPageTemplate.test.tsx:12`，改為不含該字樣的說明，例如「以假元件取代 Layout，專注測商品路由」。`vi.mock("./components/Layout", …)` 本身保留：
```typescript
vi.mock("./components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
```

---

### `src/components/NavBar.tsx`（component，改為靜態資料）

**Analog：** 自身。保留所有 class／結構，只做下列替換。

**Imports（第 1–3 行）改為：**
```typescript
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
```
（`useEffect` 仍給 scroll effect 用；`noUnusedLocals` 要求刪掉未用的 import。）

**刪除：**第 5–18 行 `NavigationItem`／`LogoData` interface、第 23–24 行 `navigationData`／`logo` state、第 38–82 行整個抓取 `useEffect`。**保留**第 29–36 行 scroll effect 與 `handleNavigation`、`isActivePath`。

**新增 state：** `const [logoFailed, setLogoFailed] = useState(false);`

**Logo 區塊（第 111–135 行）改為：**
```tsx
{!logoFailed ? (
  <div className="relative">
    <div className="bg-white/95 ... group-hover:shadow-blue-500/30">
      <img
        src="/brand-logo.png"
        width={800}
        height={235}
        alt="KRD MICGO Logo"
        onError={() => setLogoFailed(true)}
        className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto transition-all duration-300 group-hover:scale-105"
        style={{ filter: "brightness(1.1) contrast(1.1) saturate(1.2)" }}
      />
    </div>
    {/* 發光效果 div 原樣保留 */}
  </div>
) : (
  /* 原第 129–134 行的 KRD MICGO h1 區塊原樣保留 */
)}
```

**桌機選單（第 140–181 行）與手機選單（第 247–283 行）：**
- `navigationData.map((item, index) =>` → `NAV_ITEMS.map((item) =>`
- `key={item.id || index}` → `key={item.path}`
- 全部 `item.fields.path` → `item.path`，`item.fields.title` → `item.title`
- 「商店介紹」`/abouts` 兩個按鈕不動（D-03）。

**測試需知：**手機選單永遠渲染在 DOM（只用 `max-h-0 opacity-0` 隱藏，不是條件渲染），所以桌機與手機同名項目各一個，用 `getAllByRole("button", { name })`；不需先點漢堡（RESEARCH A1 已被此檔證實為「不需要」）。

---

### `src/components/SideMenu.tsx`（component，改為靜態資料）

**Analog：** 自身。

**Imports（第 1–3 行）改為：**
```typescript
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
```
（不再需要 `useEffect`／`useState`。）

**刪除：**第 5–11 行 `NavigationItem`、第 20–21 行 state、第 23–49 行 `useEffect`、第 102–114 行 `isLoading ?` 骨架分支與其三元運算外殼。保留第 115 行起 `<div className="space-y-1">` 之後的結構，把 `{navigationData.map((item, index) => (` 換成 `{NAV_ITEMS.map((item) => (`，`key={item.path}`，`item.fields.path/title` → `item.path/title`。`SideMenuProps { title?: string }` 與下方聯絡卡、「查看最新產品」按鈕不動。

---

### `src/pages/AboutPage.tsx`（page，改為靜態資料）

**Analog：** 自身。

**修改：**
- 第 1–3 行 import：移除 `useEffect, useState`、`airTable`；新增 `import { ABOUT_SERVICES } from "../content/abouts";`（保留 `Layout` import）。若 `useState`／`useEffect` 在檔內他處沒用，整行 react import 刪除。
- 刪除 `ServiceItem` 型別、第 15–16 行 `services`／`isLoading` state、第 18–40 行附近的 `useEffect`。
- 第 283–293 行 `isLoading ? (8 格骨架) : (` 整段刪除，只留 grid：
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
  {ABOUT_SERVICES.map((service, index) => (
    <div
      key={service.image}
      className="group glass-card p-6 ... animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      ...
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-full object-contain ..."
        style={{ filter: "brightness(0.2) contrast(1.5) saturate(1.2)", maxWidth: "80%", maxHeight: "80%" }}
      />
      ...
      <h4 className="text-white font-semibold ...">{service.name}</h4>
```
- `service.fields.img_url` → `service.image`、`service.fields.icon_name` → `service.name`、`key` 用 `service.image`。其餘寫死文案不動（D-10）。

---

### 新元件測試：`NavBar.test.tsx`、`SideMenu.test.tsx`、`AboutPage.test.tsx`（test，jsdom）

**Analog：** `src/components/ProductCard.test.tsx`（元件測試風格）、`src/App.test.tsx`（MemoryRouter＋`useNavigate` 測試用元件）。

**Imports 風格**（ProductCard.test.tsx 第 1–4 行；App.test.tsx 第 1–5 行）：
```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
```
（檔名 `*.test.tsx` 才會進 jsdom 的 `component` project，`src/test/setup.ts` 自動載入 jest-dom。）

**onError 測試：**直接沿用（ProductCard.test.tsx 第 184–198 行）
```typescript
fireEvent.error(screen.getByAltText(product.name));
```
NavBar 改成 `fireEvent.error(screen.getByAltText("KRD MICGO Logo"))` 後，斷言 `screen.getByText("KRD MICGO")`。

**點擊導頁：**`await userEvent.setup().click(...)`（ProductCard.test.tsx 第 132 行寫法）；在 MemoryRouter 內放一個測試用 `LocationDisplay`（`const l = useLocation(); return <div data-testid="loc">{l.pathname}</div>`）驗證 pathname，風格同 App.test.tsx 第 33–43 行的 `GoTrumpet`。

**屬性斷言：**`expect(img).toHaveAttribute("src", "/brand-logo.png")`（同 ProductCard.test.tsx 第 128–131 行）。順序斷言以 `NAV_ITEMS`／預期標題陣列（所有商品、最新商品、KRD、MICGO、無線麥克風、有線麥克風、擴大機 / 喇叭、配件）比對 `getAllByRole("button")` 的文字。不需 mock 任何網路。

### `src/config/navigation.test.ts`（unit/node）

**Analog：** `src/services/catalog.test.ts`（`describe`／`it`、`toEqual` 路徑陣列）。斷言：`NAV_ITEMS.map(i => i.path)` 等於 `PRODUCT_PAGES.map(p => p.path)`；每個 `title` 等於 `PRODUCT_PAGE_VIEWS[path].title`。因 `productPageViews.tsx` 含 JSX 但 `navigation.ts` 不含，測試檔維持 `.test.ts`（node），若 import 鏈在 node 環境出問題再改 `.test.tsx`。

---

### `src/noAirtable.test.ts`（unit/node，原始碼掃描）

**無 repo 內 analog**，直接採用 RESEARCH.md 第 115–147 行範例（`import.meta.glob("/src/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true })`）。重點：
- 不可 `import "node:fs"`：`tsconfig.app.json` `include: ["src"]` 且無 `@types/node`，會讓 `tsc -b` 失敗。
- 以路徑 `"/src/noAirtable.test.ts"` 排除自身（正規表示式字面會自我命中）。
- 加 `files.length > 20` sanity check 防止 glob 空轉。
- 失敗訊息只列檔案路徑，不輸出匹配內容；regex 只寫格式，不寫實際值。
- Commit 排序：此測試在 `services/index.ts` 刪除前必紅，須與刪除放在同一個 task／commit（或最後加入）。
- 首次執行要確認 `vite/client` 型別（`src/vite-env.d.ts`）使 `import.meta.glob` 通過 `tsc -b`。

---

### `scripts/check-dist.mjs`（script，file-I/O）

**無 analog**（repo 沒有 `scripts/`，也沒有任何 Node 腳本）。用 RESEARCH 第 159–166 行規格：純 Node ESM（`package.json` 已 `"type": "module"`）、遞迴讀 `dist/`、套同一組 regex、只輸出檔名＋規則名、命中或 `dist/` 不存在時 `process.exit(1)`。`package.json` scripts 區塊現有寫法（第 6–13 行）：
```json
"build": "tsc -b && vite build",
"lint": "eslint .",
"test": "vitest run",
```
新增 `"check:dist": "node scripts/check-dist.mjs"`，不要塞進 `build`。

**Lint 風險（RESEARCH A2 已解）：**`eslint.config.js` 的 `files: ['**/*.{ts,tsx}']`，`.mjs` 不會被套規則，通常不必加 globals；仍須實跑一次 `npm run lint`。`ignores` 只有 `dist`。

---

### 靜態資產

- `public/brand-logo.png`（800×235）、`public/abouts/{karaoke,ktv,hotel,pub,bus,repair}.png`（250×250）。下載指令與驗證（`curl -sSfL`、`file`、`sips`）見 RESEARCH 第 168–183 行。`public/logo.png` 是 favicon，禁止覆蓋。不 commit 下載腳本。

### 刪除

- `src/services/index.ts`、`src/components/ProductView.tsx`。刪除後 `src/` 內 grep 不得再有 `airTable`、`services/index`、`ProductView`（D-13）。axios 仍被 `src/services/client.ts` 使用，不移除套件。

---

## Shared Patterns

### 程式風格（所有新／改 TS 檔）
**Source：** CLAUDE.md Conventions、`src/services/catalog.ts`
- 雙引號、分號、2 空格、多行尾逗號；註解用繁體中文；不使用 `any`。
- 元件為 PascalCase arrow function，檔尾 `export default X;`；事件處理以 `handle` 開頭；interface 用 PascalCase，Props 命名 `XxxProps`。
- `import type` 用於型別（`verbatimModuleSyntax`）；移除抓取邏輯後清掉未用 import（`noUnusedLocals`）。

### 單一來源導覽
**Source：** `src/services/catalog.ts` `PRODUCT_PAGES` ＋ `src/config/productPageViews.tsx` `PRODUCT_PAGE_VIEWS`
**Apply to：** `navigation.ts`、NavBar、SideMenu。不另寫第二份路徑／標題。

### 元件測試環境
**Source：** `vite.config.ts` 第 25–46 行：`*.test.ts` → node（unit），`*.test.tsx` → jsdom（component，setup `src/test/setup.ts`）。
**Apply to：** 所有新測試；檔案副檔名決定環境。

### 每個 commit 必過
`npm run build`（含 `tsc -b`）、`npm test`、`npm run lint`；順序遵守 D-12：資產與內容檔 → 元件改靜態（含測試）→ 刪除舊檔＋掃描測試 → check:dist → 文件更新。

### 憑證衛生
**Apply to：** 全部新檔、commit、文件。regex 只描述格式；掃描輸出只含檔名與規則名；不節錄 `src/services/index.ts`。

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/noAirtable.test.ts` | test | batch（原始碼掃描） | repo 無讀原始碼的測試，採 RESEARCH 範例 |
| `scripts/check-dist.mjs` | script | file-I/O | repo 無 `scripts/` 或 Node 腳本，採 RESEARCH 規格 |
| `public/brand-logo.png`、`public/abouts/*.png` | 資產 | file-I/O | 由 curl 下載，非程式碼 |

## Metadata

**Analog search scope：** `src/**`（40 個 tracked ts/tsx）、`vite.config.ts`、`eslint.config.js`、`package.json`、`public/`
**Files read：** NavBar、SideMenu、catalog、ProductCard.test、vite.config、AboutPage（相關區段）、App.test／catalog.test（相關區段）、productPageViews（開頭）
**Pattern extraction date：** 2026-11-10
