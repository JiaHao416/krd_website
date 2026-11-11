# Domain Pitfalls

**Domain:** 既有 Vite + React 19 + Tailwind 3 SPA 的全站視覺重設計 + 新增商品詳情頁 `/products/:id`
**Milestone:** v1.1 UI 重新設計與商品詳情頁
**Researched:** 2026-11-10
**整體信心:** MEDIUM（專案現況取自 repo 與 `.planning/` 文件，屬 HIGH；Cloudflare Pages、Google JS 渲染、CJK 排版等通用行為來自訓練知識，未逐項以官方文件重新驗證，標為 MEDIUM/LOW，phase 規劃時應實測）

---

## Critical Pitfalls

會導致重寫、上線事故或 a11y 回歸的錯誤。

### Pitfall 1: 長壽 `redesign` 分支漂移，最後一次大合併直接上線

**What goes wrong:** 分支存活數週，期間 `main` 有熱修（商品欄位、後端 API 調整、文案），合併時衝突集中在 `NavBar`、`HomePage`、`ProductPageTemplate` 這些會被整個重寫的檔案。合併後的第一次 push 就是 production 部署，沒有中間驗證關卡。
**Why it happens:** `main` push 即上線，所以不能邊做邊合；重設計又幾乎動到每個元件，衝突無法局部解決。
**Consequences:** 衝突解錯，把 v1.0 修好的行為（輪播 WCAG 2.2.2、錯誤/限流畫面、`ApiError` 處理）悄悄蓋掉；或合併後才發現與新 API 欄位不符。
**Prevention:**
- 現在就把「行為層」和「呈現層」切開：`useProducts`、`services/*`、`config/navigation`、輪播的指標/焦點狀態邏輯保持原檔不動，重設計只換 JSX 與 className。這樣 `main` 上的邏輯修正不會與重設計衝突。
- 每個 phase 結束就 `git merge main` 進 `redesign`（不要 rebase 已推送分支），讓漂移以小步消化。
- 合併前建立一份「v1.0 行為清單」（輪播三路徑、限流畫面、舊網址、`check:dist`），合併後在 production 逐項實測；push `main` 前仍須使用者確認（既有規則）。
- 若必須上線熱修，先在 `main` 修、再合併進 `redesign`，不要在 `redesign` 上修同一問題。
**Detection:** `git diff main...redesign --stat` 顯示 services/hooks 被改動；`git merge main` 衝突檔案數隨週增加。
**Phase:** 每個 phase 的收尾 + 最後的「合併上線」phase。

### Pitfall 2: 重寫輪播 JSX 時丟掉 WCAG 2.2.2 行為（v1.0 花了三輪）

**What goes wrong:** 重設計首頁時把 `FeaturedCarousel` 的結構、事件掛載點或樣式換掉：暫停按鈕變成純圖示沒有可及名稱、hover 暫停改掛在不同容器、focus 暫停改回用 `:focus-visible`、觸控點擊後輪播停住、`prefers-reduced-motion` 被新 CSS 動畫蓋掉。
**Why it happens:** 這些行為不在畫面上看得出來；jsdom 不能分辨 `:focus-visible`，且觸控事件順序（`pointerup` 之後才 focus）與滑鼠不同（v1.0 retrospective 教訓 1、2）。
**Consequences:** 回到 v1.0 audit 前的 a11y 缺陷，且現有單元測試可能仍然全綠（假安全感）。
**Prevention:**
- 輪播的行為（指標事件序列、暫停原因集合、計時器）抽成 hook 或保持現有邏輯檔，只重做視覺；不要整個元件重寫。
- 保留並擴充 `FeaturedCarousel.test.tsx` 的三條路徑（滑鼠、觸控、鍵盤）；新增設計後必須仍紅綠驗證。
- 重設計的輪播若加入「可點入詳情頁」：卡片變成 `<a>`/`<Link>`，要確認點擊（pointerup→click→focus）不會觸發 sticky pause、且 Tab 聚焦連結時會暫停、離開焦點會恢復。這是新互動，必須新增測試。
- 動畫用 Tailwind `motion-safe:`/`motion-reduce:` 或 CSS media query，不要只靠 JS 判斷。
- 重設計後再做一次真實瀏覽器 UAT（Claude in Chrome／DevTools 觸控模擬，每 200ms 記錄輪播狀態），不要只信 jsdom。
**Detection:** 手機點一下輪播後不再自動前進；Tab 到卡片連結輪播不停；系統開啟「減少動態」仍在滑動。
**Phase:** 首頁重設計 phase（含 UAT 驗收條件）。

