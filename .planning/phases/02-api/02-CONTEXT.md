# Phase 2: 商品頁與首頁熱銷改讀後端 API - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

把 8 個商品分類頁（`ProductPageTemplate`）與首頁兩組熱銷輪播的資料來源，從 `airTable()` 改成 Phase 1 建好的資料層（`fetchProducts` + `buildProductParams` + `PRODUCT_PAGES` / `HOME_FEATURED_QUERIES`），並補上三種明確畫面：載入中、失敗（含重試按鈕）、沒有商品。

**本 phase 範圍內：** 商品頁、首頁輪播、`App.tsx` 商品路由、商品卡片的價格／佔位圖、元件測試環境。

**不在本 phase：** Logo、NavBar、SideMenu、關於我們仍讀 Airtable（Phase 3 處理）；`src/services/index.ts` 與 `ProductView.tsx` 不刪（Phase 3）；商品詳情頁（v2）。

</domain>

<decisions>
## Implementation Decisions

> 使用者在討論時選「都你決定」，以下都是 Claude 依專案限制與 Phase 1 決策選的預設。規劃時直接採用；研究若發現與後端實際行為衝突，以後端為準並在 PLAN 中註明。
> Phase 1 的決策以 `P1 D-xx` 引用（見 `.planning/phases/01-api/01-CONTEXT.md`）。

### 失敗與空狀態畫面
- **D-01:** 抽出一個共用的資料載入 hook（例如 `useProducts(query, sort)`），回傳 `{ status: "loading" | "error" | "success", items, error, retry }`。商品頁與首頁兩組輪播都用它，取代各元件內的 `useEffect` + `airTable()`。effect 用 `AbortController` 取消前一次請求；`kind === "canceled"` 的錯誤直接忽略，不顯示錯誤（Phase 1 已分類）。
- **D-02:** 商品頁失敗時，在商品區塊位置（Header 與控制列保留）顯示錯誤卡片：圖示 + `getErrorMessage(error)` 的文字 + 「重新載入」按鈕。按鈕呼叫 `retry()` 重新發一次請求，期間回到載入狀態。視覺沿用現有空狀態區塊的樣式（圓形圖示 + 標題 + 說明），不另做新設計語言。
- **D-03:** 商品頁沒有商品時，沿用現有「暫無產品」區塊，文字改成「目前沒有商品」（UX-03），說明改為「此分類目前沒有上架的商品」。不要再寫「請稍後再試」，避免與失敗混淆。
- **D-04:** 首頁兩組輪播各自獨立載入、獨立失敗：一組失敗不影響另一組。
  - 載入中：沿用現有 `aspect-video` 佔位框 +「載入產品中...」。
  - 失敗：同一個佔位框內顯示錯誤文字 +「重新載入」按鈕。
  - 沒有商品：該組佔位框內顯示「目前沒有精選商品」，不隱藏整區（保持版面左右對稱）。
  - 修正現狀：目前沒資料時永遠卡在「載入產品中...」，改由 `status` 判斷。
- **D-05:** 兩組輪播同時遇到 429 時各自顯示錯誤即可，不做全頁合併的錯誤訊息。

### 商品卡片內容
- **D-06:** 價格一律顯示 `priceText`（Phase 1 已算好）。位置：
  - grid 卡片：取代原本右上角的 `product-badge`，**只有在有價格時**才顯示徽章。
  - grid 卡片與 list 卡片：在名稱下方顯示一行價格文字；價格為 `null` 時顯示「價格洽詢」（灰色、較小字）。
  - 理由：目前 20 筆全是 `null`，若每張卡右上角都掛「價格洽詢」徽章會很吵；放在內文較低調，之後有價格時徽章自然出現。
- **D-07:** 首頁輪播不顯示價格，維持現行版面（名稱 + 描述）。
- **D-08:** 缺圖（`imageUrl === null`）時顯示佔位圖：與圖片容器同尺寸的深色漸層區塊 + 置中的麥克風／音符 SVG 圖示 +「暫無圖片」小字。佔位圖用 inline 元件，不新增圖檔。缺圖的商品**點擊不開燈箱**（沒有可放大的圖）。首頁輪播遇到缺圖也用同一個佔位元件。
- **D-09:** 描述沿用現行顯示方式（grid 兩行截斷、list 兩行截斷、`null` 不顯示）。`in_stock`、品牌、型號本 phase 不顯示（現貨顯示列在 v2 PROD-V2-02）。
- **D-10:** `truncated === true`（商品超過 100 筆）時，在商品列表下方顯示一行小字「僅顯示前 100 項商品」，不做分頁。

