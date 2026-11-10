---
phase: 6
slug: design-lock
status: draft
shadcn_initialized: false
preset: none
created: 2026-11-10
---

# Phase 6 — UI Design Contract

> 視覺與互動契約。本 phase 不寫 UI 程式碼；Phase 8（tokens、骨架、既有頁面）、Phase 9（詳情頁）、Phase 10（連結接線）依此實作。
> 狀態 `draft`：checker 通過後仍需使用者做最終確認才算 DESIGN-01 完成（見文末「使用者確認紀錄」）。

**來源：** REQUIREMENTS.md（DESIGN-01~03、SHELL、UX、PROD、LINK）、ROADMAP.md Phase 6 success criteria 1–2、`.planning/research/*`、現有 `src/` 與 `tailwind.config.js`。
**無 CONTEXT.md：** 以下標 `[預設]` 者為研究員依現況與研究建議給出的預設值，使用者可在確認時覆寫。

---

## 視覺方向

**名稱：專業器材型錄（Professional gear catalog）— 淺色主題，light only，不做 dark mode**

- 視覺方向由使用者授權 orchestrator 決定（使用者原話：「不要保留原本的 整個換掉 但要換什麼我也不知道你決定」）。**不保留**現有深色 slate 主題，整個換掉。
- 暖白底、白色卡片、近黑文字、單一「訊號橘」強調色，呈現專業音響器材型錄的乾淨感；商品圖放在白底容器，去背商品照可直接呈現。
- 層次靠 1px 細線與留白，不靠陰影、漸層或毛玻璃。移除所有漸層、`backdrop-blur`、紫粉色，以及 hover 位移與縮放。
- Footer 是全站唯一的深色區塊（`ink` 底、淺色字），作為頁面收尾的視覺錨點。
- 價格為空（目前 20 筆全部 `show_price=false`）時版面仍完整。
- 動效只剩 150ms 的顏色/邊框轉場；位移、縮放、淡入一律包在 `motion-safe:`，輪播沿用既有邏輯。

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none（Tailwind 3.4 + 自訂語意 token；專案無 `components.json`，不採用 shadcn）|
| Preset | not applicable |
| Component library | none（自製元件）|
| Icon library | 不新增套件；集中於 `src/components/icons.tsx` 的 inline SVG（stroke 1.5–2、`aria-hidden`、預設 20px）。圖示清單：map-pin、phone、clock、chevron-left/right、menu、close、zoom、copy、check、mail、message（LINE）。|
| Font | 系統字型堆疊，不載入 CJK webfont（見下）|

### 字型堆疊（DESIGN-03）

```
font-sans: "PingFang TC", "Microsoft JhengHei", "微軟正黑體", "Noto Sans TC", system-ui, sans-serif
```

- macOS/iOS 命中 PingFang TC；Windows 命中 Microsoft JhengHei；Android/Linux 命中 Noto Sans TC。
- `tailwind.config.js` 的 `fontFamily.sans` 與 `src/index.css` 的 `body font-family` 兩處必須同步，index.css 改為只繼承 token（`font-family: theme("fontFamily.sans")`）避免雙份維護。
- 型號等拉丁字串用 `overflow-wrap: anywhere` 避免撐破版面。

---

## 單一斷點表

只使用 Tailwind 預設斷點中的下列三段，其餘（`sm`、`lg`、`2xl`）不得在 className 出現。涵蓋 320–1440px。

| 名稱 | 寬度 | 導覽 | SideMenu（商品頁）| 商品 grid | 詳情頁 | 內容寬度 |
|------|------|------|-------------------|-----------|--------|----------|
| base | 320–767px | 漢堡選單（抽屜）| 抽屜，由商品頁上方「分類」按鈕開關 | 2 欄 | 單欄，圖在上 | 左右 padding 16px |
| `md` | 768–1279px | 漢堡選單（抽屜）| 抽屜 | 3 欄 | 兩欄（圖 5/12、資訊 7/12）| 左右 padding 24px |
| `xl` | ≥1280px | 水平選單（修正 WR-04：由 `lg` 提高到 `xl`）| 固定左側欄 256px | 4 欄（側欄存在時）| 兩欄 | `max-w-7xl`（1280px）置中，padding 32px |

