# Phase 7: 詳情資料層 - Research

**Researched:** 2026-11-11
**Domain:** 前端資料層（axios service、type guard、transform、React hook、Vitest）
**Confidence:** HIGH（契約以 production curl 實測 + 後端原始碼雙重確認；模式以既有程式碼逐檔閱讀）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
D-01..D-14 全部鎖定（見 07-CONTEXT.md），重點：
- D-01 先 curl 實測再寫型別，樣本記錄於 07-API-SAMPLES.md；以實測為準
- D-02 fixture 手寫，假 UUID 形如 `00000000-0000-4000-8000-00000000000x`，不得觸發 noAirtable 規則
- D-03/D-04 `apiTypes.ts` 追加 `PublicVariantApi`、`PublicProductDetailApi`；`transform.ts` 追加 `ProductDetail`、`ProductVariant`、`toProductDetail`；不重用 `toProduct`
- D-05 價格 null 時資料層 `priceText: null`，不改 `PRICE_ON_REQUEST`；非有限數字一律 null，不得出現 `NT$NaN`
- D-06 預設變體 `find(isDefault) ?? variants[0] ?? null`，不重排
- D-07 壞 variant 略過 + `console.warn`；商品層缺必要欄位 → `ApiError("invalid_response")`
- D-08 `classifyDetailError`：`kind==="http"` 且 status 404/400 → notFound；其餘 retryable；canceled 由 hook 先忽略
- D-09 非 UUID 不發請求直接 notFound
- D-10 資料層不決定訪客文案，hook 只給 `isRateLimited`
- D-11 hook 判別聯合 `loading | success | notFound | error` + `retry()`，AbortController
- D-12 新檔 `src/services/productDetail.ts`（+test）、`src/hooks/useProductDetail.ts`（+test）；既有 services 檔不改既有內容（apiTypes/transform 只追加）
- D-13 TDD（RED commit → GREEN commit），必測清單見 CONTEXT
- D-14 `npm test` 總數 > 215；既有 215 項不得刪改；每 commit test/lint/build 全綠

### Claude's Discretion
計畫切分、測試檔組織、函式內部寫法；不得改變 D-05、D-08、D-09、D-12。

### Deferred Ideas (OUT OF SCOPE)
- 詳情快取／去重
- 變體選取寫入 URL（`?sku=`）
- （另：UI、路由屬 Phase 9，本 phase 不碰）
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-05 | 詳情頁資料層（service、transform、hook，含 404／400／429 分類）有單元測試，欄位以真實 API 回應確認 | 下方 curl 實測樣本、既有測試模式、Validation Architecture |
</phase_requirements>

## Summary

2026-11-11 對 production 公開 API 實測 5 次請求（列表 1、詳情 1、不存在 UUID 1、非 UUID 2），欄位與 ARCHITECTURE.md §三完全一致，沒有差異。詳情 `data` 直接是商品（非 `data.items`），**沒有** `featured_group / price_min / price_max`。錯誤 body 形狀為 `{success:false, error:{code, message, details?}}`，與 `errors.ts` 的 `extractBackendMessage`（讀 `error.message`）相容，不必改 errors.ts。404 → `PRODUCT_NOT_FOUND`，400 → `VALIDATION_FAILED`。CORS 對 `Origin: https://www.krd.com.tw` 回 `access-control-allow-origin`；限流 header `ratelimit: "60-in-1min"`（curl 無 CORS 限制，未受阻）。

既有模式非常一致：service 簽名 `(arg, client = apiClient, options = {signal})`、`try { client.get } catch → throw normalizeError`、type guard 後再 `ApiError("invalid_response")`；hook 用 `reloadToken` + `AbortController`；測試用 `createApiClient("/api/v1/public", adapter)` 注入自訂 `AxiosAdapter`（service）與 `vi.mock("../services/...")`（hook）。新檔只要照抄風格。noAirtable 的 glob 為 `/src/**/*.{ts,tsx}`，自動涵蓋 `src/services/*.ts` 與 `src/hooks/*.ts(x)`。

