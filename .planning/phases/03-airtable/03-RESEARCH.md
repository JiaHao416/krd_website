# Phase 3: 靜態內容固化與移除 Airtable - Research

**Researched:** 2026-11-10
**Domain:** 前端資料來源改靜態（React 19 / Vite 6 / Vitest 4）、憑證殘留自動檢查
**Confidence:** HIGH（全部針對本 repo 實測；無新增套件）

## Summary

本 phase 不需新增任何套件，是純重構加資產下載。NavBar、SideMenu、AboutPage 各自 `useEffect` 呼叫 `airTable()`，改成讀 `NAV_ITEMS`（由 `PRODUCT_PAGES` + `PRODUCT_PAGE_VIEWS` 衍生）、`/brand-logo.png`、`ABOUT_SERVICES`。之後刪 `src/services/index.ts`（其中 `AirTable.ts` 內容其實也在同檔內）與 `ProductView.tsx`。實測 7 張 imgur 圖皆可直接 `curl` 下載，類型與尺寸與 CONTEXT 記載一致。

兩個容易漏掉的點：(1) `tsconfig.app.json` 的 `include: ["src"]` 且 repo **沒有 `@types/node`**，所以原始碼掃描測試不能 `import "node:fs"`，否則 `tsc -b`（即 `npm run build`）會失敗；應改用 Vite 內建的 `import.meta.glob(..., { query: "?raw" })`。(2) 三個既有測試檔（`App.test.tsx`、`HomePage.test.tsx`、`ProductPageTemplate.test.tsx`）的註解含「Airtable」字樣，會被掃描測試抓到，必須一併改掉。

**Primary recommendation:** 用 `import.meta.glob` 寫 node 環境的 `src/noAirtable.test.ts`（排除自身），搭配 `scripts/check-dist.mjs`（純 Node、無依賴）檢查 `dist/`；導覽順序改 `PRODUCT_PAGES` 後同步更新兩處順序斷言。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Logo 圖檔 | CDN / Static (`public/`) | Browser（`<img>`） | 路徑穩定、不經 bundler |
| 導覽項目清單 | Browser / Client（`src/config`） | — | 編譯期常數，由路由設定衍生 |
| 關於我們圖卡內容 | Browser / Client（`src/content`） | CDN / Static（圖片） | 純資料 + 靜態圖 |
| 憑證殘留檢查 | 建置／測試期 | — | 不在 runtime |

## Standard Stack

沿用既有，**不新增、不移除套件**（axios 仍被 `src/services/client.ts` 使用）。

| Library | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.1.12 | unit(node, `*.test.ts`) / component(jsdom, `*.test.tsx`) 兩個 project [VERIFIED: vite.config.ts] |
| @testing-library/react + user-event + jest-dom | 已安裝 | NavBar／SideMenu／AboutPage 元件測試 |
| `import.meta.glob`（Vite 內建） | vite ^6.3.5 | 無需 node 型別即可讀原始碼文字 |

## Package Legitimacy Audit

本 phase 不安裝外部套件，無需 slopcheck。**Packages removed / flagged: none.**

## Architecture Patterns

### 資料流
```
PRODUCT_PAGES (services/catalog.ts, 順序=現行選單)
      + PRODUCT_PAGE_VIEWS[path].title (config/productPageViews.tsx)
            └─> NAV_ITEMS (config/navigation.ts) ──> NavBar 桌機 / 手機選單
                                                └─> SideMenu
PRODUCT_PAGES ──> App.tsx 路由（順序無關）
public/brand-logo.png ──> NavBar <img src="/brand-logo.png"> ─onError─> 「KRD MICGO」文字
src/content/abouts.ts ABOUT_SERVICES ──> AboutPage map ──> public/abouts/*.png
```

### 目前程式現況（實測）
- `airTable` 唯三使用者：`NavBar.tsx`（logo+navigation）、`SideMenu.tsx`（navigation）、`AboutPage.tsx`（abouts）。`ProductView.tsx` 無任何引用。`src/services/index.ts` 單檔內含 axios instance、token、Base ID、`airTable()`、`getXxx`、型別。[VERIFIED: grep]
- NavBar 的 `navigationData` 在桌機選單（約第 140 行 map）使用；`activeHover` 以 `item.fields.path` 比對，改成 `item.path`。手機選單同樣 map，改法一致。「商店介紹」（`/abouts`）是獨立按鈕，不動。
- NavBar 目前 `logo ? <img> : <h1>KRD MICGO`；改為 `failed ? <h1> : <img onError={() => setFailed(true)}>`（state 即可，不必抽元件；若抽 `BrandLogo` 也可，屬 discretion）。Logo 容器 class／filter 不動。
- SideMenu 的 `isLoading` 骨架整段（三元運算的 true 分支）刪除，保留 `<div className="space-y-1">` 之後的結構。AboutPage 同理（8 格骨架）。`key` 改 `path`／`image`。
- 順序現況：`PRODUCT_PAGES` 為 all, new, micgo, krd, wired, wireless, trumpet, accessories；目標順序 all, new, **krd, micgo, wireless, wired**, trumpet, accessories。

