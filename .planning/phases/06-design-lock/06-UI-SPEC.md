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
> 狀態 `draft`：checker 通過後仍需使用者做最終確認才算 DESIGN-01 完成。
> **權威視覺參考：** `.planning/phases/06-design-lock/mockups/`（7 檔 `.dc.html`：home-desktop / home-mobile / list-desktop / list-tablet / list-mobile / detail-desktop / detail-mobile，數值寫在 inline style）。本文與示意稿有出入時以示意稿為準，但已在本文「示意稿正規化」處明列的項目以本文為準。

**來源：** REQUIREMENTS.md（DESIGN-01~03、SHELL、UX、PROD、LINK）、ROADMAP.md Phase 6、`.planning/research/*`、現有 `src/`、示意稿、使用者多輪決定（見文末「使用者確認紀錄」）。

---

## 視覺方向

**名稱：溫暖在地小店 × 深石板藍（C5a）。** 深色主題（dark only，不做淺色切換）。

- 使用者要求：不要太正經、太制式、太常見；要親切、有人味。像「在太平開店的音響行」，不像企業型錄。
- 深石板藍底、琥珀橘單一強調；層次靠色塊（深丹寧、沙色、琥珀棕）與實色位移陰影，不靠模糊陰影、漸層或毛玻璃。
- 手作感元素：微傾斜的貼紙分類卡與便條卡、琥珀「膠帶」、手繪風線條圖示、虛線預留框、標題下琥珀螢光筆底線、圓形「營業中」戳章。
- 口語文案（「打電話問問」「價格請來電」「有空來店裡坐坐」）。
- 商品圖一律白底容器 + `object-contain`，去背商品照乾淨呈現。
- 頁面骨架：**不要傳統 header + 大 footer**。改為膠囊浮動頂列 + 一行頁尾；聯絡資訊放首頁「有空來店裡坐坐」區塊；手機底部固定撥號列。

---

## 主視覺錨點（每頁一個視線落點）

| 頁面 | 主視覺錨點 |
|------|-----------|
| 首頁 | h1 Display +店面照片預留位（傾斜 2deg、營業中戳章）+ 主要 CTA（「逛逛商品 →」與頂列/固定列的「打電話問問」）|
| 列表頁 | h1 Display + 分類 chip 列（選中 chip 為 `accent` 實心，是頁面上唯一的 accent 色塊）|
| 詳情頁 | 主圖（白底、琥珀膠帶、傾斜 -1.2deg）+ h1 Display + 價格區塊（`block-2` 底，緊接 CTA）|
| 關於我們 | h1 Display（「關於我們」）+ 聯絡資訊區塊（沿用首頁聯絡區樣式：`block-2` 底、地址、營業時間、電話按鈕）|
| NotFound / 找不到商品 | 標題 Heading + 主按鈕（回到首頁／回到所有商品）|

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none（Tailwind 3.4 + 自訂語意 token；無 `components.json`，不採用 shadcn）|
| Preset | not applicable |
| Component library | none（自製元件）|
| Icon library | 不新增套件；集中於 `src/components/icons.tsx` 的 inline SVG（`aria-hidden`、stroke 2）。圖示：phone、menu、close、chevron-left/right、zoom、copy、check、arrow（`→` 以文字字元呈現）。分類圖示 4 個手繪風線條圖（有線麥克風、無線麥克風、擴大機/喇叭、配件，路徑取自示意稿 home-desktop，viewBox 64、stroke 3.5、round cap）。|
| Font | 系統字型堆疊，不載入 webfont |

### 字型堆疊（DESIGN-03）

```
font-sans: "PingFang TC", "Microsoft JhengHei", "微軟正黑體", "Noto Sans TC", system-ui, sans-serif
```

- `tailwind.config.js` 的 `fontFamily.sans` 與 `src/index.css` 的 `body font-family` 必須同步；index.css 改為只繼承 token（`font-family: theme("fontFamily.sans")`）。
- 型號等拉丁字串用 `overflow-wrap: anywhere`。
- 行高：Body/Label 1.6；Heading 1.25；Display 1.15；卡片名稱（Body 600，≤ 2 行）覆寫為 1.35。

---

## 單一斷點表

只使用三段：base、`md`（768px）、`xl`（1280px）。`sm`、`lg`、`2xl` 不得出現在 className。涵蓋 320–1440px。

| 區塊 | base（320–767）| `md`（768–1279）| `xl`（≥1280）|
|------|----------------|------------------|---------------|
| 頁面左右 padding | 16px | 32px | 64px（內容寬度 `max-w-[1280px]` 置中）|
| 頂列 | Logo + 選單鈕（44×44，`block-3` 底），選單展開為膠囊面板（逛商品、關於我們、打電話問問）| 水平：Logo、逛商品、關於我們、右側「打電話問問」膠囊（無漢堡）| 同 `md` |
| 底部固定列 | 有（首頁/列表/關於：全寬「打電話問問」；詳情：「複製詢價」+「打電話問問」雙鈕）| 無 | 無 |
| 首頁 hero | 單欄，照片預留位在文字下方（高 200）| 單欄，照片預留位在下（高 320）| 兩欄 6fr / 5fr，gap 64px，照片預留位高 420 |
| 首頁分類貼紙卡 | 2 欄 | 2 欄 | 4 欄（gap 32）|
| 首頁「這陣子大家都在問」 | 橫向捲動條（卡寬 260）| 3 張並排 | 3 張並排（gap 32）|
| 首頁聯絡區 | 單欄堆疊（地圖預留位高 140，無電話按鈕，由底部固定列承擔）| 單欄堆疊 | 兩欄 5fr / 4fr，地圖預留位高 220 |
| 列表頁分類 chip | 單列橫向捲動（出血到畫面邊，`overflow-x:auto`）| 可換行 | 可換行 |
| 列表 grid | 2 欄（gap 16）| 3 欄（gap 24）| 4 欄（gap 32）|
| 詳情頁 | 單欄 | 單欄，主圖 `max-w-[520px]` 置中，按鈕列行內（非固定）| 兩欄 5fr / 6fr，gap 48px |

- 1024px 落在 `md`，頂列僅 2 個連結 + 1 個按鈕，不會擠壓或折行（WR-04 因導覽縮減而根除，不再需要把水平選單提高到 `xl`）。
- 觸控目標最小 44×44px。

---

## Spacing Scale

只使用 7 個標準值，皆為 4 的倍數。

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 圖示與文字間距、tag 垂直 padding、手機頂列內距 |
| sm | 8px | 緊湊元素間距、chip gap（桌機與手機）、卡內元素間距、手機商品卡內距 |
| md | 16px | 預設間距、卡片內距、chip 水平內距、tag 水平內距、base 頁面 padding、手機 grid gap |
| lg | 24px | 區塊內距、`md` grid gap、詳情單欄 gap、手機聯絡區內距 |
| xl | 32px | `md` 頁面 padding、`xl` grid gap、便條卡 gap、NotFound 面板內距、列表結尾區塊內距 |
| 2xl | 48px | 聯絡區內距、詳情雙欄 gap、主要區塊間距 |
| 3xl | 64px | `xl` 頁面 padding、桌機首頁區塊間距、NotFound 垂直 padding |