### Pitfall 3: 測試綁死舊標記（markup coupling），重設計把 215 項測試炸掉後被「改到綠」

**What goes wrong:** 現有測試大量使用 `getByText`、`getByRole("button", { name: "下一張" })`、`queryByRole("img", { name })`、中文文案與 `role="alert"`。重設計改文案、改 DOM 層級、把 button 換成圖示後，數十個測試同時紅燈，開發者為求快速把斷言一起改成新文案或刪掉，實際行為保護消失。
**Why it happens:** 測試混合了「行為契約」（有重試鈕、錯誤用 alert、輪播有第 n 張按鈕）與「呈現細節」（具體文案、`ul>li` 層級）。
**Consequences:** 紅燈被當噪音處理；或為了讓測試過而保留醜陋標記，限制設計自由。
**Prevention:**
- 設計前先分類現有測試：契約型（role + accessible name、`aria-*`、路由、`ApiError` 狀態對應）必須在重設計後仍通過；呈現型可替換，但替換時要寫「為什麼」。
- 可及名稱（`aria-label`）視為契約，文案調整要同步提供相同 accessible name，或明確在 plan 中列出改名清單。
- 規則：不得為了過測而刪斷言；改斷言要附新行為依據。CLAUDE.md 已規定不得停用測試。
- 新元件先寫測試（紅燈）再實作，用 `getByRole` + name 而非 class 或 DOM 結構。
- 不要加 snapshot 測試（對 Tailwind class 變動極脆弱）。
**Detection:** 單一 commit 同時大量改動 `*.test.tsx` 斷言字串；測試數量下降。
**Phase:** 每個重設計 phase；測試分類盤點放在第一個 phase。

### Pitfall 4: 詳情頁 `/products/:id` 造成額外請求，撞 60 req/min/IP 限流

**What goes wrong:** 目前每次進入列表頁就重抓（`useProducts` 不做快取）。加入詳情頁後，使用者「列表 → 詳情 → 返回 → 再進另一個」每步都打 API；若再加 hover prefetch、輪播每張預取詳情、或詳情頁同時打「商品 + 相關商品 + 列表」，單一使用者一分鐘就可能逼近 60 次。更糟的是同辦公室/同 NAT 的多位訪客共用同一個 IP。
**Why it happens:** 後端限流是每 IP 而非每使用者；既有程式明確「不做快取」；React 19 `StrictMode` 開發環境 effect 雙跑，也會讓本機預覽看起來比實際多一倍請求。
**Consequences:** 客戶看到「瀏覽太頻繁」錯誤畫面（v1.0 已有該畫面，但不應成為常態）；詳情頁整頁變空白。
**Prevention:**
- 不要預取（no prefetch on hover / on carousel render）。
- 列表已拿到的欄位足夠渲染詳情頁骨架時，用 router `state`（`<Link state={{ product }}>`）傳入先顯示，再背景補抓 variants；但直接開 URL/重新整理時必須能自給自足（不能只依賴 state）。
- 加一個簡單的模組層記憶體快取（以 id 為 key，短 TTL 如 60s）包住 `fetchProductDetail`，並對同一 id 的並行請求去重；不引入 TanStack Query 除非另有理由（CLAUDE.md 要求引入新工具先說明）。
- 詳情頁只發一個請求（`/public/products/:id` 已含 variants）；不要為「相關商品」再打列表 API，改用快取過的列表或省略。
- 429 在詳情頁要有專屬畫面（沿用 `ApiError` 分類與「重新載入」），並顯示可返回列表的連結。
- 加一個以固定時間窗口模擬請求數的測試（mock `apiClient` 計數），確認典型流程（首頁→分類→詳情→返回）的請求數有上限。
**Detection:** DevTools Network 計數；本機 dev 遇到 429；`useEffect` 依賴造成請求迴圈。
**Phase:** 詳情頁資料層 phase（先做，UI 其後）。

