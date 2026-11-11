# 專案研究摘要（Project Research Summary）

**Project:** KRD 官網 v1.1 UI 重新設計與商品詳情頁
**Domain:** B2B／盤商型音響麥克風品牌型錄網站（既有 Vite + React 19 SPA 改版並新增商品詳情頁，無購物車，轉換為「洽詢」）
**Researched:** 2026-11-10
**Confidence:** MEDIUM-HIGH（專案內部與後端契約為 HIGH；Cloudflare、社群爬蟲、CJK 排版等通用行為為 MEDIUM／LOW，需實測）

## Executive Summary

本 milestone 不動技術棧與資料層，只重做外觀並新增一頁。四份研究一致認為不需要新架構，也幾乎不必加依賴。

- 詳情頁沿用現有分層，每層各加一個檔案：`apiTypes` → `fetchProductDetail` → `toProductDetail` → `useProductDetail` → `ProductDetailPage`。
- React 19 原生 `<title>/<meta>`、系統字型堆疊、自製輪播、純 `<img>` 屬性就足夠。
- Tailwind 留在 v3.4、react-router 留在 v6，不引入 TanStack Query、helmet 或輪播庫。

最大的風險在流程與行為回歸：

1. `redesign` 是長壽分支，會與 `main` 漂移，而且合併即上線。
2. 重寫輪播 JSX 時，可能丟掉 v1.0 花三輪才通過的 WCAG 2.2.2 行為。
3. 215 項測試綁定舊標記，被「改到綠」之後就失去保護。
4. 卡片改成連結會改變互動語意，這是唯一會改動測試語意的架構點。現在整張卡是 `role="button"` 開燈箱。
5. 視覺方向定得太晚，已完成的頁面得連帶重做。

對策是把行為層與呈現層切開：

- 重設計只動 JSX、className、tokens；`services/`、hooks、輪播事件邏輯不動，`services/` 只新增不修改。
- 互動語意的變更集中在單一 phase。
- 視覺方向先鎖定再寫程式碼，這也符合使用者「規格批准前不寫程式碼」的規則。

詳情 API 契約已由後端原始碼驗證，以 ARCHITECTURE.md 為準，取代 FEATURES 中信心為 LOW 的 variants 推測。

需要 Owner 提供或決定的有四件事：

- 聯絡管道（電話／LINE／Email／地址）
- 卡片與燈箱的互動分工
- 商品級 OG 預覽是否納入（建議不納入）
- 依賴清理是否併入

## Key Findings

### Recommended Stack（STACK.md）

幾乎不加東西。

**沿用：**

- React ^19.1：原生 `<title>/<meta>` 會自動提升到 head，取代 react-helmet-async。
- react-router-dom ^6.30.1：不升 v7；詳情頁只需 `<Route path="/products/:id">` 加 `useParams`。
- Tailwind ^3.4.17：不升 v4，避免把大版本升級混進設計變動；token 集中在 `theme.extend`。
- Vite ^6.3.5、axios、Vitest：不動。
- 自製 `FeaturedCarousel`：保留，只換外觀不換行為。

**零依賴擴充：**

- 字型堆疊補 `PingFang TC`、`Noto Sans TC`，不載入 CJK webfont。`tailwind.config.js` 與 `src/index.css` 的 `body` 兩處要同步修改。
- 圖片用 `aspect-*` 容器、`loading="lazy"`、`decoding="async"`，首屏主圖加 `fetchPriority="high"`，並保留 `ImagePlaceholder` 當 fallback。
- 詳情 hook 比照 `useProducts`（AbortController、retry）。

**條件／可選：**

- `lucide-react ^1.71.0`：UI-SPEC 需要 8 個以上不同圖示才加入；否則集中放在 `src/components/icons.tsx`。
- `npm uninstall @tailwindcss/postcss @types/react-router-dom`：STACK 建議當成零風險的第一個 commit，但 PROJECT.md 把依賴清理列為 Out of Scope，由 Owner 決定。若要併入，必須是獨立 commit，且 `npm run build` 與 check:dist 都要通過。

### Expected Features（FEATURES.md）

**Must have（table stakes）：**

- 詳情頁 `/products/:id`：主圖、名稱、品牌、型號、分類、說明、variants 規格。
- 價格為 `null` 時一律顯示「洽詢」並搭配聯絡 CTA。目前 20 筆全部 `show_price=false`，不要設計價格大字或特價標籤。
- 庫存只用二元標籤（有現貨／洽詢交期）；保固為 0 或 null 時整列隱藏。
- 聯絡 CTA 與 Footer 聯絡資訊共用 `src/config/contact.ts`，資料由 Owner 提供。
- 詳情頁要有四種狀態：loading、404、429、錯誤。另外需要麵包屑與返回列表，以及全域 `*` NotFound 路由。
- 列表卡片與熱銷輪播都能點入詳情頁；保留 8 條舊路徑、grid/list、名稱排序。
- 共用骨架（NavBar／SideMenu／Footer／Layout）做響應式重設計並修正 WR-04；預留圖片長寬比；a11y 不得退步。