**Primary recommendation:** 新增 `productDetail.ts` 完整照抄 `products.ts` 風格；UUID 預檢用 RFC 4122 風格 regex（與後端 zod 4 `z.string().uuid()` 對齊）；hook 測試 mock `../services/productDetail` 時**必須保留 `classifyDetailError`/`isUuid` 的真實實作**（見 Pitfall 1）。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 詳情資料取得、錯誤分類、UUID 預檢 | Browser 資料層（services） | — | 純前端 SPA，只讀後端公開 API |
| 載入/找不到/錯誤狀態機 | Browser hook | — | 無 UI，Phase 9 消費 |
| 404/400 判定、限流 | API 後端 | 前端分類 | 後端決定狀態碼，前端只分類 |
| 價格顯示文案（價格請來電） | Browser UI（Phase 9） | — | D-05 資料層不產生 |

## Standard Stack

沿用既有，**不新增任何套件**（無 Package Legitimacy 風險；省略 Audit，本 phase 不安裝外部套件）。

| Library | Version | Purpose |
|---------|---------|---------|
| axios | ^1.9.0（既有） | HTTP；`AxiosError`/`CanceledError` 供測試構造錯誤 |
| vitest + @testing-library/react（既有） | 既有 | `renderHook`、`waitFor`、`act` |
| React 19（既有） | ^19.1 | hook |

## Real API Samples（curl 實測，2026-11-11，無憑證）[VERIFIED: curl production]

請求總數 5（+1 次帶 Origin 看 header），遠低於 60/min。已 sanitize（id 保留，因為是公開商品；URL 保留 host 因為是公開圖床）。

**1. `GET /products?limit=3` → 200**（3 筆，`pagination:{offset:0,limit:3,total:20}`）
- 三筆皆 `model:null, description:null, warranty_period_months:null, featured_group:null, price_min:null, price_max:null, in_stock:false`；`brand` 為 "MICGO"/"KRD"；`image_url` 為 `https://img.krd.com.tw/<uuid>.jpg`。

**2. `GET /products/6d660a71-98b6-4b18-95ee-a2175aeab9c8` → 200**
```json
{"success":true,"data":{"id":"6d660a71-98b6-4b18-95ee-a2175aeab9c8","name":"BB1","brand":"MICGO","model":null,"category":"喇叭","description":null,"image_url":"https://img.krd.com.tw/3384cbf9-....jpg","warranty_period_months":null,"published_at":"2026-11-10T01:55:23.622Z","in_stock":false,"variants":[{"id":"4820b343-6944-48a7-bd39-6c27df0b858d","sku":"AT-99AE59705A78","attributes":{},"image_url":"https://img.krd.com.tw/3384cbf9-....jpg","is_default":true,"in_stock":false,"price_incl_tax":null}]}}
```
- 商品層鍵：`id,name,brand,model,category,description,image_url,warranty_period_months,published_at,in_stock,variants`（共 11 個；無 featured_group/price_min/price_max）。
- variant 鍵：`id,sku,attributes,image_url,is_default,in_stock,price_incl_tax`。
- 觀察到的 null/邊界：`model/description/warranty_period_months/price_incl_tax` 為 null；`attributes` 為 `{}`（空物件）；variant `image_url` fallback 為商品主圖。
- **未實測到**（production 20 筆皆 show_price=false）：非 null `price_incl_tax`、非空 `attributes`、`warranty_period_months` 為 0 或正數、空 `variants`、`image_url:null`。這些邊界只能依後端原始碼/ARCHITECTURE 寫 fixture，需標註「依契約手寫，非實測」。[ASSUMED 形狀，來源 ARCHITECTURE.md §三（後端原始碼驗證）]

**3. `GET /products/00000000-0000-4000-8000-000000000001` → 404**
```json
{"success":false,"error":{"code":"PRODUCT_NOT_FOUND","message":"商品不存在"}}
```
**4. `GET /products/not-a-uuid` → 400**
```json
{"success":false,"error":{"code":"VALIDATION_FAILED","message":"輸入驗證失敗","details":{"fields":{"id":"Invalid UUID"}}}}
```
**5. 響應 header（帶 `Origin: https://www.krd.com.tw`）：** `access-control-allow-origin: https://www.krd.com.tw`；`ratelimit: "60-in-1min"; r=55; t=47`；`ratelimit-policy: "60-in-1min"`。

**與 ARCHITECTURE.md §三比對：完全一致，無差異需記錄。**

## UUID 驗證 [VERIFIED: 後端原始碼 + curl]