### Pitfall 5: 詳情頁深層連結、404、與 Cloudflare Pages SPA fallback 的互動

**What goes wrong:**
(a) 之後有人加 `public/404.html`（為了漂亮的 404）→ 依 Cloudflare Pages 行為，**有 `404.html` 時會關閉 SPA fallback**，所有子路徑（含 `/products/xxx`、`/all-products`）直接重新整理變 404。
(b) `/products/不存在的id` 渲染空白頁或永遠載入中（目前 `App.tsx` 無 catch-all，CONCERNS.md 已記錄）；API 回 404 與「網路失敗」被混為一種錯誤。
(c) 相對路徑資源：詳情頁多一層路徑，若新增任何用相對 `./` 的資源（字型、圖）在深層 URL 會壞掉。
(d) 從詳情頁「返回」若寫死 `navigate("/all-products")`，使用者從 `/trumpet` 進來卻被送到別處，且丟失捲動位置。
**Why it happens:** SPA fallback 是平台預設行為，沒有明文設定檔，容易被無意破壞；新增動態路由才第一次暴露 404 語義。
**Consequences:** production 直接連結失效（分享出去的商品連結壞掉）。
**Prevention:**
- 不新增 `public/404.html`；SPA 內以 `<Route path="*">` 呈現 NotFound。
- 詳情頁區分三種狀態：loading、`ApiError` 404（「找不到此商品」+ 回列表連結）、其他錯誤（重試）。需先確認後端 `/public/products/:id` 對不存在 id 的實際回應碼與格式（phase 開頭實測）。
- 所有靜態資源用絕對路徑（`/brand-logo.png`）。
- 返回用 `navigate(-1)`（有歷史時）並以 `state` 或 `from` 提供 fallback 連結；使用 react-router 的 `ScrollRestoration` 需 data router，目前用 `BrowserRouter`，若不升級就手動在路由變更時處理捲動：進詳情頁回到頂端、返回列表盡量還原位置。
- 驗收：用 `vite preview` 與 production 實測直接開 `/products/<真實id>`、`/products/zzz`、`/not-a-route` 皆回 200 並顯示正確畫面。
- 舊網址清單（`PRODUCT_PAGES` 的 path）寫成測試，重設計後仍須可 render。
**Detection:** production 重新整理詳情頁 404；NotFound 畫面缺失；`navigation.test.ts` 的路徑清單與路由不一致。
**Phase:** 詳情頁路由 phase；合併上線 phase 做 production 實測。

### Pitfall 6: 純 CSR 的詳情頁沒有獨立 title/description/OG，分享與搜尋成效差