- 1024px 落在 `md` 區間，使用漢堡選單，因此不會擠壓、折行。
- list 版型在所有斷點為單欄；base 時圖 80px、`md` 以上圖 96px。
- 觸控目標最小 44×44px（NavBar 漢堡鈕、輪播按鈕、卡片、chip、複製按鈕）。

---

## Spacing Scale

宣告值皆為 4 的倍數。

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 圖示與文字間距、tag 垂直 padding |
| sm | 8px | 緊湊元素間距、tag 水平 padding、chip 間距 |
| md | 16px | 預設元素間距、卡片內距、base 頁面左右 padding |
| lg | 24px | 區塊內距、`md` 頁面左右 padding、卡片 gap |
| xl | 32px | 版面間距、`xl` 頁面左右 padding |
| 2xl | 48px | 主要區塊間距、Footer 上下內距 |
| 3xl | 64px | 頁面層級間距（Hero 與首個區塊）|

Exceptions: 互動元素最小高度 44px（觸控目標，非間距 token）；焦點環 2px、offset 2px。

Tailwind 對應：沿用預設 spacing（1=4px、2=8px、4=16px、6=24px、8=32px、12=48px、16=64px），其餘值（如 `p-5`、`p-3`、`gap-5`）不得使用。

---

## Typography

4 個字級、2 個字重（400 與 600）。禁用 `font-bold`/`font-medium`/`font-light`，一律 `font-normal` 或 `font-semibold`。

| Role | Size | Weight | Line Height | Tailwind token | 用途 |
|------|------|--------|-------------|----------------|------|
| Label | 14px | 400（強調用 600）| 1.5 | `text-label` | tag、麵包屑、表格欄位名、Footer 次要資訊、價格說明、錯誤輔助文字 |
| Body | 16px | 400 | 1.5 | `text-body` | 內文、卡片名稱（600）、按鈕文字（600）、導覽連結、說明 |
| Heading | 24px | 600 | 1.2 | `text-heading` | 區塊標題、詳情頁價格、詳情頁 h1（base）、空/錯誤狀態標題 |
| Display | 36px | 600 | 1.2 | `text-display` | 首頁 hero、頁面 h1（`md` 以上；base 退為 Heading 24px）|

- 取代現有 `h1 text-5xl`、`text-3xl/4xl`、`text-xl`、`text-xs`、`text-sm` 的散落用法。
- 12px（`text-xs`）不再使用。

---

## Color（語意 token）

於 `tailwind.config.js` 的 `theme.extend.colors` 定義；全站禁止直接寫 `slate-*`、`gray-*`、`stone-*`、`orange-*`、`#hex`、`white/10` 等（DESIGN-02）。對比值以 WCAG 相對亮度公式實算（Phase 6 以 Python 驗證）。

| Token | Hex | 佔比 / 角色 | 用途 |
|-------|-----|-------------|------|
| `surface` | `#FAFAF9`（stone-50）| Dominant 60% | 頁面背景（純色）、側欄背景 |
| `surface-raised` | `#FFFFFF` | Secondary 30% | 商品卡、詳情資訊面板、NavBar、輪播說明區、燈箱底、商品圖容器、skeleton 底 |
| `ink` | `#1C1917`（stone-900）| 文字 | 主要文字、標題；同時是 Footer 底色（唯一深色區塊）|
| `ink-muted` | `#57534E`（stone-600）| 文字 | 次要文字、無價「洽詢」、輔助說明、麵包屑、未選中導覽 |
| `line` | `#E7E5E4`（stone-200）| 邊框 | 1px 分隔線、卡片/面板/NavBar 邊框（裝飾性邊框，不承載資訊）|
| `line-strong` | `#78716C`（stone-500）| 邊框 | 可互動控制項（未選中 chip、次要按鈕）的邊框，達 UI 元件 3:1 |
| `accent` | `#C2410C`（orange-700）| Accent 10% | 主按鈕底色（白字）、連結文字、焦點環、選中指示 |
| `accent-hover` | `#9A3412`（orange-800）| 狀態 | 主按鈕與連結 hover |
| `accent-on-dark` | `#FDBA74`（orange-300）| Footer 專用 | Footer 內連結文字（`accent` 在 `ink` 上只有 3.38:1，不可用）|
| `success` | `#15803D`（green-700）| 語意 | 僅「有現貨」文字與小圓點 |
| `danger` | `#B91C1C`（red-700）| 語意 | 僅錯誤狀態圖示、錯誤標題、複製失敗文字（本 phase 無破壞性操作）|
| `footer-fg` | `#E7E5E4` | Footer 文字 | Footer 主文字（白 `#FFFFFF` 用於標題）|
| `footer-muted` | `#A8A29E`（stone-400）| Footer 文字 | Footer 次要文字、版權列 |

