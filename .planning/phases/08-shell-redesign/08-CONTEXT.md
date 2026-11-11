# Phase 8: Tokens、共用骨架與既有頁面改版 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Mode:** `--auto`（使用者授權全自動；決策為建議預設值，見 [auto] 行）

<domain>
## Phase Boundary

依已核准的 `.planning/phases/06-design-lock/06-UI-SPEC.md`（C5a）實作：語意 token 與字型、膠囊浮動頂列、分類 chip 列（取代 SideMenu）、一行頁尾、手機固定撥號列、skip link 與焦點樣式，並改版首頁（hero、分類貼紙卡、「這陣子大家都在問」便條卡、聯絡區）、分類頁（ProductPageTemplate + ProductCard 外觀）、關於我們。

**不在本 phase：** 詳情頁 UI／路由／NotFound（Phase 9）；卡片與便條卡改為 `<Link>`（Phase 10）。本 phase 結束時：ProductCard 仍保有「整張卡 `role="button"` 開燈箱」的既有行為（只換外觀），便條卡為非連結 `<div>`。

需求：DESIGN-02、DESIGN-03、SHELL-01、SHELL-02、SHELL-03、SHELL-04、UX-04、UX-05、UX-06、UX-07。

**UI 契約：** 本 phase 沒有獨立 UI-SPEC；**權威 UI 契約是 `06-UI-SPEC.md` 與 `06-design-lock/mockups/`**。

</domain>

<decisions>
## Implementation Decisions

[--auto] Selected all gray areas: 待決事項 A1/A2、實作順序與計畫切分、行為保留邊界、測試遷移、token 防回歸、瀏覽器 UAT、素材與內容來源。

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI 契約（權威）
- `.planning/phases/06-design-lock/06-UI-SPEC.md` — 全部視覺與互動契約（token、斷點、元件契約、Copywriting、contact.ts、測試影響）
- `.planning/phases/06-design-lock/mockups/*.dc.html` — 7 份示意稿（inline style 數值；與 UI-SPEC 衝突時依 UI-SPEC「示意稿正規化」）

### 測試保護網
- `.planning/phases/06-design-lock/06-TEST-INVENTORY.md` — 215 項基準的契約／呈現分類與預定處置、accessible name 契約清單
- `.planning/phases/06-design-lock/06-CONTEXT.md` D-12 — 不加測試數量檢查腳本（D-12 of Phase 8 的 designTokens 測試是樣式掃描，不是數量檢查，兩者不衝突）

### 需求
- `.planning/REQUIREMENTS.md` — DESIGN-02/03、SHELL-01~04、UX-04~07
- `.planning/ROADMAP.md` §Phase 8 成功標準 1–5

### 既有程式
- `src/components/{NavBar,SideMenu,Footer,Layout,ProductCard,FeaturedCarousel,ImageModal,ImagePlaceholder}.tsx` 與其測試
- `src/pages/{HomePage,ProductPageTemplate,AboutPage}.tsx` 與其測試
- `src/config/navigation.ts`、`src/config/productPageViews.tsx`、`src/content/abouts.ts`
- `src/hooks/usePrefersReducedMotion.ts` — base 不自動播放可比照
- `src/noAirtable.test.ts` — 原始碼掃描測試寫法（designTokens 測試比照）
- `tailwind.config.js`、`src/index.css`、`src/App.css`

</canonical_refs>

<code_context>
## Existing Code Insights

- 現行測試 314 項／20 檔（Phase 7 結束）。
- `index.css` 528 行，含 `.glass-card` 等舊共用樣式；`App.tsx` 與 `Layout` 重複深色漸層背景（研究建議只留一處，新設計為純色 `surface`）。
- `NavBar.tsx` 274 行（含 Logo 載入失敗文字備援、Esc／點外側關閉、防背景捲動），改版時保留這些行為。
- `AboutPage.tsx` 332 行，內含寫死聯絡資訊；`Footer.tsx` 也有（營業時間寫法不同，UI-SPEC 已統一）。

</code_context>

<specifics>
## Specific Ideas

- 使用者偏好：不要制式、要有人味（C5a）；手作感元素（傾斜貼紙卡、膠帶、螢光筆底線、營業中戳章）是設計重點，不可省略為平面卡片。

</specifics>

<deferred>
## Deferred Ideas

- Windows antialias／實機觸控確認 → Phase 11 上線前人工確認
- 地圖改為 Google 地圖連結 → 待 Owner 提供素材

</deferred>

---

*Phase: 08-shell-redesign*
*Context gathered: 2026-11-11（--auto）*