**What goes wrong:** `index.html` 只有 `<title>KRD</title>`，沒有 description。新增 `/products/:id` 後每個商品頁的分頁標題都是「KRD」，LINE/Facebook 分享連結預覽（OG tags 由爬蟲讀靜態 HTML，不執行 JS）永遠是同一張空預覽。
**Why it happens:** 純 CSR + Cloudflare Pages 靜態部署，沒有 SSR；商品資料在執行期才有。
**Consequences:** 商品連結在 LINE 群組分享（台灣 B2B 常見管道）看起來很陽春；Google 雖會執行 JS 並可能索引（MEDIUM，依 Google 官方說明 JS 渲染可行，但延遲與不保證），其他爬蟲不會。
**Prevention:**
- 最低限度：在 React 端依路由設定 `document.title` 與 meta description（React 19 支援在元件內直接渲染 `<title>`、`<meta>` 並自動提升到 head，可免裝 react-helmet；實作前以官方文件確認）。
- 全站靜態預設值補到 `index.html`：description、`og:title`、`og:image`（用 repo 內靜態圖）、`lang` 已正確為 `zh-Hant-TW`。
- 若需要商品級 OG 預覽：這是獨立的範圍決策，選項為 Cloudflare Pages Functions（改變部署模型，需 Owner 同意）或建置期預渲染（商品由後端動態管理，建置時資料會過期）。**建議本 milestone 不做**，把它寫入 Out of Scope 並說明理由，避免中途範圍膨脹。
- 補 `robots.txt`；`sitemap.xml` 因商品動態變化，除非有預渲染，不建議手維護。
- 切換路由時 title 要隨頁更新，且離開詳情頁要還原（否則殘留上一個商品名）。
**Detection:** 開 `/products/:id` 分頁標題仍是「KRD」；用 LINE/FB 分享除錯工具看預覽。
**Phase:** 詳情頁 phase（title/meta），範圍決定在 roadmap 階段釐清。

---

## Moderate Pitfalls

### Pitfall 7: 圖片 CLS 與流量（商品圖來自 R2，尺寸未知，列表一次載入最多數十張）

**What goes wrong:** 重設計為大圖版面（hero、詳情頁大圖、輪播）後，`<img>` 沒有 `width/height` 或 `aspect-ratio` 容器，圖載入時版面跳動；列表全部 eager 載入；詳情頁大圖與縮圖同一張原檔重複下載；燈箱 `ImageModal` 又載一次。
**Prevention:**
- 每張圖外包固定 `aspect-*` 容器（Tailwind `aspect-square`/`aspect-[4/3]`）+ `object-contain/cover`，骨架（現有 `ImagePlaceholder`）同尺寸，避免跳動。
- 首屏第一張（輪播第一張、詳情頁主圖）用 `fetchpriority="high"` 且不 lazy；其餘 `loading="lazy"` + `decoding="async"`。
- 先實測 `img.krd.com.tw` 的圖片實際尺寸與格式（可能是 2000px+ 原檔）；若過大，評估 Cloudflare Image Resizing（`/cdn-cgi/image/` 需該網域啟用，屬 Owner/後端範圍，LOW 信心，需確認）。**不要**在前端加客戶端縮圖流程。
- 圖載入失敗（輪播已有 `fireEvent.error` 測試）在新版面必須保留 fallback，且 fallback 與正常圖同尺寸。
- `alt` 用商品名稱（CONCERNS 已指出部分 alt 無意義）；裝飾圖用 `alt=""`。
- 以 Lighthouse（行動版、節流）量測 CLS < 0.1 作為驗收條件。
**Detection:** 滾動時版面跳；Lighthouse CLS；Network 一次抓 20+ 大圖。
**Phase:** 共用骨架與列表頁 phase 建立圖片元件規範，詳情頁沿用。

### Pitfall 8: 繁體中文排版與斷行（CJK typography）

