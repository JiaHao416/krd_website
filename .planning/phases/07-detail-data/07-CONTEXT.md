# Phase 7: 詳情資料層 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Mode:** `--auto`（使用者授權全自動；以下決策皆為建議預設值，記錄於 [auto] 行供稽核）

<domain>
## Phase Boundary

以 TDD 新增「單一商品詳情」的資料層：原始型別（`apiTypes.ts`）、service（`fetchProductDetail`）、轉換（`toProductDetail`）、錯誤分類與 hook（`useProductDetail`）。**不寫任何 UI、不加路由**（詳情頁 UI 與 `/products/:id` 路由屬 Phase 9）。

需求：TEST-05。成功標準見 ROADMAP Phase 7（curl 實測欄位、不重用 `toProduct`、價格 null 不出現 `NT$NaN`、404/400 → 找不到、429/5xx/網路 → 可重試、hook 四種狀態並可取消、測試總數高於 Phase 6 基準 215）。

</domain>

<decisions>
## Implementation Decisions

[--auto] Selected all gray areas: API 契約實測、型別與轉換模型、錯誤分類、hook 介面、檔案配置與測試。

### API 契約實測
- [auto] 契約實測 — Q: "欄位以什麼為準？" → Selected: "先 curl production 實測，再寫型別"（recommended）
- **D-01:** 第一個 task 先以 curl 打 production `https://api.krd.com.tw/api/v1/public/products?limit=…` 取得真實 id，再打 `/api/v1/public/products/{id}`，以及一個不存在的 UUID（預期 404）、一個非 UUID 字串（預期 400），把實際回應結構（含 null 邊界：`brand`、`model`、`description`、`image_url`、`warranty_period_months`、`price_incl_tax`、空 `variants`）記錄在 `07-API-SAMPLES.md`。型別以實測為準；與 `.planning/research/ARCHITECTURE.md` §三不一致時以實測為準並記錄差異。curl 只打公開 API，不帶任何憑證，總請求數控制在 10 次以內（限流每 IP 每分鐘 60 次）。
- **D-02:** 測試用 fixture 依實測結構手寫（假 UUID 用 `00000000-0000-4000-8000-00000000000x` 這類形狀），不直接貼 production 原始資料；fixture 字串不得觸發 `noAirtable.test.ts` 的規則。

### 型別與轉換模型
- [auto] 轉換 — Q: "是否重用 toProduct？" → Selected: "新增 toProductDetail，不重用 toProduct"（recommended，ROADMAP 明定）
- **D-03:** `apiTypes.ts` 新增 `PublicVariantApi`、`PublicProductDetailApi`（snake_case，與後端同名、不改名），既有型別不動。
- **D-04:** `transform.ts` 新增前端型別 `ProductDetail` 與 `ProductVariant`（camelCase）及 `toProductDetail(api)`。`ProductVariant` 含 `id`、`sku`、`attributes: Array<{ key: string; value: string }>`（`Object.entries` 後值一律字串化，boolean/number 轉字串）、`imageUrl: string | null`、`isDefault`、`inStock`、`priceInclTax: number | null`（分）、`priceText: string | null`（非 null 時用既有 `formatPrice`，null 時為 null）。`ProductDetail` 含 `id`、`name`（空字串時用既有 `UNNAMED_PRODUCT`）、`brand`、`model`、`category`、`description`、`imageUrl`、`warrantyMonths: number | null`（0 或 null 都正規化為 null，供 PROD-08「0 或空值時隱藏」）、`inStock`、`variants`、`defaultVariantId: string | null`。
- **D-05:** 價格為 null 時資料層**不產生任何顯示文字**（`priceText: null`），由 Phase 9 UI 依 UI-SPEC 顯示「價格請來電」。**不修改** `format.ts` 的 `PRICE_ON_REQUEST`（研究假設 A1 仍留給 Phase 8 決定）。保證任何輸入都不會產生 `NT$NaN`（非有限數字一律當 null）。
- **D-06:** 預設變體：`variants.find(v => v.isDefault) ?? variants[0] ?? null`，**不重新排序**（後端已依 is_default DESC、sku ASC 排序）。變體為空陣列時 `defaultVariantId = null`。
- **D-07:** 壞資料處理比照列表：variant 缺 `id`/`sku` 字串或 `in_stock` 非布林 → 略過並 `console.warn`；`attributes` 非物件 → `{}`；`price_incl_tax`／`image_url` 型別不符 → null。商品層缺 `id`/`name`/`category` 字串、`in_stock` 非布林或 `variants` 非陣列 → 整體 `ApiError("invalid_response")`。