### 排序下拉選單行為
- **D-11:** 頁面設定鎖定排序的頁面（`/new-products` 的 `sort: "newest"`）**隱藏**排序下拉選單；其他頁預設 `name`，使用者切換時以新的 `sort` 重新呼叫 API（P1 D-10）。移除 `ProductPageTemplate` 內的前端 `localeCompare` 排序。
- **D-12:** 切換排序時**保留舊列表**並將列表區塊淡化（`opacity-50` + `pointer-events-none`），回應到達後替換；不顯示整頁 spinner。首次進入頁面才顯示整頁載入畫面。若切換排序後失敗，顯示 D-02 錯誤卡片（重試沿用目前選的排序）。
- **D-13:** 從一個商品頁切到另一個商品頁（路由改變）時，重設為首次載入狀態（整頁載入），排序重設為 `name`。做法交給 planner（例如以 `path` 當 `key` 讓元件重新掛載）。

### 路由與頁面設定搬遷
- **D-14:** 把 8 頁的 `title`、`description`、`icon` 搬進 `src/services/catalog.ts` 的 `PRODUCT_PAGES`（或另一個 UI 設定模組以 `path` 對應，planner 決定；原則是不讓 services 依賴 React 元件——若 icon 是 JSX，放在 `src/config/` 或 `src/pages/` 下的設定檔，以 `path` 對齊 `PRODUCT_PAGES`）。文字內容與現行 `App.tsx` 完全一致，不改文案。
- **D-15:** `App.tsx` 的 8 條商品 Route 改由設定陣列 `.map()` 產生；`/` 與 `/abouts` 維持手寫。路徑字串完全不變（PROD-07）。加一個測試斷言 8 個路徑都存在且與舊路徑清單相同。
- **D-16:** `ProductPageTemplate` 的 props 從 `tableName` 改為接收頁面設定（`query`），不再引用 `airTable`。`accentColor` 這個未使用的 prop 一併移除。

### 測試
- **D-17:** 本 phase 安裝 jsdom + `@testing-library/react`（+ `@testing-library/jest-dom` 或 `user-event` 視需要），元件測試的檔案可個別用 `// @vitest-environment jsdom` 或 Vitest 的 environment 設定切換；既有 node 環境的純邏輯測試不受影響。
- **D-18:** 必測行為（以注入或 mock `fetchProducts` 的方式，不打真實 API）：
  - `useProducts`：成功、失敗、空結果、retry 會再次呼叫、canceled 不進錯誤狀態、參數改變會重新抓取。
  - 商品頁：載入中畫面、錯誤卡片含訊息與重試按鈕、空狀態文字、`/new-products` 不顯示排序選單、價格文字（有價／洽詢）、缺圖顯示佔位圖。
  - 首頁：兩組獨立（一組失敗另一組仍顯示商品）、空狀態文字。
  - 路由：8 個舊路徑全部存在。

### Claude's Discretion
- hook 名稱、檔案位置（`src/hooks/` 或 `src/services/`）、狀態型別的確切形狀。
- 佔位圖使用的 SVG 圖示樣式。
- 錯誤卡片的確切 Tailwind class，只要與現有深色 slate 主題一致。
- 是否把商品卡片（grid／list）抽成獨立元件——為了測試與可讀性建議抽出，但不強制。
- 首頁輪播的自動播放計時器在 `status !== "success"` 時不啟動（現有邏輯以 `length > 0` 判斷，等價即可）。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 後端公開 API 與頁面對照
- `.planning/BRIEF.md` — 頁面 → API 對照表、欄位清單、價格單位、限流（已與 Owner 定案）
- `../KRD-Inventory-Backend/src/openapi/paths/public.paths.ts` — 公開 API OpenAPI 定義