**What goes wrong:**
- 沿用「微軟正黑體」：僅 Windows 有，macOS/iOS/Android 會 fallback 到系統字型，設計稿與實際差異大；字重只有 regular/bold，設計若用 medium/semibold 會被合成。
- 引入 Google Fonts 的 Noto Sans TC：完整字型檔數 MB，未做 subset 會拖慢 LCP；`font-display: swap` 造成中文換字型時的 CLS。
- 英文單字式斷行規則套在中文：`break-words` / `word-break: break-all` 把英文型號（如 `SM58-LC`）從中間斷開；或沒有設定而讓長型號撐破卡片。
- 窄欄中文標點落在行首（禁則處理），或 `text-justify` 讓中文字距怪異。
- 英數與中文之間沒間距（pangu spacing）造成視覺擁擠。
- WR-04（1024px 導覽擠壓）的根因是中文導覽項不能像英文那樣縮；用 `whitespace-nowrap` 硬壓會溢出，用 `truncate` 會吃掉字。
**Prevention:**
- 字型堆疊以系統字型為主：`"PingFang TC", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif`，不載入網頁字型為預設；若設計確定要網頁字型，必須 subset（中文常用字集）+ `font-display: swap` + 預載並以 Lighthouse 量測。這是 UI 方向決策，在 sketch 階段決定，不要到實作才發現。
- 中文用 `word-break: normal` + `overflow-wrap: anywhere` 於型號/長字串容器；`line-break: strict`（現代瀏覽器支援，LOW-MEDIUM 信心，需實測 Safari）；`text-wrap: balance` 用於標題（短標題有效，注意舊瀏覽器退回正常）。
- 行高 CJK 建議 1.6–1.8，字級手機不低於 16px 內文。
- 以 6–8 個最長真實商品名稱（含長型號與中英混合）做版面壓力測試，不要只用設計稿的短文案。
- 導覽（WR-04）：8 個分類 + 品牌 + 關於，在 1024px 以下應改為較早切換到漢堡選單（提高 `lg` 斷點為 `xl`）或收合成二層，而不是縮字；驗收寬度：320、375、768、1024、1280、1440。
**Detection:** 型號中間被切斷；macOS 看起來與 Windows 差很大；標題最後一行只剩 1–2 個字（孤字）。
**Phase:** 視覺方向（UI-SPEC）phase 決定字型；共用骨架 phase 修 WR-04。

### Pitfall 9: 響應式斷點與觸控目標在重設計中不一致

**What goes wrong:** 每頁各自選斷點（`md`、`lg`、自訂 px），導覽、側邊選單、列表 grid 的切換點彼此錯開，在 768–1100px（平板直放、小筆電）出現「導覽已是桌機版但 SideMenu 還是手機抽屜」之類的中間狀態；hover 專屬互動（hover 才顯示的按鈕）在觸控裝置不可用；詳情頁變體選擇器按鈕小於 44px。
**Prevention:**
- 在 UI-SPEC 明定單一斷點表（例如 `sm 640 / md 768 / lg 1024 / xl 1280`）與每個共用元件的切換點，所有元件只引用該表。
- 優先 mobile-first；hover 效果以 `@media (hover: hover)`（Tailwind 3.4 可用 `hover:` 預設已受 `hoverOnlyWhenSupported` 設定影響，需檢查 `tailwind.config.js`，LOW 信心）保護，關鍵資訊不放在 hover 內。
- 觸控目標至少 44×44（WCAG 2.2 目標尺寸 2.5.8 最低 24×24）。
- 使用 DevTools 裝置模式 + 實機（iPhone Safari，100vh 與動態工具列問題用 `dvh`）驗證；SideMenu 抽屜鎖背景捲動要保留（現有 `防止背景滾動`）並確認關閉時還原。
**Detection:** 縮放視窗 700–1100px 逐 50px 檢查；iOS Safari 底部被工具列遮住。
**Phase:** 共用骨架 phase 先定義，其他頁沿用。

### Pitfall 10: Tailwind v3/v4 混裝在大量改 class 時爆發

**What goes wrong:** 重設計會大量新增 utility、可能想用 v4 才有的語法（`bg-linear-to-r`、`@theme`、`size-*` 之外的新寫法、`@import "tailwindcss"`）；但實際編譯的是 v3（`postcss.config.js` 用 `tailwindcss` plugin），v4 語法會**靜默無效**（class 不生效、不報錯）。另一方面，貿然「順便升級到 v4」會在重設計中同時引入兩種變數，難以區分是設計問題還是升級問題。
**Prevention:**
- 設計 token（顏色、字型、間距）集中到 `tailwind.config.js` 的 `theme.extend`，不散落任意值 `[#123456]`。
- 決策先行：本 milestone **維持 v3**，Out of Scope 已寫明依賴不一致另案處理；若要在重設計前先統一，應是獨立的第一個 phase 並以「視覺零差異」截圖比對驗收，不要與設計混做。
- 新增 class 後以實際瀏覽器確認生效；`@tailwindcss/postcss` 可在確認未被使用後移除（另案）。
- 動畫（現有 fade-in/slide-up/pulse-slow）改名或移除時，同步檢查所有引用，TS 不會幫你找 class 字串。
**Detection:** class 寫了但畫面無變化；build 無錯誤。
**Phase:** UI-SPEC/共用骨架 phase。