### 順序相依處（必須同步更新）
| 檔案 | 位置 | 動作 |
|------|------|------|
| `src/services/catalog.ts` | `PRODUCT_PAGES` 陣列 + 註解「順序同 App.tsx 路由」 | 重排；註解改為「順序即導覽選單順序」 |
| `src/App.test.tsx` | `LEGACY_PATHS` 與 `toEqual(LEGACY_PATHS)`（第 46 行） | 改新順序，或改為排序後/集合比對（建議集合比對，語意是「路徑集合與舊網址相同」） |
| `src/services/catalog.test.ts` | 第 33 行「8 個商品頁路徑順序與路由一致」 | 改新順序，標題改為「順序即導覽順序」 |
| `src/services/products.test.ts` | 第 141 行用 `find` | 與順序無關，不用改 |
| `App.tsx` | `PRODUCT_PAGES.map` | 與順序無關 |

### NAV_ITEMS 範例
```ts
// src/config/navigation.ts
import { PRODUCT_PAGES } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

export interface NavItem { path: string; title: string }

/** 導覽項目：由商品頁設定衍生，不另外維護第二份路徑或標題 */
export const NAV_ITEMS: readonly NavItem[] = PRODUCT_PAGES.map((page) => ({
  path: page.path,
  title: PRODUCT_PAGE_VIEWS[page.path].title,
}));
```
注意 `noUncheckedIndexedAccess` 未開，`Record<string,...>[path]` 型別為非 undefined；若某 path 缺 view，測試（App.test 已有「每個路徑都有非空 title」）會抓到。

### 內容檔
```ts
// src/content/abouts.ts
export interface AboutService { name: string; image: string }
export const ABOUT_SERVICES: readonly AboutService[] = [
  { name: "卡拉OK", image: "/abouts/karaoke.png" },
  { name: "KTV", image: "/abouts/ktv.png" },
  { name: "酒店", image: "/abouts/hotel.png" },
  { name: "PUB", image: "/abouts/pub.png" },
  { name: "遊覽車", image: "/abouts/bus.png" },
  { name: "維修", image: "/abouts/repair.png" },
];
```
檔名對應（imgur id → slug）：m6YYqzT→karaoke、uL42nBw→ktv、cdPIBdK→hotel、SWOXFJc→pub、yHIqSll→bus、W5Exgnz→repair。名稱文字來自 CONTEXT 的實測，執行時若要再核對須唯讀查詢且不輸出 token。

### Anti-Patterns
- 不要用 `src/assets` + Vite import（D-05/D-08 已定用 `public/`，雜湊檔名會破壞「字串路徑」測試）。
- 不要 `import "node:fs"` 或 `path`（無 `@types/node`，會讓 `tsc -b` 失敗）。
- 不要覆蓋 `public/logo.png`（favicon）。
- 不要 commit 抓取腳本、不要把 token 帶進命令列歷史（下載 imgur 不需要 token）。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 讀原始碼做掃描 | `fs` + 遞迴 readdir | `import.meta.glob("/src/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true })` | 免 node 型別，Vitest 內可用 |
| 圖片類型驗證 | 自寫 magic number 檢查 | `file` + `sips -g pixelWidth -g pixelHeight` | macOS 內建 |

## 原始碼掃描測試（D-14）

位置建議：`src/noAirtable.test.ts`（`*.test.ts` → 進 node 環境 `unit` project）。