### 對比驗證（WCAG 2.x，目標：正文 ≥ 4.5:1、UI 元件/大字 ≥ 3:1）

| 前景 / 背景 | 對比 | 結果 |
|-------------|------|------|
| `ink` / `surface` | 16.74:1 | AA、AAA |
| `ink` / `surface-raised` | 17.49:1 | AA、AAA |
| `ink-muted` / `surface` | 7.30:1 | AA、AAA |
| `ink-muted` / `surface-raised` | 7.63:1 | AA、AAA |
| 白字 / `accent` | 5.18:1 | AA |
| 白字 / `accent-hover` | 7.31:1 | AA、AAA |
| `accent` / `surface-raised`（連結、焦點環）| 5.18:1 | AA |
| `accent` / `surface`（連結、焦點環）| 4.96:1 | AA |
| `success` / `surface-raised` | 5.02:1 | AA |
| `success` / `surface` | 4.80:1 | AA |
| `danger` / `surface-raised` | 6.47:1 | AA |
| `danger` / `surface` | 6.19:1 | AA |
| `line-strong` / `surface-raised` | 4.80:1 | UI 元件 ≥ 3:1 |
| `footer-fg` / `ink` | 13.93:1 | AA、AAA |
| 白 / `ink` | 17.49:1 | AA、AAA |
| `footer-muted` / `ink` | 6.93:1 | AA |
| `accent-on-dark` / `ink` | 10.37:1 | AA、AAA |
| `accent` / `ink`（禁用組合）| 3.38:1 | 不可用於 Footer 文字 |
| `line` / `surface-raised` | 1.26:1 | 僅裝飾，不得承載資訊或當控制項唯一邊界 |

**Accent reserved for（僅限以下，禁止「所有可互動元素」）：**
1. 主按鈕（聯絡洽詢、重新載入、回到首頁）底色，白字
2. 內文連結與麵包屑連結文字
3. 目前所在頁的導覽/側欄選中指示（2px 底線或左邊線，不用整塊填色）
4. 選中的變體 chip 邊框（2px）與文字
5. 鍵盤焦點環（2px `accent`，offset 2px）
6. 卡片 hover/focus 時的邊框顏色

**移除：** 所有漸層與紫/粉色（`gradient-text`、`gradient-button`、`logo-text-enhanced`、`product-badge`、`heart-button`、`zoom-icon`、`hover-card`、`glass-card` 的 blur、`product-overlay`、`product-card-new` 的漸層與位移）。`index.css` 中對應 class 於 Phase 8 刪除。`body` 改為 `bg-surface text-ink`。

**Destructive：** 本 phase 無破壞性操作；`danger` 只用於錯誤呈現。

---

## 圓角與陰影

| Token | 值 | 用途 |
|-------|----|------|
| `rounded-control`（8px）| 8px | 按鈕、chip、tag、輸入、導覽項 |
| `rounded-card`（12px）| 12px | 商品卡、詳情面板、錯誤/空狀態容器、圖片容器 |
| `rounded-panel`（16px）| 16px | 輪播主體、燈箱、抽屜 |
| `rounded-full` | 9999px | 僅輪播圓點 |

| 陰影 token | 值 | 用途 |
|------------|----|------|
| `shadow-none`（預設）| — | 卡片、面板、NavBar（層次靠 1px `line` 與留白）|
| `shadow-float` | `0 8px 24px rgba(28,25,23,0.16)` | 僅三處：側邊抽屜/手機選單、燈箱圖片、輪播前後按鈕 |

不使用彩色陰影。

---

## 元件契約

### 共用骨架（Phase 8）

