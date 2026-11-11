# Phase 9：商品詳情頁 UI、路由與 NotFound — 研究

**研究日期：** 2026-11-11
**領域：** React 19.1 原生 metadata、react-router 6.30 路由與歷史判斷、WAI-ARIA radiogroup、Clipboard API、Vitest 4 + Testing Library 測試手法
**整體信心：** HIGH（關鍵行為都在本機 node_modules 原始碼或 jsdom 實驗中驗證過）

## 摘要

Phase 9 不需要任何新套件。React 19.1 原生 `<title>`／`<meta>` 已在本機 jsdom 實測：React 會把 `<title>` **插在 index.html 既有的 `<title>KRD</title>` 前面**，所以 `document.title` 取到的是頁面標題；元件卸載時 React 會移除它，標題自動回到「KRD」。不需要 useEffect，也不需要自己寫 cleanup。唯一的坑是 `<title>` 的 children 必須是**單一字串**：寫成 `<title>{name} | KRD</title>` 會讓標題變成空字串，這點已實測確認。

「有站內歷史」用 `location.key !== "default"` 判斷是可靠的。router 原始碼顯示，BrowserRouter 第一次載入（`history.state` 為空）時 key 是 `"default"`。MemoryRouter 的 `initialEntries` 只有第 0 筆是 `"default"`，而且預設停在最後一筆。所以測試寫成「單筆 → 直接開網址」、「兩筆 → 站內進入」即可。手機雙鈕固定列建議讓 Layout 新增一個 `mobileBar?: ReactNode` slot，預設值為 `<MobileCallBar />`。這樣其他頁與既有 Layout／MobileCallBar 測試完全不用動；複製狀態留在詳情頁，透過 slot 傳進去即可。

測試基礎設施已經齊全，不需要 Wave 0 框架安裝：Vitest 4.1.12、`.test.ts` 跑 node、`.test.tsx` 跑 jsdom、user-event 14.6.9、jest-dom 7。要注意兩點：(1) `userEvent.setup()` 會把 `navigator.clipboard` 換成自己的 stub，所以剪貼簿的 mock 必須在 setup **之後**設定，或者乾脆讓 hook 透過依賴注入取得 `writeText`；(2) designTokens 掃描只掃 `.tsx`／`.css`，間距只允許 `0|1|2|4|6|8|12|16|24|px`。

**主要建議：** 用 React 19 原生 `<title>`／`<meta>`、`location.key` 判斷歷史、Layout 的 `mobileBar` slot、可注入 `writeText` 的 `useCopyInquiry` hook。拆成 5 個 plan（3 個實作 wave + 1 個整合 + UAT），測試數從 413 單調增加到約 485。

<user_constraints>
## 使用者限制（逐字取自 09-CONTEXT.md）

### 鎖定決策

#### 價格文案
- [auto] Q: "PROD-10 寫『洽詢』，UI-SPEC 寫『價格請來電』，以何為準？" → Selected: "UI-SPEC『價格請來電』"（recommended；UI-SPEC 為已核准的權威文案，與 Phase 8 一致）
- **D-01:** 價格區塊依 `toProductDetail` 的變體 `priceText`：選中變體 `priceText === null` → 標題「價格請來電」+ 說明「這個商品沒有標價，打個電話問，我們直接報給你。」；否則標題為 `priceText`（含稅）。無變體時視為無價。`format.ts` 不改。

#### 分類對應與麵包屑
- [auto] Q: "後端 category（如『喇叭』）如何對應分類頁？" → Selected: "由 PRODUCT_PAGES 的 query.category 反查 path 與 PRODUCT_PAGE_VIEWS 標題；找不到則用 /all-products『所有商品』"（recommended；單一來源，不寫死）
- **D-02:** 新增純函式（放 `src/config/`，例如 `categoryPage.ts`）`findCategoryPage(category) → { path, title }`；有單元測試（含找不到的退回）。麵包屑「首頁 › {分類標題} › {商品名稱}」，分類 tag 也連到同一 path。`services/catalog.ts` 不改（只讀 `PRODUCT_PAGES`）。

#### 返回按鈕
- **D-03:** 「← 回上一頁」：`location.key !== "default"`（有站內歷史）時 `navigate(-1)`；否則渲染為 `<Link>` 到 D-02 的分類頁（PROD-12「直接開啟網址也有可用的返回連結」）。兩種情況都要測。

#### 頁面標題與 description
- [auto] Q: "用 React 19 原生 `<title>`/`<meta>` 還是 useEffect 改 document？" → Selected: "研究後決定；偏好 React 19 原生 metadata（不需新依賴）"（recommended；不得引入 react-helmet 等新套件）
- **D-04:** 成功：`{商品名稱} | KRD`、description 為說明前 80 字（無說明則「{品牌} {型號} {分類}」去空白）；notFound：「找不到商品 | KRD」；全域 NotFound：「找不到頁面 | KRD」。離開頁面後標題須回到原本的站名（研究確認 React 19 行為；若用 useEffect 則 cleanup 還原）。需有測試。

#### NotFound
- **D-05:** 新增 `NotFoundState`（可重用面板，props 決定標題、說明、按鈕）與 `NotFoundPage`（全域 `<Route path="*">`）。詳情 404/400 用商品版（主按鈕「回到所有商品」→ `/all-products`）；全域版主按鈕「回到首頁」。文案依 UI-SPEC Copywriting Contract。8 條舊路由與 `/`、`/abouts` 不受影響（App.test 既有測試全保留）。
- **D-06:** 非 UUID 的 `:id` 由 Phase 7 hook 直接回 notFound、不發請求（沿用，不重做）。

#### 錯誤狀態
- **D-07:** retryable：置中面板 `role="alert"`、`danger` 圖示、「重新載入」主按鈕呼叫 hook 的 `retry()`；`isRateLimited` 時用 UI-SPEC 的 429 專屬文案。文案以 UI-SPEC Copywriting 為準，不改 `ERROR_MESSAGES`。

#### 複製詢價
- **D-08:** 複製內容「{商品名稱}｜型號 {model}｜{完整網址}」（無型號省略中段），網址用 `window.location.href`。用 `navigator.clipboard.writeText`；不可用或拒絕 → 顯示「複製失敗，請手動選取網址」（`danger`）。成功時按鈕文字 2 秒變「已複製」，外層 `aria-live="polite"`；計時器卸載時清除。行內（md+）與手機固定列共用同一個 hook／函式（例如 `useCopyInquiry`），有測試（成功、失敗、無型號、2 秒還原、卸載清除）。

#### 變體選擇
- **D-09:** ≥ 2 個變體才顯示 `role="radiogroup"`（`aria-label="選擇規格"`），chip `role="radio"`、`aria-checked`，roving tabindex，方向鍵（←→↑↓、Home/End）切換並移動焦點；預設選中 `defaultVariantId`。0 或 1 個變體顯示單一規格資訊。切換變體時：價格、現貨標籤、規格表 SKU／attributes、主圖（變體有 imageUrl 才換，否則用商品圖）同步更新。選中變體不寫入 URL（Phase 7 deferred）。

#### 燈箱
- **D-10:** 沿用 `ImageModal`（Phase 8 已補 dialog 語意與焦點管理），只在主圖 `<button>` 使用；無圖 → `ImagePlaceholder`，不是按鈕、不能開燈箱。關閉鈕 `aria-label="關閉圖片"`（若現有 label 不同，以 UI-SPEC 為準並同步 ProductPageTemplate 的測試，且契約不得刪）。

#### 手機固定列
- **D-11:** 詳情頁 base 顯示「複製詢價」+「打電話問問」雙鈕固定列（grid 2fr/3fr、`shadow-float`），取代全站的單鈕 `MobileCallBar`；md+ 不顯示固定列、改顯示行內 CTA。實作方式（MobileCallBar 加 variant，或 Layout 接受 prop 替換）由研究決定，但其他頁的單鈕列行為與既有測試不得改變。頁面底部留 ≥ 96px。

#### 載入與資料
- **D-12:** loading 骨架尺寸與成功態一致，`aria-busy="true"`；詳情頁不引入任何列表 API 請求（不呼叫 `fetchProducts`／`useProducts`），用測試驗證。說明以 `whitespace-pre-line` 純文字呈現，禁用 `dangerouslySetInnerHTML`；保固 null 整列隱藏。

