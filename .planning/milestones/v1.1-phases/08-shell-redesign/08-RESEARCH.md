# Phase 8: Tokens、共用骨架與既有頁面改版 - Research

**Researched:** 2026-11-11
**Domain:** Tailwind 3.4 語意 token、React 19 元件改版、Vitest/jsdom 測試遷移、無障礙骨架（skip link、焦點、固定撥號列）
**Confidence:** HIGH（設定與測試行為都在本機實測或讀碼驗證；只有少數瀏覽器行為標 [ASSUMED]）

## Summary

這個 phase 不用裝新套件。工作分三塊：(1) 在 `tailwind.config.js` 建立 C5a 語意 token，`index.css` 改成只繼承 token；(2) 依 UI-SPEC 重寫骨架（膠囊頂列、分類 chip、一行頁尾、手機固定撥號列、skip link），再改版首頁、分類頁、關於我們；(3) 依 `06-TEST-INVENTORY.md` 遷移 314 項測試，契約類斷言一項都不能刪，最後加 `designTokens.test.ts` 防止回歸。

本機實測確認了幾件事（在 scratchpad 用專案的 tailwindcss 3.4.17 編譯）：`theme.colors` 直接覆寫時，`bg-slate-900`、`sm:`/`lg:`、`font-bold`、`text-sm` 一律不產生 CSS；`bg-tape/80`、`bg-surface/90` 會轉成 `rgb(... / 0.8)`；`fontSize` 可以寫 `var(--font-size-heading)`，配合 `:root` 的 media query，一個 `text-heading` class 就能做到「base 24px／md 28px」。jsdom 29 沒有 `Element.prototype.scrollIntoView`，也沒有 `window.matchMedia`，所以現有輪播測試在沒有 mock 時，減少動態的值一律是 `false`。新的 `(max-width: 767px)` 判斷也要先檢查 `typeof window.matchMedia === "function"`，否則大部分測試會直接崩潰。

讀碼時發現幾個上游文件沒寫到、或寫得和程式不一致的地方，planner 要知道：
1. 首頁目前是**兩組**熱銷輪播（featured=1／2），而且「兩組互相獨立」是契約測試；UI-SPEC 只畫了一個「這陣子大家都在問」區塊。
2. `ProductCard.test`「有描述時顯示，且不顯示品牌、型號、現貨」是契約列，但 UI-SPEC 要顯示品牌。
3. CONTEXT 說 NavBar 已經有 Esc／點外側關閉，**實際上沒有**，要新寫。
4. `ProductPageTemplate.test` 渲染時沒有包 Router，模板一放入 `CategoryChips`，17 項測試會全部崩潰。

以上都已在 Open Questions 給出決定。

**Primary recommendation:** 照 D-03 切 6 個 plan。第一個 commit 先把輪播 `matchMedia` mock 擴充為 `mockMatchMedia({ reducedMotion, base })`。token 先用 `theme.extend` 逐步遷移，收尾 plan 再改成 `theme` 直接覆寫（colors/fontSize/fontWeight/screens/boxShadow/borderRadius），同時啟用 `designTokens.test.ts`，兩道防線一起上。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Phase 6 留下的待決事項
- [auto] A1 — Q: "「價格請來電」如何取得？" → Selected: "UI 層依 priceMin/priceMax 皆為 null 顯示 tag，不改 PRICE_ON_REQUEST"（recommended；milestone 規則 services 只新增不修改）
- **D-01:** `format.ts` 的 `PRICE_ON_REQUEST = "價格洽詢"` 與 `formatPriceRange` **不改**。ProductCard／便條卡以 `product.priceMin === null && product.priceMax === null` 判斷無價，顯示 UI-SPEC 的「價格請來電」tag；有價時顯示 `product.priceText`。06-TEST-INVENTORY 中 ProductCard／ProductPageTemplate 對「價格洽詢」的呈現類斷言改為「價格請來電」；services 測試的「價格洽詢」契約斷言不動。
- [auto] A2 — Q: "列表頁『正在載入產品資訊...』『僅顯示前 100 項商品』？" → Selected: "兩句保留原字串"（recommended；前者為 aria-live 載入文字、後者為 truncated 提示，屬行為）
- **D-02:** 兩個字串原樣保留，只換樣式（Label、`ink-muted`）。

### 實作順序與計畫切分
- [auto] 順序 — Q: "如何切 plan？" → Selected: "基礎 → 骨架 → 列表 → 首頁 → 關於 → 全站掃描與 UAT"（recommended）
- **D-03:** 建議計畫順序（planner 可微調）：
  1. **基礎**：`FeaturedCarousel.test.tsx` 的 `matchMedia` mock 先擴充為處理 `(max-width: 767px)`（回傳 `matches:false`）——UI-SPEC 明定「Phase 8 第一個 commit 先改 mock」；`tailwind.config.js` 語意 token（色彩、字級 4 級、圓角、陰影、`fontFamily.sans`）、`index.css` 改為只繼承 token 並清除舊 `.glass-card` 等不再使用的樣式；`src/components/icons.tsx`（inline SVG，含 4 個手繪分類圖示，路徑取自 mockups/home-desktop）；`src/config/contact.ts`（欄位與值照 UI-SPEC）。
  2. **共用骨架**：`Layout`（skip link「跳到主要內容」、`<main id="main">`、移除 `showSideMenu`）、膠囊頂列 `NavBar`、一行頁尾 `Footer`（兩種文案）、手機固定撥號列（base only；詳情雙鈕版留給 Phase 9）、`CategoryChips`（取代 `SideMenu.tsx`，刪除 SideMenu 檔）。
  3. **分類頁**：`ProductPageTemplate`（h1、副行、grid/list 與排序控制、chip 列、結尾「找不到想要的？」、空／錯誤狀態）＋ `ProductCard` 外觀（grid/list、價格 tag、洽詢交期 tag、傾斜、hover/focus、skeleton）＋ `ImagePlaceholder` 配色。
  4. **首頁**：hero（含店面照片預留位、營業中戳章 xl only）、分類貼紙卡、`FeaturedCarousel` 改「這陣子大家都在問」便條卡外觀（md+ 3 張、base 橫向捲動且不自動播放）、聯絡區（含地圖預留位）。
  5. **關於我們**：依 UI-SPEC 主視覺錨點改版，聯絡資訊區塊與首頁聯絡區同樣式、同來源 `contact.ts`（UX-06）。
  6. **收尾**：全站寫死色碼掃描、斷點類別檢查、真實瀏覽器 UAT、測試總數與契約核對、合併 main 檢查。
- **D-04:** 每個 commit 都須 `npm test`、`npm run lint`、`npm run build` 全綠；TDD 衝突處理同 Phase 7：先寫／改測試看到失敗、記錄 RED 證據於 SUMMARY，綠了才 commit。

### 行為保留邊界
- **D-05:** `FeaturedCarousel` 的資料與狀態機（`activeIndex`、`intervalMs` 計時、`isHovered`、`hasFocusWithin`、`isPointerDownRef` 與 pointer/focus/blur 處理）**不動**，只改 JSX 與 className；新增「base 不自動播放」以 `matchMedia("(max-width: 767px)")` 與 reduced-motion 同機制實作；base 時按鈕／指示點改為 `scrollIntoView({ inline: "start" })`（reduced-motion 時 `behavior: "auto"`）。`aria-label`「上一張／下一張／第 N 張」與載入／空／錯誤文案不變。
- **D-06:** `ProductCard` 本 phase 保留 `role="button"`、`tabIndex`、`onClick`／`onKeyDown`、`onImageClick` 與 `aria-label="查看 … 大圖"`（Phase 10 才改為 Link），只移除 UI-SPEC 明列的呈現元素（右上價格徽章、hover 遮罩／放大鏡、「點擊查看大圖」文字）並套新外觀。`ProductPageTemplate` 的 `ImageModal` 狀態保留至 Phase 10。
- **D-07:** `NAV_ITEMS`／`PRODUCT_PAGES`／`PRODUCT_PAGE_VIEWS` 維持單一來源；8 條舊網址與 `App.tsx` 路由不變（UX-05）；`/products/:id` 不在本 phase 加入。
- **D-08:** 禁止 `services/` 既有內容的修改（milestone 規則）；hooks 不改。

### 測試遷移（TEST-06）
- **D-09:** 嚴格依 `06-TEST-INVENTORY.md` 的「預定處置」欄改寫：SideMenu 5 項 → `CategoryChips.test.tsx` 同語意 5 項（role 由 button 變 link、name 不變）；NavBar 依 UI-SPEC「導覽與 SideMenu 影響」改寫並新增「打電話問問 href=tel:」「選單鈕 aria-expanded」等測試以維持數量；FeaturedCarousel 依 UI-SPEC「對 Phase 8 / Phase 10 測試的影響」調整（視窗第一張、佔位圖對應卡）。**契約類斷言一項都不能刪**；呈現類改寫時在 SUMMARY 列出「舊斷言 → 新斷言」對照。
- **D-10:** 每個 plan 結束時 `npx vitest list | wc -l` ≥ 前一個 plan 的數字（Phase 7 結束為 314），phase 結束時 > 314；在 SUMMARY 記錄。
- **D-11:** 新元件（CategoryChips、MobileCallBar、ContactBlock 等）都要有元件測試，至少涵蓋 role／accessible name／href／aria 狀態與 contact.ts 選填欄位（LINE／Email 空值不渲染）。

### Token 防回歸（DESIGN-02）
- [auto] Q: "如何確保不再有寫死色碼？" → Selected: "新增原始碼掃描測試（同 noAirtable 手法）"（recommended）
- **D-12:** 新增 `src/designTokens.test.ts`：以 `import.meta.glob("/src/**/*.tsx", { query: "?raw" })` 掃描（排除測試檔），斷言 className 不含 `slate-`、`gray-`、`blue-`、`white/`、`black/`、任意 `#hex` 色碼、`sm:`／`lg:`／`2xl:` 斷點前綴、`font-bold`／`font-medium`。失敗時只列檔名與規則名。此測試在收尾 plan 加入（前面的 plan 逐步清除，最後一個 plan 啟用即綠）。

