# Architecture Patterns — v1.1 UI 重新設計與商品詳情頁

**Domain:** 既有 Vite + React 19 SPA（KRD 官網）新增整體視覺改版與 `/products/:id` 詳情頁
**Researched:** 2026-11-10
**Confidence:** HIGH（整合點皆由讀取現有程式碼與後端 `src/modules/public/` 原始碼驗證）；Cloudflare SPA fallback 行為為 MEDIUM（依 Pages 預設行為與專案現況推論，需部署後以預覽網址實測）

---

## 一、結論摘要

1. **不需要新架構，沿用現有分層**：Entry/Routing → Pages → Components → Config/Content → Services。詳情頁只是在每一層各加一個檔案。
2. **詳情資料走與列表相同的路徑**：`apiTypes.ts`（原始型別）→ `products.ts`（`fetchProductDetail`，含 type guard、`normalizeError`）→ `transform.ts`（`toProductDetail`）→ hook → 頁面。**不要**重用 `toProduct`，因為詳情回應沒有 `featured_group / price_min / price_max`，而多了 `variants`。
3. **404 用 `ApiError.status === 404` 判斷**：`errors.ts` 已把 HTTP 錯誤保留為 `kind: "http"` 加 `status`，不需改 errors.ts；後端對「不存在的 UUID」回 404（`PRODUCT_NOT_FOUND`），對「非 UUID」回 400（`VALIDATION_FAILED`）。兩者前端都應呈現「找不到商品」頁，但 429/網路錯誤要顯示可重試的錯誤。
4. **建置順序：先 tokens 與 shell，再卡片／輪播改連結，詳情頁資料層可平行**。詳情頁的資料層（types / service / transform / hook）與視覺無關，可在 token 階段同時做；詳情頁的 UI 放在 token 與 shell 之後，才不會做兩次。
5. **最大的測試風險是 `ProductCard` 與 `FeaturedCarousel` 的互動語意改變**（目前整張卡片是 `role="button"` 開燈箱），這是本里程碑唯一需要「先決策再動手」的架構點，見第四節。

---

## 二、現況與目標架構

### 新增與修改一覽（明確區分）

| 項目 | 新／改 | 檔案 | 說明 |
|------|--------|------|------|
| 設計 tokens | 改 | `tailwind.config.js`、`src/index.css` | 在 `theme.extend` 加語意色、字級、陰影、圓角；`index.css` 的 `.glass-card` 等共用 class 改為引用 token |
| Layout 殼 | 改 | `src/components/Layout.tsx`、`NavBar.tsx`、`SideMenu.tsx`、`Footer.tsx` | 改版；NavBar 解決 WR-04（1024px 換行）；保持 `NAV_ITEMS` 為唯一導覽來源 |
| 詳情原始型別 | 新增 | `src/services/apiTypes.ts` | 加 `PublicVariantApi`、`PublicProductDetailApi`、`PublicProductDetailResponse` |
| 詳情 service | 新增 | `src/services/products.ts` | 加 `fetchProductDetail(id, client, options)` |
| 詳情 transform | 新增 | `src/services/transform.ts` | 加 `ProductDetail`、`ProductVariant`、`toProductDetail` |
| 詳情 hook | 新增 | `src/hooks/useProductDetail.ts` | 比照 `useProducts.ts`（AbortController、retry） |
| 詳情頁 | 新增 | `src/pages/ProductDetailPage.tsx` | `/products/:id` |
| 找不到頁 | 新增 | `src/pages/NotFoundPage.tsx`（或 `components/NotFoundState.tsx`） | 詳情 404 與全域 `*` 路由共用 |
| 路由 | 改 | `src/App.tsx` | 加 `/products/:id` 與 `*` 路由；其餘不動 |
| 卡片 | 改 | `src/components/ProductCard.tsx` | 連到詳情（見第四節） |
| 輪播 | 改 | `src/components/FeaturedCarousel.tsx` | slide 加詳情連結，保留 a11y 行為 |
| 首頁／列表／關於 | 改 | `HomePage.tsx`、`ProductPageTemplate.tsx`、`AboutPage.tsx` | 僅視覺，不動資料流 |
| 價格格式 | 沿用 | `src/services/format.ts` | 變體價 `price_incl_tax` 直接呼叫 `formatPrice`，null 用 `PRICE_ON_REQUEST` |
| 錯誤處理 | 沿用 | `src/services/errors.ts` | 不改；404 以 `status` 判斷 |

