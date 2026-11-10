---
phase: 2
slug: api
status: draft
shadcn_initialized: false
preset: none
created: 2026-11-10
---

# Phase 2 — UI 設計契約

> 商品頁與首頁熱銷改讀後端 API 的視覺與互動契約。本 phase 是 brownfield：保留既有深色 slate 漸層主題與版面，只新增「載入／失敗／空狀態」、價格顯示、缺圖佔位圖、排序行為。已存在且未被本 phase 變更的樣式不重新規範。
> 來源標記：[CTX] = 02-CONTEXT.md 已鎖定決策；[既有] = 沿用現有程式碼；[預設] = 本文件依既有風格補上的預設值。

---

## Design System

| 屬性 | 值 |
|------|-----|
| Tool | none（無 shadcn、無元件庫；偵測不到 `components.json`，Tailwind 3 + 自訂 class；不導入 shadcn，避免改變既有視覺語言）|
| Preset | not applicable |
| Component library | none |
| Icon library | 無圖示庫，使用 inline SVG（Heroicons outline 風格路徑，`stroke="currentColor"`、`strokeWidth={2}`、`viewBox="0 0 24 24"`）[既有] |
| Font | `微軟正黑體`, `Microsoft JhengHei`, sans-serif（`tailwind.config.js` 的 `sans`）[既有] |

自訂 class 沿用 `src/index.css`：`glass-card`、`product-card-new`、`product-image-container`、`product-image`、`product-overlay`、`product-info`、`product-title`、`product-badge`。本 phase 不新增全域 CSS class；新元素只用 Tailwind utility。

---

## Spacing Scale

宣告值（全為 4 的倍數，對應 Tailwind 預設刻度）：

| Token | 值 | Tailwind | 本 phase 用途 |
|-------|-----|----------|---------------|
| xs | 4px | `1` | 圖示與文字間距、價格列內部間距 |
| sm | 8px | `2` | 名稱與價格間距（`mb-2`）、錯誤卡片內元素緊湊間距 |
| md | 16px | `4` | 錯誤卡片標題與說明間距、按鈕垂直 padding 組合的基準 |
| lg | 24px | `6` | 錯誤／空狀態區塊內部分組間距、list 卡片內間距 |
| xl | 32px | `8` | 商品 grid `gap-8`、錯誤卡片圖示與標題間距 |
| 2xl | 48px | `12` | 商品區塊底部留白（`pb-12`） |
| 3xl | 64px | `16` | 圖示容器（`w-16 h-16`）、空狀態大圖示 |

例外：
- 空狀態／錯誤卡片外圈圓形容器維持既有 `w-32 h-32`（128px）與 `py-20`（80px）[既有，D-02 要求沿用]。
- 按鈕最小觸控高度 44px：「重新載入」按鈕使用 `px-6 py-3`（高度約 48px）。
- 首頁輪播導覽箭頭維持既有 `w-16 h-16` / 手機 `w-12 h-12`（48px）[既有]。
- 圖片佔位框使用 `aspect-video` 與卡片圖片容器同尺寸，不另設固定數值。

---

## Typography

本 phase **新增或修改**的元素只使用下列 4 個字級、2 個字重；既有標題（`text-5xl` Header、首頁 Hero 等）屬未變動範圍，保持原樣不重寫。

| 角色 | 大小 | 字重 | 行高 | 本 phase 用途 |
|------|------|------|------|----------------|
| Body | 16px（`text-base`）| 400 | 1.5 | 錯誤卡片說明文字、空狀態說明、list 卡片描述改用 14px 見 Label |
| Label | 14px（`text-sm`）| 400（價格洽詢為 400；有價為 600）| 1.5 | 價格文字、排序標籤、list 卡片描述、「重新載入」按鈕文字（600）、截斷提示 |
| Heading | 20px（`text-xl`）| 600 | 1.2 | 錯誤／空狀態標題在窄版；商品名稱（list 卡片，沿用 `text-xl font-semibold`）|
| Display | 30px（`text-3xl`）| 600 | 1.2 | 空狀態／錯誤卡片標題（沿用既有 `text-3xl`，字重由 `font-bold` 改為 `font-semibold`）|