Exceptions（非間距 token）：
- 觸控／按鈕元件高度：**44px（一般按鈕、chip、頂列連結、選單鈕、圓形輪播鈕、燈箱關閉鈕）與 56px（主 CTA、手機固定列、詳情 CTA）兩種**。
- 元件尺寸：分類圖示圓 64×64、列表圖 80/96px、頂列 Logo 高 30/26px、營業中戳章直徑 148px、膠帶 96×28 與 120×32、「放大看」pill 高 36px（純裝飾、`aria-hidden`）、地圖/照片預留位高度。
- 邊框 1/2/3px、焦點環 2px + offset 3px。
- 版面內留白 ≥ 8px 以避免傾斜/焦點環被裁（見傾斜規則）。

### 示意稿正規化（以本文為準）
示意稿的 6px→4px、10px→8px、12px→8px（chip gap、卡內間距）或 16px、20px→16px（卡片內距）或 24px、28px→24px、40px→32px（便條卡 gap）、56px→48px（詳情雙欄 gap）；頂列內距手機 6/6/6/20 → 4/4/4/16、桌機 8/8/8/24 不變；「放大看」pill 內距 14→16；按鈕高 48→44、60/52→56；結尾區塊內距 28/40 → 24/32。

---

## Typography

**4 個字級、2 個字重（400、600）**。禁用 `font-bold` / `font-medium`。字型堆疊同上。

| Role | Size | Weight | Line Height | Tailwind token | 用途 |
|------|------|--------|-------------|----------------|------|
| Label | 15px | 400（強調 600）| 1.6 | `text-label` | 品牌/型號、tag、麵包屑、規格表、輔助說明、版權列、現貨標籤、`看看 →` |
| Body | 17px | 400（卡片名稱、按鈕、chip 選中、小標用 600）| 1.6（卡片名稱 1.35）| `text-body` | 內文、導覽、按鈕、商品卡名稱、便條卡名稱、價格（有價用 600）、詳情品牌/型號、導言 |
| Heading | 28px（**base 24px**）| 600 | 1.25 | `text-heading` | h2、分類貼紙卡名稱、詳情價格區標題（「價格請來電」「NT$ 12,345」）、「營業中」戳章標題、「找不到想要的？」標題、空/錯誤/NotFound 狀態標題 |
| Display | 48px（**base 32px**）| 600 | 1.15 | `text-display` | 所有頁面 h1（首頁、列表、詳情、關於、NotFound 一律同一級）|

**響應式例外（僅此兩處）：** Heading 在 base 為 24px、Display 在 base 為 32px，視為同一 token 的響應式值，不另計字級。`md` 與 `xl` 皆用 Heading 28 / Display 48。除此之外**不得再新增字級或響應式字級**。

- 卡片名稱（商品卡、便條卡）一律 Body 17px/600，手機同為 17px。
- 按鈕文字（含頂列、固定列、CTA）一律 Body 17px/600。
- 不使用 12px/14px/18px/20px/22px/32px/56px 等其他值。

### 示意稿正規化（以本文為準）
示意稿 14px→Label 15px；18px（卡片名稱、手機固定列）→Body 17px；19px（導言）→Body 17px；20px（便條卡名稱、按鈕、戳章標題）→Body 17px（名稱、按鈕）或 Heading 28px（戳章標題）；22px（分類卡名稱、聯絡區標題）→Heading 28px（base 24px）；28px（詳情價格）→Heading 28px；32px（h2）→Heading 28px（base 24px）；h1 56/48/44（手機 34/32/30）→ Display 48（base 32）。各頁 h1 不再分級。

---

## Color（語意 token，C5a）

於 `tailwind.config.js` 的 `theme.extend.colors` 定義；全站禁止直接寫 `slate-*`、`gray-*`、`#hex`、`white/10` 等（DESIGN-02）。對比值以 WCAG 相對亮度公式實算。

| Token | Hex | 佔比 / 角色 | 用途 |
|-------|-----|-------------|------|
| `surface` | `#27303B` | Dominant 60% | 頁面背景（純色）|
| `surface-raised` | `#323C49` | Secondary 30% | 頂列、商品卡、便條卡、詳情主圖邊框、未選中 chip、聯絡區地圖預留位、手機固定列 |
| `ink` | `#EEF1F5` | 文字 | 主要文字、標題、描邊按鈕邊框與文字 |
| `ink-muted` | `#B9C2CD` | 文字 | 品牌/型號、麵包屑、輔助說明、版權列 |
| `accent` | `#F0A04B` | Accent 10% | 主按鈕底色（**深字 `accent-ink`**）、連結文字、焦點環、選中 chip 底（主列表 chip）/ 邊框（變體 chip）、`查看詳情 →`、`aria-current` 指示 |
| `accent-ink` | `#1C232C` | 文字 | 按鈕在 `accent` 底上的文字 |
| `accent-hover` | `#F6BC7C` | 狀態 | 連結與主按鈕 hover；手機固定撥號列的實色底陰影 |
| `accent-shadow` | `#B5732E` | 裝飾 | 主按鈕下方 6px 實色陰影（`0 6px 0`）|
| `block-1` | `#2C4258` | 色塊（深丹寧）| 分類 tag、貼紙分類卡（有線麥克風）|
| `block-2` | `#3A4A5E` | 色塊 | 價格區、聯絡區、貼紙分類卡（無線麥克風）、熱銷/列表「價格請來電」tag、頂列選中項底 |
| `block-3` | `#5A4A1E` | 色塊（琥珀棕）| 「洽詢交期」tag、「營業中」戳章、貼紙分類卡（擴大機/喇叭）、手機選單鈕底 |
| `sand` | `#3A4553` | 色塊 | 規格表 `<dl>`、頂列實色陰影、店面照片預留位底、便條卡實色陰影 |
| `dash` | `#5A6676` | 邊框 | 虛線預留框、未選中 chip / 次要按鈕 1px 邊框 |
| `tape` | `#F0B43C` | 僅裝飾 | 膠帶（`tape` 加 80% 不透明度，即 `bg-tape/80`）、標題下螢光筆底線。**不承載資訊、不作文字色** |
| `success` | `#7ED6A0` | 語意 | 僅「有現貨」文字與小圓點 |
| `danger` | `#FF8A7A` | 語意 | 僅錯誤圖示、錯誤標題、複製失敗文字 |
| `white` | `#FFFFFF` | 商品圖 | 商品圖容器底（卡片、便條卡、詳情主圖、燈箱）；`object-contain` |

### 對比驗證（WCAG 2.x；正文 ≥ 4.5:1、大字/UI 元件 ≥ 3:1）