### 瀏覽器 UAT（UX-04 與 RWD）
- [auto] Q: "真實瀏覽器 UAT 由誰做？" → Selected: "Claude 以瀏覽器自動化在 localhost 實測，截圖存證；只把無法自動化的項目留給使用者"（recommended）
- **D-13:** 收尾 plan 啟動 `npm run dev`（Vite proxy 讀 production API），以瀏覽器自動化（chrome-devtools MCP 或 claude-in-chrome）在 320／768／1024／1440 寬度截圖首頁、列表、關於；驗證輪播 hover 暫停、鍵盤焦點暫停、點擊後不黏住、reduced-motion 不自動、base 不自動；8 條舊網址可開；1024px 頂列不折行。截圖與結果寫入 `08-UAT.md`。dev server 用完即停止。
- **D-14:** 無法自動化的項目（Windows Chrome 文字 antialias 是否模糊、實機觸控手感）列為 human-needed，延到 Phase 11 上線前一併請使用者確認，不阻擋 Phase 8。

### 素材與內容來源
- **D-15:** 店面照片、地圖依 UI-SPEC「素材預留位」實作為 `role="img"` 預留位（無素材即正式呈現）。`contact.ts` 的 `lineUrl`／`email` 不設值。
- **D-16:** 關於我們頁沿用 `src/content/abouts.ts` 的 `ABOUT_SERVICES` 與 `public/abouts/*.png`，只換版面；聯絡資訊改讀 `contact.ts`（舊 Footer 與 AboutPage 內寫死的地址／電話／時間全部移除）。
- **D-17:** Phase 結束時檢查 `main` 是否有新 commit，有則本地合併進 `redesign`（衝突則 abort 回報），永不 push。

### Claude's Discretion
全部灰色地帶由 Claude 依 `--auto` 選建議預設值。planner 可調整計畫切分與檔案組織，但不得改變：D-01（不改 PRICE_ON_REQUEST）、D-05（輪播狀態機不動）、D-06（ProductCard 行為留到 Phase 10）、D-09（契約斷言不得刪）、UI-SPEC 的所有視覺數值。

### Deferred Ideas (OUT OF SCOPE)
- Windows antialias／實機觸控確認 → Phase 11 上線前人工確認
- 地圖改為 Google 地圖連結 → 待 Owner 提供素材
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESIGN-02 | 全站樣式使用 `tailwind.config.js` 的語意 token，不再散落寫死的色碼 | §Token 寫法、§designTokens 掃描規則、§收尾 theme 覆寫（本機實測：覆寫後預設色票不產生 CSS）|
| DESIGN-03 | 中文字型堆疊補 `PingFang TC`、`Noto Sans TC`，不載入 CJK webfont | §fontFamily.sans（實測輸出 CSS 正確）；designTokens 字型測試；dist 無 `@font-face` 檢查 |
| SHELL-01 | 320–1440px NavBar 正常，1024px 不擠壓不折行 | §NavBar 實作細節；NavBar.test 改寫；UAT 以 `evaluate_script` 量頂列高度 |
| SHELL-02 | 分類 chip 列（md+ 換行、base 單列橫捲）取代 SideMenu | §CategoryChips；SideMenu 5 項 + NavBar 9 項 → chips 15 項 |
| SHELL-03 | 首頁聯絡區三項完整、他頁一行頁尾＋打電話問問；單一來源 `contact.ts`；LINE／Email 有值才顯示 | §contact.ts、ContactBlock／Footer／MobileCallBar；聯絡字串單一來源掃描測試 |
| SHELL-04 | skip link、所有可互動元素焦點樣式 | §Skip link 與焦點（全域 `:focus-visible`）；Layout.test；designTokens 禁 `outline-none` |
| UX-04 | 新首頁熱銷保有 WCAG 2.2.2 行為並通過真實瀏覽器 UAT | §FeaturedCarousel 測試手法（mock 擴充、視窗第一張 helper、scrollIntoView stub）；§UAT |
| UX-05 | 分類頁仍可 grid/list、名稱排序；8 條舊網址正常 | 保留 `<select>`（combobox）與 aria-pressed 按鈕；App.test 8 路由不動 |
| UX-06 | 關於我們聯絡資訊與 Footer 同一來源 | AboutPage 改用 `ContactBlock`（讀 `CONTACT`）；單一來源掃描 |
| UX-07 | 圖片固定長寬比、失敗替代畫面、不跳動 | `aspect-square`／固定高 + `ImagePlaceholder`；UAT 以 PerformanceObserver 量 CLS |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- 技術棧：Vite 6 + React 19 + TypeScript ~5.8 + Tailwind 3.4 + axios，**不引入新套件**（本 phase 也不需要）。
- 維持現有網址路徑（8 條舊網址）。
- 前端不得含任何憑證；`noAirtable.test.ts` 與 `check-dist.mjs` 必須持續通過（掃描檔數 > 20，刪除 SideMenu 後仍遠高於此）。
- 每次提交都要 `npm run build` 成功（含 `tsc -b` 與 dist 掃描）、`npm test`、`npm run lint`。
- `tsconfig.app.json`：`strict`、`noUnusedLocals/Parameters`、`verbatimModuleSyntax`（type import 要寫 `import type`）、`erasableSyntaxOnly`（不能用 enum/namespace）。
- 風格：雙引號、分號、2 空格、尾逗號；元件用 PascalCase arrow function 並 `export default`；Props 介面命名 `XxxProps`；事件處理函式以 `handle` 開頭。
- 註解、文件、commit 訊息一律繁體中文；commit 不加 AI 署名；不可 `--no-verify`。
- 服務層錯誤以 `ApiError` 上拋，畫面文字只能來自固定文案（不洩漏後端原文）。
- 後端欄位命名以 `apiTypes.ts` 為準；`services/` 既有內容不改（D-08）。
- GSD 流程：規劃文件核准後才能改程式碼。
- ESLint `react-refresh/only-export-components`（warn）：元件檔只匯出元件；常數放 `.ts` 檔（例如 `contact.ts`）。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 語意 token（色彩、字級、圓角、陰影、斷點）| 建置設定（`tailwind.config.js`）| CSS base（`index.css`）| Tailwind 編譯期就決定哪些 class 會產生 CSS |
| 字型堆疊 | 建置設定 | 瀏覽器（系統字型）| 不載入 webfont，交給 OS 解析 |
| 骨架（頂列、頁尾、固定列、skip link）| Browser / Client（`Layout` 與子元件）| — | 純前端 SPA |
| 聯絡資訊 | 靜態設定（`src/config/contact.ts`）| Client 元件 | 單一來源，元件讀常數或由 props 注入 |
| 分類導覽 | 靜態設定（`NAV_ITEMS`）| Client（CategoryChips）| D-07 單一來源 |
| 商品資料 | 後端公開 API → `useProducts`（不改）| Client 呈現 | D-08 |
| base 不自動播放 | Client（matchMedia hook）| — | 與 reduced-motion 同機制 |
| 防回歸（token、斷點、聯絡字串）| 測試（`import.meta.glob` 原始碼掃描）| 建置（theme 覆寫讓違規 class 不產生 CSS）| 兩道防線 |

## Standard Stack

### Core（全部沿用，不新增）
| Library | Version（本機 node_modules 實測）| Purpose |
|---------|---------|---------|
| tailwindcss | 3.4.17 | token、utility |
| react / react-dom | ^19.1.0 | UI |
| react-router-dom | 6.30.1 | `Link`、`useLocation` |
| vitest | 4.1.12 | 測試（unit／node、component／jsdom 兩個 project）|
| jsdom | 29.1.1 | component 環境（**無 scrollIntoView、無 matchMedia**，已實測）|
| @testing-library/react | 16.3.3 | render、within |
| @testing-library/user-event | 14.6.9 | tab、keyboard、click |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| inline SVG `icons.tsx` | lucide-react 等圖示套件 | UI-SPEC 明定不新增套件 |
| CSS 變數做響應式字級 | `text-heading md:text-heading-lg` 兩個 token | UI-SPEC 說這是「同一 token 的響應式值」；用 CSS 變數，一個 class 就夠，也不會多出字級 |
| 新 hook `useMediaQuery` | 直接改 `usePrefersReducedMotion` | D-08 禁止改既有 hook，新增檔案不算修改 |

**Installation:** 無。

## Package Legitimacy Audit

本 phase **不安裝任何外部套件**，slopcheck 不適用。

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| （無）| — | — | — | — | — | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
瀏覽器請求 /、/all-products…、/abouts
        │
        ▼
main.tsx → BrowserRouter → App.tsx（Routes，不再有漸層外框）
        │
        ▼
各頁面 ──► Layout(footer="thanks"|"address")
             ├─ <a href="#main"> 跳到主要內容（第一個 tab stop）
             ├─ NavBar（Logo Link "/"、主選單 nav：逛商品／關於我們、tel: 打電話問問；
             │          base：選單鈕 aria-expanded → 膠囊面板，Esc／點外側關閉）
             ├─ <main id="main" tabIndex=-1> ← 頁面內容
             │     ├─ HomePage：hero → 分類貼紙卡(Link×4，取 PRODUCT_PAGE_VIEWS)
             │     │            → 「這陣子大家都在問」section
             │     │                 ├─ group「熱門推薦系列」→ FeaturedCarousel(featured1)
             │     │                 └─ group「頂級精選系列」→ FeaturedCarousel(featured2)
             │     │                        └─ useMediaQuery("(max-width: 767px)")
             │     │                             ├─ false：渲染 3 張視窗、可自動播放
             │     │                             └─ true ：渲染全部卡、橫捲、不自動、按鈕→scrollIntoView
             │     │            → ContactBlock（讀 CONTACT）
             │     ├─ ProductPageTemplate：h1＋副行＋控制列 → CategoryChips(NAV_ITEMS)
             │     │            → useProducts（不改）→ ProductCard grid/list（仍 role=button 開燈箱）
             │     │            → 「找不到想要的？」→ ImageModal（保留到 Phase 10）
             │     └─ AboutPage：h1 → 公司介紹 → ContactBlock → ABOUT_SERVICES 圖卡
             ├─ Footer（一行；thanks 或 © KRD・address・businessHours）
             └─ MobileCallBar（md:hidden，fixed，tel:）