補充：
- 微字級 12px（`text-xs`）僅限：缺圖佔位文字「暫無圖片」、grid 卡片描述、價格徽章 [既有 `product-badge`]。屬既有元素的延續，新程式不再新增其他 12px 用途。
- 字重只宣告 400 與 600。既有 `font-bold`/`font-black` 的未修改元素不動；新增元素一律用 `font-normal` 或 `font-semibold`。
- 繁中內文行高 1.5（`leading-normal`），標題 1.2（`leading-tight` 約 1.25，可接受）。

---

## Color

| 角色 | 值 | 用途 |
|------|-----|------|
| Dominant (60%) | `#0f172a` slate-900 → `#1e293b` slate-800（頁面 `bg-gradient-to-br from-slate-900 to-slate-800`）| 頁面背景、載入畫面背景 |
| Secondary (30%) | `rgba(255,255,255,0.05)`（`glass-card`）、slate-800/900 80%（`product-card-new`）、`#1e293b` 排序與檢視控制底色 | 商品卡片、錯誤卡片、控制列、佔位圖底色 |
| Accent (10%) | `#3b82f6` blue-500（含 `to-purple-500` 漸層）| 見下方保留清單 |
| Destructive | 無（本 phase 無破壞性操作）| 不適用 |
| Error 語意色 | `#f87171` red-400 | 僅用於錯誤卡片的圖示（圓形容器底 `bg-red-500/10`）|

文字色階 [既有]：主要文字 `text-white`、次要 `text-gray-300`、說明 `text-gray-400`、弱化 `text-gray-500`。

Accent 保留給（明確清單，不得擴張）：
1. 「重新載入」按鈕（`bg-blue-500 hover:bg-blue-600 text-white`，其他按鈕不得使用 accent 實心底）
2. 檢視切換（grid/list）選中態 `bg-blue-500`
3. 有價格時右上角 `product-badge` 漸層徽章，以及 list 卡片中有價格時的價格文字（`text-blue-400`）
4. 商品卡片 hover 邊框與標題 hover 色（`hover:border-blue-500/50`、`group-hover:text-blue-400`）
5. 排序下拉選單 focus 邊框 `focus:border-blue-500`
6. 載入 spinner（`border-blue-500`）

價格為 `null`（「價格洽詢」）**不得**使用 accent：用 `text-gray-500`。錯誤色 red-400 不得用於按鈕或文字，只用於圖示。

---

## 元件與狀態契約

### 1. 商品頁（ProductPageTemplate）

版面順序不變：Header（icon、標題、描述）→ 控制列 → 商品區塊 → 截斷提示 → ImageModal。Header 與控制列在任何狀態（除首次載入）都保留。

| 狀態 | 觸發 | 畫面 |
|------|------|------|
| 首次載入 | 進入頁面或路由切換（D-13）`status === "loading"` 且無舊資料 | 整頁載入畫面：沿用現有雙圈 spinner + 「正在載入產品資訊...」（`min-h-screen`，置中）。以 `key={path}` 重新掛載，排序重設為 `name` |
| 排序切換中 | 已有資料時改變 sort（D-12）| 保留舊列表，商品區塊加 `opacity-50 pointer-events-none transition-opacity duration-200`，不出現 spinner；排序下拉加 `disabled` |
| 失敗 | `status === "error"`，非 canceled（D-02）| 商品區塊位置顯示錯誤卡片（見下） |
| 空 | `success` 且 `items.length === 0`（D-03）| 沿用現有空狀態區塊 |
| 成功 | `success` 且有商品 | grid／list 卡片 |
| 截斷 | `truncated === true`（D-10）| 列表下方一行 `text-sm text-gray-500 text-center mt-8`「僅顯示前 100 項商品」|