| 前景 / 背景 | 對比 | 結果 |
|-------------|------|------|
| `ink` / `surface` | 11.79:1 | AA、AAA |
| `ink` / `surface-raised` | 9.87:1 | AA、AAA |
| `ink-muted` / `surface` | 7.42:1 | AA、AAA |
| `ink-muted` / `surface-raised` | 6.21:1 | AA |
| `ink-muted` / `sand` | 5.41:1 | AA |
| `ink-muted` / `block-1` | 5.75:1 | AA |
| `ink-muted` / `block-2` | 5.02:1 | AA |
| `ink-muted` / `block-3` | 4.79:1 | AA（邊緣，block-3 上改用 `ink`）|
| `accent-ink` / `accent`（按鈕）| 7.42:1 | AA、AAA |
| `accent`（文字、焦點環）/ `surface` | 6.26:1 | AA |
| `accent`（文字、焦點環）/ `surface-raised` | 5.24:1 | AA |
| `accent-hover` / `surface` | 7.89:1 | AA、AAA |
| `ink` / `block-1` | 9.14:1 | AA、AAA |
| `ink` / `block-2` | 7.99:1 | AA、AAA |
| `ink` / `block-3` | 7.62:1 | AA、AAA |
| `ink` / `sand` | 8.60:1 | AA、AAA |
| `success` / `surface-raised` | 6.40:1 | AA |
| `danger` / `surface-raised` | 4.88:1 | AA |
| `danger` / `surface` | 5.83:1 | AA |
| `accent` / `sand`（**禁用組合**）| 4.56:1 | 太邊緣，**禁止 accent 文字放在 `sand` 上** |
| `accent` / `block-2`（**禁用組合**）| 4.24:1 | 不達 AA，**禁止 accent 文字放在 `block-2` 上** |
| `ink` / `accent`（**禁用組合**）| 1.88:1 | 按鈕一律用 `accent-ink` 深字，禁用 `ink` 白字 |
| `dash` / `surface-raised` | 1.92:1 | 僅裝飾性邊框；chip 的可辨識性來自 9.87:1 的文字，不依賴邊框 |
| `ink-muted` / `white` | 1.80:1 | 禁止在白色商品圖容器上放 `ink-muted` 文字（圖容器內只放圖片）|

**Accent reserved for（嚴格限定，禁止「所有可互動元素」）：**
1. 主按鈕底色（打電話問問、聯絡電話、重新載入、回到所有商品/首頁）
2. 內文連結文字、麵包屑連結、`查看詳情 →`、列表頁「選中」chip 底
3. 目前所在頁的導覽指示（頂列選中項改用 `block-2` 底 + 600 字重，不用 accent 填色；accent 僅用於 `aria-current` 的 chip）
4. 選中的變體 chip：2px `accent` 邊框與文字
5. 鍵盤焦點環（2px，offset 3px）
6. 首頁 hero 電話連結（accent 文字 + 虛線底線）

**Destructive：** 本 phase 無破壞性操作；`danger` 只用於錯誤呈現。

---

## 圓角、陰影、傾斜

### 圓角

| Token | 值 | 用途 |
|-------|----|------|
| `rounded-pill` | 9999px | 按鈕、chip、頂列、tag、營業中戳章（圓形）、輪播按鈕 |
| `rounded-image` | 16px | 商品圖容器 |
| `rounded-card` | 20px（手機商品卡 16px）| 商品卡、便條卡、規格表 `<dl>` |
| `rounded-block` | 24px | 價格區塊、分類貼紙卡（全斷點）、詳情主圖、地圖預留位、店面照片預留位（手機）、「找不到想要的？」、NotFound 面板、手機聯絡區 |
| `rounded-panel` | 32px | 桌機首頁聯絡區、桌機店面照片預留位 |

收斂說明：示意稿 14→16、28→24、40→32（手機聯絡區 32→24）。

### 陰影（實色位移，無模糊）

| Token | 值 | 用途 |
|-------|----|------|
| `shadow-card` | `0 6px 0 rgba(0,0,0,0.3)`（手機 4px）| 商品卡、貼紙分類卡、詳情主圖（8px）|
| `shadow-note` | `0 6px 0 {sand}` | 便條卡（手機 4px）|
| `shadow-bar` | `0 6px 0 {sand}` | 頂列（手機 4px）|
| `shadow-btn` | `0 6px 0 {accent-shadow}` | 主按鈕（桌機）；手機固定撥號列用 `0 6px 0 {accent-hover}`（示意稿）|
| `shadow-float` | `0 -6px 16px rgba(0,0,0,0.25)` | **僅**詳情頁手機底部固定列、手機選單面板（唯一的模糊陰影）|

### 傾斜（靜態，不是動畫）

| 元素 | 角度 |
|------|------|
| 首頁分類貼紙卡 | -2deg、1.5deg、-1deg、2deg（依序）|
| 首頁便條卡 | -1.5deg、1deg、-0.5deg（循環）|
| 列表商品卡 | ±0.4–0.8deg（桌機與手機同；由 index 循環）|
| 詳情主圖 | -1.2deg；膠帶 -4deg |
| 首頁店面照片預留位 | 2deg（手機 1.5deg）；營業中戳章 -10deg；地圖預留位 -1.5deg |

規則：
- 傾斜為靜態 `transform: rotate()`，與 `motion-safe` 無關；**hover/focus/active 不位移、不縮放**（取消現有 `translateY/scale`）。
- 任一元素傾斜角度絕對值 ≤ 2deg（戳章 -10deg 為純裝飾圓形，除外）。
- **可讀性：** 文字密集區塊（價格區、規格表、變體選擇、說明、聯絡區文字、表單/按鈕列）不傾斜；只有卡片外框與圖片傾斜，最大 2deg 在 22px 以上文字可接受。Phase 8 UAT 須在 Windows Chrome 檢查文字 antialias 不模糊（若模糊，該元素角度降到 ≤ 1deg 或加 `will-change: transform`）。
- **焦點環：** 一律 2px `accent`、**offset 3px**，環跟著元素一起傾斜（跟形狀一致，可接受）。傾斜容器的父層**不可** `overflow:hidden` 或需留 ≥ 8px padding，避免旋轉後的角落與焦點環被裁（卡片 grid 外層、便條卡列、橫向捲動條都要留 padding-top/bottom 16px）。
- 卡片內容 `forced-colors`/高對比模式：邊框改為 1px `CanvasText`（不特別設計，僅避免消失）。

---

## 全站焦點與互動狀態

- `:focus-visible`：2px `accent` outline、offset 3px；禁止 `outline-none` 而無替代。
- 主按鈕：default `accent` 底 + `accent-shadow` 實色陰影；hover `accent-hover` 底（陰影不變）；active 陰影縮為 2px（按下感，僅陰影，不位移元素）；focus-visible 焦點環。
- 描邊按鈕（回上一頁、複製詢價）：1px `dash`（回上一頁）或 2px `ink`（複製詢價）邊框、透明底；hover 底 `surface-raised`。
- 連結：預設 `accent`、hover `accent-hover`、無底線（`查看詳情 →`、麵包屑）；內文長連結加底線。
- 過渡：僅 150ms 顏色/邊框；其餘動效包 `motion-safe:`，並尊重 `prefers-reduced-motion`。

