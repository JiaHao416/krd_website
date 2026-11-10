# Phase 3: 靜態內容固化與移除 Airtable - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

把 Logo、導覽列（NavBar 桌機＋手機選單、商品頁 SideMenu）、關於我們頁的服務圖卡，從執行階段呼叫 `airTable()` 改為 repo 內的靜態內容與圖片；接著刪除 `src/services/index.ts`（Airtable axios instance、token、Base ID、`airTable()` 與 `getXxx` 函式、相關型別）與未被引用的 `src/components/ProductView.tsx`，讓 `dist/` 完全不含 Airtable 網址、token 或 Base ID。

**本 phase 範圍內：** STAT-01、STAT-02、STAT-03、SEC-01、SEC-04；靜態資產下載進 repo；對應的元件測試；防止 Airtable 再次出現的自動檢查。

**不在本 phase：** 撤銷 token 與 production 實測（Phase 4）；關於我們頁其他寫死文案的改寫或抽出；任何視覺改版（見記憶：UI redesign 排在 milestone 後）。

</domain>

<decisions>
## Implementation Decisions

> 使用者在討論時選「你決定」，以下都是 Claude 依專案限制、Phase 1/2 決策，以及 2026-11-10 唯讀查詢 Airtable 的實際內容所選的預設。規劃時直接採用。
> 前面 phase 的決策以 `P1 D-xx`、`P2 D-xx` 引用。

### 討論前查到的事實（2026-11-10 唯讀查詢 Airtable `view=data`）
- `logo` 表：1 筆，`img` = `https://imgur.com/vG5oafk.png`（實際下載網址 `https://i.imgur.com/vG5oafk.png`，PNG 800×235）。
- `navigation` 表：8 筆，依序為
  1. 所有商品 `/all-products`
  2. 最新商品 `/new-products`
  3. KRD `/krd-products`
  4. MICGO `/micgo-products`
  5. 無線麥克風 `/wireless-micphone`
  6. 有線麥克風 `/wired-micphone`
  7. 擴大機 / 喇叭 `/trumpet`
  8. 配件 `/accessories`
  - 標題與 `src/config/productPageViews.tsx` 的 `title` **完全相同**；但順序與 `PRODUCT_PAGES` 不同（KRD／MICGO 對調、無線／有線對調）。
- `abouts` 表：6 筆服務圖卡（`icon_name` / `img_url`），依序：卡拉OK `m6YYqzT`、KTV `uL42nBw`、酒店 `cdPIBdK`、PUB `SWOXFJc`、遊覽車 `yHIqSll`、維修 `W5Exgnz`（皆為 `https://i.imgur.com/<id>.png`，抽樣為 PNG 250×250）。
- 關於我們頁**只有**這 6 張圖卡來自 Airtable；公司介紹、聯絡資訊、CTA 等文字本來就寫死在 `AboutPage.tsx`。
- 現有 `public/logo.png`（250×250）是 `index.html` 的 favicon，**不是**導覽列 Logo，兩者不同圖。

### 導覽順序與單一來源（STAT-02）
- **D-01:** 單一來源仍是 `PRODUCT_PAGES`（路徑＋查詢）＋ `PRODUCT_PAGE_VIEWS`（標題、描述、圖示），沿用 P1 D-11、P2 D-14。**把 `PRODUCT_PAGES` 的陣列順序改成上述現行選單順序**（路由比對與順序無關，不影響 PROD-07）。`App.test.tsx`、`catalog.test.ts` 中依順序比對路徑的斷言隨之更新；路徑集合仍與舊網址完全相同。
- **D-02:** 新增導覽清單衍生函式／常數（例如 `src/config/navigation.ts` 的 `NAV_ITEMS: { path, title }[]`），由 `PRODUCT_PAGES.map()` 加上 `PRODUCT_PAGE_VIEWS[path].title` 產生，**不另外手寫第二份標題或路徑**。NavBar（桌機＋手機）與 SideMenu 都讀它。
- **D-03:** 「商店介紹」（`/abouts`）按鈕維持現狀：樣式不同、寫死在 NavBar，不納入 `NAV_ITEMS`（現行 Airtable 選單本來也不含它）。
- **D-04:** NavBar／SideMenu 移除 `useEffect` 抓取、`navigationData` state 與 SideMenu 的骨架載入畫面（`isLoading`），首屏就直接顯示選單。`key` 改用 `path`，不再用 `item.id || index`。其餘 class、互動、active 樣式完全不變。