```ts
import { describe, it, expect } from "vitest";

// 載入 src 下所有 ts/tsx 的原始碼文字；key 為 "/src/..." 路徑
const sources = import.meta.glob("/src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// 只描述「格式」，不含任何實際憑證值
const FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["airtable 字樣", /airtable/i],
  ["Airtable API 網址", /api\.airtable\.com/i],
  ["Base ID 格式", /\bapp[A-Za-z0-9]{14}\b/],
  ["PAT 格式", /\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b/],
  ["舊式 API key 格式", /\bkey[A-Za-z0-9]{14}\b/],
];

// 本檔自己含有 pattern 原始碼，必須排除
const SELF = "/src/noAirtable.test.ts";
const files = Object.entries(sources).filter(([p]) => p !== SELF);

describe("原始碼不得含 Airtable 痕跡", () => {
  it("掃描檔案數量合理（避免 glob 失效而空轉）", () => {
    expect(files.length).toBeGreaterThan(20);
  });
  it.each(FORBIDDEN)("不含 %s", (_name, re) => {
    const hits = files.filter(([, text]) => re.test(text)).map(([p]) => p);
    expect(hits).toEqual([]);
  });
});
```
- **自我比對**：測試檔含 `/airtable/i` 字面，會命中自己 → 必須以路徑排除 SELF（上面已做）。注意排除寫在 filter，不是 regex。另外 `.planning/` 與 `CLAUDE.md` 不在 `src/`，不受影響。
- **假陽性實測**：現行 `src/`（排除 `services/index.ts`）與 `dist/` 中，`\bapp[A-Za-z0-9]{14}\b` 與 `\bkey[A-Za-z0-9]{14}\b` 只命中真正的憑證（Base ID 1 筆、key 格式 0 筆）；`keyboard`、`application` 等字長不符或有 `\b` 邊界，不會誤報。[VERIFIED: grep -c 實測，未輸出值]
- **token 種類**：現有 token 是 **PAT 格式**（`pat`+14+`.`+64 的 hex 規則命中 1 筆；舊式 `key` 命中 0 筆）。正規表示式仍兩種都留（D-14）。PAT 後段用 `[A-Za-z0-9]{64}` 比 `[a-f0-9]` 寬鬆，較安全。[VERIFIED: grep -c]
- **帶 `.` 的 PAT** 在 `\b` 前後：`pat…\.…64` 結尾是英數，`\b` 成立。
- 風險：未來合法變數名剛好 `app`/`key` + 14 字元英數會誤報（機率低）；誤報時改名即可，不要放寬 regex。
- 用 `files.length > 20` 這類 sanity check 防 glob 路徑寫錯而永遠通過；目前 src 約 40 個 ts/tsx 檔。
- 在刪除 `services/index.ts` **之前**此測試必紅，這是預期；因此 D-12 的順序是：此測試與其他改動放在刪除同一個 commit，或先在 commit 序列中最後才加入，以符合「每個 commit 測試都綠」。建議：測試檔與刪除放同一個 task/commit。

### 必須先清掉的既有字樣
`src/App.test.tsx:11`、`src/pages/HomePage.test.tsx:12`、`src/pages/ProductPageTemplate.test.tsx:12` 的註解「Layout 內的 NavBar／SideMenu 仍會呼叫 Airtable，測試一律以假元件取代」。NavBar/SideMenu 不再打網路後，可改寫為「以假元件取代 Layout，專注測商品路由」（不含 Airtable 字樣）；mock Layout 本身可保留。同時需 grep 確認 `src/` 內再無 `airtable`（不分大小寫）：目前除上述三處註解與要刪除的檔案外只有 `AboutPage.tsx`、`NavBar.tsx`、`SideMenu.tsx` 的 import。[VERIFIED: grep]

## dist 檢查（D-15，建議加 `check:dist`）

建議新增 `scripts/check-dist.mjs`（純 Node，無依賴，macOS 與 Cloudflare Linux 皆可），並在 `package.json` 加 `"check:dist": "node scripts/check-dist.mjs"`。不放進 `build`（Cloudflare 只跑 `npm run build`，且避免任何誤報擋住部署）。
- 遞迴讀 `dist/` 全部檔案文字，套同一組 regex；命中時只輸出檔名與規則名稱（**不輸出匹配內容**），非零結束碼。`dist/` 不存在時要失敗並提示先 `npm run build`。
- 腳本內 regex 只寫格式。不要用 shell `grep -E` 寫在 npm script 內：`|`、引號跳脫在 JSON 內易錯；且 `grep -r` 輸出會洩漏命中內容。
- `scripts/` 不在 `tsconfig` include 內；ESLint 設定若僅針對 `**/*.{ts,tsx}` 則不檢查 `.mjs`（需確認 `npm run lint` 通過，若 `eslint .` 對 `.mjs` 套 `js.configs.recommended`，需 `globals.node` 或加 `/* eslint-env node */`；實作時跑一次 lint 驗證）。
- 現況 baseline：舊 `dist/` 含 `api.airtable.com` 2 筆、`airtable` 字樣 3 筆、PAT 1 筆、Base ID 1 筆，證明 regex 對 minified bundle 有效；重新 build 後必須全為 0。[VERIFIED: grep -c on existing dist]
- 驗證前務必重新 `npm run build`（vite 會清空 dist）；`public/` 內檔案也會被複製進 dist，所以只放圖片不會有影響。