### Pitfall 11: 詳情頁資料模型假設（variants、價格 null、`show_price=false`）

**What goes wrong:** 目前 production 20 筆商品全部 `show_price=false`（價格皆 `null`），UI 設計稿若畫了價格大字、加入購物車、「特價」標籤，實際上永遠顯示「洽詢」；variants 欄位的實際結構（SKU、顏色、規格、各自價格/庫存）若未確認，設計與型別會與後端不符；`description` 可能為 `null` 或很長的純文字（含換行）；`image_url` 可能為 `null`；`in_stock` 的顯示語意。
**Prevention:**
- 設計前先抓 3–5 個真實 `/public/products/:id` 回應（含有/無 variants、有/無圖片、有/無描述），用真實資料做設計與測試資料；型別以 `apiTypes.ts` 沿用 snake_case，不改名（既有規範）。
- 設計所有 null 狀態（無圖、無描述、無 variants、價格洽詢），包含 variants 價格範圍。
- 不建購物車、價格篩選、庫存數字精確顯示（見 FEATURES anti-features）；此站是型錄不是商店。
- 描述文字用 `whitespace-pre-line` 並處理 XSS：不要 `dangerouslySetInnerHTML`；若後端描述含 Markdown/HTML，需先確認再決定。
- `transform.ts` 新增 `transformProductDetail` 並補單元測試，包含 null 欄位。
**Detection:** 設計稿中的欄位在 API 回應找不到；詳情頁在無圖商品上版面崩壞。
**Phase:** 詳情頁資料層 phase（含 API 契約實測），早於 UI 設計定稿。

### Pitfall 12: 本機預覽不等於 production（CORS 白名單、proxy、`VITE_API_BASE_URL`）

**What goes wrong:** 本機用 Vite proxy 讀 production API，行為與 production（跨網域 + CORS）不同；`*.pages.dev` 預覽不在白名單，所以**無法用 Cloudflare 預覽網址驗收**；合併 `main` 首次部署才第一次在真實網域+CORS 環境跑新詳情頁。若詳情頁用了新的 header（自訂 header、`Cache-Control`、`If-None-Match`）會觸發 preflight，而後端 CORS 只允許特定 method/header，production 可能直接失敗而 dev proxy 完全看不出來。
**Prevention:**
- 詳情頁請求**只用簡單 GET，不加自訂 header**（`apiClient` 已不帶 headers）。
- 合併前，在 `vite preview` + 手動 `curl -H "Origin: https://www.krd.com.tw" -i https://api.krd.com.tw/api/v1/public/products/<id>` 確認 `access-control-allow-origin`。
- 可選：先把 `redesign` 分支部署到 production 之外的環境前，與 Owner 討論暫時在後端白名單加預覽網域（後端範圍，需 Owner 同意；目前約束是不改後端）。
- 合併後第一時間用 production 測：首頁、一個分類頁、一個詳情頁、直連詳情頁、行動版。
- 保留 build 內 `check:dist`；新增圖片/字型資源不要引入含 token 的第三方 URL。
**Detection:** Network 面板 preflight(OPTIONS) 失敗；production 詳情頁載入錯誤而 dev 正常。
**Phase:** 合併上線 phase 的驗收清單。

### Pitfall 13: 路由/狀態切換造成的 effect 競態與捲動、焦點、無障礙遺失

