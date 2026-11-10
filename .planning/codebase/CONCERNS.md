# Codebase Concerns

**Analysis Date:** 2026-11-10

## Tech Debt

**資料抓取邏輯重複、無共用快取:**
- Issue: `NavBar`、`SideMenu`、`HomePage`、`AboutPage`、`ProductPageTemplate` 各自在 `useEffect` 內呼叫 Airtable，各自定義 loading/error state，各自 `console.error`。NavBar 與 SideMenu 都會重複抓取 navigation，每次換頁、換元件都重新請求。
- Files: `src/components/NavBar.tsx`, `src/components/SideMenu.tsx`, `src/pages/HomePage.tsx`, `src/pages/AboutPage.tsx`, `src/pages/ProductPageTemplate.tsx`
- Impact: 多餘的 API 請求，容易觸發 Airtable rate limit（每 base 5 req/s），行為不一致。
- Fix approach: 抽出共用 hook（如 `useAirtable`）或引入 context/快取（React Query、SWR），navigation/logo 只抓一次。

**App.tsx 路由大量複製貼上:**
- Issue: 9 條路由各自內嵌相同結構的 `ProductPageTemplate` 與長 SVG path（`src/App.tsx` 203 行）。
- Impact: 新增分類需複製大段 JSX，圖示難以維護。
- Fix approach: 以設定陣列（path/title/tableName/description/icon）`map` 產生路由，圖示抽成獨立元件或檔案。

**型別鬆散 (`any`):**
- Issue: `[key: string]: any` 出現在 `src/services/index.ts`（含 `catch (error: any)`、`ApiError.data?: any`）、`src/components/ProductView.tsx`、`src/pages/ProductPageTemplate.tsx`、`src/pages/HomePage.tsx`。型別介面在 component 內重複定義，未共用 `ProductField`。
- Impact: 欄位更名（Airtable schema 變動）時編譯期無法偵測。
- Fix approach: 共用 `src/services` 匯出的型別，移除 index signature，改用明確欄位。

**`services/index.ts` 內容混雜:**
- Issue: 單一檔案同時含 axios instance 與 Airtable 查詢函式、型別（檔內有 `// services/AirTable.ts` 註解，疑似兩檔合併）。`BASE_ID` 寫死、`baseURL` 與完整 URL 重複。
- Fix approach: 拆為 `client.ts` 與 `airtable.ts`，設定移至環境變數。

**錯誤被吞掉:**
- Issue: `airTable()` 於失敗時回傳 `[]`（`src/services/index.ts`），UI 無法分辨「無資料」與「API 失敗／token 失效」。
- Impact: Token 被撤銷或網路錯誤時，網站靜默顯示空白。
- Fix approach: 向上拋出錯誤或回傳 `{data, error}`，UI 顯示錯誤狀態與重試。

**其他:**
- `package.json` 同時有 `tailwindcss ^3.4.0` 與 `@tailwindcss/postcss ^4.1.7`（版本混用），且 `@types/react-router-dom ^5` 與 react-router-dom v6 不符（v6 自帶型別）。
- `index.html` 設 `lang="en"` 但內容為繁體中文；title 僅 "KRD"，無 meta description。
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

**favicon 型別不符:**
- `index.html` 的 `<link rel="icon" type="image/svg+xml" href="/logo.png" />` type 與實際 PNG 不符；`public/vite.svg` 為殘留範本資源。

## Security Considerations

**寫死的 Airtable PAT 暴露於公開 GitHub repo（嚴重）:**
- Risk: `src/services/index.ts` 的 `Authorization: Bearer ...` header 內含寫死的 Airtable PAT。此 repo 為公開，且 token 會被打包進前端 JS bundle，任何人皆可取得，並依 token 權限讀取（若有 write scope 則可寫入/刪除）Base 資料。Git 歷史（含 commit `b12b45d` 起）已包含該 token，僅刪除檔案內容不足以消除風險。
- Files: `src/services/index.ts`
- Current mitigation: 無。
- Recommendations:
  1. 立即至 Airtable 撤銷（revoke）並重新發行該 PAT。
  2. 新 token 僅授予單一 base 的 `data.records:read`，不給 write/schema 權限。
  3. 純前端無法真正保密：改用 Cloudflare Pages Functions / Worker 作為代理，token 存放於 Cloudflare 環境變數（secret），前端只呼叫自家 `/api/*`。
  4. 若暫時必須留在前端，至少改用 `import.meta.env.VITE_*`（仍會被打包暴露，只是不入版控），不可視為安全解法。
  5. 必要時以 git filter-repo/BFG 清理歷史（撤銷 token 後仍建議）。

**Base ID 與 table 名稱寫死:**
- Files: `src/services/index.ts`（`BASE_ID`）。Base ID 本身非機密，但應移至設定。