### 元件邊界

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `tailwind.config.js` tokens | 色彩／字級／間距／陰影的唯一來源 | 所有元件 className |
| `Layout` | 殼：NavBar + 可選 SideMenu + main + Footer | 所有 pages |
| `ProductDetailPage` | 讀路由參數 `:id`、呼叫 hook、決定 loading／404／錯誤／內容四種狀態 | `useProductDetail`、`Layout`、`ImageModal`、`NotFoundState` |
| `useProductDetail(id)` | 抓取詳情；回傳 `{status, product, error, retry}` | `fetchProductDetail` |
| `fetchProductDetail` | HTTP、驗證回應、轉換 | `apiClient`、`toProductDetail`、`normalizeError` |
| `ProductCard` / `FeaturedCarousel` | 顯示商品並連到 `/products/${id}` | `react-router-dom` `Link` |

### 資料流（新增）

```
URL /products/:id
  → App.tsx <Route path="/products/:id">
  → ProductDetailPage (useParams)
  → useProductDetail(id)  --AbortController-->  fetchProductDetail(id)
        GET {base}/products/{id}  →  isProductDetailResponse() 守衛
        → sanitize（價格/圖片/variants 欄位）→ toProductDetail()
  → 狀態：loading | notFound(404/400) | error(其他, 可 retry) | ready
```

首頁／列表頁資料流**不變**；只有「卡片點擊後去哪裡」改變。

---

## 三、詳情 API 契約（已由後端原始碼驗證）

來源：`../KRD-Inventory-Backend/src/modules/public/dto/public-catalog.dto.ts`、`routes/index.ts`、`schemas/public-catalog.schemas.ts`、`services/public-catalog.service.ts`。

`GET /api/v1/public/products/:id` 回應 `{ success: true, data: PublicProductDetail }`（注意：列表是 `data.items`，詳情是 `data` 直接為商品，type guard 要分開寫）：

```ts
// 新增於 src/services/apiTypes.ts（snake_case，與後端同名、不改名）
export type PublicVariantAttributes = Record<string, string | number | boolean>;

export interface PublicVariantApi {
  id: string;
  sku: string;
  attributes: PublicVariantAttributes; // 後端已白名單過濾，只含 attributeKeys 宣告者
  image_url: string | null;            // 無變體圖時後端已 fallback 商品主圖
  is_default: boolean;
  in_stock: boolean;
  price_incl_tax: number | null;       // 含稅整數「分」；show_price=false 時為 null
}

export interface PublicProductDetailApi {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  warranty_period_months: number | null;
  published_at: string | null;
  in_stock: boolean;
  variants: PublicVariantApi[];        // 已排序：is_default DESC、sku ASC
}
```

重要事實與設計含義：

| 事實 | 影響 |
|------|------|
| 詳情**沒有** `featured_group / price_min / price_max` | 不可重用 `PublicProductApi`／`toProduct`；詳情價格由 `variants[].price_incl_tax` 自行推導（min/max 或選取變體價） |
| `variants` 後端已排序、預設變體在最前 | 前端預設選取 `variants.find(v => v.is_default) ?? variants[0]`，**不要重新排序** |
| `variants` 可能為空陣列（無上架變體） | UI 要處理：顯示「價格洽詢」、庫存依商品層 `in_stock`；不可假設 `variants[0]` 存在 |
| `attributes` 為 free-form 純量 map，key 由商品定義 | 以 `Object.entries` 通用渲染（key: value），不要硬編碼屬性名稱；值可能為 boolean／number，需字串化 |
| 價格單位為「分」且含稅 | 沿用 `formatPrice`（`/100`） |
| 只輸出 `in_stock` boolean，無數量 | 不可顯示「剩 N 件」，只能「有庫存／缺貨」 |
| 不存在的 UUID → 404（`PRODUCT_NOT_FOUND`）；非 UUID → 400（`VALIDATION_FAILED`）；router 尾端 `notFound` 對未知子路徑也回 404 | 前端把 `status` 為 404 或 400 都視為「找不到商品」；但**不要**把所有 `http` 錯誤都當 404（5xx 要可重試） |