---

## 元件契約

### 膠囊浮動頂列 `NavBar`（Phase 8）

- 取代舊 NavBar：`surface-raised`、`rounded-pill`、`shadow-bar`（`sand` 實色陰影）、無 blur。內距 8px 8px 8px 24px（手機 4px 4px 4px 16px）。頂列為文件流中的第一個區塊（不 sticky；頁面頂端 padding 24px / 手機 16px）。
- `md`+：Logo（`public/brand-logo.png`，高 30px）→ `<nav aria-label="主選單">`：「逛商品」（`/all-products`）、「關於我們」（`/abouts`），高 44px、`rounded-pill`、內距 16px；目前頁用 `aria-current="page"`：底 `block-2` + 600。右側主按鈕「打電話問問」（高 44px、內距 24px、phone 圖示 + 文字，`tel:` 連結 `contact.phoneHref`）。
- 「逛商品」選中判定：目前路徑為 `NAV_ITEMS` 任一或 `/products/:id`。
- base：Logo（高 26px）+ 44×44 選單鈕（`aria-label="開啟選單"`、`aria-expanded`、`aria-controls`；底 `block-3`）；展開為頂列下方膠囊面板（`surface-raised`、`rounded-block`、`shadow-float`），項目：逛商品、關於我們（皆高 44px）；Esc 與點外側關閉（沿用現有行為）；展開時鈕的 `aria-label` 為「關閉選單」。
- Skip link「跳到主要內容」為第一個 tab stop，`sr-only`，focus 時顯示於左上（主按鈕樣式），指向 `<main id="main">`。

### 手機底部固定列（base only，Phase 8；詳情 Phase 9）

- **首頁 / 列表 / 關於 / NotFound：** `position: fixed`，left/right/bottom 16px，高 56px，全寬「打電話問問」主按鈕（phone 圖示 + 文字，Body 17px/600），`shadow-btn` 手機版。頁面底部須留 ≥ 96px padding，避免遮住內容。
- **詳情頁：** 固定列貼齊底部（left/right/bottom 0），`surface-raised`、padding 16px、`shadow-float`，grid 2fr / 3fr、gap 8px：左「複製詢價」（描邊 2px `ink`、高 56px）、右「打電話問問」（主按鈕、高 56px）。取代同頁的行內 CTA（`md`+ 才顯示行內 CTA）。頁面底部留 ≥ 96px。
- 鍵盤或虛擬鍵盤彈出時固定列不應遮住聚焦元素（頁面無輸入欄位，風險低；變體 chip 在上方捲動區）。

### 頁尾（一行）

- 取代舊 Footer。置中 Label（`ink-muted`）一行。
- 首頁與列表頁：「© KRD・謝謝你逛到這裡」。
- 詳情頁、關於我們、NotFound：「© KRD・{address}・{businessHours}」（base 自動換行）。
- SHELL-03 對應：地址、電話、營業時間在首頁聯絡區完整呈現；其他頁以頁尾一行呈現地址與營業時間，電話由頂列/固定列的「打電話問問」承擔。LINE／Email 有值才顯示（見 contact.ts，首頁聯絡區內另列）。

### 首頁（Phase 8）

由上而下：頂列 → hero → 分類貼紙卡 → 這陣子大家都在問 → 聯絡區 → 頁尾 → （base）底部固定列。區塊垂直間距 `xl` 64px / base 32px。

1. **hero：** 小 tag「台中太平・實體門市」（`block-1` 底、`rounded-pill`、Label 600）→ h1「找麥克風、喇叭？來問我們就對了。」（Display；「來問我們」下方 SVG 琥珀螢光筆底線 `tape` 7px，手機改為 `border-bottom: 4px solid tape`）→ 導言（Body、`ink-muted`、`max-w-[520px]`）→ 按鈕列：「逛逛商品 →」（`ink` 底、`surface-raised` 字、高 56px、`rounded-pill`，連 `/all-products`）+ 電話連結（`accent` 文字 + 2px 虛線 `accent` 底線，顯示 `contact.phone`）。手機版 hero 不放按鈕列（由底部固定列與頂列承擔，詳示意稿 home-mobile）。
2. **店面照片預留位：** 見「素材預留位」。
3. **營業中戳章：** 直徑 148px 圓形、`block-3` 底、-10deg、`0 6px 0` 實色陰影（`shadow-card`，`0 6px 0 rgba(0,0,0,0.3)`）、標題「營業中」Heading、副行 Label 兩行「週一至週六／09:00–17:30」。僅 `xl` 顯示，位於照片預留位左下（left -32px）。戳章文字取自 `contact.businessHours`（解析不易時整句顯示於 Label，不拆時段）。
4. **分類貼紙卡（h2「想找什麼？」）：** 4 張整張為 `<Link>`：有線麥克風 `/wired-micphone`（`block-1`）、無線麥克風 `/wireless-micphone`（`block-2`）、擴大機 / 喇叭 `/trumpet`（`block-3`）、配件 `/accessories`（`surface-raised`）。結構：左上 64×64 圓形（`surface-raised` 底；配件卡因卡色同底，圓形改 `block-1`）內放手繪風圖示（34px，`ink` 線）→ 底部一行名稱（Heading）+ 右側「看看 →」（Label）。min-height 180（手機 136，容納兩行 Heading 名稱）、padding 24（手機 16）、`rounded-block`、`shadow-card`、傾斜如上。名稱取自 `PRODUCT_PAGE_VIEWS[path].title`，不另寫死。
5. **「這陣子大家都在問」：** 見「熱銷便條卡」。
6. **聯絡區（`block-2` 底、`rounded-panel`、padding 48、手機 24、手機圓角 `rounded-block`）：** h2「有空來店裡坐坐」→ 地址（Body）→ 營業時間（`businessHours` + 括號 `closedNote`；手機 `closedNote` 換行 Label `ink-muted`）→ 主按鈕（`contact.phone` 文字、高 56px、Body 17px/600；手機不放，由固定列承擔）→ 地圖預留位（見素材預留位）。`lineUrl`／`email` 有值時，在地址下方多一列連結（Body；文字 `ink`，連結以底線區分，**不用 accent，因 accent 在 block-2 上不達 AA**）。

### 列表頁（Phase 8；連結接線 Phase 10）