### Logo（STAT-01）
- **D-05:** 下載 Airtable 指向的 800×235 圖片，存成 **`public/brand-logo.png`**（新檔名）。**不覆蓋** `public/logo.png`，因為它是 favicon，替換會改變分頁圖示。
- **D-06:** NavBar 直接用 `<img src="/brand-logo.png">`（字串路徑，不經 Vite import），保留現有容器、class 與 `filter` 樣式，`alt` 沿用「KRD MICGO Logo」。加上 `width`／`height` 屬性（依原圖比例）以避免版面跳動。
- **D-07:** 保留現有「KRD MICGO」文字樣式作為**圖片載入失敗**（`onError`）時的備援；不再有「載入中先顯示文字」的狀態。

### 關於我們內容檔（STAT-03）
- **D-08:** 6 張圖下載到 **`public/abouts/`**，檔名用英文 slug：`karaoke.png`、`ktv.png`、`hotel.png`、`pub.png`、`bus.png`、`repair.png`。放 `public/`（不放 `src/assets/`），原因與 Logo 一致：圖片路徑穩定、內容檔只是純資料。
- **D-09:** 內容檔用 TypeScript 模組 **`src/content/abouts.ts`**，匯出 `ABOUT_SERVICES: readonly { name: string; image: string }[]`，順序同 Airtable。選 TS 而非 JSON，是為了型別檢查，也和 `catalog.ts` 的設定寫法一致。欄位改用 camelCase 的語意名稱，不沿用 Airtable 的 `icon_name`／`img_url`；CLAUDE.md「不要改名」的規則只針對 Airtable 資料，這份資料已不再來自 Airtable。
- **D-10:** `AboutPage.tsx` 移除 `useEffect`、`services`／`isLoading` state 與 8 格骨架畫面，直接 map `ABOUT_SERVICES`。圖卡的 class、`filter`、`animationDelay` 等樣式完全不變。頁面其他寫死的文字**不動、不抽出**（不在 STAT-03 範圍，抽出只會增加風險）。

### 抓取方式與 Airtable 移除（SEC-01、SEC-04）
- **D-11:** 靜態資產**在執行階段一次性下載**（`curl` 下載 imgur 公開網址；imgur 不需要 token），下載後檢查檔案類型與尺寸再 commit。**不 commit 任何抓取腳本**：token 撤銷後腳本就失效，留著反而像在鼓勵把 token 加回來。Airtable 內容已記錄在本檔「討論前查到的事實」，執行時若要再確認，只能用唯讀方式查詢，而且 token 不得寫進任何新檔案、文件或 commit 訊息。
- **D-12:** **順序**：先 commit 靜態資產與內容檔 → 再把 NavBar／SideMenu／AboutPage 改成讀靜態來源 → 最後刪除 `src/services/index.ts` 與 `src/components/ProductView.tsx`。每一步 commit 都要通過 `npm run build`、`npm test`、`npm run lint`。
- **D-13:** 刪除後檢查：`src/` 內沒有任何 `airTable`、`services/index`、`ProductView` 的引用。舊 service 只依賴 `axios`，而 axios 仍被 Phase 1 的 `client.ts` 使用，所以**不移除任何套件**。
- **D-14:** 加一個**自動化回歸檢查**：寫一支 Vitest 測試（node 環境），掃描 `src/**/*.{ts,tsx}`，斷言不含 `airtable`（不分大小寫）、`api.airtable.com`、Airtable 的 Base ID 格式（`/\bapp[A-Za-z0-9]{14}\b/`）與 token 格式（Personal Access Token `pat` + 14 字元 + `.` + 64 字元；舊式 API key `key` + 14 字元。執行時先在不輸出值的前提下確認現有 token 屬於哪一種，正規表示式要涵蓋到）。正規表示式只描述格式，**不得**在測試、文件或計畫中寫出實際的 token 或 Base ID 值。
- **D-15:** SEC-01 的 `dist/` 驗證放在 phase 的驗證步驟：執行 `npm run build` 後，用同一組模式 grep `dist/`，結果必須為零筆。是否另外加一個 `npm run check:dist` 指令交給 planner；不在 CI 加新步驟，因為 Cloudflare Pages 只跑 `npm run build`。

### 測試
- **D-16:** 必測行為（沿用 P2 的 jsdom + Testing Library 環境）：
  - NavBar：桌機與手機選單都依 D-01 順序顯示 8 個項目，加上「商店介紹」；點擊會導到對應路徑；Logo `src` 為 `/brand-logo.png`；觸發 `onError` 後改顯示「KRD MICGO」文字。
  - SideMenu：8 個項目依序顯示，active 項目依目前路徑標示，沒有骨架載入狀態。
  - AboutPage：渲染 6 張圖卡，名稱與 `src`（`/abouts/*.png`）正確。
  - `NAV_ITEMS`：路徑集合等於 `PRODUCT_PAGES`，標題等於 `PRODUCT_PAGE_VIEWS`。
  - D-14 的原始碼掃描測試。
  - 上述元件都不再發出任何網路請求（不需要 mock `airTable`）。