- 後端 `publicProductIdParamSchema = z.object({ id: z.string().uuid() }).strict()`（`src/modules/public/schemas/public-catalog.schemas.ts`），後端 zod 版本 4.4.3。zod 4 的 `.uuid()` 為嚴格 RFC 4122/9562：版本位 1–8、variant 位 `[89ab]`（另允許 nil 與 max UUID）。[CITED: zod v4 changelog，ASSUMED 細節；以 curl 驗證 `…-4000-8000-…` 被接受（回 404 而非 400）]
- 建議前端 regex：`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`。此 regex 會把「格式正確但 variant 位不合」的字串判為非 UUID → 前端直接 notFound，與後端 400 → notFound 結果一致，不會產生行為差異。nil UUID（全 0）後端會放行並回 404，前端判 notFound，結果亦相同。
- 測試必含：D-02 形狀 fixture `00000000-0000-4000-8000-000000000001`（通過）、`not-a-uuid`、空字串、含大寫、多餘空白/尾字元（皆應 false 或依 regex 判斷）。

## 既有模式摘要（新檔必須比照）

**service（`products.ts`）**
- import：`type { AxiosInstance }`、`apiClient`、`ApiError, normalizeError`；簽名 `fetchX(arg, client: AxiosInstance = apiClient, options: FetchXOptions = {})`，`options.signal`。
- 結構：`let body: unknown; try { const response = await client.get<unknown>(path, { signal: options.signal }); body = response.data; } catch (error: unknown) { throw normalizeError(error); }`，之後 type guard 失敗 → `throw new ApiError("invalid_response", "…")`。
- 路徑為相對 baseURL：`client.get("/products/" + id)`（baseURL 已含 `/api/v1/public`）。id 已過 UUID 預檢，仍建議 `encodeURIComponent(id)`（無害）。
- guard 風格：`typeof v === "object" && v !== null`，`const v = value as Record<string, unknown>`，不用 `any`。
- 詳情 guard 與列表分開：`success===true` 且 `data` 為物件（非 `data.items`）。
- `toNullableNumber` 在 `products.ts` 為非 export 內部函式 → 新檔另寫同等版本（D-12）。
- 錯誤分類 `classifyDetailError(error: unknown)`：建議先 `normalizeError(error)` 再讀 `kind/status`，這樣可直接餵任何錯誤。

**transform（`transform.ts`）**
- `UNNAMED_PRODUCT`、`resolveName`（私有，用 api.name.trim()，空時用 brand+model）。詳情 `name` 同樣 trim，空字串 → 可重用 `UNNAMED_PRODUCT`（D-04 指定）。注意 `resolveName` 非 export 且型別為 `PublicProductApi`，不要重用也不要改；新函式自寫（可含 brand/model fallback，與列表一致，或照 D-04 僅 UNNAMED_PRODUCT——planner 擇一並測試）。
- `formatPrice(cents)` 已 export 於 `format.ts`；`ProductVariant.priceText` 只在有限數字時呼叫。`toProductDetail` 內再做一次 `Number.isFinite` 防線，避免 `NT$NaN`。
- `imageUrl: api.image_url || null`（空字串正規化為 null）。

**errors（`errors.ts`）**
- 順序：ApiError 直通 → `axios.isCancel` → axios 無 response = `network` → 429 = `rate_limited`(status 429) → 其他 `http`(status)。非 axios → `invalid_response`。故 `classifyDetailError`：`kind==="http" && (status===404||status===400)` → notFound，其餘 retryable。`invalid_response`（如 SPA fallback HTML）→ retryable。

**hook（`useProducts.ts`）**
- `reloadToken` state + `retry = useCallback(() => setReloadToken(n => n+1), [])`；effect 內 `new AbortController()`，`setState(loading)`，`fetch(...,{signal})`，then/catch 前先 `if (controller.signal.aborted) return`，catch 另判 `error instanceof ApiError && error.kind === "canceled"`；cleanup `controller.abort()`。
- 詳情 hook 差異：`id` 非 UUID/undefined → effect 內同步設 `notFound`、不呼叫 fetch；retry 時狀態回 loading；error 狀態帶 `isRateLimited: error.kind==="rate_limited"`，error 需為 `ApiError`（catch 內以 `normalizeError` 轉）。
- 避免在 effect 外對 `id` 變更殘留舊 success：id 變更時先設 loading。

