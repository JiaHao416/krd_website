# External Integrations

**Analysis Date:** 2026-11-10

## APIs & External Services

**Headless CMS / 內容資料來源:**
- Airtable REST API（`https://api.airtable.com/v0/{BASE_ID}/{table}?view=data`）- 提供產品、導覽、Logo、服務項目內容
  - SDK/Client: axios instance（`src/services/index.ts`，baseURL `https://api.airtable.com`、timeout 10000ms）
  - 資料存取層：`src/services/AirTable.ts`，函式 `airTable()`、`getProducts(tableName)`、`getNavigation()`、`getLogo()`、`getServices()`
  - 使用的 table：`navigation`、`logo`、`abouts`，以及由呼叫端傳入名稱的產品表；view 固定為 `data`
  - Auth: Bearer token，寫死的 Airtable PAT 位於 `src/services/index.ts`（非環境變數）
  - Base ID 同樣寫死於 `src/services/AirTable.ts`
  - 錯誤處理：失敗時 `console.error` 後回傳空陣列，UI 顯示空狀態

**KRD 後端（尚未接入）:**
- KRD-Inventory-Backend 公開唯讀型錄 API：`https://api.krd.com.tw/api/v1/public`
  - 目前本站程式碼未引用；未來可取代 Airtable 作為產品資料來源

## Data Storage

**Databases:**
- 無自有資料庫；內容全存於 Airtable

**File Storage:**
- 圖片以 URL 形式來自 Airtable 欄位（`img_url`、`img`）；本機僅 `public/logo.png`、`public/vite.svg`、`src/assets/react.svg`

**Caching:**
- None（無 client 端快取層，每次載入皆打 Airtable）

## Authentication & Identity

**Auth Provider:**
- 無使用者驗證；網站為公開瀏覽
- 僅有對 Airtable 的 service-level token（見上）

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- 僅 `console.warn` / `console.error`（`src/services/AirTable.ts`）

## CI/CD & Deployment

**Hosting:**
- Cloudflare Pages，專案 `krd-website`，正式網域 `www.krd.com.tw`

**CI Pipeline:**
- Cloudflare Pages 的 GitHub 整合自動建置部署；repo 內無 `.github/` workflows

## Environment Configuration

**Required env vars:**
- 無（所有設定寫死於原始碼）

**Secrets location:**
- 寫死的 Airtable PAT 位於 `src/services/index.ts`，會被打包進前端 bundle 並公開暴露、且已進入 git 歷史；應撤銷輪替並改由後端代理或改用 `https://api.krd.com.tw/api/v1/public`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-11-10*