```

### Recommended Project Structure（本 phase 新增／變動）
```
src/
├── components/
│   ├── icons.tsx              # 新：Phone/Menu/Close/ChevronLeft/ChevronRight + 4 分類圖示
│   ├── PriceTag.tsx           # 新：無價→「價格請來電」tag；有價→priceText（卡片與便條卡共用）
│   ├── CategoryChips.tsx      # 新：取代 SideMenu.tsx（刪除）
│   ├── MobileCallBar.tsx      # 新：base 固定撥號列
│   ├── ContactBlock.tsx       # 新：首頁聯絡區＝關於我們聯絡區
│   ├── Layout.tsx / NavBar.tsx / Footer.tsx / ProductCard.tsx / FeaturedCarousel.tsx
│   └── ImagePlaceholder.tsx / ImageModal.tsx   # 改配色
├── config/contact.ts          # 新：ContactInfo + CONTACT + splitBusinessHours + hasText
├── hooks/useMediaQuery.ts     # 新（不動 usePrefersReducedMotion）
├── designTokens.test.ts       # 新（收尾 plan）
└── index.css                  # 只留 base；App.css 刪除
```

### Pattern 1：Token 寫法（Plan 1：extend；Plan 6：覆寫）

```js
// tailwind.config.js（Plan 1 版本：放在 extend，保留 Tailwind 預設，讓尚未遷移的頁面暫時仍能顯示）
// 色值集中成常數，陰影引用同一份，避免重複寫色碼
const COLORS = {
  surface: "#27303B",
  "surface-raised": "#323C49",
  ink: "#EEF1F5",
  "ink-muted": "#B9C2CD",
  accent: "#F0A04B",
  "accent-ink": "#1C232C",
  "accent-hover": "#F6BC7C",
  "accent-shadow": "#B5732E",
  "block-1": "#2C4258",
  "block-2": "#3A4A5E",
  "block-3": "#5A4A1E",
  sand: "#3A4553",
  dash: "#5A6676",
  tape: "#F0B43C",
  success: "#7ED6A0",
  danger: "#FF8A7A",
  white: "#FFFFFF",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: COLORS,
      fontFamily: {
        // DESIGN-03：Mac→PingFang TC、Windows→微軟正黑體、Android→Noto Sans TC；不載入 webfont
        sans: ['"PingFang TC"', '"Microsoft JhengHei"', '"微軟正黑體"', '"Noto Sans TC"', "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["15px", { lineHeight: "1.6" }],
        body: ["17px", { lineHeight: "1.6" }],
        // 響應式值由 index.css 的 CSS 變數提供（base 24/32、md 起 28/48）
        heading: ["var(--font-size-heading)", { lineHeight: "1.25" }],
        display: ["var(--font-size-display)", { lineHeight: "1.15" }],
      },
      lineHeight: { card: "1.35" }, // 卡片名稱
      borderRadius: { pill: "9999px", image: "16px", card: "20px", block: "24px", panel: "32px" },
      boxShadow: {
        card: "0 6px 0 rgba(0,0,0,0.3)",
        "card-sm": "0 4px 0 rgba(0,0,0,0.3)",
        "card-lg": "0 8px 0 rgba(0,0,0,0.3)", // Phase 9 詳情主圖
        note: `0 6px 0 ${COLORS.sand}`,
        "note-sm": `0 4px 0 ${COLORS.sand}`,
        bar: `0 6px 0 ${COLORS.sand}`,
        "bar-sm": `0 4px 0 ${COLORS.sand}`,
        btn: `0 6px 0 ${COLORS["accent-shadow"]}`,
        "btn-pressed": `0 2px 0 ${COLORS["accent-shadow"]}`, // active 按下感
        "btn-float": `0 6px 0 ${COLORS["accent-hover"]}`,   // 手機固定撥號列
        float: "0 -6px 16px rgba(0,0,0,0.25)",              // 唯一模糊陰影
      },
      outlineOffset: { 3: "3px" },
    },
  },
  plugins: [],
};
```

- 舊的 `animation`／`keyframes`（fade-in、slide-up、pulse-slow）在 Plan 1 就刪掉；目前用到的只有 HomePage、AboutPage 的 `animate-fade-in`／`animate-slide-up`，而且是 index.css 自訂 class，在 Plan 4／5 改版時一起移除。
- **間距不限制 `theme.spacing`**：w/h 也共用 spacing scale，44/56/64/80/96/148/170/200px 這些元件尺寸都要用到。7 個間距值靠 designTokens 的「間距 allow-list」規則守住（見 Pattern 6）。
- **Plan 6 覆寫**（從 `extend` 移到 `theme` 最上層）：
  ```js
  theme: {
    screens: { md: "768px", xl: "1280px" },            // sm/lg/2xl 變體從此不存在
    colors: { transparent: "transparent", current: "currentColor", inherit: "inherit", ...COLORS },
    fontSize: { label: …, body: …, heading: …, display: … },
    fontWeight: { normal: "400", semibold: "600" },
    borderRadius: { none: "0px", pill: …, image: …, card: …, block: …, panel: … },
    boxShadow: { none: "none", ...上列 },
    extend: { fontFamily, lineHeight, outlineOffset },
  }
  ```
  本機實測 [VERIFIED: scratchpad 編譯 tailwindcss 3.4.17]：覆寫後 `bg-slate-900`、`sm:p-4`、`lg:p-4`、`font-bold`、`text-sm` 都不產生 CSS；`md:`、`max-md:`、`bg-tape/80`→`rgb(240 180 60 / 0.8)`、`shadow-note`（引用 sand）、`outline-offset-3` 都正常。**注意 `text-white` 仍然有效**（因為 token 裡有 `white`），只能靠掃描規則擋下。
  Preflight 的 `borderColor.DEFAULT` 原本引用 `gray.200`，覆寫後會改成 `currentColor` [CITED: v3.tailwindcss.com/docs/customizing-colors：覆寫要自行補 transparent/currentColor]。新元件都會明寫邊框色，影響可以接受；要保守的話，可在 `extend.borderColor` 補 `DEFAULT: COLORS.dash`。

### Pattern 2：index.css（只繼承 token）

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* 響應式字級：同一個 token 在 base 與 md 起不同值（UI-SPEC 僅此兩處例外） */
  :root {
    --font-size-heading: 24px;
    --font-size-display: 32px;
  }
  @media (min-width: theme("screens.md")) {
    :root {
      --font-size-heading: 28px;
      --font-size-display: 48px;
    }
  }
  body {
    @apply m-0 min-h-screen bg-surface text-body text-ink antialiased;
    font-family: theme("fontFamily.sans");
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }
  #root { @apply min-h-screen w-full; }
  /* 全站焦點樣式（SHELL-04）：2px accent、offset 3px，所有可互動元素一致 */
  :focus-visible {
    outline: 2px solid theme("colors.accent");
    outline-offset: 3px;
  }
  /* skip link 目標 main 的程式化焦點不需外框（非可互動元素） */
  [tabindex="-1"]:focus { outline: none; }
  /* 只有允許動態時才平滑捲動 */
  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }
}
```
[VERIFIED: scratchpad 編譯] `@media (min-width: theme("screens.md"))`、`@apply text-body`、`[tabindex="-1"]:focus` 都編譯正確。

**index.css 現況與處置**（grep 使用點的結果）：

| 現有樣式 | 使用點（src，不含 index.css）| 處置 |
|---|---|---|
| base `a`（`text-blue-400 font-medium`）、`h1`（`text-5xl font-bold`）、`button`（`px-5 py-3 rounded-lg …`）| 全站隱性套用 | **Plan 1 刪除**：會把 padding、圓角、藍字帶進新元件 |
| `html scroll-smooth`、`body bg-slate-900 text-white` | 全站 | Plan 1 改成上面的 token 版 |
| `.glass-card` | SideMenu、ProductCard、AboutPage、HomePage（AboutPage.test 有 `.glass-card.animate-pulse` 選擇器）| 先放進 LEGACY 區塊，Plan 4／5 遷移完後刪除 |
| `.product-card-new`、`.product-image-container`、`.product-image`、`.product-overlay`、`.product-info`、`.product-title`、`.zoom-icon`、`.product-badge` | ProductCard（測試也斷言這些 class）| LEGACY 區塊，Plan 3 刪除 |
| `.text-shadow`、`.text-shadow-lg` | FeaturedCarousel | LEGACY 區塊，Plan 4 刪除 |
| `.animate-fade-in`、`.animate-slide-up` 與 keyframes | HomePage、AboutPage | LEGACY 區塊，Plan 4／5 刪除 |
| `.line-clamp-2/3` 自訂 utility | ProductCard 用 `line-clamp-1/2` | **Plan 1 刪除**：Tailwind 3.3 起內建 line-clamp [ASSUMED]，刪除後以 build 輸出確認 `.line-clamp-2` 仍存在 |
| `.gradient-text`、`.gradient-button`、`.hover-card`、`.nav-link`、`.sidebar-link`、`.product-price`、`.logo-enhanced`、`.logo-text-enhanced`、`.modal-backdrop`、`.loading-spinner`、`.heart-button`、`.scrollbar-hide`、`.glass-effect`、`.animate-float`、`.animate-slide-in-left`、`.animate-shimmer`、`*-modern` 系列、`@media (max-width:768px)`、`prefers-color-scheme`、`prefers-contrast` 區塊 | **無**（grep 為 0）| **Plan 1 刪除** |
| `App.css`（只有 `#root`，和 index.css 重複）| `App.tsx` import | **Plan 1 刪除檔案與 import** |

LEGACY 區塊的寫法是在 index.css 放一段 `/* LEGACY：Phase 8 遷移中，Plan N 刪除 */`。Plan 6 驗證：`grep -c "LEGACY" src/index.css` 等於 0。

### Pattern 3：NavBar（膠囊頂列）

- **現況已驗證：** NavBar.tsx 只有 scroll 監聽，**沒有** Esc、點外側關閉、防背景捲動（CONTEXT 寫錯了；Esc 只在 ImageModal 裡）。所以「Esc 與點外側關閉」是新功能，要寫測試。
- 結構：`<header>` 膠囊（`bg-surface-raised rounded-pill shadow-bar-sm md:shadow-bar`，內距 base `py-1 pr-1 pl-4`、md `py-2 pr-2 pl-6`）。不 sticky、不 fixed，移除 scroll 監聽與 `h-20` spacer。
- Logo 改成 `<Link to="/">` 包 `<img src="/brand-logo.png" width={800} height={235} alt="KRD MICGO Logo" className="h-[26px] md:h-[30px] w-auto">`。失敗備援改用 `<span>KRD MICGO</span>`，**不可以用 `<h1>`**，因為每頁已經有自己的 h1。
- md+：`<nav aria-label="主選單" className="hidden md:flex">` 放「逛商品」（`/all-products`）、「關於我們」（`/abouts`）。右側是 `<a href={`tel:${CONTACT.phoneHref}`} className="hidden md:inline-flex …">`，內容為 PhoneIcon + 打電話問問。
- 「逛商品」選中：`NAV_ITEMS.some(i => i.path === pathname) || pathname.startsWith("/products/")` 時加 `aria-current="page"` 與 `bg-block-2 font-semibold`。「關於我們」選中條件是 `pathname === "/abouts"`。
- base：選單鈕 `<button type="button" className="md:hidden h-11 w-11 bg-block-3 rounded-pill" aria-expanded={isMenuOpen} aria-controls="mobile-menu" aria-label={isMenuOpen ? "關閉選單" : "開啟選單"}>`。面板**一律渲染**，用 `hidden={!isMenuOpen}` 控制顯示，這樣 `aria-controls` 永遠指得到元素，RTL 也會把 `hidden` 元素排除在 role 查詢之外（已實測 jsdom 對 `[hidden]` 套 `display:none`）。
- Esc：開啟時在 `document` 監聽 `keydown`；按 Escape 就關閉，並把焦點還給選單鈕（用 `buttonRef.current?.focus()`）。點外側：開啟時在 `document` 監聽 `pointerdown`，`!containerRef.current?.contains(e.target as Node)` 就關閉。點面板內的 Link 時用 `onClick` 關閉。
- 移除 `useNavigate` 和 `<button onClick=navigate>` 的寫法，全部改成 `<Link>`。

