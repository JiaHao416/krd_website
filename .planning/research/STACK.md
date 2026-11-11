# Technology Stack（v1.1 增量研究）

**Project:** KRD 官網 v1.1 UI 重新設計與商品詳情頁
**Researched:** 2026-11-10
**範圍:** 只談「新功能需要加／改什麼」。既有的 Vite 6 + React 19 + TS strict + Tailwind 3.4 + axios + react-router-dom v6 + Vitest 不重新研究。

## 結論先講

**幾乎不加東西。** 全部新功能（重設計、`/products/:id` 詳情頁、variants 顯示）用現有技術棧即可完成。建議的變動只有：

| 動作 | 項目 | 信心 |
|------|------|------|
| 移除 | `@tailwindcss/postcss`（未使用的 v4 套件） | HIGH |
| 移除 | `@types/react-router-dom`（v5 過時型別） | HIGH |
| 沿用 | Tailwind 留在 v3.4.x，本 milestone 不升 v4 | MEDIUM |
| 使用（零依賴） | React 19 原生 `<title>` / `<meta>`，做詳情頁標題與描述 | HIGH |
| 擴充（零依賴） | 字型堆疊補 `PingFang TC`、`Noto Sans TC`，不載入 webfont | HIGH |
| 條件新增 | `lucide-react ^1.71.0`，僅當 UI-SPEC 需要 8 個以上不同圖示 | MEDIUM |
| 不加 | 輪播庫、head 管理庫、資料抓取庫、圖片 CDN 服務、動畫庫、UI 元件庫 | HIGH |

## Recommended Stack

### Core Framework（全部不變）

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | ^19.1（現行，最新 19.3.x） | UI | 19 內建 document metadata hoisting，正好解決詳情頁 head 需求 |
| react-router-dom | ^6.30.1（**不升 v7**） | 路由 | 詳情頁只需 `<Route path="/products/:id">` + `useParams`，v6 完全足夠；v7（目前 7.18.x）升級對本需求零收益，只增加風險 |
| Tailwind CSS | ^3.4.17（**不升 v4**） | 樣式 | 見下方「Tailwind 決策」 |
| Vite | ^6.3.5（不升 v8） | bundler | npm 最新已是 v8，但本 milestone 無升級理由；`@tailwindcss/vite` 若日後採用也支援 Vite 6 |

### 新能力 1：詳情頁 head（標題／描述）

| 做法 | 版本 | Purpose | Why |
|------|------|---------|-----|
| React 19 原生 `<title>`、`<meta name="description">` | 內建 | 詳情頁 `document.title` 與 description | React 19 會把元件中任何位置渲染的 `<title>`、`<meta>`、`<link>` 自動提升到 `<head>`（Context7 / react.dev 官方文件確認） |

整合方式：寫一個小元件（例如 `src/components/PageHead.tsx`），內容為 `<title>{name} | KRD</title><meta name="description" content={...} />`，各頁面（首頁、分類頁、關於、詳情）各自渲染一次；路由切換時 React 會自動更新。同時把 `index.html` 的 `<title>KRD</title>` 補上預設 description 作為 fallback（順便處理 CONCERNS 中「index.html 無 meta description」）。

**不要用 `react-helmet-async`**（最新 3.0.0）：React 19 已原生涵蓋，多一個依賴沒有收益。

**誠實限制：** 這是純 CSR。Googlebot 會執行 JS 所以能讀到；但 Facebook／LINE／Slack 等社群預覽爬蟲通常不執行 JS，OG tags 對它們無效。若 Owner 之後要「分享商品連結出現預覽圖」，需要預渲染（prerender）或 Cloudflare Pages Functions／Worker 注入 meta，那是**獨立功能**，不屬於本 milestone，請列入 deferred。

### 新能力 2：字型（繁體中文）

| 做法 | Purpose | Why |
|------|---------|-----|
| 擴充 `tailwind.config.js` 的 `fontFamily.sans` | 跨平台繁中顯示一致 | 現行堆疊只有「微軟正黑體 / Microsoft JhengHei / sans-serif」，macOS／iOS／Android 沒有微軟正黑體會退到無意義的 `sans-serif`；補上 `"PingFang TC"`（Apple）、`"Noto Sans TC"`（Android／Linux／Chrome OS）即可涵蓋主要平台 |

建議堆疊：`["system-ui", "-apple-system", "PingFang TC", "Microsoft JhengHei", "微軟正黑體", "Noto Sans TC", "sans-serif"]`

**不載入 CJK webfont**（`@fontsource/noto-sans-tc` 5.3.1 雖有 unicode-range 切片）：CJK 字型即使切片也會增加首屏請求與 FOUT／CLS，對一個商品型錄站不值得。唯一例外：若 UI-SPEC 決定要「拉丁字母品牌展示字型」（標題、型號），可用 `@fontsource/<font>` 只載入 latin subset（數十 KB 級），並限定 `font-display: swap`。這要等視覺方向決定後再判斷，預設不加。

