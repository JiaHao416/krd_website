# Phase 9: 商品詳情頁 UI、路由與 NotFound - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Mode:** `--auto`（使用者授權全自動；決策為建議預設值，見 [auto] 行）

<domain>
## Phase Boundary

新增 `/products/:id` 詳情頁（消費 Phase 7 的 `useProductDetail`）、詳情頁所有狀態（loading／success／notFound／retryable error）、頁面標題與 description、詳情頁手機底部雙鈕固定列，以及全域 `*` NotFound 路由。

**不在本 phase：** 分類頁商品卡與熱銷便條卡改為連到詳情頁（Phase 10）；ProductPageTemplate 的燈箱移除（Phase 10）。本 phase 結束時，訪客只能直接輸入網址進入詳情頁。

需求：PROD-08～PROD-16。

**UI 契約：** 權威為 `.planning/phases/06-design-lock/06-UI-SPEC.md` §商品詳情頁 `/products/:id`（Phase 9）、§價格為空版面、§燈箱、§NotFound 頁與 `NotFoundState`、§手機底部固定列（詳情）、Copywriting Contract，以及 `mockups/detail-desktop.dc.html`、`detail-mobile.dc.html`。

</domain>

<decisions>
## Implementation Decisions

[--auto] Selected all gray areas: 價格文案、分類對應與麵包屑、返回按鈕、頁面標題、NotFound、複製詢價、變體選擇、燈箱、手機固定列、測試與 UAT。

### 價格文案
- [auto] Q: "PROD-10 寫『洽詢』，UI-SPEC 寫『價格請來電』，以何為準？" → Selected: "UI-SPEC『價格請來電』"（recommended；UI-SPEC 為已核准的權威文案，與 Phase 8 一致）
- **D-01:** 價格區塊依 `toProductDetail` 的變體 `priceText`：選中變體 `priceText === null` → 標題「價格請來電」+ 說明「這個商品沒有標價，打個電話問，我們直接報給你。」；否則標題為 `priceText`（含稅）。無變體時視為無價。`format.ts` 不改。

### 分類對應與麵包屑
- [auto] Q: "後端 category（如『喇叭』）如何對應分類頁？" → Selected: "由 PRODUCT_PAGES 的 query.category 反查 path 與 PRODUCT_PAGE_VIEWS 標題；找不到則用 /all-products『所有商品』"（recommended；單一來源，不寫死）
- **D-02:** 新增純函式（放 `src/config/`，例如 `categoryPage.ts`）`findCategoryPage(category) → { path, title }`；有單元測試（含找不到的退回）。麵包屑「首頁 › {分類標題} › {商品名稱}」，分類 tag 也連到同一 path。`services/catalog.ts` 不改（只讀 `PRODUCT_PAGES`）。

### 返回按鈕
- **D-03:** 「← 回上一頁」：`location.key !== "default"`（有站內歷史）時 `navigate(-1)`；否則渲染為 `<Link>` 到 D-02 的分類頁（PROD-12「直接開啟網址也有可用的返回連結」）。兩種情況都要測。

### 頁面標題與 description
- [auto] Q: "用 React 19 原生 `<title>`/`<meta>` 還是 useEffect 改 document？" → Selected: "研究後決定；偏好 React 19 原生 metadata（不需新依賴）"（recommended；不得引入 react-helmet 等新套件）
- **D-04:** 成功：`{商品名稱} | KRD`、description 為說明前 80 字（無說明則「{品牌} {型號} {分類}」去空白）；notFound：「找不到商品 | KRD」；全域 NotFound：「找不到頁面 | KRD」。離開頁面後標題須回到原本的站名（研究確認 React 19 行為；若用 useEffect 則 cleanup 還原）。需有測試。

### NotFound
- **D-05:** 新增 `NotFoundState`（可重用面板，props 決定標題、說明、按鈕）與 `NotFoundPage`（全域 `<Route path="*">`）。詳情 404/400 用商品版（主按鈕「回到所有商品」→ `/all-products`）；全域版主按鈕「回到首頁」。文案依 UI-SPEC Copywriting Contract。8 條舊路由與 `/`、`/abouts` 不受影響（App.test 既有測試全保留）。
- **D-06:** 非 UUID 的 `:id` 由 Phase 7 hook 直接回 notFound、不發請求（沿用，不重做）。

### 錯誤狀態
- **D-07:** retryable：置中面板 `role="alert"`、`danger` 圖示、「重新載入」主按鈕呼叫 hook 的 `retry()`；`isRateLimited` 時用 UI-SPEC 的 429 專屬文案。文案以 UI-SPEC Copywriting 為準，不改 `ERROR_MESSAGES`。

### 複製詢價
- **D-08:** 複製內容「{商品名稱}｜型號 {model}｜{完整網址}」（無型號省略中段），網址用 `window.location.href`。用 `navigator.clipboard.writeText`；不可用或拒絕 → 顯示「複製失敗，請手動選取網址」（`danger`）。成功時按鈕文字 2 秒變「已複製」，外層 `aria-live="polite"`；計時器卸載時清除。行內（md+）與手機固定列共用同一個 hook／函式（例如 `useCopyInquiry`），有測試（成功、失敗、無型號、2 秒還原、卸載清除）。