### Pattern 4：Layout、skip link、固定撥號列、頁尾

```tsx
// Layout.tsx（重點）
interface LayoutProps {
  children: ReactNode;
  /** 頁尾文案：首頁與列表用 thanks，其餘頁用 address */
  footer: "thanks" | "address";
}

const Layout = ({ children, footer }: LayoutProps) => (
  // base 底部留 96px 給固定撥號列；md 起沒有固定列
  <div className="min-h-screen flex flex-col pb-24 md:pb-0">
    {/* skip link：第一個 tab stop，聚焦時顯示為主按鈕樣式 */}
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-pill focus:bg-accent focus:px-6 focus:text-body focus:font-semibold focus:text-accent-ink"
    >
      跳到主要內容
    </a>
    <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 md:px-8 md:pt-6 xl:px-16">
      <NavBar />
    </div>
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1280px] flex-1 px-4 md:px-8 xl:px-16">
      {children}
    </main>
    <Footer variant={footer} />
    <MobileCallBar />
  </div>
);
```

- `href="#main"` 是原生錨點。BrowserRouter 下點擊會讓網址變成 `/path#main`，觸發 popstate 後重新渲染，但不會 remount [ASSUMED]。UAT 時確認點擊後焦點在 main、內容沒有重載。
- 「頁面頂端 padding 24px／手機 16px」放在頂列外層；區塊間距 `xl` 64、base 32，由各頁自己用 `space-y-8 xl:space-y-16`。
- **MobileCallBar**：`<div className="fixed inset-x-4 bottom-4 z-40 md:hidden">`，裡面是 `<a href={`tel:${info.phoneHref}`} className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-accent text-body font-semibold text-accent-ink shadow-btn-float">`，內容為 PhoneIcon + 打電話問問。`md:hidden` 是 `display:none`，會從無障礙樹移除，不會跟頂列按鈕重複朗讀。iOS 安全區：index.html 沒有 `viewport-fit=cover`，`env(safe-area-inset-bottom)` 是 0，所以不需要處理 [ASSUMED]。
- **Footer**：`<footer className="py-8 text-center text-label text-ink-muted">`。`variant === "thanks"` 時顯示「© KRD・謝謝你逛到這裡」，否則顯示 `` `© KRD・${info.address}・${info.businessHours}` ``。
- **依賴注入**：Footer、MobileCallBar、ContactBlock 都接受 `info?: ContactInfo`，預設值為 `CONTACT`。測試注入有 `lineUrl`／`email` 的假資料，不用 mock 模組，也符合「介面勝過單例」。

### Pattern 5：contact.ts

```ts
// src/config/contact.ts — 聯絡資訊單一來源（首頁聯絡區、頂列、固定列、頁尾、關於我們、Phase 9 詳情 CTA）
export interface ContactInfo {
  /** 地址（必填）*/
  address: string;
  /** 顯示用電話（必填）*/
  phone: string;
  /** tel: 連結用電話（必填，純數字與連字號）*/
  phoneHref: string;
  /** 營業時間主行（必填）*/
  businessHours: string;
  /** 休息日備註（必填）*/
  closedNote: string;
  /** LINE 連結（選填，有值才顯示）*/
  lineUrl?: string;
  /** Email（選填，有值才顯示）*/
  email?: string;
}

export const CONTACT: ContactInfo = {
  address: "411 台中市太平區永平路二段320之1號",
  phone: "(04) 2279-8787",
  phoneHref: "04-22798787",
  businessHours: "週一至週六 09:00 - 17:30",
  closedNote: "週日及國定假日休息",
};

/** 選填欄位是否有值（undefined、空字串、純空白都視為沒有） */
export function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 營業中戳章用：以第一個空白拆成「日」與「時段」兩行；拆不出來時整句放第一行
 * @param hours - 營業時間主行
 * @returns [第一行, 第二行]
 */
export function splitBusinessHours(hours: string): [string, string] {
  const index = hours.indexOf(" ");
  return index === -1 ? [hours, ""] : [hours.slice(0, index), hours.slice(index + 1)];
}
```

### Pattern 6：designTokens.test.ts（收尾 plan）