- **Layout：** 最外層 `bg-surface text-ink`；第一個可聚焦元素為 skip link「跳到主要內容」（`sr-only`，focus 時顯示於左上，主按鈕樣式），指向 `<main id="main">`。
- **NavBar：** 高 64px，`surface-raised` + 底部 1px `line`，不使用 blur；Logo（`public/brand-logo.png`）高 32px，移除 hover 縮放與漸層光暈。`xl` 以上水平列出 `NAV_ITEMS` + 商店介紹；選中項 2px `accent` 底線，文字 `ink`，未選中 `ink-muted`。漢堡鈕 44×44，`aria-expanded`/`aria-controls`；抽屜展開時 Esc 可關閉（沿用現有行為）。
- **SideMenu：** `xl` 固定左欄（256px，`surface-raised`、1px `line`、`rounded-card`）；其餘斷點為抽屜。項目高 44px，選中項左側 2px `accent` + `ink` 文字，未選中 `ink-muted`。詳情頁 `showSideMenu=false`。
- **Footer：** 三欄（`md` 以上）／單欄（base）：地址、電話、營業時間；LINE、Email 有值才多出一欄／一列。**Footer 為全站唯一深色區塊**：底 `ink`，標題白字，內文 `footer-fg`，次要 `footer-muted`，連結 `accent-on-dark`（hover 白）；圖示 20px `footer-muted` 單色，無圓形漸層底；焦點環在 Footer 內改用 `accent-on-dark`。電話為 `tel:` 連結。版權列沿用現有文字。
- **焦點樣式（全站）：** `:focus-visible` 一律 2px `accent` outline、offset 2px（Footer 內為 `accent-on-dark`）；禁止 `outline-none` 而無替代。

### 商品卡 `ProductCard`（Phase 8 外觀、Phase 10 接線）

**已定案：整張卡為單一連結，列表頁不再有燈箱。**

- 根元素：`<Link to="/products/{id}">`（`block`，整張可點）；不再有 `role="button"`、`tabIndex`、`onClick`、`onKeyDown`、`onImageClick` prop。卡內不得再嵌套其他連結或按鈕。
- Accessible name = 商品名稱（來自卡內文字，另含價格文字；不加「查看…大圖」）。`href` = `/products/{id}`。
- **grid 版型：** `surface-raised`、1px `line`、`rounded-card`；結構由上而下：圖片（`aspect-square`、`surface-raised` 白底 #FFFFFF、`object-contain`、`loading="lazy"`、`decoding="async"`）→ 內距 16px：商品名稱（Body 600，`line-clamp-2`，保留 2 行高度避免跳動）→ 價格行（Label）→ 現貨 tag（僅 `in_stock=false` 才顯示，見待確認 Q1）。固定高度的 `h-96` 取消，改由比例與 `line-clamp` 決定，同列卡片高度以 grid `items-stretch` 對齊。
- **list 版型：** 同樣整張連結；橫排：圖 80px（base）/96px（`md`+）正方形 `rounded-control` → 名稱（Body 600）、價格行、說明（Label，`ink-muted`，`line-clamp-2`，`data-testid="product-description"` 保留）→ 右側 chevron-right 圖示（`ink-muted`，`aria-hidden`）。
- 移除：價格徽章（右上角）、hover 遮罩與放大鏡、「點擊查看大圖」、`translateY/scale` hover。
- **價格行：** 有價 → `NT$ 12,345 起`/區間文字（沿用 `product.priceText`），Label 600 `ink`；無價（`PRICE_ON_REQUEST`）→ 「洽詢」Label 400 `ink-muted`。
- **狀態：**

| 狀態 | 呈現 |
|------|------|
| default | `line` 邊框 |
| hover（指標）| 邊框 `accent`；無位移、無縮放|
| focus-visible | 焦點環（見上），邊框同 hover |
| active | 邊框維持 `accent`，無位移 |
| 無圖 / 載入失敗 | 圖片區改顯示 `ImagePlaceholder`（保留比例；`role="img"` `aria-label="暫無圖片"` 不變），卡片仍為連結 |
| loading（列表載入中）| 與卡片同尺寸的 skeleton（`surface-raised` + `motion-safe:animate-pulse`）|

### 圖片（UX-07）

- 所有商品圖放在固定比例容器：卡片 `aspect-square`、輪播 `aspect-video`、詳情主圖 `aspect-square`；`<img>` `w-full h-full`，`width`/`height` 屬性不設死但容器比例固定，載入時無版面跳動。
- 載入失敗 → `ImagePlaceholder`（背景 `surface-raised`（白）、圖示與文字 `ink-muted`，移除漸層）。
- 首屏主圖（詳情頁主圖、輪播目前 slide）`fetchPriority="high"`，其餘 `loading="lazy"`。

