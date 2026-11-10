# External Integrations

**Analysis Date:** 2026-11-10（Phase 3 更新：已停用 Airtable）

## APIs & External Services

**KRD 後端公開唯讀 API:**
- `https://api.krd.com.tw/api/v1/public`（dev 由 `.env.development` 覆寫為 `/api/v1/public` 經 Vite proxy）
  - Client: `src/services/client.ts` 的 `apiClient`（axios，timeout 10000ms，不帶任何 headers 或憑證）
  - 資料存取：`src/services/products.ts`（`fetchProducts`）、`catalog.ts`（商品頁查詢設定）、`transform.ts`
  - 錯誤處理：`src/services/errors.ts` 的 `ApiError`，向上拋出由頁面顯示
  - 依賴後端 CORS 白名單與限流；`*.pages.dev` 預覽網址不在白名單內

**已停用:** Airtable。service（`src/services/` 舊入口檔）與未使用的商品卡片元件已於 Phase 3 刪除，內容改為 repo 內靜態檔。

## Data Storage

- 無自有資料庫；商品資料在後端，由家人於 KRD-Inventory App 維護。
- 靜態內容：導覽 `src/config/navigation.ts`、關於我們 `src/content/abouts.ts` 與 `public/abouts/`、Logo `public/brand-logo.png`。

**Caching:** None（無 client 端快取層）。

## Authentication & Identity

- 無使用者驗證；網站為公開瀏覽，前端不含任何憑證。

## Monitoring & Observability

- Error Tracking: None；Logs: 僅 `console.warn` / `console.error`。

## CI/CD & Deployment

- Cloudflare Pages，專案 `krd-website`，正式網域 `www.krd.com.tw`；GitHub 整合自動建置部署（`npm run build`），repo 內無 `.github/` workflows。
- 防回歸：`npm test` 內含 `src/noAirtable.test.ts`；build 後可手動執行 `npm run check:dist` 掃描 `dist/`（不加進 build）。

## Environment Configuration

- `VITE_API_BASE_URL`（選用）：公開 API base URL，未設定時使用 production 預設。
- `KRD_PROXY_TARGET`（選用，僅 dev proxy，不帶 VITE_ 前綴以免進入 bundle）。

**Secrets location:** 前端無任何 secrets。舊 token 程式碼已移除，但 git 歷史仍含，待 Phase 4 由 Owner 撤銷。

## Webhooks & Callbacks

- Incoming: None；Outgoing: None

---

*Integration audit: 2026-11-10（Phase 3 更新）*