**What goes wrong:** 詳情頁 `useEffect` 抓資料時，使用者快速切換 id（上一頁/下一頁、點相關商品），舊請求較晚回來覆蓋新資料；SPA 換頁後焦點留在舊連結、螢幕閱讀器不朗讀新頁；捲動位置延續上一頁。`useProducts` 已有序號/取消機制的話可沿用，但新詳情 hook 容易重寫而漏掉。
**Prevention:**
- 詳情 hook 比照 `useProducts`：`AbortController` 或 request token，卸載與 id 變更時忽略舊回應；加測試（先回後到的 id）。
- 路由切換後將焦點移到頁面 `h1`（`tabIndex={-1}`）並設定 `document.title`；加上 skip link（跳到主要內容）。
- 對比度與焦點樣式：深色漸層主題下 slate 文字對比度要實測（WCAG AA 4.5:1），焦點環不可被 `overflow-hidden` 切掉。
**Detection:** 快速點擊商品時內容與網址不一致；鍵盤使用者換頁後仍停在導覽。
**Phase:** 詳情頁 phase；共用骨架 phase 放 skip link。

---

## Minor Pitfalls

### Pitfall 14: 大型元件重設計時「邊拆邊改」
**What goes wrong:** `HomePage`（407 行）、`AboutPage`（383 行）、`NavBar`（332 行）混合資料、狀態與 SVG（CONCERNS 已記錄）；同一次提交既拆元件又改視覺，diff 無法審查，行為回歸找不到來源。
**Prevention:** 每個頁面分兩個 commit：先在測試保護下只拆分、不改外觀（視覺零差異）；再改視覺。內嵌 SVG 抽到 `components/icons/`。

### Pitfall 15: 重設計期間每次提交仍須 build 全綠
**What goes wrong:** 為了「先做完整版再收」，中間 commit 讓 `tsc -b`（`noUnusedLocals`）或 lint 失敗；合併時才一次修，且 `redesign` 分支任何一個 commit 都可能被 cherry-pick 或 bisect。
**Prevention:** 維持既有規則：每個 commit `npm test`、`npm run lint`、`npm run build` 全綠；未啟用的新元件先不要匯出未使用物件（`noUnusedLocals`）。

### Pitfall 16: 刪除舊元件導致 `noAirtable.test.ts` 或 `check:dist` 掃描路徑不再成立
**What goes wrong:** 重構目錄結構或改檔名後，原始碼掃描測試的檔案 glob 漏掉新目錄，變成「綠但沒掃」。
**Prevention:** 掃描測試用遞迴 glob 涵蓋 `src/**`；在重設計完成後做一次反向測試（手動塞假 token 字串確認 build 失敗）。新增的圖片/字型 CDN URL 不得含 query token。

### Pitfall 17: 設計方向太晚才定，邊做邊改
**What goes wrong:** 視覺方向「未定、於 UI phase 探索」；若在實作 phase 才反覆調整，會讓所有已完成頁面連帶重做。
**Prevention:** 先做 sketch/UI-SPEC 並由使用者確認 design tokens（色、字、間距、斷點、元件狀態）後才進入任何元件實作；共用骨架 phase 先完成並鎖定，其他頁面只組合骨架。符合 CLAUDE.md「規格文件批准前不寫程式碼」。

### Pitfall 18: 動畫與效能（深色漸層、blur、大量陰影）
**What goes wrong:** 重設計加入大面積 `backdrop-blur`、疊層漸層、多重動畫，低階 Android 捲動掉幀；`pulse-slow` 等常駐動畫無法停止（也違反 WCAG 2.2.2 若超過 5 秒且自動開始，需可暫停）。
**Prevention:** 常駐動畫須 `motion-reduce` 時關閉且不使用超過 5 秒的自動動畫（除輪播已有暫停控制）；`backdrop-blur` 僅用於固定導覽等小區域；以行動版節流（4x CPU）Lighthouse/Performance 檢查。

---

## Phase-Specific Warnings