#### 測試與流程
- **D-13:** 每個 commit `npm test`、`npm run lint`、`npm run build` 全綠；TDD（RED 記錄於 SUMMARY，不提交紅燈）。`src/services/` 既有內容與既有 hooks 不改；契約測試不得刪；`npx vitest list | wc -l` 每個 plan 單調不減（起點 413）。designTokens 掃描測試必須持續通過（新程式只用語意 token 與 base/md/xl）。
- **D-14:** 收尾 plan 由主 session 以 chrome-devtools MCP 做真實瀏覽器 UAT（320／768／1440）：直接開一個真實商品 id、不存在的 UUID、非 UUID、任意不存在網址；變體切換、燈箱、複製、返回按鈕（直接開網址與站內進入兩種）、頁面標題；結果寫 `09-UAT.md`。無法自動化的列 human-needed。
- **D-15:** Phase 結束時檢查 `main` 是否有新 commit，有則本地合併（衝突則 abort 回報），永不 push。

### Claude 可自行決定
全部灰色地帶由 Claude 依 `--auto` 選建議預設值。planner 可調整計畫切分與檔案組織，但不得改變：D-01（不改 format.ts）、D-03（直接開網址有可用返回）、D-08 複製格式、D-12（不打列表 API、不用 innerHTML）、D-13、UI-SPEC 的所有視覺數值與文案。

### 延後項目（不在範圍內）
- 選中變體寫入 URL（`?sku=`）
- 詳情資料快取／預取
- 卡片、便條卡連到詳情頁 → Phase 10
</user_constraints>

<phase_requirements>
## Phase 需求

| ID | 說明 | 研究支撐 |
|----|------|----------|
| PROD-08 | 主圖、名稱、品牌、型號、分類、說明（保留換行）、保固（0／空值隱藏） | `ProductDetail` 欄位已在 transform 正規化（`warrantyMonths` 0→null）；`whitespace-pre-line` 純文字；§Pattern 6 規格表；保固格式見 A2 |
| PROD-09 | 變體切換、預設變體、無變體顯示單一規格 | §Pattern 4 radiogroup + roving tabindex；以 `key={product.id}` 重設選擇狀態 |
| PROD-10 | 價格為空顯示（依 D-01）「價格請來電」並附聯絡按鈕；有價顯示含稅 | D-01；`priceText` 由 Phase 7 產生，不會有 NaN；CTA 一律保留 |
| PROD-11 | 主圖燈箱 | 沿用 `ImageModal`（`aria-label="關閉圖片"` 已符合 UI-SPEC，不需改） |
| PROD-12 | 麵包屑回分類、返回上一頁、直接開網址也有返回連結 | §Pattern 2 `location.key`；`findCategoryPage` |
| PROD-13 | 404/400 顯示找不到商品；429/網路顯示可重試 | hook 已分類（`notFound`／`error.isRateLimited`）；§Copywriting 字串表 |
| PROD-14 | 一鍵複製詢價訊息 | §Pattern 5 `useCopyInquiry`（可注入 `writeText`） |
| PROD-15 | 分頁標題與 description | §Pattern 1 React 19 原生 metadata（已實測） |
| PROD-16 | 任何不存在的網址顯示 NotFound | §Pattern 7 `<Route path="*">`；Cloudflare Pages 無 404.html 時採 SPA fallback |
</phase_requirements>

## 專案限制（取自 CLAUDE.md）

- 技術棧沿用 Vite 6 + React 19 + TypeScript + Tailwind 3 + axios；**不新增依賴**（D-04 也明文禁止 react-helmet）。
- 維持舊網址（8 條商品頁、`/`、`/abouts`）。
- 前端不得含任何憑證；`npm run build` 包含 `tsc -b` 與 dist 憑證掃描，每個 commit 都要通過。
- TS 嚴格：`noUnusedLocals/Parameters`、`verbatimModuleSyntax`（型別 import 要用 `import type`）、`erasableSyntaxOnly`（不能用 enum／namespace）。
- 風格：雙引號、分號、2 空格縮排、尾逗號；元件用 PascalCase arrow function 並 `export default`；事件處理函式以 `handle` 開頭；Props 型別命名為 `XxxProps`。
- 註解與文件一律繁體中文；服務層函式用 `/** */` 中文 JSDoc。
- 錯誤策略：service 拋 `ApiError`，畫面負責呈現。詳情頁直接讀 hook 的判別聯合，不要再加 try/catch。
- 不要仿效：`any`、`catch (error: any)`。
- 全域規範：TDD、不跳過 hook（`--no-verify`）、commit 不加 AI 署名。
- GSD：檔案只能在 `/gsd-execute-phase` 流程中修改。

## 架構責任對照

| 能力 | 主要層級 | 次要層級 | 理由 |
|------|----------|----------|------|
| 取得詳情資料 | API／Backend（公開 API） | Browser（`useProductDetail`） | Phase 7 已完成；本 phase 只消費判別聯合 |
| 路由、NotFound | Browser（react-router） | CDN（Cloudflare Pages SPA fallback） | 無 404.html，Pages 會把所有路徑回到 index.html，由客戶端路由決定畫面 |
| 頁面標題／description | Browser（React 19 hoist 到 `<head>`） | — | SPA 沒有 SSR，只能由客戶端設定 |
| 分類反查 | Browser（`src/config/categoryPage.ts` 純函式） | — | 單一來源 `PRODUCT_PAGES` + `PRODUCT_PAGE_VIEWS` |
| 複製詢價 | Browser（Clipboard API） | — | 需要 secure context 與使用者手勢 |
| 視覺／斷點 | Browser（Tailwind 語意 token） | — | 以 designTokens 掃描把關 |

## 標準技術棧

### 核心（全部已安裝，本 phase 不新增）
| 套件 | 版本（node_modules 實測） | 用途 |
|------|------|------|
| react / react-dom | 19.1.0 | 原生 `<title>`／`<meta>` hoist、`fetchPriority` |
| react-router-dom / react-router | 6.30.1（`@remix-run/router` 內部） | `useParams`、`useLocation().key`、`useNavigate`、`<Route path="*">` |
| vitest | 4.1.12 | 兩個 project：unit（node，`*.test.ts`）、component（jsdom，`*.test.tsx`） |
| @testing-library/react | 16.3.3 | `render`、`renderHook`、`act`、`within` |
| @testing-library/user-event | 14.6.9 | 鍵盤（`{ArrowRight}`、`{Home}`、`{End}`）、tab、click；**會自動掛 clipboard stub** |
| @testing-library/jest-dom | 7.0.1 | `toBeChecked()`（支援 `role="radio"` + `aria-checked`）、`toHaveFocus()` |
| jsdom | 29.1.1 | 沒有 `navigator.clipboard`（user-event setup 後才有 stub） |

**安裝：** 不需要。

## 套件合法性稽核

本 phase **不安裝任何外部套件**，因此不需要執行 slopcheck。
- 被 [SLOP] 移除的套件：無
- 被標 [SUS] 的套件：無

## 架構模式

### 系統架構圖

```
訪客輸入網址 ──► Cloudflare Pages（無 404.html → 回 index.html）
                      │
                      ▼
            BrowserRouter → App <Routes>
     ┌──────────────┬──────────────────┬───────────────────────┐
     │ / /abouts     │ /products/:id     │ *（其他任何路徑）       │
     │ 8 條舊路由     │                   │                       │
     │（不變）        ▼                   ▼                       │
     │      ProductDetailPage        NotFoundPage                │
     │       useParams().id           <title>找不到頁面 | KRD     │
     │            │                   Layout(address, 預設單鈕列)  │
     │            ▼                   NotFoundState(全域版)       │
     │   useProductDetail(id) ──► 非 UUID：notFound，不發請求       │
     │            │                UUID：GET /api/v1/public/products/:id
     │   ┌────────┼──────────┬──────────────┐
     │ loading  success    notFound      error
     │ 骨架       │        NotFoundState   role=alert
     │ aria-busy  │        (商品版)         429 文案／重新載入→retry()
     │ 單鈕列     │        <title>找不到商品 | KRD
     │            ▼
     │  ProductDetailView key={product.id}
     │   ├ <title>{name} | KRD</title> + <meta description>
     │   ├ 麵包屑（findCategoryPage）+ 返回（location.key 判斷）
     │   ├ 主圖 button → ImageModal（無圖：ImagePlaceholder）
     │   ├ VariantSelector（≥2 才有）→ selectedVariant
     │   │      └► PriceBlock／現貨標籤／SpecTable／主圖 同步
     │   ├ DetailCta（md+ 行內）─┐
     │   └ Layout mobileBar=<DetailMobileBar>（base）─┴► useCopyInquiry（共用狀態）
     │                                               └► navigator.clipboard.writeText
     └──────────────────────────────────────────────────────────────
```