型別守衛建議（比照 `isPublicProduct` 的風格）：驗證 `id/name/category` 為字串、`in_stock` 為布林、`variants` 為陣列；`variants` 逐筆驗證 `id/sku` 字串、`in_stock` 布林，格式不符的 variant 略過並 `console.warn`（與列表「略過壞資料」一致），`attributes` 非物件時退為 `{}`，`price_incl_tax` 與 `image_url` 用現有 `toNullableNumber`／字串檢查校正。**把 `toNullableNumber` 抽成可共用**（目前是 `products.ts` 內部函式，直接在同檔新增 `fetchProductDetail` 即可，不必拆檔）。

---

## 四、關鍵決策：卡片／輪播如何連到詳情（現有測試的最大衝擊點）

### 現況（已讀程式碼確認）

- `ProductCard`：整張卡是 `<div role="button" tabIndex=0 aria-label="查看 {name} 大圖">`，點擊／Enter／Space 呼叫 `onImageClick(imageUrl)` 開 `ImageModal`；無圖時沒有互動。`ProductCard.test.tsx`（約 11K）多半針對這個行為。
- `FeaturedCarousel`：slide 顯示 `<img>`；有 `usePrefersReducedMotion`、焦點／指標暫停旗標（`isPointerDownRef`、`hasFocusWithin`）、`role="alert"` 錯誤區、上一張／下一張／圓點按鈕。`FeaturedCarousel.test.tsx` 約 11.5K，覆蓋 a11y 與暫停行為。

### 建議

**卡片整體改為 `<Link to={`/products/${product.id}`}>`；大圖燈箱移到詳情頁（主圖點擊放大），列表頁不再有 lightbox。**

理由：
- 避免「卡片內嵌互動元素」（`role="button"` 內再放 `<a>` 屬無效／混淆的 a11y 結構）。
- 一個卡片一個主要動作，符合「商品可被瀏覽到詳情」的主要目標；燈箱仍存在（`ImageModal` 不刪），只是換地方用，減少新增元件。
- `ProductPageTemplate` 目前持有 `ImageModal` 狀態與 `onImageClick` prop 傳遞，改版後可移除該狀態，**簡化**頁面。

對測試的處理（不要刪測試，要有計畫地改）：
1. **加法優先**：先讓 `ProductCard` 接受新的 props 並保持舊 props 相容（例如 `onImageClick` 變為可選），新增「渲染為連結且 `href` 正確」的測試；舊的「按 Enter 開燈箱」測試**在決定移除燈箱互動的同一個 commit 中**改寫為連結語意（斷言 `getByRole("link", {name: ...})` 與 `href`），保持 215 個測試總數不倒退，且每次提交 `npm test` 全綠。
2. 卡片測試目前沒有 Router 包裹（`ProductCard.test.tsx` 需確認）；`Link` 需 Router context，**測試工具要補 `MemoryRouter`**。建議在 `src/test/` 新增一個 `renderWithRouter` 輔助函式，統一包裹，避免每個測試重複。
3. `ProductPageTemplate.test.tsx`、`HomePage.test.tsx` 已用 `MemoryRouter`，且 mock 了 `Layout` 與 `../services/products`。**注意**：`vi.mock("../services/products")` 是自動 mock 整個模組，新增的 `fetchProductDetail` 會自動變成 mock 函式，不會破壞既有測試；但詳情頁的測試同樣要 mock 此模組並設定回傳值。
4. 輪播：不要把整個 slide 包成 `Link`（會讓箭頭／圓點／暫停邏輯與連結焦點互相干擾）。建議**只在商品名稱（標題）或一個明確的「查看詳情」連結**上放 `Link`，其餘結構、`role`、aria 屬性與事件處理器**原封不動**。這樣 `isPointerDownRef`／`onFocus`／`onBlur` 的暫停邏輯自然涵蓋新連結（連結在輪播容器內，焦點進入即暫停）。新增測試：連結存在、`href` 正確、鍵盤聚焦連結時輪播暫停。
5. 視覺改版對 a11y 測試的風險來自「改 DOM 結構」，不是改 class。**規則：改版先改 className 與 tokens，不改 role／aria／事件結構；必須改結構時，該 commit 同步更新測試並說明。**