**測試模式**
- service：`createMockAdapter(data, status)`（拋 `AxiosError(..., ERR_BAD_RESPONSE, config, null, {data,status,...})` 於 ≥400）與 `createNetworkErrorAdapter`（`AxiosError("Network Error", ERR_NETWORK, config)`），`createApiClient("/api/v1/public", adapter)`；用 `captured.config.url`/`signal` 斷言請求。這些 helper 在 `products.test.ts` 內為檔內私有，**新測試檔需自行複製**（不可 import，也不要改 products.test.ts）。canceled：以 `new AbortController()` 先 abort 再呼叫，或 adapter 拋 `CanceledError`。
- hook：`vi.mock("../services/productDetail")` + `vi.mocked(...)`，`beforeEach(vi.resetAllMocks)`；`renderHook`、`waitFor`、`act(() => result.current.retry())`；永不 resolve 的 promise `new Promise(() => {})` 代表 loading；StrictMode 用 `renderHook(..., { wrapper: StrictMode })`；abort 以 `mockFetch.mock.calls[0][2]?.signal?.aborted` 斷言。`rerender` 搭 `initialProps` 測切換 id。專案未用 fake timers，不必引入。

## Architecture Patterns

```
route id ─▶ useProductDetail(id)
            ├─ !isUuid(id) ───────────────▶ { status: "notFound" }（不發請求）
            └─ AbortController ─▶ fetchProductDetail(id, undefined, {signal})
                                   GET /products/{id}
                                   ├─ ok  ─▶ guard ─▶ toProductDetail ─▶ success
                                   ├─ ApiError canceled ─▶ 忽略
                                   └─ error ─▶ classifyDetailError
                                        ├─ notFound (http 404/400)
                                        └─ retryable ─▶ { status:"error", error, isRateLimited }
```

檔案：`src/services/productDetail.ts(+.test.ts)`、`src/hooks/useProductDetail.ts(+.test.tsx)`；`apiTypes.ts`、`transform.ts`（+`transform.test.ts` 可追加 `describe` 區塊，**只追加不刪改**，或另開 `transformDetail.test.ts` 更安全）。

## Don't Hand-Roll

| Problem | Use Instead |
|---------|-------------|
| 錯誤正規化 | `normalizeError`（不要在新檔重判 axios 錯誤） |
| 價格格式化 | `formatPrice`（不要自己 `/100` 與千分位） |
| 取消請求 | `AbortController` + axios `signal` |
| 測試網路 | 自訂 `AxiosAdapter`，不要 mock axios 模組 |

## Common Pitfalls

### Pitfall 1：hook 測試 `vi.mock("../services/productDetail")` 自動 mock 掉 `isUuid`/`classifyDetailError`
**What goes wrong:** 自動 mock 後 `isUuid` 回 undefined → 所有 id 被判 notFound 或 classify 失效，測試莫名失敗。
**How to avoid:** 用 `vi.mock(path, async (orig) => ({ ...(await orig<typeof import(...)>()), fetchProductDetail: vi.fn() }))`，只替換 fetch。或把 `isUuid`/`classifyDetailError` 放在不被 mock 的位置（但 D-12 指定放 productDetail.ts，故用 partial mock）。
**Warning signs:** hook 測試中成功路徑永遠 notFound。

### Pitfall 2：noAirtable 規則誤傷 fixture
規則（`src/noAirtable.test.ts` 與 `scripts/check-dist.mjs` 必須一致）：`/airtable/i`、`/api\.airtable\.com/i`、`/\bapp[A-Za-z0-9]{14}\b/`、`/\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b/`、`/\bkey[A-Za-z0-9]{14}\b/`。
風險：任何**單字**（`\b` 邊界）以 `app`/`key` 開頭且後接恰好 14 個英數字元會中獎，例如 `applicationRequirements`（app+14 字元後恰為邊界時）不太可能但別寫長駝峰識別名；`keyboardAttributeNames` 之類 `key`+14 字元的識別名同理。實務上：fixture 的 sku 用 `AT-99AE59705A78` 形狀（含 `-`，`\b` 切開）安全；不要把 base64/長 hex 當 sku 或 attributes 值；attributes key 避免 `key`+14 字元連續英數（如 `keyboardLayoutX`）。UUID 含 `-`，安全。**不要**在 fixture 或註解中寫 "airtable"（連註解都會中）。`isUuid` regex 本身不含上述樣式。若誤報，改名，不放寬 regex。
- 掃描檔數量斷言 `> 20`：新增檔只會增加，不影響。