### 建議檔案結構（新增／修改）

```
src/
├── config/
│   ├── categoryPage.ts           # 新：findCategoryPage（D-02）
│   └── categoryPage.test.ts      # 新（node）
├── hooks/
│   ├── useCopyInquiry.ts         # 新：複製狀態 + 2 秒計時（D-08）
│   └── useCopyInquiry.test.tsx   # 新（jsdom，renderHook）
├── pages/
│   ├── productDetailText.ts      # 新：純函式 buildInquiryText／buildMetaDescription／variantLabel／formatWarranty
│   ├── productDetailText.test.ts # 新（node）
│   ├── ProductDetailPage.tsx     # 新：讀 id、切換狀態、單一 Layout
│   ├── ProductDetailPage.test.tsx
│   ├── NotFoundPage.tsx          # 新：全域 *
│   └── NotFoundPage.test.tsx
├── components/
│   ├── Layout.tsx                # 改：新增 mobileBar?: ReactNode（預設 <MobileCallBar />）
│   ├── Layout.test.tsx           # 加 2 項
│   ├── NotFoundState.tsx(+test)  # 新：可重用面板
│   ├── VariantSelector.tsx(+test)# 新：radiogroup + roving tabindex
│   ├── PriceBlock.tsx(+test)     # 新：價格區塊（D-01）
│   ├── SpecTable.tsx(+test)      # 新：<dl> 規格表
│   ├── DetailCta.tsx(+test)      # 新：md+ 行內 CTA（打電話、複製、LINE）
│   ├── DetailMobileBar.tsx(+test)# 新：base 雙鈕固定列
│   ├── icons.tsx / icons.test.tsx# 加 CopyIcon、CheckIcon（可選 ZoomIcon）
├── index.css                     # 改：IN-01 把 [tabindex="-1"]:focus 收斂成 main 專用
├── App.tsx / App.test.tsx        # 加 /products/:id 與 * 路由與測試
```

純函式放 `.ts` 有兩個原因：(1) 可以在 node 環境快速測試；(2) 避免觸發 `react-refresh/only-export-components` 警告（`.tsx` 若同時匯出非元件會被警告）。注意 `.ts` 檔不會被 designTokens 掃描，所以 **class 字串不要放在 `.ts` 裡**（IN-05）。

### Pattern 1：React 19 原生頁面標題與 description（PROD-15、D-04）

**本機實測結果**（以專案 node_modules 的 react-dom 19.1.0 + jsdom 29，head 預先放 `<title>KRD</title>`）：

| 時點 | `document.title` | head 內容 |
|------|------------------|-----------|
| 初始 | `KRD` | `<title>KRD</title>` |
| 詳情掛載 | `BB1 \| KRD` | `<title>BB1 \| KRD</title><title>KRD</title><meta name="description" …>` |
| 改名重渲染 | `XYZ \| KRD` | 原地更新，不會多插一個 |
| 卸載 | `KRD` | React 的 title 與 meta 都被移除 |
| children 寫成 `"A", " \| KRD"` 兩段 | `""`（空字串） | `<title></title>` |

- React 把 `<title>` 插在第一個既有 `<title>` **之前**。依 HTML 規範，`document.title` 取文件順序中的第一個 title，所以瀏覽器顯示的是頁面標題 [VERIFIED: 本機實驗]。
- 官方文件說明：「React will always place the DOM element corresponding to the `<title>` component within the document's `<head>`」；children「must be a single string」；也警告「Only render a single `<title>` at a time … behavior of browsers and search engines is undefined」[CITED: react.dev/reference/react-dom/components/title]。目前 head 裡會同時有我們的 title 與 index.html 的 `KRD`，但瀏覽器確定取第一個。不要刪 index.html 的 `<title>KRD</title>`，否則 JS 載入前分頁沒有標題。
- 官方文件**沒有**寫卸載時會移除，這點由本機實驗確認 [VERIFIED: 本機實驗]。
- index.html 目前**沒有** description，所以卸載後 description 消失即恢復原狀；**不要**在 index.html 加 description，否則詳情頁會出現兩個 description（範圍外）。

```tsx
// 詳情成功態：children 一律用 template literal，確保是單一字串
<title>{`${product.name} | KRD`}</title>
<meta name="description" content={buildMetaDescription(product)} />
```

**同一時間只渲染一個 `<title>`：** loading 與 error 狀態**不渲染** title（維持「KRD」，因為 Copywriting 沒有定義這兩個狀態的標題）；notFound 由頁面渲染 `找不到商品 | KRD`。NotFoundState 本身**不要**內含 title，由呼叫端（頁面）決定，否則商品版與全域版會互相干擾。

**測試寫法（jsdom）：**
```tsx
// 模擬 index.html 的站名 title，驗證離開頁面後還原
beforeEach(() => {
  const t = document.createElement("title");
  t.textContent = "KRD";
  document.head.appendChild(t);
});
afterEach(() => document.head.querySelectorAll("title").forEach((t) => t.remove()));

it("成功時分頁標題為 {名稱} | KRD，卸載後回到 KRD", async () => {
  const { unmount } = renderPage(/* success */);
  expect(document.title).toBe("測試商品 | KRD");
  expect(
    document.head.querySelector('meta[name="description"]')
  ).toHaveAttribute("content", "說明前 80 字…");
  unmount();
  expect(document.title).toBe("KRD");
});
```

**備援方案（原生方式出問題時才用，目前不需要）：**
```ts
/** 設定分頁標題，卸載或標題改變時還原上一個值 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
```

### Pattern 2：判斷「有站內歷史」（PROD-12、D-03）

`@remix-run/router` 原始碼（node_modules 實讀）[VERIFIED: node_modules/@remix-run/router/dist/router.js]：
- BrowserRouter：`globalHistory.state && globalHistory.state.key || "default"`。新分頁、外部連結進站、書籤開啟時 `history.state` 為空，key 是 `"default"`。站內 `navigate` 後 key 是隨機字串；在站內頁面重新整理時，`history.state` 會保留，key 仍是非 default，此時 `navigate(-1)` 仍會回到站內上一頁。這是正確行為。
- MemoryRouter：`initialEntries.map((entry, index) => createMemoryLocation(entry, …, index === 0 ? "default" : undefined))`，且 `initialIndex` 預設是 `entries.length - 1`。

不要用 `window.history.length` 或 `document.referrer`，兩者都不可靠（外站進來時 length 也會 > 1）。

```tsx
// 返回按鈕：有站內歷史就回上一頁，否則連到所屬分類頁
const location = useLocation();
const navigate = useNavigate();
const hasInSiteHistory = location.key !== "default";
const category = findCategoryPage(product.category);

{hasInSiteHistory ? (
  <button type="button" onClick={handleBack} className={BACK_CLASS}>← 回上一頁</button>
) : (
  <Link to={category.path} className={BACK_CLASS}>← 回到{category.title}</Link>
)}
```
備援連結的文字依 Copywriting Contract：「← 回上一頁（備援：回到{分類名稱}）」，所以是「← 回到擴大機 / 喇叭」。D-03 只規定連到哪裡，沒有規定文字，因此以 UI-SPEC 為準。箭頭沿用專案慣例，直接寫成文字字元（`逛逛商品 →`、`看看 →`），測試用 regex `/回上一頁/`。

**測試：**
```tsx
// 直接開網址：只有一筆 entry → key 為 "default" → 備援 Link
render(<MemoryRouter initialEntries={[`/products/${ID}`]}><Routes>…</Routes></MemoryRouter>);
expect(screen.getByRole("link", { name: /回到擴大機 \/ 喇叭/ })).toHaveAttribute("href", "/trumpet");

// 站內進入：兩筆 entry，預設停在最後一筆 → key 非 default → 按鈕 navigate(-1)
render(
  <MemoryRouter initialEntries={["/trumpet", `/products/${ID}`]}>
    <Routes>
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/trumpet" element={<p>喇叭列表</p>} />
    </Routes>
  </MemoryRouter>
);
await user.click(screen.getByRole("button", { name: /回上一頁/ }));
expect(screen.getByText("喇叭列表")).toBeInTheDocument();
```

### Pattern 3：Layout 的 `mobileBar` slot（D-11）

| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| **A. Layout 新增 `mobileBar?: ReactNode`，預設 `<MobileCallBar />`** | Layout 不需要知道詳情頁；複製狀態留在頁面，以元素形式傳入；其他頁不用改呼叫端；既有 5 項 Layout 測試與 2 項 MobileCallBar 測試完全不動 | Layout 多一個 prop | **採用** |
| B. MobileCallBar 加 `variant="detail"` | 只改一個元件 | 複製的 status／onCopy 必須經 Layout 一路傳下去，Layout 仍然要改 props；MobileCallBar 職責膨脹 | 不採用 |
| C. 詳情頁不用 Layout、自己組骨架 | 不改 Layout | 重複 skip link、NavBar、Footer，違反單一來源 | 不採用 |

```tsx
interface LayoutProps {
  children: ReactNode;
  footer: "thanks" | "address";
  /** base 底部固定列；預設為全站單鈕撥號列，詳情頁傳入雙鈕列 */
  mobileBar?: ReactNode;
}
const Layout = ({ children, footer, mobileBar = <MobileCallBar /> }: LayoutProps) => ( … {mobileBar} … );
```

- 詳情頁的 **ProductDetailPage 只渲染一個 Layout**，依狀態決定 `mobileBar`：只有 success 傳 `<DetailMobileBar …/>`；loading／notFound／error 傳 `undefined`，使用預設單鈕列（UI-SPEC：NotFound 使用單鈕列；替不存在的商品複製詢價沒有意義）。這樣狀態切換時 NavBar／main 不會重掛。
- `useCopyInquiry` 也放在 ProductDetailPage 層，無條件呼叫，參數為 `text: string | null`（非 success 時傳 null）。行內 DetailCta 與 DetailMobileBar 共用同一份狀態（D-08）。
- 底部留白：Layout 外層已有 `pb-24 md:pb-0`（96px）。雙鈕列高度為 56 + 上下 padding 32 = 88px，96px 足夠。如果複製失敗訊息也放進固定列，列會變高，見 Open Question 2。
- DetailMobileBar class（全部符合 token 規則）：`fixed inset-x-0 bottom-0 z-40 grid grid-cols-[2fr_3fr] gap-2 bg-surface-raised p-4 shadow-float md:hidden`。燈箱是 `z-50`，會蓋在固定列上面，這是正確的。
- 測試新增：「未傳 mobileBar 時顯示打電話問問單鈕列」、「傳入 mobileBar 時取代預設列」（Layout +2）。

### Pattern 4：變體 radiogroup + roving tabindex（PROD-09、D-09）

依 WAI-ARIA APG Radio Group 模式 [CITED: w3.org/WAI/ARIA/apg/patterns/radio/]：Tab 進入群組時停在已選中的項目；↓／→ 移到下一個並選中，↑／← 移到上一個並選中，兩端循環；Space 選中目前焦點項目。Home／End 是 D-09 額外要求的。

```tsx
// 變體選擇：只有選中的 chip tabIndex=0，其餘 -1；方向鍵切換選中並移動焦點
const refs = useRef<Array<HTMLButtonElement | null>>([]);
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  const last = variants.length - 1;
  const next =
    e.key === "ArrowRight" || e.key === "ArrowDown" ? (index === last ? 0 : index + 1)
    : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (index === 0 ? last : index - 1)
    : e.key === "Home" ? 0
    : e.key === "End" ? last
    : null;
  if (next === null) return;
  e.preventDefault(); // 避免方向鍵／Home／End 捲動頁面
  onSelect(variants[next].id);
  refs.current[next]?.focus();
};

<div role="radiogroup" aria-label="選擇規格">
  {variants.map((v, i) => (
    <button
      key={v.id}
      ref={(el) => { refs.current[i] = el; }}
      type="button"
      role="radio"
      aria-checked={v.id === selectedId}
      tabIndex={v.id === selectedId ? 0 : -1}
      onClick={() => onSelect(v.id)}
      onKeyDown={(e) => handleKeyDown(e, i)}
    >
      {variantLabel(v)}
      {!v.inStock && <span className="… bg-block-3 …">洽詢交期</span>}
    </button>
  ))}
</div>
```
- 用 `<button type="button">` 時，Space／Enter 會原生觸發 click，不需要另外處理。
- 選擇狀態放在 `ProductDetailView`（success 分支），並以 `key={product.id}` 渲染，初值為 `product.defaultVariantId ?? product.variants[0]?.id ?? null`。換商品時狀態自動重設（Phase 10 從一個詳情連到另一個詳情時也成立）。
- **IN-01 陷阱：** `src/index.css` 有 `[tabindex="-1"]:focus { outline: none; }`。roving 群組中未選中的 chip 是 `tabIndex=-1`，如果在 state 更新前就 `focus()`，焦點環在那一瞬間會被規則吃掉（重渲染成 0 之後才恢復）。建議本 phase 把這條規則收斂成 `main[tabindex="-1"]:focus`（Phase 8 REVIEW IN-01 已預告這個問題）。
- **測試（user-event 可用，專案已在使用）：**
```tsx
const user = userEvent.setup();
const radios = screen.getAllByRole("radio");
expect(radios[0]).toBeChecked();             // 預設變體
expect(radios[0]).toHaveAttribute("tabindex", "0");
expect(radios[1]).toHaveAttribute("tabindex", "-1");
radios[0].focus();
await user.keyboard("{ArrowRight}");
expect(radios[1]).toBeChecked();
expect(radios[1]).toHaveFocus();
await user.keyboard("{End}");   // 最後一個
await user.keyboard("{ArrowRight}"); // 循環回第一個
await user.keyboard("{Home}");
```

### Pattern 5：`useCopyInquiry`（PROD-14、D-08）

```ts
export type CopyStatus = "idle" | "copied" | "failed";
type WriteText = (text: string) => Promise<void>;

/** 預設寫入函式：呼叫當下才讀 navigator.clipboard，並以方法形式呼叫（避免 Illegal invocation） */
const defaultWriteText: WriteText = (text) => {
  const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
  if (!clipboard?.writeText) return Promise.reject(new Error("clipboard unavailable"));
  return clipboard.writeText(text);
};

/**
 * 複製詢價訊息；成功 2 秒後回到 idle，卸載時清除計時器
 * @param text - 要複製的文字；null 時 copy 不動作
 * @param writeText - 寫入函式（測試可注入）
 */
export function useCopyInquiry(text: string | null, writeText: WriteText = defaultWriteText) { … }
```
關鍵細節：
- **使用者手勢：** 在 click handler 中**同步**呼叫 `writeText`，呼叫前不要先 `await` 任何東西，否則 Safari 會因為失去 transient activation 而拒絕 [ASSUMED]。
- **secure context：** `navigator.clipboard` 只在 HTTPS 或 localhost 存在。用區網 IP（`http://192.168.x.x:5173`）在手機上測試時會走失敗分支，這是預期行為。UAT 請用 localhost 或 production。
- **Illegal invocation：** 不要寫 `const w = navigator.clipboard.writeText; w(text)`，一定要以方法形式呼叫。
- **計時器：** 用 `useRef<number | null>` 存 timer id。每次 copy 先 `clearTimeout`；失敗時也清除；effect cleanup 時 `clearTimeout`。另外用 `mountedRef` 防止「promise 在卸載後才 resolve、又設了新 timer」。
- 失敗狀態保持到下一次嘗試（UI-SPEC 沒有說要自動消失）。
- **aria-live：** `aria-live="polite"` 的容器必須在掛載時就存在（包住按鈕與失敗訊息），不能等狀態改變才出現。
- 詢價文字以純函式 `buildInquiryText(name, model, url)` 產生，model 為 null 或只有空白時省略中段：`BB1｜https://…`；有型號時為 `UHF 組｜型號 MG-U200｜https://…`（分隔符號是全形「｜」）。頁面傳入 `window.location.href`。

**測試手法：**
- **user-event 會掛 clipboard stub**：`userEvent.setup()` 會呼叫 `attachClipboardStubToView`，以 getter 覆蓋 `navigator.clipboard`。專案沒有開 vitest globals，所以 user-event 不會自動重設這個 stub [VERIFIED: node_modules/@testing-library/user-event/dist/esm/setup/setup.js、utils/dataTransfer/Clipboard.js]。因此：
  - hook 單元測試用 `renderHook(() => useCopyInquiry(text, writeText))`，**直接注入** `vi.fn()`，完全不碰 navigator。
  - 頁面／元件整合測試要驗證預設路徑時，在 `userEvent.setup()` **之後**執行 `vi.spyOn(navigator.clipboard, "writeText")`；要測「不可用」時，在 setup 之後用 `Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })`。