- h1（Display 48px / 手機 32px）= 該頁 `title` + 副行（Label→Body、`ink-muted`）「共 {n} 項。看到喜歡的，直接打電話問最快。」。副行與 grid/list 切換、排序控制排在同一標題區（保留現有 grid/list 切換與名稱排序功能；控制項為 44px 高的 `rounded-pill` 描邊切換鈕，選中為 `block-2` 底 + 600，見 UX-05）。
- **分類 chip 列（`<nav aria-label="商品分類">`）：** 8 個 chip 取自 `NAV_ITEMS`（順序不變）。`md`+ 可換行、gap 8；base 單列橫向捲動（`overflow-x:auto`、左右出血至畫面邊、`white-space:nowrap`、gap 8、底部留 4px 避免捲軸遮擋）。chip 高 44px、`rounded-pill`、padding 16px。選中（`aria-current="page"`）：`accent` 底 + `accent-ink` 600；未選中：`surface-raised` 底、1px `dash` 邊框、`ink`。chip 為 `<Link>`。取代舊 SideMenu。
- grid：2/3/4 欄（見斷點表）；list 版型保留（單欄）。
- 結尾「找不到想要的？」區塊（`block-2` 底、`rounded-block`、padding 24 32）：標題（Heading）「找不到想要的？」+ 副行「我們店裡還有很多沒放上來，打個電話問最快。」+ 主按鈕（電話號碼文字）；base 隱藏按鈕（固定列承擔），保留文字。
- 頁尾：「© KRD・謝謝你逛到這裡」。

### 商品卡 `ProductCard`（Phase 8 外觀、Phase 10 接線）

**已定案：整張卡為單一連結，列表頁不再有燈箱。**

- 根元素：`<Link to="/products/{id}">`（`block`）；移除 `role="button"`、`tabIndex`、`onClick`、`onKeyDown`、`onImageClick` prop。卡內不得再嵌其他連結或按鈕。
- Accessible name：由卡內文字組成（商品名稱、價格文字）；不再有「查看 … 大圖」。`href` = `/products/{id}`。
- **grid 卡：** `surface-raised`、`rounded-card`（手機 16）、padding 16（手機 8）、`shadow-card`、列表傾斜。由上而下：圖片容器（`aspect-square`、`white`、`rounded-image`、`object-contain`、`loading="lazy"`、`decoding="async"`）→ 品牌（Label、`ink-muted`）→ 商品名稱（Body 600、`line-clamp-2`、保留 2 行高度 min-h 48px / 手機 44px）→ 標籤列（flex-wrap gap 8）：價格 tag 或價格文字、「洽詢交期」tag（僅 `in_stock=false`）。取消固定 `h-96`；同列卡片靠 grid `items-stretch` 對齊。
- **list 卡：** 同樣整張連結；橫排：圖 80px（base）/96px（`md`+）正方形 `rounded-image` → 名稱（Body 600）、品牌、標籤列、說明（Label、`ink-muted`、`line-clamp-2`、`data-testid="product-description"` 保留）→ 右側 chevron-right（`ink-muted`、`aria-hidden`）。
- **價格行：** 無價（`PRICE_ON_REQUEST`）→ tag「價格請來電」（`block-2` 底、`rounded-pill`、Label、`ink`）；有價 → 價格文字（Body 600 `ink`，沿用 `product.priceText`）。**無價格徽章（右上）、無 hover 遮罩/放大鏡、無「點擊查看大圖」。**
- **「洽詢交期」tag：** `block-3` 底、`rounded-pill`、Label、`ink`（不用 muted）；與價格 tag 並排。
- **狀態：**

| 狀態 | 呈現 |
|------|------|
| default | `shadow-card`、傾斜 |
| hover（指標）| 外框 2px `accent`（以 `outline` 或 `box-shadow` inset 呈現，不改版面尺寸）；無位移、無縮放、無圖片縮放 |
| focus-visible | 焦點環 2px `accent`、offset 3px |
| active | 與 hover 相同 |
| 無圖 / 載入失敗 | 圖片區改為 `ImagePlaceholder`（保留正方形；`role="img"` `aria-label="暫無圖片"` 不變），卡仍為連結 |
| loading | 同尺寸 skeleton（`surface-raised` + 圖片區 `sand`、`motion-safe:animate-pulse`）|

### 熱銷便條卡「這陣子大家都在問」`FeaturedCarousel`（Phase 8 外觀、Phase 10 連結）

**取代原「單張大圖輪播」外觀。** 標題列（h2「這陣子大家都在問」）右側為兩顆 44×44 圓形按鈕（`aria-label` 見下）。

- **便條卡：** 整張為 `<Link to="/products/{id}">`（`aria-label="查看 {商品名稱} 詳情"`）；`surface-raised`、`rounded-card`、padding 16、`shadow-note`、傾斜 -1.5/1/-0.5deg 循環；頂端琥珀膠帶（`tape` 80% 透明，96×28，`aria-hidden`，-4deg，置中、top -14px）。結構：圖片容器（高 200 / 手機 170、`white`、`rounded-image`、`object-contain`）→ 品牌（Label、`ink-muted`）→ 名稱（Body 17px/600，行高 1.35）→ 底列：左 tag「價格請來電」（`block-2`）或價格、右 `查看詳情 →`（`accent`、600；手機「詳情 →」）。**`accent` 文字在 `surface-raised` 上 5.24:1，符合；但不得放在 block-2 / sand 上。**
- **版面：** `md`+ 一次 3 張並排（grid 3 欄，gap 32，外層留 padding-top 16px 給膠帶）；base 為橫向捲動條（卡寬 260、gap 16，`scroll-snap-type: x mandatory`、卡 `scroll-snap-align: start`，左側 padding 16px，出血到畫面邊）。條下方 Label 提示「← 左右滑動看更多 →」（`ink-muted`）。
- **按鈕：** 「上一張」「下一張」（`aria-label` 沿用現有字串 `上一張`／`下一張`，每按一次移動 1 張，不改成「組」以免連動測試改寫）；左鈕描邊（2px `ink`、透明底）、右鈕實心（`ink` 底、`surface-raised` 圖示）。只有 ≥ 2 筆才顯示。指示點（`aria-label="第 N 張"`）保留，置於卡列下方置中，視覺 8px、點擊區 44px；示意稿未畫，為保留既有契約而保留（`md`+ 與 base 皆顯示；base 僅在 ≥ 2 筆）。
- **狀態：** loading（3 張 skeleton，文字「載入產品中...」保留於 `aria-live` 區）、空（「目前沒有精選商品」）、錯誤（`role="alert"`、`danger` 圖示、「重新載入」主按鈕）— 文案沿用既有。

#### 既有輪播行為契約如何保留

資料與狀態機層**不動**：`activeIndex` 與 `items`、`intervalMs` 計時、`isHovered`、`hasFocusWithin`、`isPointerDownRef` 與其 pointer/focus/blur 事件處理，一律沿用。重設計只改 JSX 結構與 className。

