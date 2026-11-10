# Phase 1: 測試與 API 資料層基礎 - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

導入 Vitest（`npm test`），並建立一套**尚未接到畫面**的後端公開 API 資料層：

- axios client（base URL 由 `VITE_API_BASE_URL` 控制，預設 production）
- API 回應 → 畫面資料的轉換（欄位對應、價格 ÷100、`null` 價格、價格區間）
- 商品頁／首頁熱銷 → 查詢參數的對照（含中文分類 encode）
- 錯誤正規化（網路、非 2xx、429、`success:false`）與對應的中文訊息
- Vite dev proxy，讓本機 `npm run dev` 能讀到商品資料

以上邏輯都要有單元測試。現有頁面、Airtable service（`src/services/index.ts`）**本 phase 不動**，網站行為維持原樣；接到畫面是 Phase 2，移除 Airtable 是 Phase 3。

</domain>

<decisions>
## Implementation Decisions

> 使用者在討論時選「你決定」，以下都是 Claude 依專案限制選的預設。規劃時直接採用；若研究發現跟後端實際行為衝突，以後端為準並在 PLAN 中註明。

### 價格與欄位顯示規則
- **D-01:** 價格顯示格式為 `NT$1,200`：用 `Intl.NumberFormat("zh-TW")` 加千分位，「分」÷100 後整數不顯示小數，有小數時最多 2 位。
- **D-02:** `price_min ≠ price_max` 時顯示 `NT$1,200 – NT$1,500`；兩者相等時只顯示單一價格；只有一邊非 `null` 時顯示那一個；兩邊都是 `null` 時顯示「價格洽詢」（集中定義成一個常數）。
- **D-03:** 轉換後的畫面型別用 camelCase（例如 `imageUrl`、`publishedAt`、`featuredGroup`、`inStock`），另附預先算好的 `priceText`。API 原始型別保留 snake_case，和 API 文件對得起來。
- **D-04:** 商品不因缺圖被過濾掉，跟舊的 Airtable 邏輯不同，因為核心價值是與後端一致。缺圖時 `imageUrl` 為 `null`，佔位圖在 Phase 2 處理。`name` 是空字串時，退回用 `${brand} ${model}`。

### 錯誤分類與訊息
- **D-05:** 新增 `ApiError`（繼承 `Error`），帶 `kind` 與可選的 `status`。`kind` 分四類：`"network"`（含 timeout、沒有回應）、`"rate_limited"`（HTTP 429）、`"http"`（其他非 2xx）、`"invalid_response"`（`success:false` 或回應格式不符）。
- **D-06:** 錯誤一律往上拋，**不再吞成 `[]`**。「查無商品」是成功回傳空陣列，與失敗分開。
- **D-07:** 資料層提供 `getErrorMessage(error)`，回傳給使用者看的中文訊息，Phase 2 直接使用：
  - `rate_limited` → 「瀏覽太頻繁，請稍候一分鐘再重試」
  - `network` → 「無法連線，請檢查網路後重試」
  - 其他 → 「商品資料暫時無法載入，請稍後再試」
- **D-08:** 資料層不自動重試，因為 429 時重試只會更糟。重試交給 Phase 2 的「重試」按鈕。

### 分類對照與筆數上限
- **D-09:** 每次請求固定帶 `limit=100`（API 上限），不做多頁抓取，因為 production 目前只有 20 筆。如果回應的 `pagination.total` 大於拿到的筆數，就 `console.warn`，提醒之後要做分頁。
- **D-10:** 排序交給後端（`sort=name|newest`），不在前端排序，對應 PROD-05。查詢建構函式接收頁面設定與使用者選的排序；頁面設定若鎖定排序（`/new-products` 固定 `newest`），以頁面設定為準。
- **D-11:** 8 個商品頁的「路徑 → 查詢條件」寫成一份設定陣列（`path` + `query`），放在獨立模組，不寫在 `App.tsx` 內。Phase 2 用它產生路由，Phase 3 的導覽列擴充同一份設定，對應 STAT-02「同一份來源」。標題、描述、圖示本 phase **不搬**，Phase 2 再處理。首頁熱銷的 `featured=1`、`featured=2` 也定義在同一個模組。
- **D-12:** query string 用 axios `params` 或 `URLSearchParams` 產生。測試要斷言最後序列化出來的字串，確認中文分類有被正確 encode。