- **2 秒還原與卸載清除**（沿用專案 FeaturedCarousel 的 fake timers + act 寫法）：
```tsx
vi.useFakeTimers();
const writeText = vi.fn().mockResolvedValue(undefined);
const { result, unmount } = renderHook(() => useCopyInquiry("文字", writeText));
await act(async () => { await result.current.copy(); }); // 讓 promise 的 microtask 跑完
expect(result.current.status).toBe("copied");
act(() => { vi.advanceTimersByTime(1999); });
expect(result.current.status).toBe("copied");
act(() => { vi.advanceTimersByTime(1); });
expect(result.current.status).toBe("idle");
// 卸載清除：copied 狀態下卸載後，不應留下任何計時器
await act(async () => { await result.current.copy(); });
unmount();
expect(vi.getTimerCount()).toBe(0);
vi.useRealTimers();
```
- 若在 fake timers 下使用 user-event，必須寫 `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`，否則 user-event 內部的 delay 會卡住。比較簡單的做法是元件層改用 `fireEvent.click` 搭配 `await act(async …)`。

### Pattern 6：詳情內容的資料推導（PROD-08/09/10）

```ts
const selected = product.variants.find((v) => v.id === selectedId) ?? null;
const priceText = selected?.priceText ?? null;            // 無變體 → null → 價格請來電（D-01）
const inStock = selected ? selected.inStock : product.inStock;
const imageUrl = selected?.imageUrl ?? product.imageUrl;  // 變體有圖才換
```
- 主圖：沿用 ProductCard 的 `failedImageUrl` 模式（以網址記錄失敗）；`imageUrl !== null && imageUrl !== failedImageUrl` 時才渲染 `<button aria-label={`放大查看 ${name} 圖片`}>`，否則渲染 `ImagePlaceholder`（不是按鈕）。`<img fetchPriority="high">`（React 19 支援）。
- 規格表列：SKU（有選中變體時）→ `selected.attributes` 每一項 `{key}: {value}` → 保固（`warrantyMonths !== null`）。沒有任何列時整個 `<dl>` 隱藏。
- 變體標籤：`attributes.map(a => a.value).join(" / ")`，空陣列時用 `sku`。
- 說明：`description` trim 後為空就整區隱藏；有內容時 `<p className="whitespace-pre-line text-body text-ink">{description}</p>`。
- 品牌 · 型號行：只用非空的值以「 · 」串接，兩個都空就整行不渲染。示意稿顯示為「MICGO · 型號 MG-U200」，見 A3。
- 價格區塊（有價）：標題直接用 `priceText`（`formatPrice` 產生 `NT$1,200`，沒有空格；UI-SPEC 範例寫「NT$ 12,345」，但 D-01 鎖定不改 format.ts，以 D-01 為準），再加「含稅」Label。

### Pattern 7：全域 `*` 路由與 NotFound（PROD-16、D-05）

```tsx
<Route path="/products/:id" element={<ProductDetailPage />} />
<Route path="*" element={<NotFoundPage />} />
```
- v6 依路由權重排序，與宣告順序無關；8 條舊路由、`/`、`/abouts` 的比對完全不受影響 [CITED: reactrouter.com v6 route ranking]。
- `/products`（沒有 id）與 `/products/a/b` 都會落到 `*`，顯示全域 NotFound；這是合理行為，可以加一項測試。
- **App.test 影響：** 既有 11 項（2 項 + 8 項 each + 1 項切換）完全不變，因為它們都比對到明確路徑；`Layout` 在 App.test 中被 mock 成 `<div>`，所以 `mobileBar` prop 會被忽略，NotFoundPage 也能在 mock 下正常渲染 h1。新增測試要**補 mock**：`vi.mock("./services/productDetail", partial)`（照 useProductDetail.test 的寫法）讓 `/products/:uuid` 有資料；`fetchProducts` 已被 automock，可以斷言「詳情路由不呼叫 fetchProducts」。
- Cloudflare Pages：沒有頂層 404.html 時，「Pages assumes that you are deploying a single-page application」，任何非靜態資源路徑都回到根目錄 [CITED: developers.cloudflare.com/pages/configuration/serving-pages/]。所以 production 也會由客戶端顯示 NotFound，但 HTTP 狀態仍是 200（soft 404）。UI-SPEC 明定不加 404.html，這點接受。
- NotFound 頁：`<Layout footer="address">`（預設單鈕列）+ `<title>找不到頁面 | KRD</title>` + `<NotFoundState title="找不到這一頁" description="這個網址沒有東西，回到首頁重新逛逛吧。" actionLabel="回到首頁" actionTo="/" />`。
- NotFoundState 標題建議用 **`<h1>` 元素、`text-heading` 字級**：每頁都需要一個 h1，而 UI-SPEC §NotFound 明寫「標題（Heading）」，以元件段落的具體規定為準。測試寫 `getByRole("heading", { level: 1, name: "找不到這一頁" })`。圖示沿用 `AlertIcon`（`text-ink-muted h-12 w-12`），不另做新圖示。

### 反模式
- **`<title>{name} | KRD</title>`**：children 是多段，標題會變成空字串（已實測）。
- **用 `useMediaQuery` 決定渲染行內 CTA 或固定列**：測試會依 matchMedia mock 而不穩定。改用純 CSS：行內用 `hidden md:flex`、固定列用 `md:hidden`，兩者都在 DOM 中，accessible name 不同（「複製詢價訊息」vs「複製詢價」、「打電話問 (04) 2279-8787」vs「打電話問問」）。
- **在詳情頁 import `useProducts`／`fetchProducts`**：違反 D-12。
- **`dangerouslySetInnerHTML` 渲染說明**：違反 D-12。
- **把 class 字串放進 `.ts`**：designTokens 掃不到（IN-05）。
- **在 NotFoundState 內渲染 `<title>`**：會跟頁面的 title 重複。

## 不要自己造輪子

| 問題 | 不要自己做 | 改用 | 原因 |
|------|------------|------|------|
| 分頁標題／meta | react-helmet、手寫 head 操作 | React 19 原生 `<title>`／`<meta>` | 零依賴，卸載會自動移除（已實測） |
| 燈箱 | 新的 modal | 既有 `ImageModal` | Phase 8 已補 dialog 語意、焦點鎖定與還原 |
| 缺圖 | 新的 placeholder | `ImagePlaceholder` | `role="img"`、`暫無圖片` 已是契約 |
| 載入／錯誤分類 | 頁面內 try/catch、自己判斷 404 | `useProductDetail` 判別聯合 | Phase 7 已處理 UUID、abort、429 |
| 分類標題 | 寫死「擴大機 / 喇叭」 | `PRODUCT_PAGES` + `PRODUCT_PAGE_VIEWS` | 單一來源（D-02） |
| 電話／地址 | 寫死字串 | `CONTACT`（designTokens 會掃「2279」「永平路」） | SHELL-03 單一來源測試 |
| 價格格式 | 新的 formatter | `variant.priceText` | D-01 不改 format.ts |

## 常見陷阱

### 陷阱 1：`<title>` children 不是單一字串
**會發生什麼：** 標題變成空白，而且 React 會在 console 發出警告。**避免方法：** 一律寫 `{`${name} | KRD`}`。**偵測：** 標題測試用 `toBe("… | KRD")` 斷言。

### 陷阱 2：user-event 的 clipboard stub 蓋掉自己的 mock
**會發生什麼：** 先 `defineProperty(navigator,"clipboard",…)` 再呼叫 `userEvent.setup()`，你的 mock 會被 stub 覆蓋，「不可用」的測試因此誤判為成功。**避免方法：** hook 用依賴注入；頁面測試在 setup 之後才 spy 或覆蓋。

### 陷阱 3：多個「打電話問問」連結造成查詢歧義
**會發生什麼：** 在 jsdom 中 NavBar（md+）的「打電話問問」與固定列的同名連結同時存在，`getByRole` 會丟出 multiple elements 錯誤。**避免方法：** 給 DetailMobileBar 加 `data-testid="detail-mobile-bar"`（專案已有 data-testid 慣例），再用 `within()` 限定範圍。複製成功後行內按鈕與固定列按鈕都會顯示「已複製」，要用 `getAllByRole` 或 `within`。

### 陷阱 4：`[tabindex="-1"]:focus` 吃掉 roving chip 的焦點環
見 Pattern 4，建議把規則收斂成 `main[tabindex="-1"]:focus`。這項改動在 jsdom 測不到，要靠 UAT 目視確認。