### 若連結被取消（備案）
若使用者想保留「卡片點擊開燈箱」，則在卡片加獨立的「查看詳情」`Link`（卡片內非巢狀於 `role=button`，用兩個並列的互動區域）。複雜度較高，不建議。

---

## 五、路由與 Cloudflare Pages SPA fallback

- `BrowserRouter` 下加 `<Route path="/products/:id" element={<ProductDetailPage />} />`。放在 `App.tsx` 的商品頁 `map` 之後即可；`/products/:id` 與現有 8 個路徑無衝突（它們都是單層、無 `products/` 前綴）。
- **Cloudflare Pages**：專案 `public/` 內沒有 `_redirects` 與 `404.html`。Pages 的預設行為是：若專案**沒有 `404.html`**，未匹配的路徑會回傳 `index.html`（SPA 模式），因此 `/products/<uuid>` 重新整理或直接開啟可運作。**行動項**：不要新增 `404.html`（會關閉 SPA 模式）；實作後在 `main` 上線前，以 production 的 `*.pages.dev` 以外方式驗證直接輸入網址（深連結）。若要保險，可新增 `public/_redirects` 內容 `/* /index.html 200`，但這與預設行為重複，且需注意 Pages 對 `_redirects` 的無限迴圈檢查；**預設情況不建議新增**。（MEDIUM：依 Cloudflare 官方文件的預設行為，需部署後實測）
- **CORS 白名單限制**：`*.pages.dev` 預覽網址不在後端白名單內，所以 `redesign` 分支的預覽部署**無法抓到 API**。本地開發靠 `.env.development` 的 `/api/v1/public` proxy。因此詳情頁與列表的**真實資料驗證只能在 localhost 或合併到 main 後**；分支預覽只能看靜態版面。規劃驗證步驟時要把這點寫入，或向後端申請預覽網域加入白名單。
- **全域 404**：目前 `App.tsx` 沒有 `*` 路由，未知路徑會是空白頁。新增 `<Route path="*" element={<NotFoundPage />} />`，與詳情頁的「商品不存在」共用同一個 `NotFoundState` 元件（含回到 `/all-products` 的連結）。`App.test.tsx` 目前測 8 條舊路徑，加 `*` 不影響。
- **預設選取與 URL**：不要把選取的變體寫入 URL（YAGNI；詳情頁分享連結只要 id）。若日後需要，用 `?sku=` search param，不用改路由結構。
- 回到列表保留捲動位置與脈絡：可用 `<Link to=... state={{ from }}>` 或單純 `navigate(-1)`；MVP 以「返回上一頁」按鈕加上「回到全部商品」連結即可。

### 404 處理細節

```ts
// hook 內的分類（不改 errors.ts）
function classifyDetailError(error: ApiError): "notFound" | "error" {
  // 404：商品不存在；400：id 非 UUID（例如手動亂打網址）
  if (error.kind === "http" && (error.status === 404 || error.status === 400)) {
    return "notFound";
  }
  return "error"; // 網路、429、5xx、格式不符：顯示 getErrorMessage + 重試按鈕
}
```

`canceled` 一律忽略（與 `useProducts` 現行處理一致）。可先在前端用 UUID regex 預檢，非 UUID 直接顯示找不到而**不打 API**，省一次請求並避免打到限流；這是可選優化，建議做（成本很低）。

---

## 六、設計 Tokens 整合方式

**現況**：`tailwind.config.js` 只有字型與三個動畫；顏色是在各元件直接寫 `slate-*`、`blue-400` 等 utility；`index.css` 有 `.glass-card` 等共用 class（11.4K）；`src/App.tsx` 最外層與 `Layout` 重複寫了一次深色漸層背景。