### Pitfall 3：把所有 `http` 錯誤當 notFound
只有 404、400。500/502/503 → retryable。測試需分別覆蓋 500 與 503（或 502）。

### Pitfall 4：`isRateLimited` 來源
429 在 `normalizeError` 為 `kind: "rate_limited"`（非 `http`），所以 `classifyDetailError` 的 `http` 判斷不會把 429 吞掉；notFound 判斷務必同時檢查 `kind==="http"`，否則 429 之外的邏輯可能意外錯分。

### Pitfall 5：`useEffect` 內同步 `setState` 規則
React 19 + `react-hooks` eslint 版本若有 `set-state-in-effect` 規則可能警告；`useProducts` 已在 effect 內 `setState`，同寫法通過 lint。非 UUID 的 notFound 也可用同寫法（或以 `useMemo` 衍生狀態避免 effect）。先跑 `npm run lint` 驗證。

### Pitfall 6：價格 NaN
`toNullableNumber` 擋 NaN/Infinity/字串；transform 內對 `price_incl_tax` 再次 `Number.isFinite` 防線；測試餵 `NaN`、`"1200"`、`undefined`、負值（負值是否視為 null：契約無此情況，不特別處理，只保證不出現 NaN）。

### Pitfall 7：attributes 值字串化
`Object.entries(attrs).map(([key,value]) => ({key, value: String(value)}))`；僅接受 string/number/boolean 值，其他型別（物件、null）略過該 key（避免 `"[object Object]"`/`"null"`）。保持後端輸出順序。

## Code Examples

```ts
// 錯誤分類（與 D-08 一致）；先 normalizeError 讓任意錯誤可餵入
export type DetailErrorClass = "notFound" | "retryable";
export function classifyDetailError(error: unknown): DetailErrorClass {
  const e = normalizeError(error);
  if (e.kind === "http" && (e.status === 404 || e.status === 400)) return "notFound";
  return "retryable";
}
```

```ts
// service 測試：adapter 注入（照抄 products.test.ts 的 helper）
const { client } = setup(detailFixture);            // 200
await expect(fetchProductDetail(ID, client)).resolves.toMatchObject({ id: ID });
const nf = setup({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "商品不存在" } }, 404);
await expect(fetchProductDetail(ID, nf.client)).rejects.toMatchObject({ kind: "http", status: 404 });
```

```ts
// hook partial mock（Pitfall 1）
vi.mock("../services/productDetail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/productDetail")>()),
  fetchProductDetail: vi.fn(),
}));
```

fixture 建議（手寫，非實測，需標註）：價格非 null 變體 `price_incl_tax: 120000` → `priceText "NT$1,200"`；`warranty_period_months: 0` → `warrantyMonths null`；`variants: []` → `defaultVariantId null`；壞 variant（缺 sku）被略過並 `console.warn`（測試以 `vi.spyOn(console,"warn").mockImplementation(()=>{})` 靜音並斷言）。

## State of the Art
無相關變動；沿用 Phase 1–6 既有模式。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | zod 4 `.uuid()` 的版本位 1–8、variant `[89ab]`（含 nil/max）細節 | UUID 驗證 | 低：前端 regex 與後端不一致時，結果仍同為 notFound（400/404 皆 notFound） |
| A2 | 非 null 價格、非空 attributes、warranty 0、空 variants 的形狀取自 ARCHITECTURE.md（後端原始碼驗證），production 無此資料未實測 | Real API Samples | 中：若後端 DTO 有差異，fixture 偏離；Phase 9 前上線有價商品時可再 curl 一次補樣本 |
| A3 | 詳情 `name` 空字串是否也退 brand+model（D-04 只寫 UNNAMED_PRODUCT） | Patterns | 低：planner 擇一並寫測試 |

## Open Questions