### 陷阱 5：design token 掃描誤判
新 `.tsx` 不能出現以下寫法：`p-3`／`px-5`／`gap-3`／`mt-10` 等非 token 間距（只允許 0、1、2、4、6、8、12、16、24、px）；`sm:`／`lg:`／`2xl:`；`font-bold`／`font-medium`；`text-sm`／`text-xl`；單獨的 `rounded`、`rounded-lg`；單獨的 `shadow`、`shadow-md`；`slate-*`／`gray-*`；任何 `#hex`（**連註解與字串裡的 `#abc` 也會命中**，例如錨點 `#face`）；`rgba(`；`hover:translate-`／`hover:scale-`；`outline-none`；`text-white`。
可以使用：`bg-white`（圖容器）、`bg-tape/80`、任意值 `w-[120px]`、`-rotate-[1.2deg]`、`grid-cols-[2fr_3fr]`、`xl:grid-cols-[5fr_6fr]`、`grid-cols-[96px_minmax(0,1fr)]`、`[overflow-wrap:anywhere]`（Tailwind 3.4 沒有 `wrap-anywhere`）、`border-8 md:border-[16px]`、`shadow-card-lg`（8px）、`shadow-btn`、`shadow-float`、`h-14`（56px）、`h-11`（44px）、`h-9`（36px，`h` 不在間距規則內）。
UI-SPEC 數值對應：單欄 gap 24 → `gap-6`；xl 雙欄 gap 48 → `xl:gap-12`；價格區塊 padding 16/24 → `py-4 px-6`；`<dl>` row-gap 8 → `gap-y-2`；NotFound 面板 `p-8`、外層 `py-16`。

### 陷阱 6：BrowserRouter 的 key 在 hash 導覽後變回 "default"
**會發生什麼：** 站內進入詳情頁後，若使用 skip link（`#main`），瀏覽器會產生沒有 state 的 hash 歷史項目，router 的 key 因此變成 `"default"`，返回鈕改為連到分類頁。**評估：** 此時 `navigate(-1)` 只會回到同一頁不含 hash 的版本，改成分類連結反而合理。接受，不處理（LOW）[ASSUMED]。

### 陷阱 7：狀態轉換造成 Layout 重掛
**避免方法：** ProductDetailPage 只寫一個 `<Layout>`，各狀態放在 children 中，`mobileBar` 依狀態切換。

### 陷阱 8：在 `.ts` 檔匯出 class 字串常數
designTokens 掃不到。樣式常數放在 `.tsx` 元件檔內（比照 ProductPageTemplate 的 `PRIMARY_BUTTON_CLASS`）。

## 程式碼範例

### findCategoryPage（D-02）
```ts
import { PRODUCT_PAGES } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

/** 分類頁連結資訊 */
export interface CategoryPageLink { path: string; title: string; }

const FALLBACK: CategoryPageLink = { path: "/all-products", title: PRODUCT_PAGE_VIEWS["/all-products"].title };

/**
 * 由後端 category 反查分類頁；找不到時退回所有商品
 * @param category - 後端商品分類（例如「喇叭」）
 * @returns 分類頁路徑與標題
 */
export function findCategoryPage(category: string): CategoryPageLink {
  const page = PRODUCT_PAGES.find((p) => "category" in p.query && p.query.category === category);
  return page ? { path: page.path, title: PRODUCT_PAGE_VIEWS[page.path].title } : FALLBACK;
}
```
（`"喇叭"` → `{ "/trumpet", "擴大機 / 喇叭" }`；`"耳機"` → 所有商品。品牌頁沒有 category，自然不會被比對到。`query` 的型別是 `as const` 聯集，實作時需確認 `"category" in` 的收窄能通過 tsc；也可以用 `(p.query as ProductPageQuery).category`。）

### buildMetaDescription（D-04）
```ts
/** 說明前 80 字（以字元計，換行與連續空白壓成一個空白）；無說明時用「品牌 型號 分類」 */
export function buildMetaDescription(p: Pick<ProductDetail, "description" | "brand" | "model" | "category">): string {
  const text = (p.description ?? "").replace(/\s+/g, " ").trim();
  if (text) return Array.from(text).slice(0, 80).join("");
  return [p.brand, p.model, p.category].map((s) => s?.trim()).filter(Boolean).join(" ");
}
```
（用 `Array.from` 以 code point 切字，避免把 emoji 或罕用字切半。真實樣本 BB1：`MICGO 喇叭`。）

## 確切字串表（UI-SPEC Copywriting Contract，逐字）

| 位置 | 字串 | 備註 |
|------|------|------|
| 頁面標題（成功） | `{商品名稱} \| KRD` | D-04 |
| 頁面標題（找不到商品） | `找不到商品 \| KRD` | |
| 頁面標題（全域） | `找不到頁面 \| KRD` | |
| description（無說明） | `{品牌} {型號} {分類}`（去空值） | |
| 麵包屑 | `首頁` › `{分類標題}` › `{商品名稱}`；`<nav aria-label="麵包屑">`；分隔符號 `›` 加 `aria-hidden` | |
| 返回（有歷史） | `← 回上一頁` | |
| 返回（備援 Link） | `← 回到{分類名稱}` | Copywriting「備援：回到{分類名稱}」 |
| 主圖 aria-label | `放大查看 {商品名稱} 圖片` | |
| 放大看 pill | `放大看`（`aria-hidden`） | |
| 燈箱 | dialog `商品大圖`、關閉 `關閉圖片`、img alt `產品詳細圖片` | 既有，不改 |
| 無圖 | `暫無圖片` | 既有 |
| 品牌 · 型號 | `{brand} · {model}` | 見 A3 |
| 價格（無價）標題／說明 | `價格請來電` ／ `這個商品沒有標價，打個電話問，我們直接報給你。` | D-01 |
| 價格（有價） | `{priceText}` + `含稅` | |
| 變體區 | 標題 `選規格`；radiogroup `aria-label="選擇規格"`；缺貨 chip 內 `洽詢交期` | |
| 現貨 | `有現貨` ／ `洽詢交期` | |
| 行內主 CTA | `打電話問 {contact.phone}` → `打電話問 (04) 2279-8787` | 用 `CONTACT.phone` |
| 行內次 CTA | `複製詢價訊息` → 成功 `已複製`（+ check 圖示） | |
| LINE | `LINE 問問`（僅 `lineUrl` 有值時；`target="_blank" rel="noopener noreferrer"`） | 目前不渲染 |
| 手機固定列 | `複製詢價`（成功 `已複製`）／ `打電話問問` | |
| 複製失敗 | `複製失敗，請手動選取網址`（`danger`） | |
| 複製內容 | `{商品名稱}｜型號 {model}｜{完整網址}`；無型號：`{商品名稱}｜{完整網址}` | 全形「｜」 |
| 說明標題 | `商品說明` | |
| 規格表 dt | `SKU`、`{attribute key}`、`保固` | |
| 找不到商品 | 標題 `找不到這個商品`；內文 `它可能已經下架，或是網址打錯了。回到所有商品逛逛吧。`；按鈕 `回到所有商品` → `/all-products` | |
| 找不到頁面 | 標題 `找不到這一頁`；內文 `這個網址沒有東西，回到首頁重新逛逛吧。`；按鈕 `回到首頁` → `/` | |
| 可重試錯誤 | 標題 `商品暫時載入不出來`；內文 `可能是網路不穩或我們這邊在忙，等一下再試試看。`；按鈕 `重新載入` | |
| 429 | 標題同上；內文 `現在逛的人有點多，等幾秒再試一次。` | Copywriting 只定義 429 內文 |
| 頁尾 | `© KRD・{address}・{businessHours}`（Layout `footer="address"`） | |

## 執行期狀態盤點

不適用：本 phase 是新增功能，不是改名或遷移。

## 現況與新做法

| 舊做法 | 現行做法 | 影響 |
|--------|----------|------|
| react-helmet／useEffect 設定 document.title | React 19 原生 `<title>`／`<meta>` hoist | 不需要新依賴；卸載會自動移除 |
| `document.execCommand("copy")` | `navigator.clipboard.writeText` | execCommand 已 deprecated；D-08 鎖定使用 Clipboard API，失敗時顯示文案，不做 execCommand 備援 |

## 假設紀錄