### 本機開發 proxy 與環境變數
- **D-13:** 環境變數用 `VITE_API_BASE_URL`；沒設定時預設為 `https://api.krd.com.tw/api/v1/public`。Cloudflare Pages 不需要設任何變數。
- **D-14:** 新增並 commit `.env.development`，內容為 `VITE_API_BASE_URL=/api/v1/public`（走 proxy）。`vite.config.ts` 用 `loadEnv` 讀 `VITE_PROXY_TARGET`（預設 `https://api.krd.com.tw`）作為 `/api` 的 proxy target，並設 `changeOrigin: true`。要連本機後端時，在 `.env.development.local`（已被 gitignore）覆寫 `VITE_PROXY_TARGET`。
- **D-15:** 新增 `.env.example`，說明兩個變數的用途。`.gitignore` 已包含 `.env`、`*.local`，不用改。
- **D-16:** 研究時要確認後端在伺服器端會不會依 `Origin` header 拒絕請求。如果會，proxy 需要把 `Origin` 改寫成 `https://www.krd.com.tw`；如果只靠瀏覽器擋 CORS，就不用改寫。

### Claude's Discretion
- 測試環境：Phase 1 只測純邏輯，用 Vitest `environment: "node"`。jsdom 與 `@testing-library/react` 留到 Phase 2 需要測元件時再裝。
- HTTP mock 方式：優先用依賴注入（把 axios instance 或 adapter 傳進去），或用 `vi` mock axios，不額外引入 msw。最後由 planner 選。
- 檔案位置：新程式碼放在 `src/services/` 下的新檔（例如 `client.ts`、`products.ts`、`errors.ts`、`format.ts`、`catalog.ts`），不修改現有 `src/services/index.ts`。測試檔與原始檔放在一起，命名 `*.test.ts`。
- Vitest 設定寫在 `vite.config.ts` 還是獨立的 `vitest.config.ts`，以及 tsconfig 怎麼納入測試檔：只要 `npm run build`（`tsc -b`）與 `npm run lint` 都通過即可。
- `npm test` 對應 `vitest run`，可另外加 `test:watch`。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 後端公開 API 規格
- `.planning/BRIEF.md` — 端點、查詢參數、欄位清單、價格單位、頁面 → API 對照表（已與 Owner 定案）
- `../KRD-Inventory-Backend/src/openapi/paths/public.paths.ts` — 公開 API 的 OpenAPI 定義（含 `pagination` 結構）
- `../KRD-Inventory-Backend/src/modules/public/controllers/public-catalog.controller.ts` — 實際回應：`{ items, pagination: { offset, limit, total } }`
- `../KRD-Inventory-Backend/src/modules/public/` — 查 CORS／Origin 處理與限流的實作（D-16）

### 專案規劃
- `.planning/PROJECT.md` — 限制（axios、build 必須通過、不得含憑證）
- `.planning/REQUIREMENTS.md` — TEST-01～04、SEC-02、SEC-03
- `.planning/ROADMAP.md` — Phase 1 成功標準

### 既有程式碼分析
- `.planning/codebase/CONVENTIONS.md` — 程式風格（雙引號、分號、2 空格、中文註解）
- `.planning/codebase/TESTING.md` — 目前沒有測試框架，以及建議的測試檔位置
- `.planning/codebase/CONCERNS.md` — 錯誤被吞掉、`any` 型別等不要再仿效的寫法

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/services/index.ts` 的 axios interceptor 寫法（把錯誤正規化成 `{message, data, status}`）可參考，但新的 client 要**另外建立 instance**。舊 instance 的 baseURL 與 Authorization header 是 Airtable 專用，不能共用。

### Established Patterns
- 服務層函式用 `/** */` 寫中文 JSDoc，含 `@param`、`@returns`
- 嚴格 TS：`verbatimModuleSyntax`（型別要用 `import type`）、`erasableSyntaxOnly`（不能用 enum，`kind` 改用字串字面值聯集）、`noUnusedLocals`

### Integration Points
- `vite.config.ts`：目前只有 react plugin，要加 `server.proxy` 與 Vitest 設定
- `package.json`：要加 `test` script 與 `vitest` devDependency
- `src/vite-env.d.ts`：要補 `ImportMetaEnv` 的 `VITE_API_BASE_URL` 型別
- `src/pages/ProductPageTemplate.tsx` 已有 `"name" | "newest"` 排序型別，可對應 D-10 的 sort 參數（Phase 2 才接上）

</code_context>

<specifics>
## Specific Ideas

不需要特別參照的對象，採標準做法。價格與錯誤訊息的實際文字見 D-01、D-02、D-07。

</specifics>

<deferred>
## Deferred Ideas

- 多頁抓取（offset 分頁）：商品超過 100 筆時再做（D-09 已留下 warn）
- 元件層測試（jsdom + testing-library）：Phase 2
- 商品頁標題、描述、圖示搬進設定陣列：Phase 2／3

</deferred>

---

*Phase: 01-api*
*Context gathered: 2026-11-10*