| 行為契約（WCAG 2.2.2）| 新版處理 |
|------------------------|----------|
| 自動輪播依 `intervalMs` 前進 | 狀態機不變；`activeIndex` 代表「3 張視窗的第一張」（`md`+ 顯示 `items[activeIndex]`、`+1`、`+2`，循環取模；筆數 < 3 時顯示全部、不重複）。每次前進 1 張 |
| 滑鼠 hover 暫停（僅 `pointerType==="mouse"`）| 事件綁在整個便條卡容器（含 3 張卡與按鈕）上，與現行一致 |
| 焦點進入暫停（僅非指標焦點）| 便條卡 `<Link>` 為 tab stop；聚焦連結觸發容器 `onFocus` → 暫停；`onBlur` 離開容器才恢復。**隱藏（不在視窗內）的卡不渲染，因此不在 tab 順序內**（`md`+）|
| 觸控不暫停、點擊後不黏住 | 事件邏輯不變（`pointerdown/up/cancel`、`click` 清旗標）|
| `prefers-reduced-motion` 時不自動播放、手動仍可切換 | 不變；`motion-safe:`/`motion-reduce:` 包動畫與過渡；切換不使用位移動畫（直接換卡，最多 150ms 淡入且包 `motion-safe:`）|
| 手動切換後重新計時 | 不變 |
| **新增：base 不自動播放** | 橫向捲動條由使用者自行滑動，與自動前進互相打架。base（`max-width: 767px`）一律視為「不自動播放」，用與 reduced-motion 相同的機制（`matchMedia("(max-width: 767px)")`）。base 時 `activeIndex` 僅供指示點與按鈕使用：按鈕與指示點改為 `scrollIntoView({inline: "start"})` 該卡（`behavior` 在 reduced-motion 時為 `auto`，否則 `smooth`）。|

#### 對 Phase 8 / Phase 10 測試的影響（`FeaturedCarousel.test.tsx`，約 19 項）

- **契約類（不得刪除，總數不得減少 TEST-06）：** 狀態（載入中、失敗＋重新載入、空）、只有一筆不顯示箭頭/指示點、點下一張切換、自動播放依 `intervalMs`、reduced-motion 不自動切換、hover 暫停、觸控不暫停、焦點暫停/恢復、滑鼠/觸控點擊取得焦點不暫停、鍵盤焦點仍暫停、pointercancel、非按鈕區域點擊、手動切換重新計時。
- **需調整斷言（呈現類，語意不變）：**
  - 「三筆時點下一張顯示第二筆」：原斷言「目前顯示第二筆」改為「視窗第一張變成第二筆」（`md`+ 同時顯示 3 張，需用 `getAllByRole("link")` 取得視窗內卡片）。
  - 「圖片載入失敗改顯示佔位圖」：改為針對視窗內對應那張卡。
  - `matchMedia` mock：目前僅處理 `prefers-reduced-motion: reduce`；新增 `max-width: 767px` 查詢必須回傳 `matches:false`（jsdom 預設桌機），否則自動播放測試全數失敗。**於 Phase 8 第一個 commit 先改 mock、再改元件。**
  - **新增測試（Phase 10）：** 便條卡為 `link`、`href=/products/{id}`、accessible name `查看 {name} 詳情`；聚焦該連結時輪播暫停；base（mock `max-width` 為 true）不自動播放。
- Phase 8 只改外觀與結構，連結在 Phase 10 才接線：Phase 8 的便條卡先以相同樣式渲染為非連結的 `<div>`（沿用既有無連結行為），Phase 10 換成 `<Link>`。
- 輪播仍須做真實瀏覽器 UAT（Phase 8、Phase 10 各一次）。

### 圖片（UX-07）

- 容器固定比例：卡片 `aspect-square`、便條卡固定高 200/170、詳情主圖 `aspect-square`；`<img>` `w-full h-full object-contain`。載入時無版面跳動。
- 載入失敗 → `ImagePlaceholder`：背景 `white`（與圖容器一致）；圖示與「暫無圖片」文字一律用 `accent-ink`（`#1C232C`，在白底 > 15:1），**不得用 `ink-muted`**（白底僅 1.80:1）。
- 詳情主圖與便條卡首圖 `fetchPriority="high"`，其餘 `loading="lazy"`。

### 價格為空（price null）版面

目前 20 筆皆如此，此為預設版面，非例外。

- 卡片 / 便條卡 / 列表：tag「價格請來電」（見上）。不顯示 `NT$`、不顯示 0 或「—」。
- 詳情頁價格區塊（`block-2` 底、`rounded-block`、padding 16 24、gap 4）：標題「價格請來電」（Heading）→ 說明（Label、`ink-muted`）「這個商品沒有標價，打個電話問，我們直接報給你。」
- 有價：「NT$ 12,345」（Heading）+「含稅」（Label、`ink-muted`）；選中變體時價格跟著變體（`price_incl_tax` 為分，轉元）。變體價 null 時該變體顯示「價格請來電」。禁止 `NT$NaN`。
- 兩種狀態下 CTA 一律保留、區塊高度大致相同，避免跳動。

### 商品詳情頁 `/products/:id`（Phase 9）

Layout：頂列、頁尾（地址版）；無 SideMenu、無分類 chip 列；不加入 NAV_ITEMS。