| # | 假設 | 所在段落 | 若錯誤的風險 |
|---|------|----------|--------------|
| A1 | Safari 的 `writeText` 必須在 click handler 中同步呼叫（不能先 await） | Pattern 5 | 低：照建議寫法本來就是同步呼叫 |
| A2 | 保固顯示格式：`warrantyMonths % 12 === 0` → `{n/12} 年`，否則 `{n} 個月`（示意稿顯示「1 年」，UI-SPEC 沒有明列） | Pattern 6 | 低：純文案，planner 可以改 |
| A3 | 品牌 · 型號行沿用示意稿，型號前加「型號 」（`MICGO · 型號 MG-U200`）；UI-SPEC 只寫「品牌 · 型號」 | 字串表 | 低：純呈現；建議依示意稿（UI-SPEC：「本文與示意稿有出入時以示意稿為準」） |
| A4 | hash 導覽讓 key 變回 default 是可接受的行為 | 陷阱 6 | 低 |

## Open Questions

1. **非 success 狀態使用哪一種固定列？** — **RESOLVED：** loading／notFound／error 使用預設單鈕 `MobileCallBar`，只有 success 使用雙鈕列。理由：UI-SPEC 規定 NotFound 用單鈕列；商品不存在時沒有可以複製的內容。
2. **base 的複製失敗訊息放在哪裡？** — **RESOLVED（planner 採建議）：** 失敗訊息放在 DetailMobileBar 內、按鈕上方 `col-span-2`，同在 `aria-live` 容器；成功態根元素加 `pb-8 md:pb-0` 補償（09-03、09-04），UAT 檢查 320 寬遮擋。原建議： 放在 DetailMobileBar 內、按鈕上方，跨兩欄（`col-span-2`），一起包在 `aria-live` 容器裡。代價是失敗時固定列會增高約 32px，可能暫時遮住頁尾一行；可接受，或讓 ProductDetailPage 成功態額外加 `pb-8` 補償。UAT 需要檢查 320 寬時的遮擋情況。
3. **NotFoundState 標題的層級** — **RESOLVED：** 使用 `<h1>`，字級為 `text-heading`（理由見 Pattern 7）。
4. **loading／error 是否設定頁面標題？** — **RESOLVED：** 不設定（維持 KRD），因為 Copywriting 沒有定義。
5. **ImageModal 關閉鈕 label** — **RESOLVED：** 現有 label 已經是 `關閉圖片`，不需要修改，也不會連動 ProductPageTemplate 的測試。
6. **新增 CopyIcon／CheckIcon** — **RESOLVED：** 加到 `icons.tsx`，並把對應項目加進 `icons.test.tsx` 的 `ICONS` 陣列（每個 +1 項測試）。ZoomIcon 可選（「放大看」pill 在示意稿中有 gap，暗示有圖示），由 planner 決定。
7. **production 沒有多變體、有價格的商品，UAT 如何驗證？** — **RESOLVED（planner）：** 由 VariantSelector／PriceBlock／ProductDetailView 元件測試涵蓋；UAT（09-05）無資料時這兩項標 human-needed。原說明： 變體切換與有價格的版面以元件測試涵蓋；UAT 中若 20 筆商品都只有單一變體且價格為 null，就把這兩項標為 human-needed（待後端有資料時再驗）。
8. **index.css IN-01 要不要在本 phase 修？** — **RESOLVED（建議修）：** 本 phase 第一次出現 roving tabindex，正是 IN-01 預告的情境。只改一行 CSS，放在 Plan 02。

## 環境可用性

| 依賴 | 用途 | 可用 | 版本 | 備援 |
|------|------|------|------|------|
| Node.js | 建置與測試 | ✓ | v24.13.0 | — |
| npm 依賴 | 全部 | ✓ | 已安裝，`npx vitest run` 413/413 通過、`npm run lint` 無問題 | — |
| chrome-devtools MCP | D-14 UAT | 由主 session 提供（Phase 8 已使用過） | — | 無法使用時改列 human-needed |
| 公開 API（Vite proxy → api.krd.com.tw） | UAT | 本研究未呼叫（限制：不打外部 API） | — | — |

`main` 與 `redesign` 的分歧：`git log redesign..main` 沒有輸出，目前 main 沒有新 commit（D-15 收尾時要再檢查一次）。

## Validation Architecture

### 測試框架
| 屬性 | 值 |
|------|----|
| 框架 | Vitest 4.1.12（projects：unit=node `src/**/*.test.ts`；component=jsdom `src/**/*.test.tsx`，setup `src/test/setup.ts`） |
| 設定檔 | `vite.config.ts` 的 `test.projects` |
| 快速執行 | `npx vitest run <檔案路徑>` |
| 完整套件 | `npm test && npm run lint && npm run build` |
| 數量檢查 | `npx vitest list \| wc -l`（起點 413，每個 plan 不得減少） |

### 需求 → 測試對照
| 需求 | 行為 | 類型 | 自動化指令 | 檔案存在？ |
|------|------|------|------------|------------|
| PROD-08 | 名稱、品牌·型號、分類 tag、說明 pre-line、保固 null 隱藏 | component | `npx vitest run src/pages/ProductDetailPage.test.tsx src/components/SpecTable.test.tsx` | ❌ 新增 |
| PROD-09 | radiogroup 只在 ≥2 時出現、預設選中、方向鍵與 Home/End、切換後價格／現貨／SKU／主圖同步 | component | `npx vitest run src/components/VariantSelector.test.tsx src/pages/ProductDetailPage.test.tsx` | ❌ |
| PROD-10 | 無價顯示價格請來電 + 說明；有價顯示 priceText + 含稅；無變體視為無價；CTA 保留 | component | `npx vitest run src/components/PriceBlock.test.tsx` | ❌ |
| PROD-11 | 主圖 button 開啟 dialog「商品大圖」；無圖時為 `img` 暫無圖片，沒有 button | component | `npx vitest run src/pages/ProductDetailPage.test.tsx` | ❌ |
| PROD-12 | 麵包屑 href；直接開網址時備援 Link 指向分類 path；站內進入時按鈕 navigate(-1) | component | 同上 | ❌ |
| PROD-12 | findCategoryPage 對應與退回 | unit | `npx vitest run src/config/categoryPage.test.ts` | ❌ |
| PROD-13 | notFound 顯示商品版 NotFoundState；非 UUID 不發請求；error 時 role=alert + retry 被呼叫；429 文案 | component | `npx vitest run src/pages/ProductDetailPage.test.tsx src/components/NotFoundState.test.tsx` | ❌ |
| PROD-14 | 複製文字格式（有／無型號）、成功→已複製→2 秒還原、失敗文案、卸載清除計時器 | unit + component | `npx vitest run src/pages/productDetailText.test.ts src/hooks/useCopyInquiry.test.tsx src/components/DetailCta.test.tsx src/components/DetailMobileBar.test.tsx` | ❌ |
| PROD-15 | 標題／description 正確，卸載後回到 KRD；notFound 標題；全域標題 | component | `npx vitest run src/pages/ProductDetailPage.test.tsx src/pages/NotFoundPage.test.tsx` | ❌ |
| PROD-16 | 未知路徑、`/products` 顯示「找不到這一頁」；舊路由不受影響 | component | `npx vitest run src/App.test.tsx` | ✅ 擴充 |
| D-11 | Layout 預設單鈕列，傳入 slot 時取代 | component | `npx vitest run src/components/Layout.test.tsx` | ✅ 擴充 |
| D-12 | 詳情頁不呼叫 fetchProducts；不使用 innerHTML | component + 原始碼掃描 | App.test 斷言 `fetchProducts` 未被呼叫；可選：比照 noAirtable.test 用 `import.meta.glob` 掃描 `ProductDetailPage.tsx` 不含 `dangerouslySetInnerHTML` | 部分 |
| D-13 | token 規則 | unit | `npx vitest run src/designTokens.test.ts` | ✅ |

### 取樣頻率
- **每個 task commit：** 跑該檔的 `npx vitest run <file>`，再跑 `npm test && npm run lint && npm run build`（D-13 規定每個 commit 都要全綠）
- **每個 wave 結束：** 完整套件 + `npx vitest list | wc -l`
- **Phase gate：** 完整套件全綠 + 09-UAT.md 完成

### Wave 0 缺口
無。框架、setup、user-event、jest-dom 都已具備。新測試檔隨各 plan 的 TDD RED 一起建立。