## 靜態資產下載與驗證

7 張皆實測可下載，結果（2026-11-10）[VERIFIED: curl + file + sips]：
- `vG5oafk` → PNG 800×235（Logo，約 16 KB）
- 六張服務圖 → 皆 PNG 250×250 RGBA（2.4–8.8 KB），彼此內容不重複

```bash
mkdir -p public/abouts
curl -sSfL -o public/brand-logo.png https://i.imgur.com/vG5oafk.png
curl -sSfL -o public/abouts/karaoke.png https://i.imgur.com/m6YYqzT.png
# ...其餘依對照表
file public/brand-logo.png public/abouts/*.png      # 必須都是 "PNG image data"
sips -g pixelWidth -g pixelHeight public/brand-logo.png public/abouts/*.png
```
- 用 `-f`（失敗即非零）+ `-L`（跟隨轉址）。imgur 若限流／下架可能回傳 HTML 或 `removed.png`（尺寸會異常小），所以驗證要檢查「類型為 PNG 且尺寸 = 800×235／250×250」，不要只看檔案存在。
- Logo `<img>` 建議 `width={800} height={235}` 配合現有 `h-7…lg:h-10 w-auto`；因 Tailwind class 設高度、`w-auto`，屬性只提供比例預留，不改視覺。AboutPage 圖卡容器為 `aspect-square`，圖片 `w-full h-full object-contain`，可加 `width={250} height={250}` 但非必要。

## Common Pitfalls

1. **Build 因 node 型別失敗**：在 `src/**/*.test.ts` 用 `node:fs`。避免：用 `import.meta.glob`。
2. **掃描測試自我比對**：見上，以路徑排除，並加檔案數 sanity check。
3. **中間 commit 紅燈**：掃描測試在 `services/index.ts` 刪除前會失敗。把測試新增與刪除放同一 commit，或測試最後加入。
4. **既有測試的 Airtable 註解**：三個檔案，見上。
5. **`noUnusedLocals`**：移除 `useEffect`/`useState` 後要同步刪未用 import（NavBar 仍需 `useState`、`useEffect`（scroll）；SideMenu 與 AboutPage 兩者皆不再需要）。
6. **SideMenu／NavBar 元件測試要包 Router**：用 `MemoryRouter initialEntries`；點擊導覽可驗證 `useLocation`（以測試用 `LocationDisplay` 元件顯示 `pathname`）。NavBar 手機選單需先點漢堡按鈕才會渲染（確認實作中是否條件渲染）；測試用 `getAllByRole("button", { name })` 處理桌機與手機同名項目。
7. **NavBar `scroll` 事件**：jsdom 可用，保留現有 effect 即可。
8. **onError 測試**：jsdom 不載入圖片，用 `fireEvent.error(img)` 觸發。
9. **舊 `dist/` 殘留**：驗證前務必重 build。
10. **CLAUDE.md／.planning/codebase 文件**：更新 Airtable 段落時不得寫入 token 或 Base ID 值；CLAUDE.md 目前仍有多處描述 Airtable（Stack、Architecture、Conventions），最後一個 plan 一併改寫。這些檔案不在 `src/`，不會被掃描測試涵蓋，但屬於 SEC-04 精神。