1. **麵包屑 + 返回列：** 左：`<nav aria-label="麵包屑">`「首頁 › {分類名稱} › {商品名稱}」（Label、`ink-muted`；前兩項為 `accent` 連結、無底線；末項 `aria-current="page"`、可 `truncate`）。右：描邊 pill 按鈕「← 回上一頁」（高 44px、1px `dash`、`ink`；`navigate(-1)`；無站內歷史時改為 `Link` 到分類頁，保證直接開網址仍可用）。base：`column-reverse`——按鈕在上、麵包屑在下，gap 8px。
2. **主區（`xl` 兩欄 5fr/6fr gap 48；其他單欄 gap 24）：**
   - **圖：** 外層 `relative`、padding-top 16；琥珀膠帶（120×32，置中、-4deg、`aria-hidden`、z-index 1）。主圖為整個 `<button>`（`aria-label="放大查看 {商品名稱} 圖片"`、`aspect-square`、`white` 底、`object-contain`、邊框 16px `surface-raised`（base 8px）、`rounded-block`、傾斜 -1.2deg、`shadow-card` 8px、`cursor: zoom-in`）；右下角「放大看」小 pill（高 36、內距 16、`surface` 底、`ink` 字、Label、`aria-hidden`）。無圖 → `ImagePlaceholder`，不是按鈕。變體有 `image_url` 時切換即換主圖。
   - **資訊欄（gap 24，文字區不傾斜）：**
     1. 品牌 · 型號（Body、`ink-muted`；任一為空則省略；型號 `overflow-wrap:anywhere`）
     2. `<h1>` 商品名稱（Display）
     3. 分類 tag（`block-1` 底、`rounded-pill`、Label、`ink`；為連結到分類頁）
     4. 價格區塊（見上）
     5. 變體選擇（≥ 2 個變體才顯示；0 或 1 個顯示單一規格資訊）：標題「選規格」（Body 600）；`role="radiogroup"` `aria-label="選擇規格"`；每個 chip `role="radio"` `aria-checked`，高 44px、`rounded-pill`、padding 16；選中：2px `accent` 邊框、`surface-raised` 底、`accent` 600 文字；未選：1px `dash` 邊框、`surface-raised` 底、`ink`。文字 = `Object.entries(attributes)` 的 value 以「 / 」串接，否則 `sku`。預設選中 `is_default`；方向鍵切換。`in_stock=false` 變體仍可選，chip 內附「洽詢交期」（`block-3` 小 tag）。
     6. 現貨標籤：有現貨 → `success` 小圓點（10px）+「有現貨」（Label、`success`）；否 → 「洽詢交期」tag（`block-3`）。只有二元標籤。
     7. CTA 列（`md`+：行內，gap 8；base：被底部固定列取代）：主按鈕「打電話問 {contact.phone}」（高 56、內距 24、Body 17px/600、`shadow-btn`，`tel:` 連結）；描邊按鈕「複製詢價訊息」（高 56、2px `ink`）。若有 `lineUrl`，多一顆次要描邊「LINE 問問」（`target="_blank" rel="noopener noreferrer"`）。複製內容：「{商品名稱}｜型號 {model}｜{完整網址}」（無型號省略該段）；成功 → 按鈕文字 2 秒內變「已複製」+ check 圖示，外層 `aria-live="polite"`；失敗（clipboard 不可用）→ Label `danger`「複製失敗，請手動選取網址」。base 固定列的「複製詢價」行為相同。
     8. 說明：標題「商品說明」（Body 600）+ 純文字 `whitespace-pre-line`（`ink`，對比 9.87:1）；空說明整區隱藏；禁用 `dangerouslySetInnerHTML`。
     9. 規格表 `<dl>`：`sand` 底、`rounded-card`、padding 16 24、grid `96px minmax(0,1fr)`、row-gap 8、Label；`<dt>` `ink-muted`（5.41:1）、`<dd>` `ink`。列：SKU、`attributes`（`Object.entries`）、保固（0 或空值整列隱藏）。無任何列時整區隱藏。
3. **頁尾：** 「© KRD・{address}・{businessHours}」。
4. base 底部固定雙鈕列（見上）。

**狀態：**

| 狀態 | 呈現 |
|------|------|
| loading | 左圖正方形 skeleton + 右側 4 條不同寬度 skeleton 條（`sand` 底、`motion-safe:animate-pulse`）；骨架尺寸與成功態一致；`aria-busy="true"` |
| success | 如上 |
| not found（404/400）| `NotFoundState`（商品版）|
| retryable error（429/5xx/網路）| 置中面板，`role="alert"`，`danger` 圖示，「重新載入」主按鈕；429 專屬文案 |
| 無圖 | `ImagePlaceholder`，不可開燈箱 |
| 頁面標題 | `<title>{商品名稱} | KRD</title>` 與 `<meta name="description">`（說明前 80 字，無說明則「{品牌} {型號} {分類}」）；not found 為「找不到商品 | KRD」|

### 燈箱 `ImageModal`

沿用現有元件與行為（Esc、點背景關閉、焦點管理、防止背景捲動），改為只在詳情主圖使用。外觀：遮罩 `surface` 90%；圖片白底容器 `rounded-block`、`object-contain`；關閉鈕 44×44 `rounded-pill`、`ink` 底、右上、`aria-label="關閉圖片"`；無傾斜、無模糊陰影。

### NotFound 頁與 `NotFoundState`

全域 `*` 與詳情 404 共用：置中、垂直 padding 64px；`surface-raised` 面板 `rounded-block`、padding 32；圖示（`ink-muted`、48）→ 標題（Heading）→ 說明（Body、`ink-muted`）→ 主按鈕。頁面標題「找不到頁面 | KRD」。有頂列與（base）底部固定列、頁尾（地址版）。

---

## 素材預留位（待提供）

兩種預留位皆為 `<div role="img" aria-label="…（待提供）">`，**無素材時就是正式呈現**，不可顯示破圖。

| 預留位 | 位置 | 無素材呈現 | 有素材時 |
|--------|------|-----------|----------|
| 店面照片 | 首頁 hero | `sand` 底、3px 虛線 `dash` 框、`rounded-panel`（手機 `rounded-block`）、置中 Label「店面照片（待提供）」、傾斜 2deg（手機 1.5deg）；`aria-label="店面照片（待提供）"` | 換成 `<img>`（白底不適用；`object-cover`、同圓角、同傾斜、`alt="KRD 店面"`），`aria-label` 移除；素材路徑為 `public/` 靜態檔 |
| 地圖 | 首頁聯絡區 | `surface-raised` 底、3px 虛線 `dash` 框、`rounded-block`、Label「地圖（待嵌入）」、傾斜 -1.5deg；`aria-label="地圖（待嵌入）"` | 以連結到 Google 地圖的靜態圖或「用地圖開啟」連結取代（不嵌 iframe，避免第三方腳本）；此細節於提供素材時再補 |

虛線框對比 `dash`/`surface-raised` 1.92:1 屬裝飾，文字（`ink-muted`，6.21:1 於 `surface-raised`；於 `sand` 5.41:1）達標。

---

## 導覽與 SideMenu 影響（SideMenu 淘汰、NAV_ITEMS 保留）

- **不再有固定側欄 SideMenu。** 取代方式：列表頁的分類 chip 列（取自 `NAV_ITEMS`）+ 首頁 4 張貼紙分類卡（取自 `PRODUCT_PAGE_VIEWS` 的 title 與 path）。
- `NAV_ITEMS`（`src/config/navigation.ts`）**維持單一來源**，不新增第二份分類清單；chip 列與（若需要）選單皆從其衍生。`navigation.test.ts` 不受影響。
- `Layout` 的 `showSideMenu` 屬性與 `SideMenu.tsx` 於 Phase 8 移除；`HomePage` 與 `ProductPageTemplate` 的呼叫端同步改。
- **測試影響（`SideMenu.test.tsx`，5 項；`NavBar.test.tsx`，約 8 項）：**
  - SideMenu 5 項**不得靜默刪除**：改為新元件 `CategoryChips`（暫名）的同語意測試——「依序顯示 8 個項目」（來自 `NAV_ITEMS`）、「目前頁有 `aria-current="page"`」、「其他項沒有」、「點擊 KRD 後導向 `/krd-products`」、「沒有骨架載入元素」。role 由 `button` 變為 `link`（name 不變）；因此是「呈現/結構」調整，行為契約（8 項、順序、導向）保留。
  - NavBar：「桌機選單依序為 8 項加商店介紹」變為不成立。改寫為「頂列依序為：逛商品、關於我們、打電話問問」＋「`NAV_ITEMS` 的 8 項出現在 chip 列」；「點擊無線麥克風後導向 `/wireless-micphone`」改在 chip 測試中驗證。Logo 兩項（靜態路徑與尺寸、失敗後文字備援）保留；新增「打電話問問 `href=tel:…`」與「選單鈕 `aria-expanded`」測試以補足數量。
  - 以上改寫須在 Phase 8 執行，並登錄於測試盤點清單（Phase 6 後續 plan）；測試總數不得減少。