### 新能力 3：圖示

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.71.0（peer：React 16–19） | NavBar、排序、grid/list 切換、燈箱關閉、詳情頁返回等圖示 | **有條件**：現況 11 個檔案各自內嵌長 SVG path（CONCERNS 已列為維護痛點）。重設計會新增更多圖示，建議二擇一：(a) UI-SPEC 圖示 ≤ 8 個 → 自建 `src/components/icons.tsx` 集中管理內嵌 SVG，零依賴；(b) 更多 → 加 lucide-react |

整合注意：
- 一律具名匯入（`import { ChevronLeft } from "lucide-react"`），可 tree-shake；不要 `import * as`。
- 圖示加 `aria-hidden="true"`，純裝飾；有功能的按鈕要有 `aria-label`（輪播／燈箱按鈕已有的可維持）。
- Vitest + jsdom 可直接渲染，不需額外 mock。
- 圖示是公開靜態資源，不影響 dist 憑證掃描。

### 新能力 4：輪播（保留自製）

**不加 embla-carousel（8.6.0）／swiper 等。** 現有 `FeaturedCarousel` 已通過 WCAG 2.2.2 的 hover／焦點暫停、`prefers-reduced-motion`、滑鼠／觸控／鍵盤三路徑 UAT，並有測試把關。換庫等於重做 UAT，而重設計只需要改外觀（class 與版面），不需改行為。重設計時請把「行為（狀態與事件）」與「外觀（JSX/class）」維持分離，只動外觀。

### 新能力 5：圖片處理

| 做法 | Purpose | Why |
|------|---------|-----|
| 原生 `<img>` 屬性：`loading="lazy"`、`decoding="async"`、明確 `width`/`height` 或 Tailwind `aspect-*` | 減少 CLS 與流量 | CONCERNS 已指出現況缺漏；純 HTML 屬性、零依賴 |
| 首屏主圖（首頁輪播第一張、詳情頁主圖）用 `fetchpriority="high"` 且不 lazy | 改善 LCP | React 19 支援 `fetchPriority` prop |
| 保留既有 `ImagePlaceholder` 作為 `image_url === null` 或載入失敗的 fallback | 後端欄位可為 null | 已存在元件 |

**不加**：Cloudflare Image Resizing／`/cdn-cgi/image`（需在 `img.krd.com.tw` 那個 zone 啟用，屬後端／基礎設施決策，且可能計費）；圖片燈箱庫（既有 `ImageModal` 沿用）；圖片 gallery 庫——目前 `PublicProductApi` 只有單一 `image_url`，詳情頁若 variants 也只有文字規格，不需要 gallery。**待確認：** variants 是否各自帶圖片，需在詳情頁 phase 開頭打一次 `GET /public/products/:id` 實測回應形狀（本研究未驗證該端點 schema，見 Gaps）。

### 新能力 6：詳情頁資料層

| 做法 | Why |
|------|-----|
| 比照現有 `useProducts` 新增 `useProduct(id)` hook，沿用 `apiClient`、`ApiError`、`transform.ts` | 一致性優先；專案已有「載入／失敗／被限流」畫面與測試樣式可複用 |
| `useEffect` 內用 `AbortController` 取消 `id` 切換時的舊請求 | 避免快速切換商品時舊回應覆蓋新回應（race condition） |
| 對 404（商品不存在）顯示專屬「找不到商品」狀態，並順手補 catch-all `*` 路由（CONCERNS 已列） | 詳情頁是第一個「ID 可能不存在」的路由 |

**不加 TanStack Query／SWR：** 全站只有 3 種讀取（列表、熱銷、詳情），且後端限流 60 次／分／IP；快取有價值但可用簡單的模組層 `Map` 快取「列表→詳情」的已載入資料另行評估，不值得為此引入新依賴。若要降低限流風險，這是未來優化，不在本 milestone 必要範圍。

## Tailwind 決策：本 milestone 不升 v4，只清理混裝

**現況（實測 node_modules）：** 實際安裝 `tailwindcss 3.4.17`，`postcss.config.js` 用 `tailwindcss` + `autoprefixer`（v3 方式）；`@tailwindcss/postcss 4.1.7` 已安裝但**完全沒被引用**，純屬殘留。`src/index.css` 528 行，含 `@tailwind` 指令與 `@apply`。

**建議：**
1. **立即做（零風險）：** `npm uninstall @tailwindcss/postcss @types/react-router-dom`。因為前者未被任何設定引用，移除不會改變輸出樣式；後者 react-router-dom v6 自帶型別。完成後跑 `npm run build` 確認 `tsc -b` 通過。這項可在重設計第一個 commit 完成，與樣式工作解耦。
2. **留在 v3.4：** 視覺方向未定、全部 UI 都要重寫，此時同時換 Tailwind 大版本會讓「樣式回歸」與「設計變動」混在一起，除錯困難。v3 的功能對本需求（grid／flex／aria variants／動畫／深色主題）全部足夠。
3. **v4 何時升：** 重設計全部完成並上線後，以獨立 milestone／quick task 用官方 `npx @tailwindcss/upgrade` 升級，屆時用 `@tailwindcss/vite`（最新 4.3.5，peer 支援 Vite 5–8）取代 PostCSS 流程。v4 需要較新瀏覽器基線（Safari 16.4+、Chrome 111+、Firefox 128+，來自 Tailwind 官方升級文件，training 記憶，**LOW-MEDIUM**，升級前須再查證），且 `bg-gradient-to-*`→`bg-linear-to-*` 等改名會波及現有大量 class。