**Should have（擇一到兩項）：**

- 一鍵複製「商品名稱＋型號＋網址」的詢價訊息（優先）。
- 「新品」徽章（天數閾值待 Owner 確認）。

**Defer：**

- 商品級 OG／LINE 預覽與 JSON-LD。純 CSR 頁面的爬蟲不執行 JS，需要 Pages Functions 或預渲染。
- 相關商品，因為會多一次請求，加重限流壓力。
- 篩選晶片與站內搜尋、多圖縮圖（API 沒有資料）、Tailwind v4 升級。

**明確不做：** 購物車、庫存數量、評論與比較、會員、詢價表單後端、無限捲動，以及把價格顯示成 0 或「—」。

### Architecture Approach（ARCHITECTURE.md）

沿用現有分層，詳情資料走和列表相同的路徑，但不可重用 `toProduct`。詳情回應沒有 `featured_group / price_min / price_max`，重用會顯示 `NT$NaN`。

**已驗證的詳情契約**（來源：後端 `src/modules/public` 原始碼）：

- `GET /api/v1/public/products/:id` 回傳 `{ success, data: PublicProductDetail }`。`data` 直接是商品，不像列表包在 `data.items` 裡，所以 type guard 要分開寫。
- `variants[]` 的欄位：
  - `id`、`sku`
  - `attributes`：自由 key 的純量 map，後端已用白名單過濾
  - `image_url`：沒有變體圖時，後端已 fallback 成主圖
  - `is_default`、`in_stock`
  - `price_incl_tax`：含稅金額，單位為「分」；`show_price=false` 時為 null
- 後端已排好 `variants` 順序（`is_default` DESC、`sku` ASC），前端不要重排；`variants` 也可能是空陣列。
- 不存在的 UUID 回 404，非 UUID 回 400，前端兩者都顯示「找不到商品」。429、5xx、網路錯誤則顯示可重試的錯誤。

**Major components：**

1. 設計 tokens：在 `tailwind.config.js` 定義語意色、字級、陰影、圓角。
2. `Layout`／`NavBar`／`SideMenu`／`Footer`：WR-04 的修法是把水平選單斷點從 `lg` 提高到 `xl`。詳情頁設 `showSideMenu=false`，不加進 `NAV_ITEMS`。
3. 詳情資料層：`fetchProductDetail`（含守衛）、`toProductDetail`、`useProductDetail`（四種狀態）。
4. `ProductDetailPage` 與 `NotFoundState`，後者由詳情 404 與全域 `*` 共用。
5. 接線：`ProductCard` 整張改成單一 `<Link>`。`FeaturedCarousel` 只在標題或「查看詳情」放 `Link`，其餘 role／aria／事件結構不動。

**呈現規則：**

- `attributes` 用 `Object.entries` 通用渲染。
- `description` 以純文字加 `whitespace-pre-line` 呈現，禁止用 `dangerouslySetInnerHTML`。
- 選取的變體用元件內 `useState` 保存。

### Critical Pitfalls（PITFALLS.md）

1. **分支漂移、合併即上線：**
   - 行為層不動，只換 JSX 與 className。
   - 每個 phase 結束時 `git merge main` 進 redesign。
   - 熱修先在 main 修。
   - 建立「v1.0 行為清單」，push `main` 前須經使用者確認。
2. **輪播丟掉 WCAG 2.2.2：**
   - 不整個重寫。
   - 補測試，確認連結存在、href 正確、聚焦連結時輪播會暫停。
   - 動畫用 `motion-safe:/motion-reduce:`。
   - 重設計後必須做真實瀏覽器 UAT。
3. **測試綁舊標記被「改到綠」：**
   - 先把測試分成契約型與呈現型。
   - 不得為了通過而刪斷言，不加 snapshot，測試總數不得減少。
   - 補一個 `renderWithRouter` 輔助函式。
4. **撞上每 IP 每分鐘 60 次的限流：**
   - 不預取，詳情頁只發一個請求。
   - 可選擇加模組層短 TTL 快取並去重。
   - 429 要有專屬畫面。
5. **深連結／404／SPA fallback：**
   - 不新增 `public/404.html`，它會關閉 SPA fallback。
   - 加 `*` 路由；返回用 `navigate(-1)` 並附 fallback 連結。
   - 上線後實測三種網址：真實商品 id、不存在的 id、不存在的路由。