### 首頁熱銷輪播 `FeaturedCarousel`（Phase 8 外觀、Phase 10 連結）

- **行為層一律不動**：pointer/focus 暫停、`prefers-reduced-motion`、點擊後不黏住、前後按鈕與圓點的 role/aria 結構皆維持；只換 className。動畫與過渡包 `motion-safe:`；移除 `scale-105/group-hover:scale-110` 的 1000ms 縮放。
- 視覺：`rounded-panel`、`aspect-video`；圖片白底 + `object-contain`；說明區為圖下方獨立的 `surface-raised` 區塊（上方 1px `line`），**不使用圖上遮罩**，確保文字對比不依賴圖片內容。
- **詳情連結位置（已決定）：** 放在目前 slide 說明區內、商品名稱與說明之下，一個次要按鈕樣式的 `<Link>`，文字「查看詳情」，`aria-label="查看 {商品名稱} 詳情"`，`href=/products/{id}`。商品名稱維持標題、不是連結。圖片本身與輪播其餘區域不可點。
  - 理由：連結為獨立 tab stop，聚焦時既有 `onFocus` 會暫停輪播（WCAG 2.2.2），且不引入「整個 slide 是連結」造成的指標/焦點行為改變。
  - 只有目前顯示的 slide 內的連結可被聚焦；隱藏 slide 不可進入 tab 順序。
- 前後按鈕 44×44（`md`+ 48×48）、`shadow-float`、`surface-raised` 白底、`ink` 圖示、1px `line`；圓點為視覺 8px，點擊區 44px。
- 狀態：loading（skeleton，同 aspect-video）、空（「目前沒有精選商品」）、錯誤（`role="alert"`，`danger` 圖示 + 重試主按鈕）— 文案沿用既有。

### 價格為空（price null）版面

目前 20 筆商品皆如此，此為預設版面，非例外情況。

- 卡片：價格行顯示「洽詢」（`ink-muted`），不顯示徽章、不顯示 `NT$`、不顯示 0 或「—」。
- 詳情頁價格區塊（`surface-raised` 面板內）：
  - 標題行：「洽詢」（Heading 24px 600，`ink`）。
  - 說明（Label，`ink-muted`）：「此商品未標示價格，歡迎來電或 LINE 洽詢。」
  - 緊接兩個動作（見詳情頁 CTA）：「聯絡洽詢」「複製詢價訊息」。
- 有價時：「NT$ 12,345」（Heading 24px 600）+「含稅」（Label，`ink-muted`）；選中變體切換時價格跟著變體（`price_incl_tax` 為分，轉元）。變體價為 null 但商品有其他變體價時，該變體顯示「洽詢」。禁止出現 `NT$NaN`。
- 價格與「洽詢」區塊的高度在兩種狀態大致相同（CTA 一律保留），避免有無價切換造成版面跳動。

### 商品詳情頁 `/products/:id`（Phase 9）

Layout：`showSideMenu=false`；不加入 NAV_ITEMS。