## Code Examples（NavBar 重點）
```tsx
import { NAV_ITEMS } from "../config/navigation";
const [logoFailed, setLogoFailed] = useState(false);
// ...
{!logoFailed ? (
  <img src="/brand-logo.png" width={800} height={235} alt="KRD MICGO Logo"
       onError={() => setLogoFailed(true)} className="…原有 class…"
       style={{ filter: "brightness(1.1) contrast(1.1) saturate(1.2)" }} />
) : ( /* 原本的 KRD MICGO h1 */ )}
{NAV_ITEMS.map((item) => (<div key={item.path} …>{item.title}</div>))}
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 手機選單需點漢堡按鈕後才渲染 | Pitfalls 6 | 測試步驟需調整，低風險（實作時讀 NavBar 即知） |
| A2 | `eslint .` 對 `scripts/*.mjs` 的處理方式 | dist 檢查 | lint 可能需加 node globals；實作時跑 lint 驗證 |

## Open Questions

1. **Airtable 內容在撤銷前是否仍與 CONTEXT 記載一致？**
   - 已知：CONTEXT 為 2026-11-10 當天唯讀查詢；imgur 圖檔已實測可下載。
   - 建議：不需重查；若要確認，依 D-11 唯讀且不輸出 token。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | 測試／build／check:dist | ✓ | v24.13.0（`.nvmrc` 24） | — |
| curl | 下載資產 | ✓ | 系統 | — |
| `file`、`sips` | 驗證圖片 | ✓ | macOS 內建 | — |
| imgur 公開網址 | 下載 | ✓（HTTP 200，7/7） | — | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.12（jsdom + Testing Library） |
| Config file | `vite.config.ts`（`unit`=node `*.test.ts`；`component`=jsdom `*.test.tsx`，setup `src/test/setup.ts`） |
| Quick run command | `npx vitest run <檔案>` |
| Full suite command | `npm test && npm run lint && npm run build && npm run check:dist` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | Logo `src=/brand-logo.png`；onError 顯示文字；`public/brand-logo.png` 存在 | component + 手動檔案檢查 | `npx vitest run src/components/NavBar.test.tsx`；`file public/brand-logo.png` | ❌ Wave 0 |
| STAT-02 | NAV_ITEMS 路徑集合=PRODUCT_PAGES、標題=views；NavBar 桌機/手機、SideMenu 依序顯示 8 項、active、點擊導頁 | unit + component | `npx vitest run src/config/navigation.test.ts src/components/NavBar.test.tsx src/components/SideMenu.test.tsx` | ❌ Wave 0 |
| STAT-03 | AboutPage 6 張圖卡名稱與 `/abouts/*.png` | component | `npx vitest run src/pages/AboutPage.test.tsx` | ❌ Wave 0 |
| SEC-04 | `src/` 無 airtable／Base ID／token 格式；舊檔已刪 | unit（掃描） | `npx vitest run src/noAirtable.test.ts` | ❌ Wave 0 |
| SEC-01 | `dist/` 無 Airtable 網址／token／Base ID | build 後腳本 | `npm run build && npm run check:dist` | ❌ Wave 0 |
| 全站可瀏覽 | build 成功、既有 172 測試仍綠 | full | `npm test && npm run build` | ✅ |

另可加：靜態資產存在性測試（`public/abouts/*.png` 數量等於 `ABOUT_SERVICES` 且每個 `image` 對應檔案存在）——因無 node 型別，可用 `import.meta.glob("/public/abouts/*.png", { query: "?url" })` 比對；非必要，改用 phase 驗證時的 `file`/`sips` 手動檢查亦可。

### Sampling Rate
- **每個 task commit：** `npx vitest run <相關檔案>` + `npm run build`（專案規定每次 commit 都要 build 成功）
- **每個 wave：** `npm test && npm run lint && npm run build`
- **Phase gate：** 上列 Full suite 全綠，且 `check:dist` 零命中

### Wave 0 Gaps
- [ ] `src/config/navigation.test.ts`、`src/components/NavBar.test.tsx`、`src/components/SideMenu.test.tsx`、`src/pages/AboutPage.test.tsx`
- [ ] `src/noAirtable.test.ts`、`scripts/check-dist.mjs`
- 框架已安裝，無需安裝。

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2/V3/V4 | no | 純靜態前端 |
| V5 Input Validation | no | 本 phase 無使用者輸入 |
| V6 Cryptography | no | — |
| V14 Config / Secrets | yes | 原始碼掃描測試 + dist 掃描；移除寫死憑證 |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 憑證殘留於 bundle／git 歷史 | Information Disclosure | 刪除來源 + 自動掃描；token 於 Phase 4 撤銷（git 歷史仍含舊 token，故撤銷是真正的緩解） |
| 掃描輸出洩漏憑證 | Information Disclosure | 腳本／測試只輸出檔名與規則名，不輸出匹配內容 |
| 外部圖床遺失 | Availability | 圖片已存入 repo（本 phase 目的） |

## Sources

### Primary (HIGH)
- 本 repo 實測：`vite.config.ts`、`tsconfig.app.json`、`package.json`、`src/**`、`dist/`（grep -c，不輸出值）、imgur 下載（curl/file/sips）
- `.planning/phases/03-airtable/03-CONTEXT.md`、`.planning/REQUIREMENTS.md`

### Secondary (MEDIUM)
- Vite `import.meta.glob` + `?raw`（Vite 內建功能；`vite/client` 型別已由 `src/vite-env.d.ts` 引入）[ASSUMED: 依訓練知識，實作時以一次測試跑通確認]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH（無新增）
- Architecture: HIGH（實讀程式）
- Pitfalls: HIGH／MEDIUM（`import.meta.glob` 在 Vitest 4 行為建議第一個 task 先跑通）

**Research date:** 2026-11-10
**Valid until:** 30 天