另一種可以反駁的觀點：既然全部 UI 重寫，趁現在升 v4 反而「只寫一次新語法」。我不採納，原因是 `index.css` 的 `@apply` 與設計 token 尚未定案，且 v4 的 CSS-first 設定（`@theme`）會改變 `tailwind.config.js` 的角色，讓本 milestone 的 UI-SPEC 對照變複雜。如果 Owner 偏好一次到位，可作為 Phase 0 獨立任務、在任何視覺工作前完成，並先跑一次全頁截圖比對。

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Head 管理 | React 19 原生 `<title>/<meta>` | react-helmet-async 3.0.0 | React 19 已內建，多餘依賴 |
| 社群預覽（OG） | 本輪不做，列 deferred | 預渲染（vite-plugin-prerender 類）／Pages Functions | 超出 UI 重設計範圍；詳情頁 ID 動態，預渲染需後端清單，屬新功能 |
| 輪播 | 保留自製 `FeaturedCarousel` | embla-carousel-react 8.6.0、Swiper | 換庫會丟失已驗證的 WCAG 2.2.2 行為與 215 項測試中的相關覆蓋 |
| 圖示 | 集中內嵌 SVG，或條件加 lucide-react | react-icons、Font Awesome | react-icons 打包體積管理較差；Font Awesome 字型檔重；皆無優勢 |
| 字型 | 系統字型堆疊 | Noto Sans TC webfont | CJK 字型過重、FOUT／CLS，商品型錄站不值得 |
| 路由 | react-router-dom v6.30 | v7（7.18.x） | 無需求驅動；升級僅增加風險 |
| 資料抓取 | 自訂 hook + axios | TanStack Query | 只有 3 種讀取，新增依賴不成比例 |
| 樣式 | Tailwind 3.4（移除 v4 殘留） | 立即升 v4 | 與設計變動混在一起難除錯，見上節 |
| 動畫 | Tailwind 內建 + 既有自訂 keyframes | framer-motion／motion | 頁面轉場不是需求；需要時用 CSS，並尊重 `prefers-reduced-motion` |

## Installation

```bash
# 立即清理（零風險）
npm uninstall @tailwindcss/postcss @types/react-router-dom

# 僅在 UI-SPEC 確定需要 8 個以上不同圖示時才加
npm install lucide-react@^1.71.0

# 其餘一律不新增
```

## 整合檢查清單（給 planner）

- 擴充字型堆疊在 `tailwind.config.js` 的 `theme.extend.fontFamily.sans`，同時檢查 `src/index.css` 第 17 行的 `body` `font-family` 是否也要同步（目前兩處各寫一份）。
- 詳情頁路由 `/products/:id` 放在 `PRODUCT_PAGES` 產生的路由之外，另加；**不要**把它加進 `NAV_ITEMS`（導覽只列分類）。
- 列表卡片與輪播改為 `<Link to={`/products/${id}`}>`；既有「點圖放大（ImageModal）」要決定：點圖進詳情頁，或圖上保留放大按鈕。這是 UX 決策，需在 UI-SPEC 明定，避免巢狀互動元素（`<a>` 內放 `<button>`）造成無障礙問題。
- `id` 進 URL 前用 `encodeURIComponent`（沿用專案對分類的慣例）；測試要涵蓋非法／不存在的 id。
- 新增依賴後務必確認 `npm run build` 內的 `check:dist` 仍通過（lucide-react 不含任何敏感字串，預期無影響）。
- Vite proxy（`/api`）已可讀 production API，詳情頁端點 `/api/v1/public/products/:id` 自動被代理，無需改設定。

## Sources

- React 官方文件（Context7 `/reactjs/react.dev`，`<meta>` 元件）：React 自動將 `<meta>` 提升至 `<head>` — HIGH
- 本機實測：`package.json`、`node_modules/tailwindcss` 3.4.17、`@tailwindcss/postcss` 4.1.7、`postcss.config.js`、`tailwind.config.js`、`vite.config.ts`、`src/services/apiTypes.ts` — HIGH
- npm registry（2026-11-10 查詢）：tailwindcss 4.3.5、@tailwindcss/vite 4.3.5（peer vite ^5.2||^6||^7||^8）、lucide-react 1.71.0（peer React 16–19）、react-router-dom 7.18.5、react-helmet-async 3.0.0、@fontsource/noto-sans-tc 5.3.1、embla-carousel-react 8.6.0、vite 8.3.7 — HIGH（版本號）
- Tailwind v4 瀏覽器基線與改名清單：來自訓練記憶，未在本次查證 — LOW，升級前必須查官方 upgrade guide
- 「社群爬蟲不執行 JS」：業界通識，未逐一驗證各平台 — MEDIUM