**由上而下：**
1. 麵包屑（Label）：`首頁 / {分類名稱} / {商品名稱}`；分類名稱為連結（對應該分類路徑，無法對應時連到 `/all-products`）；最後一項為純文字 `aria-current="page"`，過長 `truncate`。外層 `<nav aria-label="麵包屑">`。
2. 返回列：「← 返回上一頁」（`navigate(-1)`；若無站內歷史，改為 `Link` 到分類頁；保證直接開啟網址時仍可用，PROD-12）。base 與麵包屑同列換行，`md`+ 置於麵包屑上方右側可省略，僅保留麵包屑與一個返回控制。
3. 主區（base 單欄 / `md`+ 兩欄，gap 32px）：
   - **左（圖）**：主圖容器 `aspect-square`、`rounded-card`、1px `line`、`surface-raised` 白底 + `object-contain`；整個容器是 `<button>`，`aria-label="放大查看 {商品名稱} 圖片"`，開啟 `ImageModal`（燈箱從列表頁移到此處，PROD-11）；右下角放 zoom 圖示（32px，`surface-raised` 底 + 1px `line`，`aria-hidden`）。無圖 → `ImagePlaceholder`，不是按鈕。變體有 `image_url` 時，切換變體即換主圖。
   - **右（資訊面板，`surface-raised`、`rounded-card`、內距 24px、區塊間距 24px）**：
     1. 品牌 · 型號（Label，`ink-muted`；任一為空則省略，型號 `overflow-wrap:anywhere`）
     2. 商品名稱 `<h1>`（base 用 Heading 24px，`md`+ 用 Display 36px）
     3. 分類 tag（Label，`rounded-control`、`line` 邊框、可為連結到分類頁）
     4. 價格區塊（見上）
     5. 變體選擇（有 ≥2 變體才顯示；0 或 1 個變體顯示單一規格資訊，無選擇器）：`role="radiogroup"` `aria-label="選擇規格"`；每個 chip 為 `role="radio"` `aria-checked`，高度 44px，`rounded-control`，文字 = `Object.entries(attributes)` 的 value 以「 / 」串接，沒有 attributes 則用 `sku`。選中：2px `accent` 邊框、文字 `accent`、底 `surface-raised`；未選：`line-strong` 邊框、`ink-muted`。預設選中後端標記 `is_default` 的變體；方向鍵切換。`in_stock=false` 的變體仍可選，chip 內附「洽詢交期」。
     6. 現貨狀態（依選中變體；單一規格看商品 `in_stock`）：有現貨 → `success` 小圓點 +「有現貨」；否 →「洽詢交期」（`ink-muted`）。只顯示二元標籤，不顯示數量。
     7. CTA 列（base 直向堆疊、`md`+ 橫排，gap 16px，按鈕高 44px）：
        - 主按鈕「聯絡洽詢」：`tel:` 連結（`contact.phoneHref`），`accent` 底、白字。若有 `lineUrl`，另外加次要按鈕「LINE 洽詢」（外開 `target="_blank" rel="noopener noreferrer"`）。
        - 次要按鈕「複製詢價訊息」：複製「{商品名稱}｜型號 {model}｜{完整網址}」（無型號則省略該段）；成功後按鈕文字 2 秒內變為「已複製」並搭配 check 圖示，外層 `aria-live="polite"` 宣告；失敗（`navigator.clipboard` 不可用）→ 顯示「複製失敗，請手動選取網址」（Label，`danger`）。
     8. 說明：標題「商品說明」（Body 600）+ 純文字 `whitespace-pre-line`，禁用 `dangerouslySetInnerHTML`；空說明整區隱藏。
     9. 規格表 `<dl>`（Label）：SKU、`attributes` 通用 `Object.entries` 渲染、保固（0 或空值整列隱藏）。無任何列時整區隱藏。
4. 頁尾沿用 Footer。

**狀態：**

| 狀態 | 呈現 |
|------|------|
| loading | 左圖 skeleton（正方形）+ 右側 4 條不同寬度 skeleton 條（`motion-safe:animate-pulse`）；版面骨架尺寸與成功態一致；`aria-busy="true"` |
| success | 如上 |
| not found（404/400）| 置中 `NotFoundState`（見文案），隱藏麵包屑中的商品名 |
| retryable error（429/5xx/網路）| 置中錯誤面板，`role="alert"`，`danger` 圖示，附「重新載入」主按鈕；429 用專屬文案 |
| 無圖 | `ImagePlaceholder`，不可開燈箱 |
| 頁面標題 | `<title>{商品名稱} | KRD</title>` 與 `<meta name="description">`（說明前 80 字，無說明則用「{品牌} {型號} {分類}」）；not found 為「找不到商品 | KRD」|

### 燈箱 `ImageModal`

沿用現有元件與行為（Esc 關閉、點背景關閉、焦點管理、防止背景捲動），改為只在詳情頁主圖使用；外觀換 token：背景 `ink/70`（半透明遮罩，圖片區為白底）、圖片 `rounded-panel` + `shadow-float`、關閉鈕 44×44 位於右上、`aria-label="關閉圖片"`。

### NotFound 頁與 `NotFoundState`

- 全域 `*` 路由與詳情 404 共用 `NotFoundState`；置中、垂直 padding 64px，`surface-raised` 面板 `rounded-card`。
- 內容：圖示（`ink-muted`，48px）→ 標題（Heading）→ 說明（Body，`ink-muted`）→ 主按鈕。
- 頁面標題：全域為「找不到頁面 | KRD」。

---

## `src/config/contact.ts` 欄位（已定案）

單一來源，Footer、AboutPage、詳情頁 CTA 共用。