錯誤卡片結構（沿用空狀態樣式，D-02）：
- 外層 `text-center py-20`
- 圓形圖示容器 `w-32 h-32 rounded-full bg-red-500/10 mx-auto mb-8 flex items-center justify-center`，內含警告三角形 SVG `w-16 h-16 text-red-400`
- 標題 `h3`：`text-3xl font-semibold text-gray-300 mb-4`，文字「無法載入商品」
- 說明 `p`：`text-gray-400 text-base`，內容**只能**來自 `getErrorMessage(error)`，不得顯示後端原始訊息
- 按鈕（mt-8）：「重新載入」，`bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors`，`focus-visible:ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900`；點擊後回到載入狀態（已有舊資料時走「排序切換中」淡化；無資料時走首次載入畫面）
- 容器加 `role="alert"`，方便螢幕閱讀器與測試以 `getByRole("alert")` 查詢

空狀態區塊：沿用既有圓形圖示（`bg-white/5`、灰色 inbox 圖示），標題「目前沒有商品」（`text-3xl font-semibold text-gray-300`），說明「此分類目前沒有上架的商品」（`text-gray-500 text-lg`）。

控制列：
- 排序下拉選項「依名稱」（`name`）與「最新優先」（`newest`）[既有文案]。
- 頁面設定鎖定排序（`/new-products` 為 `newest`）時**整個排序區塊（標籤＋下拉）不渲染**（D-11）；檢視切換靠右對齊仍保留（容器使用 `sm:justify-end` 或 `justify-between` + 空位，不得讓檢視切換移位到左邊跳動）。
- 兩個檢視切換按鈕補 `aria-label`：「格狀檢視」「列表檢視」，並用 `aria-pressed` 標示選中態。

### 2. 商品卡片（grid 與 list）

價格規則（D-06）：
- grid：有價格（`priceText` 非「價格洽詢」語意，即 `priceMin !== null`）時顯示右上角 `product-badge`，內容為 `priceText`；沒有價格時**不渲染徽章**。
- grid 與 list：名稱下方一行價格文字（`mb-2`）。有價：`text-sm font-semibold text-blue-400`；無價：「價格洽詢」`text-sm text-gray-500`。
- grid 卡片固定高度 `h-96` 與圖片 `h-64` 不變，價格行放進 `product-info` 名稱與描述之間，名稱仍 `line-clamp-2`，描述縮為 `line-clamp-2`（既有）；放不下時優先保價格、描述其次（描述使用 `line-clamp-1` 作為縮減方案由 executor 以不溢出為準）。
- 名稱使用 Product.name（Phase 1 已保底為「未命名商品」）。

缺圖佔位圖（D-08，共用元件 `ImagePlaceholder`，首頁輪播亦使用）：
- 與圖片容器同尺寸（`w-full h-full`），底 `bg-gradient-to-br from-slate-700 to-slate-800`
- 置中垂直排列：麥克風 SVG（`w-12 h-12 text-gray-500`，list 卡片 `w-8 h-8`）+ 文字「暫無圖片」`text-xs text-gray-500 mt-2`
- 外層 `role="img"`、`aria-label="暫無圖片"`
- 缺圖商品：卡片**不顯示** hover 放大鏡遮罩、「點擊查看大圖」改為不顯示、`cursor-default`、點擊不開 ImageModal；`group-hover` 的標題色變化保留。list 卡片同樣隱藏「查看大圖」提示。
- 有圖卡片：行為不變（點擊開燈箱）。圖片 `alt` 為商品名稱；有圖卡片外層加 `role="button"`、`tabIndex={0}`、Enter/Space 觸發（鍵盤可達性，[預設]）。
- 圖片載入失敗（`onError`）：切換為同一個佔位圖，不再顯示破圖 [預設]。

### 3. 首頁熱銷輪播（兩組獨立）

共用 `aspect-video` 佔位框：`aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center`（沿用既有）。

| 狀態 | 框內內容 |
|------|----------|
| 載入中 | 既有 `animate-pulse` 圓點 + 「載入產品中...」`text-gray-400` |
| 失敗 | 警告圖示（`w-12 h-12 text-red-400`）+ `getErrorMessage(error)` 文字 `text-gray-300 text-base` + 「重新載入」按鈕（樣式同商品頁，`mt-4`）|
| 沒有商品 | 輪播圖示（沿用該組標題圖示色）+「目前沒有精選商品」`text-gray-400 text-base`，不隱藏整區 |
| 成功 | 既有輪播；缺圖的投影片以 `ImagePlaceholder` 取代 `<img>`，漸層遮罩與名稱／描述照常疊在上面 |