**建議（沿用 Tailwind 3，不升級）**：
- 在 `theme.extend.colors` 加**語意色**（例如 `surface`、`surface-raised`、`accent`、`accent-muted`、`ink`、`ink-muted`），值引用或對應現有 slate／blue 色階，讓改版可「改一處」。
- 在 `theme.extend` 加字級階層、`boxShadow`、`borderRadius`、必要的 `screens`／`maxWidth`（容器寬度）。
- 在 `index.css` 以 `@layer components` 重寫 `.glass-card`、按鈕 base 樣式使其使用 token（`@apply bg-surface-raised ...`）。**不要**使用 CSS 變數 + 自訂 plugin 的複雜方案（目前沒有換主題需求，違反「選無聊解法」）。
- **不要處理** `@tailwindcss/postcss` v4 與 tailwindcss v3 並存的版本不一致，除非改版過程它造成實際問題；那是獨立的整理任務（避免在視覺改版 PR 內混入工具鏈變更）。若要整理，單獨一個 commit，且需確認 `npm run build` 與 dist 憑證掃描仍成功。
- **背景重複**：`App.tsx` 最外層漸層與 `Layout` 的漸層重複，改版時只保留一處（建議留在 `Layout`），詳情頁／404 頁一律包 `Layout`，確保一致。
- **`noAirtable.test.ts` 與 `check-dist.mjs`** 會掃描 `src/**/*.{ts,tsx}` 原始碼與 dist：新增的檔案（含 tokens 命名、測試資料）不得出現 airtable 字樣、token 形狀字串、Base ID 形狀字串。測試用的假 UUID／假 SKU 請避免 `app` + 14 碼英數、`pat` 開頭長字串等形狀；失敗時以改名解決，不放寬 regex。

### WR-04（1024px 導覽換行）整合
問題在 `NavBar`（12.2K）的水平選單項目數（8 個商品頁 + 商店介紹）在 lg 斷點（1024px）塞不下。建議：
- 把桌面水平選單的顯示斷點從 `lg` 提高到 `xl`（1280px），`lg` 以下一律用漢堡選單；或
- 水平選單只放精選 4–5 個主分類，其餘進「更多」下拉。
前者改動最小、可預測，**優先採用**。這是 `NavBar` 內的 className／斷點修改，`NavBar.test.tsx` 以 `MemoryRouter` 測導覽連結，應不受影響；若測試依賴選單在某斷點可見（jsdom 沒有版面，通常不依賴），改版後確認。導覽項目仍只從 `NAV_ITEMS` 衍生（`/abouts` 維持寫死在 NavBar，D-03）。

詳情頁**不要**放進 `NAV_ITEMS`（它不是分類頁）；導覽高亮邏輯（以 `useLocation` 判斷）在 `/products/:id` 時不會高亮任何分類，這是可接受的；若想高亮來源分類，使用 `Link state` 傳遞（可延後）。

`Layout` 的 `showSideMenu`：詳情頁建議 `false`（不要側邊選單，騰出版面給圖片與規格）。

---

## 七、Patterns to Follow

### Pattern 1：詳情 service 與列表同風格
**What:** `fetchProductDetail(id, client = apiClient, options = {})`；內部 `try { client.get(`/products/${encodeURIComponent(id)}`, {signal}) } catch → throw normalizeError(error)`；回應不符守衛時 `throw new ApiError("invalid_response", ...)`。
**When:** 一律；保持可注入 `client` 以便測試用 `createApiClient(baseURL, adapter)`。
**Example:**
```ts
export async function fetchProductDetail(
  id: string,
  client: AxiosInstance = apiClient,
  options: FetchProductsOptions = {}
): Promise<ProductDetail> {
  let body: unknown;
  try {
    const response = await client.get<unknown>(
      `/products/${encodeURIComponent(id)}`,
      { signal: options.signal }
    );
    body = response.data;
  } catch (error: unknown) {
    throw normalizeError(error);
  }
  if (!isProductDetailResponse(body)) {
    throw new ApiError("invalid_response", "商品詳情 API 回應格式不符");
  }
  return toProductDetail(sanitizeDetail(body.data));
}
```

### Pattern 2：`toProductDetail` 的衍生欄位預先算好
**What:** 與 `toProduct`（預先算好 `priceText`）一致，詳情轉換時預先算好每個變體的 `priceText`、整體 `priceText`（variants 最低～最高含稅價，無價則 `PRICE_ON_REQUEST`）、`attributeEntries: [string, string][]`（已字串化）、`defaultVariantId`。名稱沿用 `resolveName`（需從 `transform.ts` 內部共用）。`imageUrl` 沿用「空字串／null → null」規則；缺圖用 `ImagePlaceholder`。
**Why:** 元件只負責顯示，邏輯集中在 `services/` 且已有單元測試風格可複製（`transform.test.ts`）。