| Phase 主題 | 可能的陷阱 | 緩解 |
|------------|-----------|------|
| 視覺方向 / UI-SPEC | 方向太晚才定（#17）；字型選擇未評估載入成本（#8）；斷點不一致（#9） | 先鎖定 design tokens、字型、斷點表，使用者確認後才實作 |
| 測試盤點（第一步） | 測試綁標記（#3） | 分類契約型/呈現型測試；列出 accessible name 契約清單 |
| 共用骨架（NavBar/SideMenu/Footer/Layout） | WR-04 中文導覽擠壓（#8）、Tailwind 版本（#10）、焦點/skip link（#13）、大型元件（#14） | 提高導覽切換斷點；先拆後改；維持 v3 |
| 首頁 + 輪播 | WCAG 2.2.2 回歸（#2）、圖片 CLS（#7） | 保留行為邏輯與三路徑測試；重設計後真實瀏覽器 UAT |
| 商品分類頁 Template | 圖片流量/CLS（#7）、測試耦合（#3）、grid/list 在中間斷點（#9） | 固定 aspect 容器、lazy、`getByRole` 型測試 |
| 關於我們 | 長中文段落排版（#8）、`public/abouts/*.png` 尺寸（#7） | 行長 ≤ 約 40 全形字、固定尺寸圖 |
| 詳情頁資料層 | 限流（#4）、資料模型假設（#11）、競態（#13）、CORS 簡單請求（#12） | 先實測 API 契約；快取+去重；不預取；單一請求 |
| 詳情頁路由與 UI | 深層連結/404（#5）、title/OG（#6）、返回導覽（#5d）、null 狀態（#11） | 不加 404.html；NotFound；title 隨路由；所有 null 設計 |
| 合併上線 | 分支漂移（#1）、本機≠production（#12）、舊網址（#5） | 合併 main 進分支、行為清單逐項實測、等使用者確認再 push |

## 需要更深入研究的標記

- **詳情頁 SEO/OG 範圍決策**（#6）：是否接受「僅 title/description」或要上 Pages Functions/預渲染，需 Owner 決策；預設建議不做。
- **圖片實際尺寸與是否可做 Image Resizing**（#7）：需實測 `img.krd.com.tw`，LOW 信心。
- **`/public/products/:id` 的實際回應契約**（#11、#5b）：404 格式、variants 結構、null 欄位，需 phase 開頭實測。
- **字型方案**（#8）：系統字型 vs subset Noto Sans TC，取決於視覺方向。

## 信心評估

| 項目 | 信心 | 理由 |
|------|------|------|
| 專案內部風險（輪播、測試耦合、限流、分支、Tailwind 混裝） | HIGH | 取自 repo、RETROSPECTIVE、CONCERNS、PROJECT 與程式檔案 |
| Cloudflare Pages `404.html` 關閉 SPA fallback | MEDIUM | 來自訓練知識與 Cloudflare 文件記憶，未於本次重新驗證；規劃時應查官方 Pages "Serving Pages / SPA rendering" 文件並實測 |
| React 19 原生 `<title>/<meta>` 提升 | MEDIUM | 來自 React 19 發布資訊記憶，實作前以 Context7/官方文件確認 |
| CJK 排版屬性支援（`line-break: strict`、`text-wrap: balance`） | LOW-MEDIUM | 訓練知識，需在 Safari/Chrome 實測 |
| Google JS 渲染索引 | MEDIUM | 公開行為，但延遲與覆蓋率不保證 |

## Sources

- 專案內部：`.planning/PROJECT.md`、`.planning/RETROSPECTIVE.md`、`.planning/codebase/CONCERNS.md`、`src/services/apiTypes.ts`、`src/hooks/useProducts.ts`、`vite.config.ts`、`index.html`、`src/components/FeaturedCarousel.test.tsx`（HIGH）
- 訓練知識（需在對應 phase 驗證）：Cloudflare Pages SPA fallback 行為、React 19 document metadata、WCAG 2.2（2.2.2、2.5.8）、CJK CSS 排版屬性（LOW-MEDIUM）