- 兩組獨立，一組失敗不影響另一組；同時 429 時各自顯示即可（D-05）。
- 不顯示價格（D-07），不顯示現貨、品牌、型號（D-09）。
- 自動播放：僅 `status === "success"` 且 `items.length > 1` 時計時；`items.length === 1` 時隱藏左右箭頭與指示點 [預設，避免單張輪播無意義操控]。
- 輪播箭頭按鈕補 `aria-label`：「上一張」「下一張」；指示點補 `aria-label`「第 N 張」。
- 修正既有 bug：`from-${accentColor}-500` 動態 class 會被 Tailwind purge 掉。executor 必須改為完整靜態 class 字串（例如用物件對照 `blue`/`purple` → 完整 class），或在 `tailwind.config.js` 加 `safelist`。

---

## Copywriting Contract

| 元素 | 文案 |
|------|------|
| Primary CTA（本 phase 唯一新增按鈕）| 重新載入 |
| 商品頁首次載入 | 正在載入產品資訊... [既有] |
| 首頁輪播載入 | 載入產品中... [既有] |
| 商品頁空狀態標題 | 目前沒有商品 |
| 商品頁空狀態說明 | 此分類目前沒有上架的商品 |
| 首頁輪播空狀態 | 目前沒有精選商品 |
| 錯誤標題（商品頁）| 無法載入商品 |
| 錯誤說明 | 一律為 `getErrorMessage(error)` 回傳文字（來自 `src/services/errors.ts` 的 `ERROR_MESSAGES`）；包含問題與可行動方向，不另寫、不顯示後端原文 |
| 價格洽詢 | 價格洽詢 |
| 缺圖 | 暫無圖片 |
| 截斷提示 | 僅顯示前 100 項商品 |
| 排序標籤 / 選項 | 排序方式： / 依名稱 / 最新優先 [既有] |
| 檢視切換 aria-label | 格狀檢視 / 列表檢視 |
| 破壞性操作 | 無（本 phase 沒有刪除或不可逆操作，不需確認對話框）|

禁止出現的字樣：「請稍後再試」用於空狀態（避免與失敗混淆，D-03）。

---

## Responsive 與 Motion

- 斷點沿用既有：grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`；控制列 `flex-col sm:flex-row`。
- 錯誤卡片、空狀態在手機版：圖示容器縮為 `w-24 h-24`（`w-32 sm:w-32` 以下用 `max-sm:w-24 max-sm:h-24`），標題 `text-2xl sm:text-3xl`；按鈕不全寬，置中。
- 動畫：排序淡化 200ms；其餘沿用既有 `transition-all duration-300/500`。`prefers-reduced-motion` 下停用 spinner 以外的位移動畫非本 phase 範圍（不新增）。
- 缺圖與錯誤狀態不得造成 layout shift：佔位框尺寸與正常狀態一致。

---

## 測試友善鉤子（供 D-18 元件測試）

| 元素 | 查詢方式 |
|------|----------|
| 錯誤卡片 | `role="alert"` + 文字「重新載入」按鈕（`getByRole("button", { name: "重新載入" })`）|
| 空狀態 | 文字「目前沒有商品」「目前沒有精選商品」|
| 排序下拉 | `getByRole("combobox")`；`/new-products` 斷言不存在 |
| 價格 | 文字「價格洽詢」或 `priceText` |
| 佔位圖 | `getByRole("img", { name: "暫無圖片" })` |
| 檢視切換 | `getByRole("button", { name: "列表檢視" })` |

---

## Registry Safety

| Registry | 使用的 Blocks | Safety Gate |
|----------|---------------|-------------|
| shadcn official | 無（未使用 shadcn）| not applicable |
| 第三方 registry | 無 | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