### 錯誤分類
- [auto] 錯誤 — Q: "分類放哪裡？" → Selected: "新增純函式 classifyDetailError，不改 errors.ts"（recommended；milestone 規則 services/ 只新增不修改）
- **D-08:** 新增純函式 `classifyDetailError(error: unknown): "notFound" | "retryable"`：`ApiError` 且 `kind === "http"` 且 `status` 為 404 或 400 → `notFound`；其餘（`rate_limited` 429、5xx、`network`、`invalid_response`）→ `retryable`。`canceled` 由 hook 先行忽略，不進分類。放在 `src/services/productDetail.ts`（與 detail service 同檔，見 D-12）。
- **D-09:** id 預檢：以 UUID regex 檢查路由參數，非 UUID 直接回 `notFound`、**不發出請求**（省限流額度）。regex 與分類一起測試。
- **D-10:** 給訪客的錯誤文字不在資料層決定：hook 只回 `errorKind`（`rate_limited` | 其他），Phase 9 依 UI-SPEC Copywriting（含 429 專屬文案）顯示。不修改 `ERROR_MESSAGES`。

### Hook 介面
- [auto] hook — Q: "回傳形狀？" → Selected: "判別聯合（discriminated union）四種狀態 + retry"（recommended）
- **D-11:** `useProductDetail(id: string | undefined)` 回傳 `{ status: "loading" } | { status: "success"; product: ProductDetail } | { status: "notFound" } | { status: "error"; error: ApiError; isRateLimited: boolean }`，外加 `retry()`。沿用 `useProducts` 的 `AbortController` 寫法：id 變更或卸載時 abort；被取消的請求不改狀態。不做快取、不預取、不打列表 API。`id` 為 undefined 或非 UUID → 直接 `notFound`。同一 id 每次造訪只發一個請求（StrictMode 開發模式的重跑會先 abort 前一個，屬預期）。

### 檔案配置與測試
- [auto] 檔案 — Q: "新增在哪？" → Selected: "detail 專用新檔 + apiTypes/transform 只追加"（recommended）
- **D-12:** 新增 `src/services/productDetail.ts`（`fetchProductDetail(id, client = apiClient, options = {})`、type guard、`classifyDetailError`、`isUuid`）與 `src/services/productDetail.test.ts`；`apiTypes.ts`、`transform.ts` 只**追加**型別與 `toProductDetail`，既有 export 與行為不變；需要的 `toNullableNumber` 若在 `products.ts` 內部，於新檔另寫同等小函式（不改 `products.ts`，避免違反「services 只新增不修改」）。新增 `src/hooks/useProductDetail.ts` 與 `.test.tsx`。
- **D-13:** TDD：每個單元先寫失敗測試（RED commit）再實作（GREEN commit）。必測：404→notFound、400→notFound、429→retryable 且 isRateLimited、500→retryable、網路錯誤→retryable、非 UUID 不發請求、價格 null 無 `NT$NaN`、0 保固→null、空 variants、壞 variant 被略過、attributes 字串化、預設變體選取、切換 id 會 abort 前一個請求、卸載後不 setState、retry 重新請求。
- **D-14:** 完成後 `npm test` 總數 > 215，並記錄新總數；`noAirtable.test.ts` 以 `import.meta.glob("src/**/*.{ts,tsx}")` 掃描，新檔自動涵蓋——在 VERIFICATION 以 grep 確認 glob 範圍即可，不改該測試。依 Phase 6 盤點規則，既有 215 項契約測試一項都不得刪改。每個 commit `npm test`、`npm run lint`、`npm run build` 全綠。