### Pattern 3：hook 抄 `useProducts` 的取消與重試
**What:** `useProductDetail(id)` 在 effect 內建立 `AbortController`，cleanup `abort()`，`kind === "canceled"` 忽略；`retry` 以遞增計數觸發 effect；`id` 改變時重設狀態（避免顯示上一個商品的殘影；也可用 `key={id}` 在路由元素上強制重掛，與 `App.tsx` 現行 `key={page.path}` 同手法）。
**Why:** React 19 StrictMode 會重跑 effect，現有 `useProducts` 已處理此情況，複製其測試（`useProducts.test.tsx`）即可。

### Pattern 4：詳情頁四態呈現
loading（骨架或 spinner）／notFound（共用 `NotFoundState`）／error（`getErrorMessage` + 重試按鈕，429 文案已存在）／ready。**不要**用 `alert` 或只 `console.error`；新程式碼遵循 CLAUDE.md「單一錯誤策略」：資料層拋 `ApiError`，頁面顯示錯誤狀態。

### Pattern 5：頁面標題
SPA 沒有 `<title>` 管理。詳情頁建議 `useEffect` 設定 `document.title = `${product.name} | KRD``，unmount 還原。不引入 react-helmet（避免新增依賴；需在規劃中說明理由才可新增）。SEO 方面：SPA 於 Cloudflare Pages 上，爬蟲看不到動態內容；預渲染／SSR 超出本里程碑，列為已知限制。

---

## 八、Anti-Patterns to Avoid

### Anti-Pattern 1：用 `toProduct` 轉詳情
**Why bad:** 欄位不同（沒有 price_min/max/featured_group），會產生 `undefined` 滲入 `priceText`（"NT$NaN" 風險）。
**Instead:** 獨立的 `ProductDetailApi` → `ProductDetail`。

### Anti-Pattern 2：在 `ProductCard` 內巢狀互動元素
`role="button"` 的 div 裡放 `<a>`，或 `Link` 內放 `<button>`，屬無效結構，鍵盤與螢幕閱讀器行為不可預期。**Instead:** 卡片單一 `Link`；操作按鈕不放在卡片內。

### Anti-Pattern 3：改版同時重構資料層
先前 v1.0 的 services 與 215 個測試是改版的安全網。**Instead:** 改版 commit 只動 `components/`、`pages/`、`config/`、`index.css`、`tailwind.config.js`；`services/` 只做「新增」詳情相關函式／型別，不修改既有函式簽名。

### Anti-Pattern 4：把變體選取狀態放進全域 Context／URL
詳情頁單頁區域狀態，`useState<string | null>(selectedVariantId)` 即可（專案無 Context，維持）。

### Anti-Pattern 5：直接 `dangerouslySetInnerHTML` 渲染 `description`
後端 `description` 是自由文字，來源為後台輸入。**Instead:** 以純文字渲染，用 `whitespace-pre-line` 保留換行。

### Anti-Pattern 6：硬編碼變體屬性鍵
屬性 key 由商品的 `attributeKeys` 決定，不同商品不同。**Instead:** 通用 `Object.entries` 渲染。

### Anti-Pattern 7：一次改 `NAV_ITEMS` 型別
`NavItem.path` 是 `ProductPagePath` 字面量聯集；加入詳情或 `/abouts` 會破壞 `PRODUCT_PAGE_VIEWS` 的完整性檢查（缺 key 即編譯失敗）。**Instead:** 保持 `NAV_ITEMS` 只含分類頁。

---

## 九、建議建置順序（含相依性）

相依關係：
```
tokens ──► shell(Layout/NavBar/SideMenu/Footer) ──► 各頁視覺 ──┐
詳情資料層(types→service→transform→hook) ─────────────────────┼──► 詳情頁 UI ──► 卡片/輪播連結 ──► 路由接線收尾
NotFoundState ────────────────────────────────────────────────┘
```

**Phase A — Tokens 與 Shell（先做）**
1. `tailwind.config.js` tokens、`index.css` 共用 class 轉 token；移除 `App.tsx` 重複背景。
2. `Layout`、`NavBar`（含 WR-04）、`SideMenu`、`Footer` 改版。測試：`NavBar.test.tsx`、`SideMenu.test.tsx` 應維持綠燈。
理由：所有頁面（含新詳情頁）都吃這層；先做才不會把詳情頁做兩次。風險最低（只動 className）。