- 舊網址 8 條不變；`/products/:id` 為新增；不新增 `public/404.html`。

---

## `src/config/contact.ts` 欄位（已定案）

單一來源：首頁聯絡區、頂列按鈕、手機固定列、詳情 CTA、頁尾一行、AboutPage 共用。

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

| 欄位 | 值 |
|------|----|
| address | `411 台中市太平區永平路二段320之1號` |
| phone | `(04) 2279-8787`（示意稿顯示格式；原 Footer 為 `(04) 22798787`，統一採示意稿）|
| phoneHref | `04-22798787` |
| businessHours | `週一至週六 09:00 - 17:30` |
| closedNote | `週日及國定假日休息` |
| lineUrl / email | 不設（待 Owner 提供）|

- 營業時間措辭統一採 AboutPage 版本（Footer 舊寫法「09:00 AM ~ 17:30 PM」為誤寫）。
- `lineUrl`、`email` 為 `undefined` 或空字串時，整個項目（含標題）不渲染，不留空位。

---

## Copywriting Contract

語氣口語親切，但仍清楚、附下一步。

| Element | Copy |
|---------|------|
| 頂列主按鈕 / 手機固定列 | 打電話問問 |
| 詳情主 CTA | 打電話問 {contact.phone} |
| 詳情次要 CTA | 複製詢價訊息（手機：複製詢價）；成功：已複製；LINE（有 `lineUrl` 才有）：LINE 問問 |
| hero 標題 | 找麥克風、喇叭？來問我們就對了。 |
| hero tag | 台中太平・實體門市 |
| hero 導言 | 我們是在太平開店的音響盤商，有線、無線麥克風到擴大機都有。不確定要選哪一款？打個電話來問就好。（手機版為「有線、無線麥克風到擴大機都有。不確定要選哪一款？打個電話來問就好。」）|
| hero 按鈕 | 逛逛商品 → |
| 分類區標題 | 想找什麼？（卡內：看看 →）|
| 熱銷標題 | 這陣子大家都在問 |
| 便條卡連結 | 查看詳情 →（手機：詳情 →；`aria-label`：查看 {商品名稱} 詳情）|
| 聯絡區標題 | 有空來店裡坐坐 |
| 營業中戳章 | 營業中 / {businessHours 兩行}|
| 列表副行 | 共 {n} 項。看到喜歡的，直接打電話問最快。 |
| 列表結尾 | 找不到想要的？ / 我們店裡還有很多沒放上來，打個電話問最快。|
| 頁尾（首頁、列表）| © KRD・謝謝你逛到這裡 |
| 頁尾（其他頁）| © KRD・{address}・{businessHours} |
| 無價 | 價格請來電；說明：這個商品沒有標價，打個電話問，我們直接報給你。 |
| 有價 | NT$ {金額}　含稅 |
| 現貨 | 有現貨｜洽詢交期 |
| 無圖 | 暫無圖片 |
| 列表空狀態 標題 | 這裡還沒有商品 |
| 列表空狀態 內文 | 這個分類暫時沒東西，過幾天再來看看，或直接打電話問我們。 |
| 找不到商品 標題 | 找不到這個商品 |
| 找不到商品 內文 | 它可能已經下架，或是網址打錯了。回到所有商品逛逛吧。 |
| 找不到商品 按鈕 | 回到所有商品（連 `/all-products`）|
| 找不到頁面 標題 | 找不到這一頁 |
| 找不到頁面 內文 | 這個網址沒有東西，回到首頁重新逛逛吧。 |
| 找不到頁面 按鈕 | 回到首頁 |
| 可重試錯誤 標題 | 商品暫時載入不出來 |
| 可重試錯誤 內文 | 可能是網路不穩或我們這邊在忙，等一下再試試看。 |
| 429 內文 | 現在逛的人有點多，等幾秒再試一次。 |
| 錯誤按鈕 | 重新載入 |
| 熱銷 loading | 載入產品中... |
| 熱銷空 | 目前沒有精選商品 |
| 複製失敗 | 複製失敗，請手動選取網址 |
| 返回 | ← 回上一頁（備援：回到{分類名稱}）|
| Skip link | 跳到主要內容 |
| 選單鈕 aria-label | 開啟選單 / 關閉選單 |
| Destructive confirmation | 本 phase 無破壞性操作 |

---

## 使用者確認紀錄

| # | 事項 | 結果 |
|---|------|------|
| 1 | 整體調性 | 不要太正經、太制式、太常見；要親切、有人味 |
| 2 | 頁面骨架 | 不要傳統 header + 大 footer。採膠囊浮動頂列（Logo、逛商品、關於我們、右側琥珀橘「打電話問問」）；頁尾僅一行版權（可含地址/時間）；首頁有「有空來店裡坐坐」聯絡區（地址、營業時間、電話按鈕、地圖預留位）；手機（base）底部固定「打電話問問」；詳情手機底部固定「複製詢價」+「打電話問問」|
| 3 | RWD | 要。沿用 base / md / xl 三段斷點，可依示意稿調整（本文已據此調整）|
| 4 | 配色 | 原 C 太少女 → 要深色、再淺一階 → **C5a 溫暖在地小店 × 深石板藍**（取代先前「深色 slate」「專業器材型錄淺色 + 訊號橘」兩個方向）|
| 5 | `in_stock=false` | 已確認：照常顯示並加「洽詢交期」tag |
| 6 | 熱銷輪播 | 改為「這陣子大家都在問」便條卡：桌機 3 張並排、手機橫向滑動；每張卡整張連到詳情（取代原單張輪播外觀；行為契約與測試影響見上）。**待使用者認可（偏離）：前後按鈕步進 1 張、沿用既有 aria-label「上一張／下一張」**（使用者原要求為「翻組」；orchestrator 將於最終確認時詢問）|
| 7 | 營業時間與 LINE／Email | 已確認：採 AboutPage 版本；LINE／Email 有值才顯示 |
| 8 | 分類 | 首頁 4 張微傾斜貼紙分類卡（有線麥克風、無線麥克風、擴大機/喇叭、配件，手繪風線條圖示）；列表頁桌機/平板為可換行膠囊 chip、手機為橫向捲動 chip；**不再有固定側欄 SideMenu**，NAV_ITEMS 仍為單一來源 |
| 9 | 素材 | 「店面照片」「地圖」待提供，先以預留位呈現 |

視覺方向歷程：深色 slate（現況）→ 專業器材型錄淺色（orchestrator 代決）→ 使用者經多輪示意稿比較後推翻 → C5a。
DESIGN-01 的最終確認：待 checker 通過後，由使用者對整份 UI-SPEC 做最終確認；在此之前 `status: draft`。

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