### 變體選擇
- **D-09:** ≥ 2 個變體才顯示 `role="radiogroup"`（`aria-label="選擇規格"`），chip `role="radio"`、`aria-checked`，roving tabindex，方向鍵（←→↑↓、Home/End）切換並移動焦點；預設選中 `defaultVariantId`。0 或 1 個變體顯示單一規格資訊。切換變體時：價格、現貨標籤、規格表 SKU／attributes、主圖（變體有 imageUrl 才換，否則用商品圖）同步更新。選中變體不寫入 URL（Phase 7 deferred）。

### 燈箱
- **D-10:** 沿用 `ImageModal`（Phase 8 已補 dialog 語意與焦點管理），只在主圖 `<button>` 使用；無圖 → `ImagePlaceholder`，不是按鈕、不能開燈箱。關閉鈕 `aria-label="關閉圖片"`（若現有 label 不同，以 UI-SPEC 為準並同步 ProductPageTemplate 的測試，且契約不得刪）。

### 手機固定列
- **D-11:** 詳情頁 base 顯示「複製詢價」+「打電話問問」雙鈕固定列（grid 2fr/3fr、`shadow-float`），取代全站的單鈕 `MobileCallBar`；md+ 不顯示固定列、改顯示行內 CTA。實作方式（MobileCallBar 加 variant，或 Layout 接受 prop 替換）由研究決定，但其他頁的單鈕列行為與既有測試不得改變。頁面底部留 ≥ 96px。

### 載入與資料
- **D-12:** loading 骨架尺寸與成功態一致，`aria-busy="true"`；詳情頁不引入任何列表 API 請求（不呼叫 `fetchProducts`／`useProducts`），用測試驗證。說明以 `whitespace-pre-line` 純文字呈現，禁用 `dangerouslySetInnerHTML`；保固 null 整列隱藏。

### 測試與流程
- **D-13:** 每個 commit `npm test`、`npm run lint`、`npm run build` 全綠；TDD（RED 記錄於 SUMMARY，不提交紅燈）。`src/services/` 既有內容與既有 hooks 不改；契約測試不得刪；`npx vitest list | wc -l` 每個 plan 單調不減（起點 413）。designTokens 掃描測試必須持續通過（新程式只用語意 token 與 base/md/xl）。
- **D-14:** 收尾 plan 由主 session 以 chrome-devtools MCP 做真實瀏覽器 UAT（320／768／1440）：直接開一個真實商品 id、不存在的 UUID、非 UUID、任意不存在網址；變體切換、燈箱、複製、返回按鈕（直接開網址與站內進入兩種）、頁面標題；結果寫 `09-UAT.md`。無法自動化的列 human-needed。
- **D-15:** Phase 結束時檢查 `main` 是否有新 commit，有則本地合併（衝突則 abort 回報），永不 push。

### Claude's Discretion
全部灰色地帶由 Claude 依 `--auto` 選建議預設值。planner 可調整計畫切分與檔案組織，但不得改變：D-01（不改 format.ts）、D-03（直接開網址有可用返回）、D-08 複製格式、D-12（不打列表 API、不用 innerHTML）、D-13、UI-SPEC 的所有視覺數值與文案。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/phases/06-design-lock/06-UI-SPEC.md` — §商品詳情頁、§價格為空、§燈箱、§NotFound、§手機底部固定列、§Copywriting Contract、§全站焦點與互動狀態
- `.planning/phases/06-design-lock/mockups/detail-desktop.dc.html`、`detail-mobile.dc.html`
- `.planning/phases/06-design-lock/06-TEST-INVENTORY.md` — 契約清單
- `.planning/phases/07-detail-data/07-CONTEXT.md`、`07-API-SAMPLES.md` — 詳情資料層契約與真實回應樣本
- `.planning/phases/08-shell-redesign/08-CONTEXT.md`、`08-0*-SUMMARY.md`、`08-REVIEW.md` — 骨架元件、PriceTag、contact.ts、ImageModal 改動、designTokens 規則
- `.planning/REQUIREMENTS.md` — PROD-08～16；`.planning/ROADMAP.md` §Phase 9 成功標準 1–5
- 既有程式：`src/hooks/useProductDetail.ts`、`src/services/productDetail.ts`、`src/services/transform.ts`（ProductDetail）、`src/services/catalog.ts`（PRODUCT_PAGES）、`src/config/productPageViews.tsx`、`src/config/contact.ts`、`src/components/{Layout,MobileCallBar,ImageModal,ImagePlaceholder,PriceTag,icons}.tsx`、`src/App.tsx`、`src/App.test.tsx`

</canonical_refs>

<code_context>
## Existing Code Insights

- 測試 413 項（Phase 8 結束）。
- `useProductDetail(id)` 回傳判別聯合 loading／success{product}／notFound／error{error,isRateLimited} 與 `retry()`。
- `ProductDetail` 欄位：id、name、brand、model、category、description、imageUrl、warrantyMonths（0→null）、inStock、variants[{id,sku,attributes:[{key,value}],imageUrl,isDefault,inStock,priceInclTax,priceText}]、defaultVariantId。
- production 目前 20 筆商品價格皆為 null。

</code_context>

<specifics>
## Specific Ideas

- 使用者偏好：不要制式、有人味（C5a）；詳情主圖的膠帶與傾斜、價格區塊色塊要保留。

</specifics>

<deferred>
## Deferred Ideas

- 選中變體寫入 URL（`?sku=`）
- 詳情資料快取／預取
- 卡片、便條卡連到詳情頁 → Phase 10

</deferred>

---

*Phase: 09-product-detail*
*Context gathered: 2026-11-11（--auto）*