**Phase B — 詳情資料層（可與 A 平行，因零視覺相依）**
`apiTypes.ts` → `products.ts`（`fetchProductDetail` + 守衛）→ `transform.ts`（`toProductDetail`）→ `useProductDetail` → 測試（比照 `products.test.ts`、`transform.test.ts`、`useProductDetail.test.tsx`，用 `createApiClient` adapter 注入）。
理由：純邏輯、TDD 友善（CLAUDE.md 要求測試先行）、可獨立驗證；先驗證 404／400／429／空 variants 等邊界。

**Phase C — 既有頁面視覺改版**
`HomePage`＋`FeaturedCarousel`（僅 className，保持結構）、`ProductPageTemplate`、`AboutPage`。此階段**先不改連結語意**，確保 215 測試持續全綠。

**Phase D — 詳情頁 UI + 路由 + 404**
`NotFoundState`、`ProductDetailPage`（主圖加 `ImageModal`、變體選取、屬性表、庫存、保固月數顯示）、`App.tsx` 加 `/products/:id` 與 `*`。更新 `App.test.tsx`（新增詳情路由與 404 案例）。

**Phase E — 連結接線（互動語意變更集中在這一步）**
`ProductCard` 轉 `Link`、`FeaturedCarousel` 加詳情連結、`ProductPageTemplate` 移除 lightbox 狀態；同步改寫相關測試（見第四節）。理由：把唯一會改測試語意的變更隔離成一個階段，出問題容易回溯與回滾。

**Phase F — 收尾驗證**
`npm run build`（`tsc -b` + dist 憑證掃描）、`npm run lint`、`npm test`；1024px 導覽、鍵盤操作、`prefers-reduced-motion`、深連結重新整理；確認 8 條舊 URL 不變；合併 `main` 後實測真實 API（預覽網址受 CORS 限制）。

> 備註：B 放在 A 之後或平行皆可；若只有單一開發者，建議 A → B → C → D → E → F 的線性順序，因為 B 的測試先行最能降低後面風險。**不建議「詳情頁先做」**：詳情頁 UI 會立刻被 token 與 shell 改版推翻，且詳情頁在未接線前沒有入口，使用者看不到成果。

---

## 十、Scalability Considerations

| Concern | 目前（約 20 筆商品） | 商品數成長 | 備註 |
|---------|----------------------|------------|------|
| 列表 limit | `PRODUCT_LIMIT = 100`，`truncated` 提示 | 需分頁（已有 warn 提示） | 超出本里程碑 |
| 詳情請求 | 每次進頁一次 GET；後端設 `setPublicCache`（有 Cache-Control） | 瀏覽器 HTTP cache 自然生效 | 不要自建 client cache；限流 429 已有文案 |
| 列表→詳情切換 | 重抓詳情 | 可考慮把列表已有的欄位當 placeholder | 先不做（簡單性優先），有感延遲再議 |
| Bundle | 無 code-splitting | 新增一頁影響很小 | 若要拆，可 `React.lazy` 詳情頁；非必要 |

---

## 十一、Sources

- 專案現有程式碼（HIGH）：`src/App.tsx`、`src/config/navigation.ts`、`src/services/{apiTypes,products,transform,catalog,errors,format,client}.ts`、`src/components/{Layout,ProductCard,FeaturedCarousel}.tsx`、`tailwind.config.js`、`.planning/codebase/TESTING.md`
- 後端原始碼（HIGH）：`../KRD-Inventory-Backend/src/modules/public/{routes/index.ts, schemas/public-catalog.schemas.ts, dto/public-catalog.dto.ts, services/public-catalog.service.ts, controllers/public-catalog.controller.ts}`
- Cloudflare Pages SPA 預設行為（MEDIUM，來自訓練知識，未於本次查證官方文件；需在 Phase F 部署實測）：https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering

## 待驗證／缺口

- `ProductCard.test.tsx` 與 `FeaturedCarousel.test.tsx` 逐項斷言內容本次未逐行檢視，Phase E 規劃前需精讀以列出「需改寫」與「應保持」清單。
- Cloudflare Pages 深連結 fallback 需實測；若失敗再加 `_redirects`。
- 詳情頁是否要顯示所有變體圖片（`image_url` per variant）與是否做圖片切換，屬 FEATURES 層決策。