```ts
import { describe, it, expect } from "vitest";

// 樣式 token 防回歸（DESIGN-02、SHELL-04、斷點表）：src 元件只能用 tailwind.config.js 的語意 token。
// 只列檔名與規則名；若誤判（例如註解提到舊 class 名），請改寫註解，不要放寬規則。
const SOURCES = import.meta.glob(["/src/**/*.tsx", "/src/**/*.css", "!/src/**/*.test.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const files = Object.entries(SOURCES);

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTIL = "bg|text|border|ring|ring-offset|outline|from|via|to|fill|stroke|divide|placeholder|decoration|shadow|accent|caret";

/** [規則名稱, 格式]；(?<![\w-]) 確保是 class 起點，前面可接任意變體前綴 */
const RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["Tailwind 預設色票", new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_UTIL})-(?:${PALETTE})-\\d{2,3}\\b`)],
  ["white／black 透明度", /(?<![\w-])(?:[\w-]+:)*[a-z-]+-(?:white|black)\/\d+/],
  ["white 非圖片底色", /(?<![\w-])(?:[\w-]+:)*(?:text|border|ring|outline|from|via|to|fill|stroke|divide|shadow)-white\b/],
  ["black 色", /(?<![\w-])(?:[\w-]+:)*(?:bg|text|border|ring|outline|from|via|to|fill|stroke|divide|shadow)-black\b/],
  ["寫死色碼", /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/],
  ["rgb／hsl 色值", /\b(?:rgba?|hsla?)\(/],
  ["禁用斷點", /(?<![\w-])(?:max-)?(?:sm|lg|2xl):/],
  ["禁用字重", /(?<![\w-])font-(?:thin|extralight|light|medium|bold|extrabold|black)\b/],
  ["預設字級", /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)\b/],
  ["預設圓角", /(?<![\w-])rounded(?:-[trblse]{1,2})?(?:-(?:sm|md|lg|xl|2xl|3xl|full))?(?=["'`\s}])/],
  ["預設陰影", /(?<![\w-])(?:[\w-]+:)*shadow(?:-(?:sm|md|lg|xl|2xl|inner))?(?=["'`\s}])/],
  ["漸層／毛玻璃", /(?<![\w-])(?:[\w-]+:)*(?:bg-gradient-to-|backdrop-blur|blur-(?:none|sm|md|lg|xl|2xl|3xl)\b)/],
  ["互動位移縮放", /(?<![\w-])(?:[\w-]+:)*(?:hover|focus|focus-visible|active|group-hover):-?(?:translate-[xy]|scale)-/],
  ["移除焦點外框", /(?<![\w-])(?:[\w-]+:)*outline-none\b/],
  ["非 token 間距", /(?<![\w-])(?:[\w-]+:)*-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?!(?:0|1|2|4|6|8|12|16|24|px)\b)[\d.]+\b/],
];

describe("樣式只用語意 token", () => {
  it("掃描檔案數量合理（避免 glob 失效而空轉）", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(RULES)("不含 %s", (_name, re) => {
    const hits = files.filter(([, text]) => re.test(text)).map(([path]) => path);
    expect(hits).toEqual([]);
  });
});
```

**誤判風險逐項檢查：**

| 風險 | 判斷 |
|---|---|
| `bg-white`（商品圖容器）| token 允許；規則只擋 `white/數字` 與 `text|border|…-white`，`bg-white` 不會被擋 |
| SVG `fill="#…"`／`stroke="#F0B43C"`（示意稿的螢光筆底線、分類圖示）| **會被擋，這正是要擋的**。改成 `stroke="currentColor"` 加 `className="text-tape"`（或用 `stroke-tape` utility）|
| `&#8594;` 這類 HTML 實體 | 前面是 `&`，lookbehind 會排除 |
| `href="#main"` | `main` 不是 hex 字元，不會命中；之後若有 `#abc`、`#add` 這類 hash 要改名 |
| `aria-label`、`data-testid="product-description"`、中文文案 | 都不符合任何規則 |
| `onBlur`、`handleBlur` | 「漸層／毛玻璃」規則只抓 `blur-sm` 等，大寫 B 和名稱不會被擋 |
| 註解寫到舊 class（例如「原本 bg-slate-900」）| 會被擋；比照 noAirtable 的政策改寫註解 |
| `rgba(` 寫在 tsx inline style | 會被擋；陰影一律用 token |
| `index.css` 的 `theme("colors.accent")` | 沒有 hex 也沒有 rgb，不會被擋 |
| `pb-24`（固定列留白 96px）| 間距 allow-list 已含 24 這個例外 |
| `-rotate-[0.8deg]`、`h-[26px]` 這類元件尺寸與傾斜 | 不在間距規則範圍內，允許 |
| `space-y-8 xl:space-y-16` | 8 和 16 都在 allow-list 內 |
| 測試檔斷言舊 class | glob 已排除 `*.test.tsx` |
| `productPageViews.tsx` 的 `makeIcon` 用了 `text-white` | **會被擋**，Plan 3 要移除 `icon` 欄位與 `makeIcon`（見 Open Questions 11）|

另外加兩項字型測試（DESIGN-03），共 2 項：用 `import.meta.glob("/tailwind.config.js", { query: "?raw" })` 讀設定檔原始碼，斷言 `PingFang TC` → `Microsoft JhengHei` → `微軟正黑體` → `Noto Sans TC` 依序出現；並斷言 `/src/index.css` 不含 `@font-face`、`@import url(`、`fonts.googleapis`。

最後再加「聯絡字串單一來源」測試，共 2 項：掃描 `/src/**/*.{ts,tsx}`（排除測試檔與 `src/config/contact.ts`），斷言不含 `永平路`、`2279`。

### Pattern 7：FeaturedCarousel 改版（狀態機不動）

- 保留 `currentSlide` state、`activeIndex = currentSlide % items.length`、effect 計時、所有 pointer/focus/blur handler，**逐字不動**；根元素仍然是 event container，並且必須是 render container 的 `firstElementChild`，hover 和 pointercancel 測試都靠這一點。
- 只改兩處：新增 `const isBase = useMediaQuery(BASE_QUERY)`；`isPaused` 改成 `prefersReducedMotion || isBase || isHovered || hasFocusWithin`（UI-SPEC 指定同一機制）。
- 渲染：
  - md+：`visible = Array.from({ length: Math.min(3, n) }, (_, k) => items[(activeIndex + k) % n])`。用 `<ul className="grid grid-cols-3 gap-8 pt-4">` 搭配 `<li>`，**只渲染視窗內的卡**。
  - base：渲染全部 items，`<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-4 pl-4 pt-4 -mx-4">`，`li` 加 `w-[260px] shrink-0 snap-start`，每個 li 掛 ref。
- 按鈕與指示點（base）：`setCurrentSlide(next)` 之後呼叫 `cardRefs.current[next]?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest", inline: "start" })`。**`block: "nearest"` 一定要寫**：預設值 `block: "start"` 會把整個頁面垂直捲到卡片頂端 [CITED: MDN Element.scrollIntoView]。
- 指示點加 `aria-current={index === activeIndex ? "true" : undefined}`。這是新增的無障礙屬性，也讓 base 模式（全部卡都在 DOM 裡）可以斷言目前位置。
- 圖片失敗：拆成 `NoteCard` 子元件（`key={product.id}`），自己管理 `failedImageUrl`。比照 ProductCard 的寫法，3 張同時顯示時每張獨立判斷。這不屬於 D-05 列出的狀態機。
- 卡片名稱用 `<h3>`（section h2 → 卡 h3）。Phase 8 的卡是 `<div>`，不是連結（Phase 10 才換 `<Link>`）。
- 移除 `accent: "blue" | "purple"` prop 與 `ACCENT_CLASSES`（內含 blue/purple class）。HomePage 與測試 harness 也要一起拿掉 `accent=`，否則 tsc 會報 excess prop。
- 錯誤、空、載入文案**沿用既有**（UI-SPEC 便條卡狀態列明寫「文案沿用既有」）：錯誤用 `getErrorMessage`，加上「重新載入」與 `role="alert"`；空狀態是「目前沒有精選商品」；載入中是 3 張 skeleton，文字「載入產品中...」放在 `aria-live="polite"`。

```ts
// src/hooks/useMediaQuery.ts（新檔；不改 usePrefersReducedMotion）
import { useEffect, useState } from "react";

/** 是否支援 matchMedia（jsdom 預設沒有，測試未 mock 時須回傳 false 而非崩潰） */
function canMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

/**
 * 讀取並監聽 media query；初值於第一次 render 同步讀取，避免先排一次計時器
 * @param query - 完整 media query 字串，例如 "(max-width: 767px)"
 * @returns 目前是否符合
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    canMatchMedia() ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (!canMatchMedia()) return;
    const mql = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches); // query 變更時同步一次
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);
  return matches;
}
```
（`setMatches` 寫在 effect 內，在 eslint-plugin-react-hooks 5.2 不會報錯；若 lint 有意見，可以拿掉那一行，因為 query 是常數。）

### Anti-Patterns to Avoid
- **在 FeaturedCarousel 根元素外再包一層帶 label 的 wrapper：** hover 測試對 `container.firstElementChild` 觸發 `pointerEnter`，而 pointerenter 不會冒泡。帶 label 的 group 要放在 HomePage。
- **chip 用 `NavLink` 的自動 aria-current：** 可以用，但和 NavBar 的「逛商品」判斷邏輯不一致。兩邊都用 `pathname` 手動計算比較好讀。
- **用 `outline` 做卡片 hover 外框：** 會和焦點環（outline offset 3px）互相覆蓋。hover 改用 `hover:ring-2 hover:ring-inset hover:ring-accent`。Tailwind 的 ring 與 `shadow-card` 是透過 CSS 變數組合的，不會互相覆蓋（實測 `shadow-card` 輸出使用 `var(--tw-ring-shadow), var(--tw-shadow)`）。
- **動態組 class 字串（例如 `` `rotate-[${deg}deg]` ``）：** Tailwind 的 content 掃描抓不到。傾斜角度要寫成靜態陣列，例如 `const CARD_TILTS = ["-rotate-[0.8deg]", "rotate-[0.6deg]", "-rotate-[0.4deg]", "rotate-[0.8deg]"] as const`。
- **營業中戳章給輔助科技朗讀：** 戳章是靜態「營業中」，晚上也會照樣顯示，朗讀出來會誤導。加 `aria-hidden="true"`，營業時間由聯絡區提供。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 響應式字級 | JS 依寬度換 class | CSS 變數 + `:root` media query | 不用 JS、沒有 hydration 閃爍，也只算一個 token |
| 斷點／色票防回歸 | 只靠 code review | `theme` 覆寫 + designTokens 掃描 | 覆寫讓違規 class 不產生 CSS；掃描讓違規會讓測試失敗 |
| 焦點樣式 | 每個元件各寫 `focus-visible:` class | 全域 `:focus-visible` base 規則 | SHELL-04 要求「所有可互動元素」，集中一處才不會漏掉 |
| 橫向捲動定位 | 手算 `scrollLeft` | `scrollIntoView({ inline: "start", block: "nearest" })` + CSS scroll-snap | 瀏覽器原生功能，也尊重 smooth／auto |
| matchMedia 監聽 | 每個元件各寫 | `useMediaQuery` hook | 可測試、可重用 |
| 聯絡資訊 | 各頁寫死 | `CONTACT` + props 注入 | UX-06／SHELL-03 要求單一來源 |

## Runtime State Inventory

本 phase 是 UI 改版加刪除 SideMenu，沒有重新命名任何對外識別字。

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | 無：沒有 localStorage／sessionStorage 使用（`grep -rn localStorage src` 為 0）| 無 |
| Live service config | 無：後端 CORS 白名單只看網域，與 UI 無關 | 無 |
| OS-registered state | 無 | 無 |
| Secrets/env vars | `.env.development`（`VITE_API_BASE_URL`）、`KRD_PROXY_TARGET`：本 phase 不改 | 無 |
| Build artifacts | `dist/` 每次 build 都會重建；`node_modules/.tmp/tsconfig.app.tsbuildinfo` 在刪除 SideMenu 後由 `tsc -b` 自動更新 | 無 |

## Common Pitfalls

### Pitfall 1：ProductPageTemplate 測試沒有 Router
**What goes wrong:** 模板一加入 `CategoryChips`（裡面用 `Link`／`useLocation`），17 項測試會全部丟出「useLocation() may be used only in the context of a <Router>」。
**How to avoid:** Plan 2 在同一個 commit 把 `renderPage()` 包進 `<MemoryRouter>`。這是 harness 修改，不算改斷言，要在 SUMMARY 記錄。

### Pitfall 2：輪播「視窗 3 張」讓舊斷言變成永遠為真
**What goes wrong:** 3 筆資料時，md+ 一次顯示商品1、2、3，所以 `getByText("商品2")` 在切換前就已經成立，自動播放、暫停相關測試都會假通過。
**How to avoid:** 新增 `firstCard = () => screen.getAllByRole("listitem")[0]` helper，所有「目前顯示第 N 筆」改成 `expect(firstCard()).toHaveTextContent("商品N")`。指示點不要放在 `<ul>` 裡，否則會混進 listitem。`toHaveTextContent` 是子字串比對，測試資料 ≤ 9 筆時不會有「商品1／商品10」混淆。

### Pitfall 3：新 hook 在沒有 matchMedia 時崩潰
**What goes wrong:** 大部分輪播測試和所有 HomePage 測試都沒有 stub matchMedia，jsdom 也沒有 `window.matchMedia`（已實測）。
**How to avoid:** `useMediaQuery` 先檢查 `typeof window.matchMedia === "function"`。另外，現有 `mockReducedMotion` 對其他 query 本來就回傳 `false`，所以「base 為 false」原本就成立；第一個 commit 擴充 mock 的真正目的是讓之後的 base 測試可以傳 `base: true`。

### Pitfall 4：同名「打電話問問」連結出現多次
**What goes wrong:** jsdom 不載入 Tailwind CSS，`hidden md:inline-flex`／`md:hidden` 都不生效。Layout 測試會同時看到頂列和固定列的「打電話問問」，`getByRole` 會丟出 multiple elements。NavBar 面板展開時，「逛商品」也會出現兩次。
**How to avoid:** 用 `getAllByRole` 或 `within(screen.getByRole("navigation", { name: "主選單" }))` 限縮範圍；面板用 `hidden` 屬性，關閉時就不在 role 查詢範圍內。

### Pitfall 5：scrollIntoView 在 jsdom 不存在
**How to avoid:** 在 `src/test/setup.ts` 補一個 no-op polyfill，測試再用 `vi.spyOn(Element.prototype, "scrollIntoView")` 觀察（見 Code Examples），`afterEach` 執行 `vi.restoreAllMocks()`。

### Pitfall 6：`block` 預設值造成頁面跳動
`scrollIntoView({ inline: "start" })` 沒寫 `block` 時，預設是 `"start"`，整頁會垂直捲動。一定要寫 `block: "nearest"`。測試要斷言完整的參數物件。

### Pitfall 7：測試數量中途下降
Plan 2 會刪掉 SideMenu.test（5 項）與 NavBar 的 8 項 it.each。要先建立 `CategoryChips.test.tsx`（RED），再刪 SideMenu 檔。D-10 只看 plan 結束時的數字，但每個 commit 都要全綠。

### Pitfall 8：tsc 的 excess prop 錯誤
移除 `showSideMenu`、`accent`、`icon` 這些 props 時，呼叫端（HomePage、ProductPageTemplate、App 的 spread、測試 harness）要在**同一個 commit** 一起修改，否則 `tsc -b` 會失敗、build 不會綠。

### Pitfall 9：子代理（subagent）可能沒有 MCP 瀏覽器工具
有 `tools:` 限制的 agent 會被拿掉 MCP 工具（上游 issue anthropics/claude-code#13898，GSD 文件也有提到）。過去 05-UAT 是由主 session 用 Claude in Chrome 加 chrome-devtools MCP 完成的。**UAT task 應標 `autonomous: false`，或明定由主 session（orchestrator）執行。**

### Pitfall 10：`theme` 覆寫造成無聲失效
收尾 plan 改成覆寫後，任何殘留的預設 class 都會不產生 CSS，但測試不會失敗。所以要先讓 designTokens 掃描全綠，再改覆寫，最後用 UAT 截圖確認。

## Code Examples

### 擴充 matchMedia mock（Plan 1 第一個 commit）
```ts
// FeaturedCarousel.test.tsx — 取代 mockReducedMotion；呼叫端改為 mockMatchMedia({ reducedMotion: true })
/** 模擬 matchMedia；只回應減少動態與 base 斷點兩個查詢，其餘一律 false（jsdom 視為桌機） */
function mockMatchMedia({ reducedMotion = false, base = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches:
        query === "(prefers-reduced-motion: reduce)"
          ? reducedMotion
          : query === "(max-width: 767px)"
            ? base
            : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}
```
這個 commit 只改 mock 與 1 個呼叫點，18 項維持全綠，數量不變。元件裡的 query 字串要和這裡**完全一致**（`"(max-width: 767px)"`，冒號後有一個空白）。

### scrollIntoView stub 與 base 測試
```ts
// src/test/setup.ts 追加：jsdom 沒有 scrollIntoView，提供 no-op，個別測試再 spyOn
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// FeaturedCarousel.test.tsx
it("base 寬度點下一張時把第二張捲到起點，且不自動播放", () => {
  mockMatchMedia({ base: true });
  const calls: Array<{ el: Element; options: unknown }> = [];
  vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (
    this: Element,
    options?: boolean | ScrollIntoViewOptions
  ) {
    calls.push({ el: this, options });
  });
  vi.useFakeTimers();
  renderCarousel(makeResult({ items: makeItems(3) }), 5000);
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  // 不自動播放：目前位置仍是第 1 張
  expect(screen.getByRole("button", { name: "第 1 張" })).toHaveAttribute("aria-current", "true");
  fireEvent.click(screen.getByRole("button", { name: "下一張" }));
  expect(calls).toHaveLength(1);
  expect(calls[0].el).toHaveTextContent("商品2");
  expect(calls[0].options).toEqual({ behavior: "smooth", block: "nearest", inline: "start" });
});
```
（用自己寫的 `mockImplementation(function …)` 收集 `this`，不依賴 `mock.contexts` 這類 API 細節。`afterEach` 已有 `vi.unstubAllGlobals()`，再補 `vi.restoreAllMocks()`。）

### HomePage 區塊查詢改寫
```ts
/** 以 group 名稱找到該組輪播區塊（取代舊的 closest("div.space-y-8")） */
function getSection(name: string): HTMLElement {
  return screen.getByRole("group", { name });
}
// HomePage.tsx 對應結構：
// <section aria-labelledby="featured-title">
//   <h2 id="featured-title">這陣子大家都在問</h2>
//   <div role="group" aria-label="熱門推薦系列"><FeaturedCarousel result={featured1} intervalMs={5000} /></div>
//   <div role="group" aria-label="頂級精選系列"><FeaturedCarousel result={featured2} intervalMs={5500} /></div>
// </section>
```

### CategoryChips 測試範例（SideMenu 同語意）
```ts
it("目前頁 chip 有 aria-current=page", () => {
  renderChips("/trumpet");
  expect(screen.getByRole("link", { name: "擴大機 / 喇叭" })).toHaveAttribute("aria-current", "page");
});
it("點擊 KRD 後導向 /krd-products", async () => {
  renderChips("/trumpet");
  await userEvent.setup().click(screen.getByRole("link", { name: "KRD" }));
  expect(screen.getByTestId("loc")).toHaveTextContent("/krd-products");
});
```

## 逐檔測試影響（研究重點 3）

### `NavBar.test.tsx`（14 → 15）
| 舊測試 | 分類／處置 | 新測試 |
|---|---|---|
| Logo 3 項（路徑尺寸、失敗備援、初次不顯示）| 契約／保留 | 原樣保留；備援改成 `<span>`，`getByText("KRD MICGO")` 仍然通過 |
| 「X 在桌機與手機各有一個按鈕」×8 | 契約／改寫為新元件 | 移到 CategoryChips：「X chip 為連結且 href 為對應路徑」×8 |
| 桌機選單依序為 8 項加商店介紹 | 契約／改寫 | 「主選單依序為逛商品、關於我們，右側為打電話問問」（`within(nav 主選單)` 取 link 文字 + 另查 tel 連結）|
| 商店介紹按鈕存在 | 呈現／調整 | 「關於我們連結指向 /abouts」|
| 點擊無線麥克風導向 | 契約／改寫 | 移到 CategoryChips |
| 新增 | — | 「打電話問問 href 為 tel:04-22798787」、「選單鈕預設 aria-expanded=false、aria-label=開啟選單，點擊後 true／關閉選單、aria-controls 指向面板」、「Esc 關閉面板並把焦點還給選單鈕」、「點面板外側關閉」、「點面板內連結後關閉」、「逛商品在 /all-products、/trumpet、/products/abc 有 aria-current」（it.each ×3）、「關於我們在 /abouts 有 aria-current」、「Logo 連到 /」|

NavBar 小計：3 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 3 + 1 + 1 = 15。

### `SideMenu.test.tsx`（5）→ `CategoryChips.test.tsx`（15）
5 項同語意（依序 8 個 link、目前頁 `aria-current="page"`、其他頁沒有、點 KRD 導向、沒有 `.animate-pulse`），加上 NavBar 移過來的 8 項 it.each 與「點無線麥克風導向」，再加「nav 的 aria-label 為商品分類」。SideMenu.tsx 與 SideMenu.test.tsx 刪除。

### `FeaturedCarousel.test.tsx`（18 → 25）
- 所有 `renderCarousel` 拿掉 `accent="blue"`；`mockReducedMotion(true)` 改成 `mockMatchMedia({ reducedMotion: true })`。
- 用 `firstCard()` 改寫：「三筆點下一張」「依 intervalMs 切換」「減少動態」「滑鼠移入」「觸控進入」「焦點」「滑鼠點擊不暫停」「觸控點擊不暫停」「觸控後鍵盤」「pointercancel」「非按鈕區域」（title 點擊目標仍用 `getByText("商品1")`，因為它在 3 張中唯一）「手動切換重新計時」。
- 「失敗時只顯示固定中文訊息」：**保留原字串**（UI-SPEC 寫「文案沿用既有」）。
- 「圖片載入失敗」：1 筆情境不變。另外新增「3 筆中第 2 張破圖，只有那張變佔位圖」。
- 新增 6 項：md+ 只渲染 3 張且循環（5 筆、activeIndex=3 → 商品4、5、1）；筆數 < 3 不重複；base 不自動播放且下一張會 scrollIntoView（smooth）；base + 減少動態時 behavior 為 auto；base 點「第 3 張」捲到第 3 張；便條卡無價顯示「價格請來電」、有價顯示 priceText。加上前述破圖 1 項，共 +7 → **25**。

### `ProductCard.test.tsx`（21 → 25）
| 舊測試 | 處置 → 新斷言 |
|---|---|
| grid 有價：徽章與價格行各一次 | 調整：`getAllByText(priceText)` 長度 1，「不出現價格洽詢」保留 |
| grid 區間價、只有 priceMax | 調整：出現次數 2 → 1 |
| grid 無價：價格洽詢且無徽章 | 調整：`getByText("價格請來電")`、`queryByText(PRICE_ON_REQUEST)` 為 null |
| list 有價（保留）| `.product-badge` 斷言仍然成立（class 已不存在）→ 原樣保留 |
| list 無價 | 調整：「價格請來電」|
| 價格洽詢使用灰色 | 調整：「價格請來電 tag 使用 block-2 底而非 accent」（`toHaveClass("bg-block-2")`、`not.toHaveClass("bg-accent")`）|
| 圖片與燈箱 5 項（Phase 10）| **本 phase 不動**（D-06 保留 role=button）；「缺圖」那項的 `queryByText("點擊查看大圖")` 斷言仍然成立 |
| 破圖換網址 | 保留 |
| 描述 null | 保留 |
| grid line-clamp-1 | 調整：UI-SPEC 的 grid 卡**沒有說明欄位**（只有 list 有）→ 改成「grid 不渲染說明段落」；`data-testid` 維持 |
| list line-clamp-2 | 保留（UI-SPEC list 說明為 `line-clamp-2`）|
| grid 資訊區 py-4 px-5 | 調整：「grid 卡內距 p-2 md:p-4」|
| 價格行 mb-1／mb-2 兩項 | 調整：「價格行位於標籤列（flex-wrap gap-2）」，對有價與無價各斷言一次 |
| h-96／h-64／提示 | 調整：「圖片容器為 aspect-square 白底、名稱 line-clamp-2、無『點擊查看大圖』」|
| 有描述時顯示，且不顯示品牌、型號、現貨（**契約**）| 調整斷言（見 Open Questions 2）：「有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期」|
| 新增 | 「inStock=false 時 grid 顯示洽詢交期」、「list 也顯示洽詢交期」、「img 有 loading=lazy 與 decoding=async」、「無價判斷看 priceMin/priceMax 皆 null（priceText 不是 PRICE_ON_REQUEST 也一樣）」→ +4 |

### `ProductPageTemplate.test.tsx`（17 → 20）
- Plan 2：`renderPage` 包 `MemoryRouter`。
- 「請求進行中…」保留（D-02）；「截斷提示」保留（D-02）；「rate_limited」「network」保留原字串（Open Questions 3）。
- 「點重新載入」與「空狀態」：`目前沒有商品` → `這裡還沒有商品`；`此分類目前沒有上架的商品` → `這個分類暫時沒東西，過幾天再來看看，或直接打電話問我們。`（UI-SPEC 列表空狀態）。
- 「同時顯示 priceText 與價格洽詢」：`getByText("價格洽詢")` → `getByText("價格請來電")`。
- 燈箱 3 項（Phase 10）不動；切換排序、aria-busy、combobox 都不動（保留 `<select>`）。
- 新增 3 項：「h1 下方副行顯示共 N 項」、「結尾『找不到想要的？』含 tel 連結」、「chip 列存在且目前頁 chip 有 aria-current」。

### `HomePage.test.tsx`（7 → 13）
- `getSection` 改成 `getByRole("group", { name })`；「兩組都沒有商品」改用 `getByRole("group", …)` 斷言存在。
- 「首頁不顯示價格與價格洽詢」（呈現）→「便條卡有價顯示 priceText、無價顯示價格請來電，且不出現價格洽詢」。
- 其餘 5 項保留。
- 新增 6 項：「h1 含『來問我們就對了』」（用 regex，因為 `<br>`）、「逛逛商品連到 /all-products」、「hero 電話連結 tel:」、「4 張分類貼紙卡 href 依序為 /wired-micphone、/wireless-micphone、/trumpet、/accessories」、「店面照片預留位 role=img 名稱為店面照片（待提供）」、「熱銷 h2 為這陣子大家都在問」。

### `AboutPage.test.tsx`（3 → 6）
- 6 張圖卡 src 保留；「圖卡標題 h4」→ 改成 `level: 3`（inventory 註明 heading level 屬呈現成分）；「不再顯示載入骨架」選擇器 `.glass-card.animate-pulse` → `.animate-pulse`。
- 新增 3 項：「h1 為關於我們」、「聯絡區顯示 CONTACT.address 與營業時間」、「不含舊電話格式 (04) 22798787」。

### `App.test.tsx`（11）：不需修改
Layout 被 mock；h1 名稱沿用 title；combobox 保留；`/products/:id` 不加入。

### 新檔
Layout.test（5：skip link 為第一個 tab stop、href=#main 且 main#main 存在、children 在 main 內、thanks／address 頁尾）、Footer.test（3）、MobileCallBar.test（2：連結名稱與 tel、注入的 phoneHref）、ContactBlock.test（6：地址、營業時間加休息備註、tel 連結名稱為 phone、LINE／Email 未設定不渲染、有值時渲染（LINE 外連帶 `rel="noopener noreferrer"`）、空字串不渲染）、icons.test（9：每個 icon 都有 `aria-hidden="true"` 與 `stroke="currentColor"`）、contact.test.ts（5）、useMediaQuery.test（4：初值、change 事件、無 matchMedia 時為 false、unmount 移除監聽）、PriceTag.test（3）、designTokens.test.ts（15 + 字型 2 + 聯絡單一來源 2）。

## 建議 Plan 切分（研究重點 7）

| Plan | Wave | 依賴 | 主要檔案 | 結束時預期 `npx vitest list \| wc -l`（下限 = 前一個 plan）|
|---|---|---|---|---|
| **08-01 基礎** | 1 | — | ①第一個 commit：`FeaturedCarousel.test.tsx`（mockMatchMedia）；`tailwind.config.js`（extend tokens）、`src/index.css`（base 加 LEGACY 區塊）、刪 `src/App.css` 與 App.tsx 的 import、`src/test/setup.ts`（scrollIntoView polyfill）；新增 `icons.tsx`+test、`config/contact.ts`+test、`hooks/useMediaQuery.ts`+test、`components/PriceTag.tsx`+test | ≈335（314 + 9 + 5 + 4 + 3）|
| **08-02 共用骨架** | 2 | 01 | `Layout.tsx`、`NavBar.tsx`+test（改寫）、`Footer.tsx`+新 test、新增 `MobileCallBar.tsx`+test、`CategoryChips.tsx`+test、`Layout.test.tsx`；刪 `SideMenu.tsx`、`SideMenu.test.tsx`；`App.tsx`（移除漸層外框）；呼叫端最小修改：`HomePage.tsx`／`AboutPage.tsx`／`ProductPageTemplate.tsx`（`footer=` prop、模板插入 CategoryChips）、`ProductPageTemplate.test.tsx`（包 MemoryRouter）| ≈356 |
| **08-03 分類頁** | 3 | 02 | `ProductPageTemplate.tsx`+test、`ProductCard.tsx`+test（含 skeleton）、`ImagePlaceholder.tsx`、`ImageModal.tsx`、`config/productPageViews.tsx`（移除 icon／makeIcon）；index.css 刪除 product-* LEGACY | ≈363 |
| **08-04 首頁** | 3（可與 03 平行：檔案不重疊；PriceTag 已在 01 完成）| 02 | `HomePage.tsx`+test、`FeaturedCarousel.tsx`+test、新增 `ContactBlock.tsx`+test；index.css 刪除 text-shadow、animate-* 的 HomePage 用途 | ≈382 |
| **08-05 關於我們** | 4 | 04（ContactBlock）| `AboutPage.tsx`+test；index.css 刪除剩餘 LEGACY（glass-card、animate-*）| ≈385 |
| **08-06 收尾** | 5 | 03、05 | 新增 `src/designTokens.test.ts`（含字型與聯絡單一來源）；`tailwind.config.js` 改成 theme 覆寫；全站掃描修正；`08-UAT.md`（主 session 執行）；測試總數、契約核對；D-17 合併 main 檢查（研究時 `git log redesign..main` 為空）| ≈402，必須 > 314 |

- config 是 `granularity: coarse`，planner 可以把 03 與 04 合併，或把 05 併入 04，以減少 plan 數；Wave 結構維持不變即可。
- 每個 plan 的 TDD 順序：先改／建測試（RED，貼失敗輸出到 SUMMARY）→ 改元件（GREEN）→ 刪舊檔。
- 預估數字是依上方逐檔表計算的規劃值；實際數字以 `npx vitest list | wc -l` 為準，只要求單調不減。

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.line-clamp-*` 自訂 utility／plugin | Tailwind 內建 `line-clamp-*` | Tailwind 3.3 [ASSUMED] | 可以刪掉 index.css 的自訂版本 |
| 色票加 `/opacity` 需要 CSS 變數 | hex 色直接寫 `bg-x/80` | Tailwind 3.x | 實測 `bg-tape/80` 可用 |
| 每頁各寫 focus class | 全域 `:focus-visible` | — | SHELL-04 一處搞定 |

**Deprecated/outdated（本 repo 內）：** 毛玻璃（`backdrop-blur`）、漸層字、`hover:scale`／`translateY` 的卡片動效、`SideMenu`、`showSideMenu` prop、`accent` prop、`ProductPageView.icon`。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Tailwind 3.3 起內建 `line-clamp-*`，刪除 index.css 自訂版本不影響 | Pattern 2 | 低：build 後 grep dist CSS 即可確認；有問題就保留自訂版本 |
| A2 | BrowserRouter 下點 `href="#main"` 只會更新 hash，不會 remount 頁面 | Pattern 4 | 低：UAT 檢查；若有問題，改成 onClick 聚焦 main 並 preventDefault |
| A3 | 沒有 `viewport-fit=cover` 時 iOS 不需要 safe-area 處理 | Pattern 4 | 低：實機確認延到 Phase 11（D-14）|
| A4 | 子代理拿不到 MCP 瀏覽器工具 | Pitfall 9 | 中：如果拿得到，UAT 可以交給 executor；保守做法是由主 session 執行 |
| A5 | 兩組熱銷放在同一個 h2 下、各自有控制列，使用者可以接受（與示意稿單列不同）| Open Q1 | 中：若使用者要單列，只能改成合併資料，會牽動契約測試；UAT 截圖時提醒使用者確認 |
| A6 | ProductCard 契約列「不顯示品牌」依 UI-SPEC 改成顯示品牌 | Open Q2 | 中：屬於契約列斷言調整，要在 SUMMARY 明列理由 |

## Open Questions（全部已決定）

1. **首頁兩組熱銷 vs UI-SPEC 單一區塊** — RESOLVED：保留兩個 `FeaturedCarousel`（D-05 狀態機與 HomePage 的「兩組獨立」契約都要求如此），放在同一個 `<section aria-labelledby>`、h2「這陣子大家都在問」底下。兩組各包一層 `role="group"`，aria-label 沿用既有字串「熱門推薦系列」「頂級精選系列」，不新增文案，畫面上也不顯示子標題。每組自己有一排控制列（上一張／下一張靠右）、卡片列與指示點。這和示意稿「按鈕與 h2 同列」不同，要在 SUMMARY 記錄，並在 UAT 截圖提醒使用者（A5）。
2. **`ProductCard`「有描述時…不顯示品牌、型號、現貨」（契約）vs UI-SPEC 顯示品牌** — RESOLVED：照 UI-SPEC（權威、晚於 inventory 核准）調整斷言，改成「顯示說明與品牌、不顯示型號；現貨商品不顯示洽詢交期」。測試名稱也一起改；這是契約列的「調整斷言」，不是刪除，SUMMARY 要列出舊→新對照與理由（A6）。
3. **列表／輪播錯誤文案** — RESOLVED：輪播依 UI-SPEC「文案沿用既有」。列表錯誤卡保留標題「無法載入商品」加 `getErrorMessage`（services 不改，D-08），所以 rate_limited 與 network 兩項測試不用改。UI-SPEC 的「商品暫時載入不出來／現在逛的人有點多…」屬於 Phase 9 詳情頁的可重試錯誤。列表**空狀態**則採用 UI-SPEC 的「這裡還沒有商品」加內文（inventory 已指定新字串）。
4. **base 選單面板項目（斷點表寫 3 項，元件契約寫 2 項）** — RESOLVED：依較具體的元件契約，只放 2 項（逛商品、關於我們），電話交給固定撥號列。
5. **排序控制：`<select>` vs 切換鈕** — RESOLVED：保留 `<select>`（App.test 與 ProductPageTemplate.test 的契約用 `combobox`），只改成 44px 高、`rounded-pill`、1px `dash` 邊框；grid／list 兩顆按鈕改成 pill 切換，選中時 `bg-block-2 font-semibold`，`aria-pressed` 與 aria-label 不變。
6. **「共 {n} 項」的 n** — RESOLVED：用 `items.length`（`useProducts` 不提供 total，hooks 不能改）；`items.length > 0` 才顯示；截斷時仍有截斷提示。
7. **關於我們聯絡區** — RESOLVED：直接重用 `ContactBlock`（同標題「有空來店裡坐坐」、同地圖預留位、電話按鈕 `hidden md:inline-flex`），不加 variant prop。
8. **關於我們服務卡 heading level** — RESOLVED：h1 → h2（羽程企業社、我們的服務）→ h3（6 張卡），測試改成 `level: 3`。公司介紹文字與「10+／1000+」沿用現有文案，只換樣式。
9. **base 使用者手動滑動後 activeIndex 不同步** — RESOLVED：不同步（UI-SPEC 明定 base 時 activeIndex 只給按鈕與指示點用，D-05 也不加 scroll 監聽）；在 UAT 記錄成已知行為。
10. **list 版商品卡是否傾斜** — RESOLVED：只有 grid 卡傾斜；list 列含說明文字，屬於「文字密集區塊不傾斜」。
11. **`ProductPageView.icon`／`description`** — RESOLVED：Plan 3 移除 `icon` 欄位與 `makeIcon`（新設計不顯示，且內含 `text-white`）；`description` 留在 config 與 props 型別中但不再渲染（避免動到 App 的 spread 與測試 harness）。
12. **UAT 執行者** — RESOLVED：08-06 的 UAT task 標 `autonomous: false`，由主 session 用 chrome-devtools MCP（或 Claude in Chrome）執行（Pitfall 9）。
13. **CONTEXT 說 NavBar 已有 Esc／點外側關閉** — RESOLVED：讀碼確認沒有。Plan 2 新寫這兩個功能並補測試（已算進 NavBar 15 項）。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build／test | ✓ | v24.13.0 | — |
| npm | scripts | ✓ | 11.6.2 | — |
| tailwindcss CLI（node_modules）| token 驗證 | ✓ | 3.4.17 | — |
| chrome-devtools-mcp plugin | UAT（emulate、resize_page、hover、take_screenshot、evaluate_script、performance trace）| ✓（`~/.claude/settings.json` enabledPlugins，v1.11.0）| 1.11.0 | Claude in Chrome；都不可用時列為 human-needed |
| production API（經 Vite proxy）| dev UAT | 未在研究中連線（限制：不打外部 API）| — | 若連不上，用 `KRD_PROXY_TARGET` 指到本機後端 |
| git `main` 新 commit | D-17 | 研究時 `git log redesign..main` 為空 | — | — |

**UAT 做法（研究重點 9）：**
- 啟動：`npm run dev -- --port 5173 --strictPort`（背景執行）。`.env.development` 會讓 `VITE_API_BASE_URL` 走相對路徑，`vite.config.ts` 把 `/api` proxy 到 `KRD_PROXY_TARGET`（預設 `https://api.krd.com.tw`）。結束時必須停掉 dev server。
- chrome-devtools MCP 工具 [VERIFIED: 本機 plugin docs/tool-reference.md]：
  - `new_page`／`navigate_page`：開 `http://localhost:5173/…`。
  - `resize_page({ width, height })`：320、768、1024、1440。
  - `emulate({ viewport: "320x800x2,mobile,touch", prefersReducedMotion: "reduce" })`：每次呼叫會**取代全部模擬設定**，要一次傳齊。
  - `hover`：滑鼠類型，測暫停。
  - `press_key("Tab")`：測鍵盤焦點與 skip link。
  - `click`：觸控模擬下測「點擊後不黏住」。
  - `take_screenshot`：存證。
  - `evaluate_script`：每 200ms 讀兩組 `li:first-child` 的文字，或讀指示點 `aria-current`，記錄切換時間（比照 05-UAT）；1024px 時量 `header.getBoundingClientRect().height`，應為單行 ≈ 60px；chip 列在 base 確認 `scrollWidth > clientWidth`；用 `new PerformanceObserver` 累計 `layout-shift` 值，CLS 應 < 0.1。
  - `performance_start_trace`（reload）：可另外取得 CLS insight。
- 8 條舊網址逐一 `navigate_page`，確認 h1 為對應 title。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.12（unit／node：`src/**/*.test.ts`；component／jsdom：`src/**/*.test.tsx`，setup `src/test/setup.ts`）|
| Config file | `vite.config.ts`（`test.projects`）|
| Quick run command | `npx vitest run <檔案>` |
| Full suite command | `npm test && npm run lint && npm run build` |
| 數量 | `npx vitest list \| wc -l`（基準 314）|

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESIGN-02 | 元件與 CSS 不含預設色票、hex、rgb、white/black 濫用、漸層毛玻璃 | unit（原始碼掃描）| `npx vitest run src/designTokens.test.ts` | ❌ Plan 6 |
| DESIGN-02 | 覆寫後違規 class 不產生 CSS | build | `npm run build && ! grep -E "\.bg-slate-|\.text-gray-|\.font-bold" dist/assets/*.css` | ✅（指令）|
| DESIGN-03 | 字型堆疊順序、不載入 webfont | unit + build | `npx vitest run src/designTokens.test.ts -t 字型`；`! grep -l "@font-face" dist/assets/*.css` | ❌ Plan 6 |
| SHELL-01 | 頂列順序、tel、選單鈕 aria、Esc／外側關閉、aria-current | component | `npx vitest run src/components/NavBar.test.tsx` | ✅ 改寫（Plan 2）|
| SHELL-01 | 1024px 不折行、320–1440 正常 | manual-auto（MCP）| UAT：`resize_page` + `evaluate_script` 量 header 高度 + 截圖 | 08-UAT.md |
| SHELL-02 | 8 chips 順序、aria-current、導向、nav label | component | `npx vitest run src/components/CategoryChips.test.tsx` | ❌ Plan 2 |
| SHELL-02 | base 單列橫捲、md 換行 | manual-auto | UAT：320／768 截圖 + `scrollWidth > clientWidth` | 08-UAT.md |
| SHELL-03 | contact 欄位值、選填判斷、拆營業時間 | unit | `npx vitest run src/config/contact.test.ts` | ❌ Plan 1 |
| SHELL-03 | 聯絡區三項、LINE／Email 有值才顯示；頁尾兩種文案；固定列 tel | component | `npx vitest run src/components/ContactBlock.test.tsx src/components/Footer.test.tsx src/components/MobileCallBar.test.tsx` | ❌ Plan 2／4 |
| SHELL-03／UX-06 | 地址、電話只存在 contact.ts | unit | `npx vitest run src/designTokens.test.ts -t 聯絡` | ❌ Plan 6 |
| SHELL-04 | skip link 第一個 tab stop、指向 main#main | component | `npx vitest run src/components/Layout.test.tsx` | ❌ Plan 2 |
| SHELL-04 | 不使用 outline-none；全域 :focus-visible | unit + grep | `npx vitest run src/designTokens.test.ts -t 焦點`；`grep -n "focus-visible" src/index.css` | ❌ Plan 6 |
| UX-04 | 自動播放、暫停契約 18 項 + base 不自動、scrollIntoView、視窗 3 張 | component | `npx vitest run src/components/FeaturedCarousel.test.tsx` | ✅ 調整（Plan 1／4）|
| UX-04 | 兩組獨立、便條卡價格、hero／分類卡連結 | component | `npx vitest run src/pages/HomePage.test.tsx` | ✅ 調整（Plan 4）|
| UX-04 | 真實瀏覽器 hover／焦點／觸控／減少動態／base | manual-auto（MCP，主 session）| UAT（見 Environment）| 08-UAT.md |
| UX-05 | 8 路由 h1 與查詢、排序回到 name | component | `npx vitest run src/App.test.tsx` | ✅ 不動 |
| UX-05 | grid／list aria-pressed、排序 combobox、副行、結尾區塊 | component | `npx vitest run src/pages/ProductPageTemplate.test.tsx` | ✅ 調整（Plan 2／3）|
| UX-06 | 關於我們 h1、聯絡區讀 CONTACT、6 圖卡 | component | `npx vitest run src/pages/AboutPage.test.tsx` | ✅ 調整（Plan 5）|
| UX-07 | aspect-square、lazy、破圖佔位、無價 tag | component | `npx vitest run src/components/ProductCard.test.tsx src/components/PriceTag.test.tsx` | ✅／❌ |
| UX-07 | 載入不跳動 | manual-auto | UAT：PerformanceObserver CLS < 0.1 | 08-UAT.md |
| TEST-06（全 phase）| 數量單調、契約未刪 | 指令 | `npx vitest list \| wc -l`；對照 06-TEST-INVENTORY 的契約列 | ✅ |

### Sampling Rate
- **每個 task commit：** `npx vitest run <該 task 測試檔>`（RED commit 預期失敗、GREEN commit 預期通過）
- **每個 plan 結束：** `npm test && npm run lint && npm run build`，加 `npx vitest list | wc -l` 寫進 SUMMARY
- **Phase gate：** 全綠、總數 > 314、08-UAT.md 完成，才能 `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/test/setup.ts` 加 scrollIntoView polyfill（Plan 1）
- [ ] `FeaturedCarousel.test.tsx` 的 `mockMatchMedia` 擴充（Plan 1 第一個 commit）
- [ ] 新測試檔由各 plan 的 RED task 建立；不需要新框架

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 無使用者認證 |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | 低 | 沒有輸入欄位；商品文字以 React 文字節點輸出，禁用 `dangerouslySetInnerHTML` |
| V6 Cryptography | no | — |
| V14 Configuration | yes | 前端不含憑證：`noAirtable.test.ts` + `check-dist.mjs` 持續執行 |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 外部連結 tabnabbing（之後 `lineUrl` 有值時）| Tampering | `target="_blank" rel="noopener noreferrer"`（ContactBlock 測試要斷言）|
| `tel:`／`mailto:` 由設定產生 | — | 值只來自 repo 內常數 `CONTACT`，不接受使用者輸入 |
| 後端錯誤原文洩漏 | Information Disclosure | 錯誤畫面只用 `getErrorMessage` 的固定文案（契約測試保留）|

## Sources

### Primary (HIGH confidence)
- 本機讀碼：`src/**`、`tailwind.config.js`、`src/index.css`、`vite.config.ts`、`package.json`、`.env.example`、所有 `*.test.tsx`
- 本機實測：`npx vitest list`（314 項／20 檔）；scratchpad 以專案 tailwindcss 3.4.17 編譯 token 設定（覆寫行為、opacity modifier、CSS 變數字級、`theme()`、`@apply`）；jsdom 29 確認沒有 scrollIntoView、matchMedia，且 `[hidden]` 為 display:none
- `.planning/phases/06-design-lock/06-UI-SPEC.md`、`06-TEST-INVENTORY.md`、`mockups/home-desktop.dc.html`、`list-desktop.dc.html`
- chrome-devtools-mcp 1.11.0 `docs/tool-reference.md`（emulate、resize_page 參數）

### Secondary (MEDIUM confidence)
- https://v3.tailwindcss.com/docs/font-size — fontSize tuple 與 lineHeight
- https://v3.tailwindcss.com/docs/customizing-colors — `theme.colors` 覆寫會取代整個色票，要保留 transparent／currentColor
- MDN `Element.scrollIntoView`（block 預設 "start"）— 依訓練知識，未在本 session 抓取

### Tertiary (LOW confidence)
- 無

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 無新套件，版本都由 node_modules 實測
- Architecture／token: HIGH — 關鍵設定都在本機編譯驗證
- 測試遷移: HIGH — 逐檔讀過測試與 inventory
- 瀏覽器行為（hash 導航、safe-area、MCP 在子代理的可用性）: MEDIUM

**Research date:** 2026-11-11
**Valid until:** 2026-12-11（技術棧穩定；UI-SPEC 若改版就要重看）