### Claude's Discretion
- `NAV_ITEMS` 的確切檔案位置與名稱（`src/config/navigation.ts` 為建議），以及要做成常數還是函式。
- Logo 的 `width`／`height` 數值，以及 onError 備援用 state 還是其他寫法。
- 是否把 Logo 抽成小元件（例如 `BrandLogo`）以利測試。
- `npm run check:dist` 指令要不要加（D-15）。
- 是否順手更新 `CLAUDE.md` 與 `.planning/codebase/*.md` 中描述 Airtable 的過時段落。建議在最後一個 plan 一併更新，但不得寫入 token 值。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 背景與定案
- `.planning/BRIEF.md` — Logo／導覽／關於我們改靜態檔的定案（Owner 已確認）
- `.planning/PROJECT.md` — 限制：每次 commit 都要 build 通過、前端不得含憑證、撤銷 token 前抓好靜態內容
- `.planning/REQUIREMENTS.md` — STAT-01～03、SEC-01、SEC-04
- `.planning/ROADMAP.md` — Phase 3 成功標準

### 前面 phase 的決策與成果
- `.planning/phases/01-api/01-CONTEXT.md` — P1 D-11：路徑設定是導覽的單一來源
- `.planning/phases/02-api/02-CONTEXT.md` — P2 D-14～D-17：`PRODUCT_PAGE_VIEWS` 位置、路由由設定產生、元件測試環境
- `src/services/catalog.ts` — `PRODUCT_PAGES`（本 phase 調整順序）
- `src/config/productPageViews.tsx` — `PRODUCT_PAGE_VIEWS`（標題來源）

### 要修改／刪除的檔案
- `src/components/NavBar.tsx` — Logo 與導覽（桌機＋手機）
- `src/components/SideMenu.tsx` — 側邊選單
- `src/pages/AboutPage.tsx` — 服務圖卡（第 294 行附近的 `services.map`）
- `src/services/index.ts` — 刪除（含寫死的憑證；閱讀時不得把值複製到任何地方）
- `src/components/ProductView.tsx` — 刪除（未被引用）
- `src/App.test.tsx`、`src/services/catalog.test.ts` — 順序斷言隨 D-01 更新

### 既有程式碼分析
- `.planning/codebase/CONVENTIONS.md` — 程式風格
- `.planning/codebase/INTEGRATIONS.md` — Airtable 整合現況（移除後應更新）

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PRODUCT_PAGES` + `PRODUCT_PAGE_VIEWS`：導覽清單直接由這兩份衍生。
- `src/test/setup.ts` 與 P2 的 jsdom／Testing Library 設定：元件測試直接沿用。
- NavBar／SideMenu／AboutPage 的版面與樣式全部保留，只換資料來源。

### Established Patterns
- 元件寫成 PascalCase arrow function，檔尾 `export default`；事件處理函式以 `handle` 開頭。
- 嚴格 TS（`verbatimModuleSyntax`、`erasableSyntaxOnly`、`noUnusedLocals`），不使用 `any`。
- 設定檔：services 不依賴 React，含 JSX 的設定放 `src/config/`。

### Integration Points
- `src/components/Layout.tsx` 掛 NavBar 與 SideMenu（`showSideMenu`）。
- `index.html` 的 favicon `/logo.png` 不動。
- 刪除 `src/services/index.ts` 後，`src/services/` 只剩 Phase 1 的 API 模組。

</code_context>

<specifics>
## Specific Ideas

- 「外觀與現行一致」的判準：Logo 同一張圖、同一個容器樣式；選單項目、文字和順序與 Airtable `navigation` 表一致；關於我們的 6 張圖卡同圖、同名、同順序。
- 移除載入骨架會讓首屏「更快」顯示，這是預期中的改善，不算外觀差異。

</specifics>

<deferred>
## Deferred Ideas

- 關於我們頁其他寫死文案抽成內容檔：本輪不做，日後有改版需求再處理。
- 圖片轉成 WebP 等格式最佳化：不在範圍內。
- UI 重設計：milestone 完成後另開分支（見專案記憶）。

</deferred>

---

*Phase: 03-airtable*
*Context gathered: 2026-11-10*