1. 07-API-SAMPLES.md 是否另建？上方「Real API Samples」已含全部 sanitized 樣本，planner 可直接複製為該檔（D-01 要求），第一個 task 可改為「落檔 + 與型別比對」而非重打 curl（避免多耗限流額度；若要重驗再打 ≤3 次）。
2. transform 詳情測試放既有 `transform.test.ts`（追加）或新檔？建議新檔，降低誤改既有 215 項的風險。

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Node/npm、vitest | 測試 | ✓（專案既有） | — |
| production API（curl） | 契約驗證 | ✓ | 已實測，無 CORS/網路阻擋 |
| `../KRD-Inventory-Backend` 原始碼 | 契約比對 | ✓ 可讀 | 唯讀 |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest（unit 為 node、component 為 jsdom，見 TESTING.md）+ @testing-library/react |
| Config file | 既有（vite.config.ts 內 test 設定；不新增） |
| Quick run command | `npx vitest run src/services/productDetail.test.ts src/hooks/useProductDetail.test.tsx` |
| Full suite command | `npm test`（基準 215；Phase 7 後須 > 215 並記錄新總數）、`npm run lint`、`npm run build` |

### Phase Requirements → Test Map
| Req / 標準 | Behavior | Test Type | Automated Command | File Exists? |
|-----------|----------|-----------|-------------------|-------------|
| TEST-05 / SC1 | 型別欄位與 curl 樣本一致；`toProductDetail` 不重用 `toProduct`；價格 null 無 `NT$NaN`；0 保固→null；空 variants；attributes 字串化；預設變體 | unit | `npx vitest run src/services/transformDetail.test.ts` | ❌ Wave 0 |
| TEST-05 / SC2 | 404/400→notFound；429/500/503/network/invalid_response→retryable；非 UUID 不發請求；`isUuid` | unit | `npx vitest run src/services/productDetail.test.ts` | ❌ Wave 0 |
| TEST-05 / SC3 | hook 四狀態、id 變更 abort、unmount abort、不 setState、retry、StrictMode 一次有效請求 | hook | `npx vitest run src/hooks/useProductDetail.test.tsx` | ❌ Wave 0 |
| SC4 | 總數 > 215；noAirtable 掃描涵蓋新檔 | meta | `npm test`（讀總數）；`grep -n 'import.meta.glob' src/noAirtable.test.ts` 確認 `/src/**/*.{ts,tsx}` | ✅ |

### Sampling Rate
- Per task commit: 上列對應檔的 quick run + `npm run lint`
- Per wave merge / phase gate: `npm test && npm run lint && npm run build` 全綠

### Wave 0 Gaps
- [ ] `src/services/productDetail.test.ts`、`src/services/transformDetail.test.ts`、`src/hooks/useProductDetail.test.tsx`（均新檔，RED 先行）
- 框架已安裝，無需安裝

## Security Domain

| ASVS | Applies | Control |
|------|---------|---------|
| V5 Input Validation | yes | `isUuid` 預檢路由參數；回應 type guard；`encodeURIComponent(id)` 防路徑注入 |
| V2/V3/V4/V6 | no | 無認證/session/加密；公開唯讀 API |

| Threat | STRIDE | Mitigation |
|--------|--------|-----------|
| 路由參數造成路徑穿越（`../`） | Tampering | UUID 預檢 + encode，非 UUID 不發請求 |
| 前端帶憑證 | Info disclosure | 不設 headers；noAirtable + dist 掃描 |
| 回應惡意 HTML/型別 | Tampering | type guard，不使用 `dangerouslySetInnerHTML`（Phase 9 渲染 description 須當純文字） |

## Sources

### Primary (HIGH)
- production curl（`https://api.krd.com.tw/api/v1/public/products…`，2026-11-11）
- 後端原始碼 `../KRD-Inventory-Backend/src/modules/public/schemas/public-catalog.schemas.ts`、`services/public-catalog.service.ts`
- 專案原始碼：`src/services/{products,errors,transform,format,client,apiTypes}.ts`、`src/hooks/useProducts{.ts,.test.tsx}`、`src/services/products.test.ts`、`src/noAirtable.test.ts`
- `.planning/research/ARCHITECTURE.md` §三

### Tertiary (LOW)
- zod 4 uuid 細節（訓練知識，A1）

## Metadata
**Confidence:** 標準堆疊 HIGH（無新增）；架構 HIGH；陷阱 MEDIUM-HIGH（noAirtable 正則推演為分析，非跑測試驗證）
**Research date:** 2026-11-11；**Valid until:** 2026-12-11（後端契約變動時失效）