### Phase 1 成果（本 phase 直接使用）
- `.planning/phases/01-api/01-CONTEXT.md` — P1 D-01～D-16（價格格式、錯誤分類與訊息、排序交給後端、單一設定來源）
- `.planning/phases/01-api/01-REVIEW-FIX.md` — 新增的 `canceled` 錯誤種類、`truncated` 旗標、`UNNAMED_PRODUCT`
- `src/services/catalog.ts` — `PRODUCT_PAGES`、`HOME_FEATURED_QUERIES`、`buildProductParams`
- `src/services/products.ts` — `fetchProducts`（可注入 client）、`ProductListResult`
- `src/services/transform.ts` — 畫面用 `Product` 型別（`imageUrl`、`priceText`…）
- `src/services/errors.ts` — `ApiError`、`getErrorMessage`、`ERROR_MESSAGES`

### 專案規劃
- `.planning/PROJECT.md` — 限制（每次 commit 都要 `npm run build` 通過、維持舊網址）
- `.planning/REQUIREMENTS.md` — PROD-01～07、UX-01～03
- `.planning/ROADMAP.md` — Phase 2 成功標準

### 既有程式碼分析
- `.planning/codebase/CONVENTIONS.md` — 程式風格（雙引號、分號、2 空格、中文註解）
- `.planning/codebase/CONCERNS.md` — 錯誤被吞、`any` 型別等不要仿效的寫法

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/ProductPageTemplate.tsx`：既有的載入 spinner、「暫無產品」空狀態區塊、grid／list 卡片、`ImageModal` 串接——版面全部保留，只換資料來源與加錯誤狀態。
- `src/pages/HomePage.tsx` 的 `renderEnhancedCarousel`：已有 `aspect-video` 佔位框，可延伸為載入／錯誤／空狀態。
- `src/components/ImageModal.tsx`：燈箱沿用，`img` 為字串，缺圖時不開啟即可。
- Phase 1 資料層：`fetchProducts` 第二參數可注入 axios instance，元件測試可直接 mock 模組或注入。

### Established Patterns
- 元件使用 PascalCase arrow function + 檔尾 `export default`；事件處理以 `handle` 開頭。
- 嚴格 TS：`verbatimModuleSyntax`（型別用 `import type`）、`erasableSyntaxOnly`（狀態用字串字面值聯集，不用 enum）、`noUnusedLocals/Parameters`。
- 不要再寫 `[key: string]: any` 與 `catch (error: any)`；錯誤用 `unknown` + `ApiError` 判斷。
- Tailwind utility class、深色 slate 漸層主題；`index.css` 內已有 `product-card-new`、`product-badge`、`glass-card` 等自訂 class。

### Integration Points
- `src/App.tsx`：8 條手寫商品 Route（含大段 SVG icon）改為由設定產生。
- `src/pages/ProductPageTemplate.tsx`：props 由 `tableName` 改為頁面設定。
- `src/pages/HomePage.tsx`：`getHotProduct1/2` 改用 hook + `HOME_FEATURED_QUERIES`。
- `vite.config.ts` / `package.json`：新增 jsdom、testing-library 依賴與環境設定。
- 本機驗證：`npm run dev` 透過 proxy 讀 production API（Phase 1 已完成）。

</code_context>

<specifics>
## Specific Ideas

- 目前 production 20 筆商品價格全是 `null`，畫面設計要以「全部價格洽詢」為常態來看是否太吵（D-06 的理由）。
- 首頁兩組輪播標題（「熱門推薦系列」「頂級精選系列」）與配色不變。
- 錯誤訊息文字只能來自 `getErrorMessage`，不得顯示後端原始錯誤內容（Phase 1 安全稽核 T 項目）。

</specifics>

<deferred>
## Deferred Ideas

- 多頁抓取（超過 100 筆）——目前只顯示提示文字（D-10）
- 商品卡片顯示現貨狀態——v2 PROD-V2-02
- 跨頁快取（例如切回同一分類不重抓）——目前沒有需求，限流 60 次／分足夠
- NavBar／SideMenu 改讀同一份頁面設定——Phase 3（STAT-02）

</deferred>

---

*Phase: 02-api*
*Context gathered: 2026-11-10*