```ts
export interface ContactInfo {
  /** 地址（必填）*/
  address: string;
  /** 顯示用電話（必填）*/
  phone: string;
  /** tel: 連結用電話（必填，純數字與連字號）*/
  phoneHref: string;
  /** 營業時間主行（必填）*/
  businessHours: string;
  /** 休息日備註（必填）*/
  closedNote: string;
  /** LINE 連結（選填，有值才顯示）*/
  lineUrl?: string;
  /** Email（選填，有值才顯示）*/
  email?: string;
}
```

初始值（沿用現有 Footer / AboutPage 資料）：

| 欄位 | 值 |
|------|----|
| address | `411 台中市太平區永平路二段320之1號` |
| phone | `(04) 22798787` |
| phoneHref | `04-22798787` |
| businessHours | `週一至週六 09:00 - 17:30` |
| closedNote | `週日及國定假日休息` |
| lineUrl | 不設（待 Owner 提供）|
| email | 不設（待 Owner 提供）|

- 現有兩處措辭不一致：Footer「09:00 AM ~ 17:30 PM（例、假日休息）」與 AboutPage「週一至週六 09:00 - 17:30／週日及國定假日休息」。**統一採 AboutPage 用法**（較精確，且 `17:30 PM` 為誤寫）。
- 顯示規則：`lineUrl`、`email` 為 `undefined` 或空字串時，整個項目（含圖示與標題）不渲染，不留空欄。

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA（詳情頁）| 聯絡洽詢 |
| Secondary CTA | 複製詢價訊息（成功：已複製）｜LINE 洽詢（有 `lineUrl` 才有）|
| 輪播詳情連結 | 查看詳情（`aria-label`：查看 {商品名稱} 詳情）|
| 無價 | 洽詢；說明：此商品未標示價格，歡迎來電或 LINE 洽詢。（無 LINE 時為「歡迎來電洽詢。」）|
| 有價 | NT$ {金額}　含稅 |
| 現貨 | 有現貨｜洽詢交期 |
| 無圖 | 暫無圖片 |
| 列表空狀態 標題 | 目前沒有商品 |
| 列表空狀態 內文 | 這個分類暫時沒有商品，請稍後再來，或直接來電洽詢。 |
| 找不到商品 標題 | 找不到商品 |
| 找不到商品 內文 | 這個商品可能已下架，或網址有誤。 |
| 找不到商品 按鈕 | 回到所有商品（連到 `/all-products`）|
| 找不到頁面 標題 | 找不到頁面 |
| 找不到頁面 內文 | 您要找的頁面不存在，請回到首頁重新瀏覽。 |
| 找不到頁面 按鈕 | 回到首頁 |
| 可重試錯誤 標題 | 暫時無法載入商品 |
| 可重試錯誤 內文 | 網路或伺服器發生問題，請稍後再試一次。 |
| 429 錯誤 內文 | 目前瀏覽人數較多，請等幾秒後再試一次。 |
| 錯誤按鈕 | 重新載入 |
| 複製失敗 | 複製失敗，請手動選取網址 |
| 返回 | 返回上一頁（備援：返回{分類名稱}）|
| Skip link | 跳到主要內容 |
| Destructive confirmation | 本 phase 無破壞性操作 |

---

## 使用者確認紀錄

| # | 事項 | 結果 |
|---|------|------|
| 1 | `in_stock=false` 商品是否在列表顯示 | **已確認：照常顯示，並加「洽詢交期」tag**（卡片價格行下方、詳情頁同樣顯示）。不新增前端篩選。|
| 2 | 視覺方向 | **使用者拒絕保留原深色 slate**，授權 orchestrator 決定新方向（使用者：「不要保留原本的 整個換掉 但要換什麼我也不知道你決定」）。**已採用：專業器材型錄，淺色主題**（見「視覺方向」與 Color）。|
| 3 | 輪播詳情連結位置 | **已確認：目前 slide 說明區內的次要按鈕「查看詳情」**。|
| 4 | 營業時間措辭與 LINE／Email | **已確認：採 AboutPage 版本；LINE／Email 有值才顯示**。|

DESIGN-01 的最終確認：待 checker 通過後，由使用者對整份 UI-SPEC 做最終確認；在此之前 frontmatter 維持 `status: draft`。

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none（專案不使用 shadcn）| not applicable |
| third-party | none | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
