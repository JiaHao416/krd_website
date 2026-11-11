# Codebase Concerns

**Analysis Date:** 2026-11-10

## Tech Debt

**App.tsx 路由（已改為設定陣列產生，僅供歷史參考）:**
- Issue: 9 條路由各自內嵌相同結構的 `ProductPageTemplate` 與長 SVG path（`src/App.tsx` 203 行）。
- Impact: 新增分類需複製大段 JSX，圖示難以維護。
- Fix approach: 以設定陣列（path/title/tableName/description/icon）`map` 產生路由，圖示抽成獨立元件或檔案。

**其他:**
- `@types/react-router-dom ^5` 與 react-router-dom v6 不符（v6 自帶型別）。
- `index.html` title 僅 "KRD"，無 meta description。
- `README.md` 可能仍為 Vite 範本內容；`package.json` version `0.0.0`。

## Known Bugs

**SPA 路由在 Cloudflare Pages 直接進入子路徑會 404:**
- Symptoms: 直接開啟或重新整理 `/abouts`、`/all-products` 等路徑時，可能出現 404（或依 Cloudflare Pages 預設行為不穩定）。
- Files: `public/`（缺少 `_redirects`）, `src/App.tsx`
- Trigger: 於 www.krd.com.tw 直接輸入子路徑 URL 或重新整理。
- Workaround: 於 `public/_redirects` 加入 `/* /index.html 200`（注意 Cloudflare Pages 若無 404.html 預設已啟用 SPA fallback，需實測確認）。

**`App.tsx` 無 catch-all 路由:**
- Symptoms: 未定義路徑渲染空白頁，無 404 頁面。
- Files: `src/App.tsx`
- Fix: 新增 `<Route path="*" element={<NotFound/>} />`。

## Security Considerations

**舊憑證仍存在於 git 歷史:**
- 現況: 程式碼已於 Phase 3 移除（`src/noAirtable.test.ts` 與 `npm run check:dist` 防回歸），但公開 git 歷史仍含舊 token。
- 緩解: 待 Phase 4 由 Owner 至 Airtable 撤銷該 token（REL-02）；程式無法清除公開歷史。

**缺少 `.env*` 忽略規則確認:**
- `.gitignore` 含 `*.local`，但未明列 `.env`；改用環境變數前需補上 `.env`、`.env.*`。

**無 CSP / 安全標頭:**
- 未設定 `public/_headers`，無 Content-Security-Policy、X-Frame-Options 等。
- 商品圖片 URL 來自後端，需信任其來源。

## Performance Bottlenecks

**無快取:**
- 換路由即重抓商品；10 秒 timeout，失敗無自動重試。

**圖片未最佳化:**
- Files: `src/pages/ProductPageTemplate.tsx`, `src/pages/HomePage.tsx`
- `<img>` 未見 `loading="lazy"`、尺寸屬性或響應式 srcset 的一致使用，易造成 CLS 與流量浪費。
- Improvement path: 圖片放自家 CDN / Cloudflare Images 或 R2。

**無 code splitting:**
- `src/App.tsx` 同步匯入所有頁面，未使用 `React.lazy`；規模小，影響有限。

## Fragile Areas

**大型元件:**
- `src/pages/HomePage.tsx`（407 行）、`src/pages/AboutPage.tsx`（383 行）、`src/components/NavBar.tsx`（332 行）混合資料、狀態與大量 JSX/內嵌 SVG，修改易波及。
- Safe modification: 先拆子元件再改版面。

## Scaling Limits

**後端公開 API 限流:**
- 依賴後端 CORS 白名單與限流；流量增加時需評估快取。

## Dependencies at Risk

**`@types/react-router-dom ^5.3.3`:**
- Risk: 與 react-router-dom v6 不相容的過時型別，可能誤導型別。Migration: 移除。

## Missing Critical Features

**CI/CD 與 lint gate:**
- 無 GitHub Actions；部署僅靠 Cloudflare Pages 建置（`npm run build`，含 `tsc -b` 與 dist 憑證掃描），lint 未被強制。

**SEO / 可及性:**
- 純 CSR SPA，無 SSR/預渲染，搜尋引擎與社群預覽（OG tags）支援弱；無 `robots.txt`、`sitemap.xml`、404 頁、錯誤邊界（Error Boundary）。
- 圖片 alt 部分取自資料欄位（如 `icon_name`），可能無意義。

**錯誤與載入狀態:**
- 無全域 Error Boundary；API 失敗無使用者可見訊息與重試。

## Test Coverage Gaps

**頁面與元件測試持續補強中:**
- 已有 Vitest 測試；`ImageModal` 鍵盤行為、響應式行為仍可補。
- Priority: Medium

---

*Concerns audit: 2026-11-10*