### 瀏覽器 UAT 步驟（D-14，給收尾 plan）
1. `npm run dev -- --port 5173 --strictPort`（Vite proxy → production API）。
2. 真實 id：`6d660a71-98b6-4b18-95ee-a2175aeab9c8`（BB1，取自 07-API-SAMPLES：model null、description null、warranty null、單一變體、價格 null、`in_stock=false`）。可預期：沒有 radiogroup、顯示「價格請來電」、顯示「洽詢交期」、沒有說明區、規格表只有 SKU、標題 `BB1 | KRD`、description `MICGO 喇叭`、麵包屑「擴大機 / 喇叭」→ `/trumpet`、有主圖可開燈箱。若 id 已失效，開 `/all-products` 後從 devtools network 的 `/api/v1/public/products?limit=100` 回應取一個 id（只會產生頁面本來就會發的那次請求）。
3. 320／768／1440 各截圖一次：320 有雙鈕固定列、沒有行內 CTA；768 與 1440 有行內 CTA、沒有固定列；1440 為兩欄 5fr/6fr；320 寬時 `scrollWidth === 320`；固定列不遮住頁尾。
4. 燈箱：點主圖 → dialog 開啟、焦點在關閉鈕；Esc 關閉後焦點回到主圖。
5. 複製：localhost 下點「複製詢價訊息」→ 按鈕變「已複製」，約 2 秒後還原；用 `navigator.clipboard.readText()` 驗證內容格式（可能需要權限，不行就標 human-needed）。
6. 返回：(a) 新分頁直接開詳情 → 顯示「← 回到擴大機 / 喇叭」連結；(b) 從 `/trumpet` 在網址列以 SPA 方式導航進入（Phase 10 前沒有卡片連結，可以用 `history.pushState` + `popstate`，或在 devtools evaluate 中觸發 router 導航）→ 顯示「← 回上一頁」，點擊回到 `/trumpet`。站內進入若無法自動化，標 human-needed。
7. `/products/00000000-0000-4000-8000-000000000001` → 「找不到這個商品」、標題 `找不到商品 | KRD`、按鈕連到 `/all-products`。
8. `/products/not-a-uuid` → 同上，且 network 中**沒有**詳情請求。
9. `/whatever-404` → 「找不到這一頁」、標題 `找不到頁面 | KRD`、按鈕連到 `/`、有單鈕固定列。
10. 離開詳情頁（點 Logo 回首頁）→ 分頁標題回到「KRD」。
11. 變體切換、有價格版面：production 沒有資料時標 human-needed。
12. 鍵盤：Tab 進入 radiogroup 時確認焦點環可見（陷阱 4；只有在有多變體商品時才能驗證）。

## 建議 plan 切分

| Plan | Wave | 依賴 | 檔案 | 內容 | 預期新增測試 | 累計 |
|------|------|------|------|------|-------------|------|
| 09-01 純函式、hook、圖示 | 1 | — | `config/categoryPage.ts(+test.ts)`、`pages/productDetailText.ts(+test.ts)`、`hooks/useCopyInquiry.ts(+test.tsx)`、`components/icons.tsx`、`icons.test.tsx` | findCategoryPage（4 個分類 + 品牌頁不會命中 + 退回）約 4；buildInquiryText（有／無型號、空白型號）約 3、buildMetaDescription（截 80、壓空白、退回、全 null）約 4、variantLabel（屬性／sku）約 2、formatWarranty（年／月）約 2；useCopyInquiry（成功寫入正確文字、2 秒還原、失敗：reject、失敗：不可用、null 不動作、卸載清除）約 6；icons +2 | ≈ +23 | ≈ 436 |
| 09-02 骨架擴充與全域 NotFound | 1（與 01 平行，檔案不重疊） | — | `components/Layout.tsx(+test)`、`components/NotFoundState.tsx(+test)`、`pages/NotFoundPage.tsx(+test)`、`App.tsx`、`App.test.tsx`、`index.css` | Layout slot +2；NotFoundState（標題、說明、按鈕 href、h1）約 3；NotFoundPage（全域文案、標題 `找不到頁面 \| KRD` 與卸載還原、頁尾地址版）約 3；App（未知路徑、`/products`、舊路由仍正常）+2；IN-01 CSS | ≈ +10 | ≈ 446 |
| 09-03 詳情子元件 | 2 | 01（CopyStatus、icons、helper） | `components/VariantSelector.tsx`、`PriceBlock.tsx`、`SpecTable.tsx`、`DetailCta.tsx`、`DetailMobileBar.tsx`（各自 +test） | VariantSelector 約 8；PriceBlock 3；SpecTable 4；DetailCta（tel href 與文字、複製按鈕呼叫 onCopy、已複製、失敗文案、LINE 有／無）約 5；DetailMobileBar（兩鈕、tel、md:hidden + fixed、已複製）約 4 | ≈ +24 | ≈ 470 |
| 09-04 詳情頁組裝與路由 | 3 | 02、03 | `pages/ProductDetailPage.tsx(+test)`、`App.tsx`、`App.test.tsx` | 頁面：loading aria-busy、成功欄位、說明 pre-line、變體切換連動（價格／現貨／SKU／主圖）、燈箱開啟、無圖不可點、麵包屑、兩種返回、notFound + 標題、error + retry、429、標題／description／卸載還原、成功時雙鈕列與 notFound 時單鈕列、複製整合（DI 或 spy）約 18；App：`/products/:uuid` 顯示 h1 且 fetchProducts 未被呼叫、`/products/not-a-uuid` 不呼叫 fetchProductDetail +2 | ≈ +20 | ≈ 490 |
| 09-05 UAT 與收尾 | 4 | 04 | `09-UAT.md`、`uat/*.png` | D-14 瀏覽器 UAT（主 session）、D-15 main 合併檢查、`npx vitest list` 最終計數 | 0 | ≈ 490 |

- 09-01 與 09-02 沒有共用檔案，可以平行。App.tsx 由 02（加 `*`）與 04（加 `/products/:id`）先後修改，wave 已錯開。
- 若 planner 想減少 plan 數，可以把 03 併入 04，但 04 會變得很大（約 45 項測試）。建議維持 5 個。
- 每個 plan 都要記錄 `npx vitest list | wc -l` 的前後值。

## Security Domain

| ASVS 類別 | 適用 | 控制方式 |
|-----------|------|----------|
| V2 認證／V3 Session／V4 存取控制 | 否 | 公開唯讀 API，無登入 |
| V5 輸入驗證 | 是 | `:id` 由 `isUuid` 驗證（Phase 7）；說明以 React 文字節點輸出（自動跳脫），禁用 `dangerouslySetInnerHTML`；meta content 由 React 跳脫 |
| V6 密碼學 | 否 | — |
| V14 設定 | 是 | 不含憑證；`npm run build` 的 dist 掃描 |

| 威脅 | STRIDE | 緩解 |
|------|--------|------|
| 後端說明欄位夾帶 HTML／script | Tampering／XSS | 純文字渲染 + `whitespace-pre-line` |
| 外部 LINE 連結 tabnabbing | Tampering | `rel="noopener noreferrer"` |
| 圖片網址指向任意網域 | Info disclosure | 只當作 `<img src>` 使用，不注入 href；後端控管圖片網域 |
| 前端夾帶憑證 | Info disclosure | noAirtable.test + check-dist |

## 參考來源

### 主要（HIGH）
- 本機實驗：react-dom 19.1.0 + jsdom 29.1.1 的 `<title>`／`<meta>` hoist、更新、卸載與多段 children 行為（腳本放在 scratchpad，未進 repo）
- `node_modules/@remix-run/router/dist/router.js` 第 69–70、182、222 行：key `"default"` 與 initialIndex
- `node_modules/@testing-library/user-event/dist/esm/setup/setup.js`、`utils/dataTransfer/Clipboard.js`：clipboard stub
- https://react.dev/reference/react-dom/components/title：hoist、單一字串、多個 title 時行為未定義
- https://developers.cloudflare.com/pages/configuration/serving-pages/：沒有 404.html 時採 SPA fallback
- 專案檔案：09-CONTEXT、06-UI-SPEC、mockups detail-*、07-API-SAMPLES、08-REVIEW（IN-01、IN-05）、src/*

### 次要（MEDIUM）
- WAI-ARIA APG Radio Group pattern（鍵盤行為；依訓練知識整理，本次未重新抓取原文）

### 第三級（LOW）
- Safari clipboard transient activation 細節（A1）

## 中繼資料

**信心評估：**
- 技術棧：HIGH，版本取自 node_modules，不新增套件
- 架構：HIGH，關鍵行為已用原始碼與實驗驗證
- 陷阱：HIGH／MEDIUM，clipboard stub 與 title 已驗證；Safari 細節為 LOW

**研究日期：** 2026-11-11
**有效期限：** 30 天（技術棧穩定）