### Claude's Discretion
全部灰色地帶由 Claude 依 `--auto` 選建議預設值（使用者授權全自動）。planner 可調整計畫切分、測試檔組織與函式內部寫法，但不得改變：D-05（資料層不產生無價文案、不改 PRICE_ON_REQUEST）、D-08（404/400 才是 notFound）、D-09（非 UUID 不發請求）、D-12（不修改既有 services 檔的既有內容）。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 契約與架構
- `.planning/research/ARCHITECTURE.md` §三（詳情 API 契約，由後端原始碼驗證）、§五（404 處理細節）、§七（Pattern：詳情 service 與列表同風格）
- `.planning/research/PITFALLS.md` — 限流（#4）、資料模型假設（#11）、競態（#13）、CORS 簡單請求（#12）
- 後端原始碼（唯讀參考）：`../KRD-Inventory-Backend/src/modules/public/`（dto、routes、schemas、services）

### 需求與設計
- `.planning/REQUIREMENTS.md` — TEST-05（本 phase）；PROD-08~16（Phase 9 消費端，型別要能支撐）
- `.planning/ROADMAP.md` §Phase 7 成功標準 1–4
- `.planning/phases/06-design-lock/06-UI-SPEC.md` — §價格為空版面、§商品詳情頁狀態表（資料層要提供的欄位與狀態）
- `.planning/phases/06-design-lock/06-TEST-INVENTORY.md` — 既有 215 項測試基準與契約清單（不得刪改）

### 既有程式（模式來源）
- `src/services/products.ts` — `fetchProducts`、type guard、`normalizeError` 使用方式、可注入 client
- `src/services/errors.ts` — `ApiError`、`normalizeError`（不修改）
- `src/services/transform.ts` — `toProduct`、`UNNAMED_PRODUCT`（追加，不改既有）
- `src/services/format.ts` — `formatPrice`（沿用，不改）
- `src/hooks/useProducts.ts` + `useProducts.test.tsx` — AbortController、canceled 忽略、retry 寫法與測試手法
- `src/services/client.ts` — `apiClient`、`createApiClient(baseURL, adapter)` 測試注入點

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `normalizeError` 已把 429 分成 `rate_limited`、其他 HTTP 保留 `status`，分類只需讀 `kind`/`status`。
- `createApiClient(baseURL, adapter)` 讓測試不打真實網路。
- `formatPrice(cents)` 已處理千分位與 ÷100。

### Established Patterns
- service 簽名 `(params, client = apiClient, options = { signal })`，錯誤一律 `throw normalizeError(error)`，格式不符 `ApiError("invalid_response")`。
- hook 以 `reloadToken` 觸發 retry，effect 內建立 `AbortController`，aborted 或 `canceled` 不改狀態。
- 本機開發以 Vite proxy（`vite.config.ts`，`KRD_PROXY_TARGET` 預設 production）繞過 CORS。

### Integration Points
- Phase 9 的 `ProductDetailPage` 將呼叫 `useProductDetail(params.id)`；`ProductPageTemplate`／`HomePage` 測試以 `vi.mock("../services/products")` 自動 mock，新檔不在該模組內，不受影響。

</code_context>

<specifics>
## Specific Ideas

- 目前 production 20 筆商品價格皆為 null（`show_price=false`），null 是預設路徑而非例外。

</specifics>

<deferred>
## Deferred Ideas

- 詳情資料快取／去重（若 Phase 9 發現同頁重複請求再評估）
- 選取變體寫入 URL（`?sku=`）— YAGNI，ARCHITECTURE.md 已建議延後

</deferred>

---

*Phase: 07-detail-data*
*Context gathered: 2026-11-11（--auto）*