**缺少 `.env*` 忽略規則確認:**
- `.gitignore` 含 `*.local`，但未明列 `.env`；改用環境變數前需補上 `.env`、`.env.*`。

**無 CSP / 安全標頭:**
- 未設定 `public/_headers`，無 Content-Security-Policy、X-Frame-Options 等。
- 圖片 URL 來自 Airtable 附件連結，需信任其來源；Airtable 附件 URL 會過期（見 Performance）。

## Performance Bottlenecks

**每個頁面載入皆即時請求 Airtable，無分頁處理:**
- Problem: `airTable()` 只取第一頁（最多 100 筆），忽略回傳的 `offset`；產品超過 100 筆時資料被截斷。
- Files: `src/services/index.ts`
- Improvement path: 迴圈處理 `offset`，或於建置期/Worker 端快取。

**無快取、重複請求:**
- NavBar 與 SideMenu 重複抓 navigation；換路由即重抓（見 Tech Debt）。10 秒 timeout，失敗無重試。

**圖片未最佳化:**
- Files: `src/components/ProductView.tsx`, `src/pages/ProductPageTemplate.tsx`, `src/pages/HomePage.tsx`
- `<img>` 未見 `loading="lazy"`、尺寸屬性或響應式 srcset 的一致使用，易造成 CLS 與流量浪費。Airtable 附件 URL 為暫時性連結（約數小時過期），快取頁面可能出現破圖。
- Improvement path: 圖片放自家 CDN / Cloudflare Images 或 R2。

**無 code splitting:**
- `src/App.tsx` 同步匯入所有頁面，未使用 `React.lazy`；規模小，影響有限。

## Fragile Areas

**ProductPageTemplate 與 ProductView（資料欄位約定）:**
- Files: `src/pages/ProductPageTemplate.tsx`（399 行）, `src/components/ProductView.tsx`
- Why fragile: 依賴 Airtable 欄位名稱（`img_url`、`product_name`、`name`、`icon_name`、導航連結欄位）與表名（`all-product`、`new-product`、`micgo` 等）；任何於 Airtable 改名都會導致靜默空白。
- Safe modification: 修改前確認 Airtable schema，集中欄位名常數。

**大型元件:**
- `src/pages/HomePage.tsx`（407 行）、`src/pages/AboutPage.tsx`（383 行）、`src/components/NavBar.tsx`（332 行）混合資料、狀態與大量 JSX/內嵌 SVG，修改易波及。
- Safe modification: 先拆子元件再改版面。

**導航連結來自 Airtable:**
- `NavBar`/`SideMenu` 的連結由資料決定，若 Airtable 內路徑與 `src/App.tsx` 路由不一致即成死連結。

## Scaling Limits

**Airtable API 限制:**
- Limit: 每 base 5 req/s，免費方案 API 呼叫次數有月上限；流量增加且每次瀏覽皆打 API，會被限流，且因錯誤回傳 `[]`，網站表現為空白。
- Scaling path: 以 Worker/Pages Function 加快取（Cache API/KV），或建置期預先抓取靜態化。

## Dependencies at Risk

**`@types/react-router-dom ^5.3.3`:**
- Risk: 與 react-router-dom v6 不相容的過時型別，可能誤導型別。Migration: 移除。

**Tailwind v3 / v4 混用:**
- Risk: `tailwindcss ^3.4.0` 搭配 `@tailwindcss/postcss`（v4 專用）；`postcss.config.js` 與 `tailwind.config.js` 設定可能不一致，升級時易壞。Migration: 統一至 v4 或 v3。

## Missing Critical Features

**測試框架:**
- Problem: 未安裝任何測試框架（無 vitest/jest），`package.json` 無 `test` script，無 CI。
- Blocks: 重構（如拆路由、改資料層）缺乏安全網。

**CI/CD 與 lint gate:**
- 無 GitHub Actions；部署僅靠 Cloudflare Pages 建置（`tsc -b && vite build`），lint 未被強制。

**SEO / 可及性:**
- 純 CSR SPA，無 SSR/預渲染，搜尋引擎與社群預覽（OG tags）支援弱；無 `robots.txt`、`sitemap.xml`、404 頁、錯誤邊界（Error Boundary）。
- 圖片 alt 部分取自資料欄位（如 `icon_name`），可能無意義。

**錯誤與載入狀態:**
- 無全域 Error Boundary；API 失敗無使用者可見訊息與重試。

## Test Coverage Gaps

**全部程式碼未測試:**
- What's not tested: 資料層 (`src/services/index.ts`) 的過濾與錯誤處理、路由設定 (`src/App.tsx`)、`ImageModal` 鍵盤/關閉行為、NavBar/SideMenu 響應式行為。
- Files: `src/**`
- Risk: Airtable schema 或 token 變更時無法提前發現。
- Priority: High（資料層與路由）；Medium（UI 元件）。

---

*Concerns audit: 2026-11-10*
