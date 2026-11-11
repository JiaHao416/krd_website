---
phase: 01
slug: api
status: verified
threats_open: 0
asvs_level: 1
created: 2026-11-10
---

# Phase 1 — Security

> 每階段安全契約：威脅登錄、接受風險與稽核紀錄。

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| 瀏覽器 → 公開 API | 無憑證的唯讀 GET，後端以 CORS 白名單與限流保護 | 公開商品資料 |
| 回應 → 前端 | 後端回應視為不可信，經型別守衛與逐筆驗證 | JSON 商品資料 |
| 建置環境 → bundle | 僅 VITE_ 變數進入 bundle，只放公開值 | API base URL |
| dev proxy（node 端） | KRD_PROXY_TARGET 僅存在於 vite.config.ts | 開發用目標網址 |

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation（證據） | Status |
|-----------|----------|-----------|-------------|--------------------|--------|
| T-01-01 | Information Disclosure | client.ts/apiTypes.ts/products.ts | mitigate | client.ts:23-27 `axios.create({ baseURL, timeout, adapter })` 無 headers；對 airtable/bearer/authorization 的 grep 在 services 新檔無命中（僅註解「不設任何 headers」）；無 import services/index.ts | closed |
| T-01-02 | Information Disclosure | .env.development/.env.example | mitigate | 僅公開網址；.env.example 無 airtable/token/secret；vite-env.d.ts 註解「所有 VITE_ 變數都會打包進前端，只能放公開值」 | closed |
| T-01-03 | Information Disclosure | KRD_PROXY_TARGET | mitigate | 只在 vite.config.ts:11 讀取；src/ 內 grep 無引用；非 VITE_ 前綴；src 內 import.meta.env 僅 VITE_API_BASE_URL（client.ts:23） | closed |
| T-01-04 | Tampering | vite.config.ts server.proxy | accept | 見接受風險 AR-01 | closed |
| T-01-05 | Spoofing | proxy Origin 改寫 | mitigate | vite.config.ts 僅 `target` 與 `changeOrigin: true`，無偽造 Origin header（僅註解提及） | closed |
| T-01-06 | Denial of Service | proxy live-check | mitigate | 01-01-SUMMARY.md:46 記錄單次 `limit=1` 請求且結束後無殘留程序 | closed |
| T-01-SC | Tampering | npm install vitest | mitigate | package.json:36-37 vite ^6.3.5、vitest ^4.1.12；SUMMARY 與 package.json 無 --force/--legacy-peer-deps | closed |
| T-01-07 | Tampering | toProduct name/description | accept | 見 AR-02 | closed |
| T-01-08 | Tampering | toProduct null/空欄位 | mitigate | transform.ts:59 `image_url \|\| null`、name trim/fallback/保底文案；transform.test.ts:88-123 涵蓋空圖、空白名稱、null brand/model | closed |
| T-01-09 | Information Disclosure | format.ts/transform.ts | accept | 見 AR-03 | closed |
| T-01-10 | Tampering | buildProductParams | mitigate | catalog.ts:51-70 僅白名單鍵 brand/category/featured/sort/limit，空值不送；catalog.test.ts:73-106 驗證 encode 與空字串省略 | closed |
| T-01-11 | Denial of Service | limit 參數 | mitigate | catalog.ts:19 `PRODUCT_LIMIT = 100`，非外部傳入；catalog.test.ts:45 | closed |
| T-01-12 | Information Disclosure | catalog.ts | accept | 見 AR-04 | closed |
| T-01-13 | Tampering | fetchProducts 回應解析 | mitigate | products.ts:19-28 `isProductListResponse`、逐筆 `isPublicProduct`（CR-01）、失敗拋 `ApiError("invalid_response")`；products.test.ts:197-254 涵蓋 success:false、HTML、非陣列、null 元素 | closed |
| T-01-14 | Information Disclosure | getErrorMessage | mitigate | errors.ts:86-91 僅回傳固定 ERROR_MESSAGES；canceled 退回 generic 文案，不含後端細節。後端 message 只存於 ApiError.message，不經由 getErrorMessage 輸出 | closed |
| T-01-15 | Denial of Service | 429 重試 | mitigate | products.ts 無重試邏輯；products.test.ts:265 斷言 500 時只請求一次 | closed |
| T-01-16 | Repudiation | 吞錯 | mitigate | products.ts 所有失敗路徑皆 throw，grep 無 `return []` | closed |
| T-01-17 | Information Disclosure | 新 services 檔 | mitigate | 對 airtable/bearer/authorization 的 grep 無命中（含 errors/format/transform/catalog） | closed |

*Status: open · closed*

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-01-04 | proxy 僅用於本機 dev server，production 為 Cloudflare Pages 靜態部署，無 proxy | 計畫階段（PLAN threat_model） | 2026-11-10 |
| AR-02 | T-01-07 | 不產生 HTML，由 React 轉義；repo 內無 dangerouslySetInnerHTML | 計畫階段 | 2026-11-10 |
| AR-03 | T-01-09 | format/transform 為純函式，無外洩路徑 | 計畫階段 | 2026-11-10 |
| AR-04 | T-01-12 | catalog.ts 只含公開字串 | 計畫階段 | 2026-11-10 |

## Unregistered Flags

無。01-01 至 01-04 SUMMARY 的 Threat Flags 皆為 none。

## Notes（資訊性，非阻擋）

- 舊的 Airtable 檔 `src/services/index.ts` 仍在 repo，屬後續階段移除範圍，新檔未引用它，不影響本階段威脅。
- 本次稽核涵蓋 REVIEW-FIX 後狀態：WR-03 改名 KRD_PROXY_TARGET、WR-02 新增 canceled 種類、CR-01 逐筆驗證，均已確認。

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-10 | 18 | 18 | 0 | gsd-security-auditor |

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-10