**其他需注意：**

- 純 CSR 做不到商品級 OG，要明確寫入 Out of Scope。
- 用固定長寬比的容器避免圖片造成 CLS。
- 型號用 `overflow-wrap: anywhere` 換行。
- 斷點表只定義一份。
- 每個 commit 都要通過 `npm test`、`lint`、`build`。
- `noAirtable.test.ts` 的掃描範圍要涵蓋新目錄。

## Implications for Roadmap

### 順序調和（Architecture 與 Pitfalls 的分歧）

兩份研究其實不衝突，差別只在把「設計決策」與「程式碼」分開看。

1. 第一關先鎖定設計，不寫 UI 程式碼，經使用者確認後才實作 UI 元件。
2. 詳情資料層可以在等待設計確認時進行。它與視覺沒有耦合，契約也已驗證，適合 TDD。Phase 2 開頭先用 curl 抓真實回應，確認 null 的邊界情況。
3. UI 實作順序依 Architecture：tokens → shell → 既有頁面視覺 → 詳情頁 UI → 連結接線 → 收尾。
4. 互動語意的變更集中在單一 phase，出問題時容易回溯與回滾。

### 建議 Phase 結構（7 個）

1. **設計鎖定與測試盤點（不寫 UI 程式碼）**
   - sketch／UI-SPEC：tokens、字型、斷點表、元件狀態、null 版面。
   - 決定卡片與燈箱的分工、輪播連結放在哪裡。
   - 把 215 項測試分成契約型與呈現型。
   - Owner 確認項目。
2. **詳情資料層（TDD）**：apiTypes、service、transform、hook；404／400 的分類；可選的快取與去重。
3. **Tokens 與共用骨架**：Layout、NavBar（WR-04）、SideMenu、Footer（聯絡資訊）、skip link、字型堆疊。
4. **既有頁面視覺改版（不改連結語意）**：首頁與輪播、分類頁、關於我們、圖示；輪播做真實瀏覽器 UAT。
5. **詳情頁 UI、路由與 NotFound**：ProductDetailPage、NotFoundState、PageHead、`/products/:id` 與 `*` 路由、低成本差異化功能。
6. **連結接線**：ProductCard 改用 Link、輪播加詳情連結、同步改寫測試。
7. **收尾驗證與合併上線**：test、lint、build 全部通過；RWD 檢查；Lighthouse CLS；驗證 CORS；使用者確認後 push `main`，再到 production 實測。

### Research Flags

- **需要研究或實測：**
  - Phase 1：視覺方向、字型方案、圖片實際尺寸。
  - Phase 6：精讀 `ProductCard.test.tsx` 與 `FeaturedCarousel.test.tsx`。
  - Phase 7：Cloudflare 深連結與 CORS 只能在 production 驗證。
- **可略過：** Phase 2、3、4、5。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 本機實測加上 npm registry；Tailwind v4 基線為 LOW，但本輪不升級 |
| Features | MEDIUM | 依慣例推導；variants 部分已被後端原始碼驗證取代 |
| Architecture | HIGH | 程式碼與後端原始碼驗證；Cloudflare SPA fallback 為 MEDIUM |
| Pitfalls | MEDIUM | 專案內部風險為 HIGH；平台行為為 MEDIUM／LOW |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- 聯絡管道資料缺：電話、LINE、Email、地址、營業時間都還沒有。
- `description` 格式：預設當純文字處理，用真實樣本確認。
- 燈箱：PROJECT.md 寫「保留燈箱」，ARCHITECTURE 建議把燈箱移到詳情頁主圖，需要 Owner 決定。
- 依賴清理是否併入、要不要做商品級 OG、「新品」天數閾值、`in_stock=false` 的商品在列表是否顯示。
- 圖片實際尺寸，以及要不要做 Image Resizing。
- `*.pages.dev` 預覽抓不到 API，真實資料只能在 localhost 或合併到 main 之後才看得到。

## Sources

- **Primary（HIGH）：**
  - 專案原始碼與設定、`.planning/*`
  - 後端 `../KRD-Inventory-Backend/src/modules/public/*`
  - Context7 `/reactjs/react.dev`
  - npm registry
- **Secondary（MEDIUM）：** Cloudflare Pages SPA 行為、社群爬蟲行為、B2B 型錄與 PDP 慣例。
- **Tertiary（LOW）：**
  - Tailwind v4 的瀏覽器基線
  - Safari 的 CJK 排版屬性
  - `img.krd.com.tw` 的圖片尺寸

*Research completed: 2026-11-10 ｜ Ready for roadmap: yes*
