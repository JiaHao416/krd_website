---
phase: 08-shell-redesign
type: uat
status: passed（2 項 gap 已於 6ef063a 修正並重驗）
date: 2026-11-11
tool: chrome-devtools MCP（主 session）
server: npm run dev -- --port 5173 --strictPort（Vite proxy → https://api.krd.com.tw，20 筆商品）
---

# Phase 8 真實瀏覽器 UAT

截圖都在 `uat/` 底下。dev server 已在測試結束後停止，5173 埠已釋放。

## 截圖（3 頁 × 4 寬度）

| 頁面 | 320 | 768 | 1024 | 1440 |
|------|-----|-----|------|------|
| `/` | home-320.png | home-768.png | home-1024.png | home-1440.png |
| `/all-products` | all-products-320.png | all-products-768.png | all-products-1024.png | all-products-1440.png |
| `/abouts` | abouts-320.png | abouts-768.png | abouts-1024.png | abouts-1440.png |

320 寬度使用 `320x800x2,mobile,touch` 模擬。三頁在 320 寬時 `document.documentElement.scrollWidth` 都是 320，沒有水平捲動。

## SHELL-01 頂列 — pass

- 1024 與 1440 寬的 header 高度都是 60px（≤ 64），逛商品、關於我們、打電話問問的高度都是 44px，沒有折行。
- 320 寬點選單鈕後，`aria-expanded=true`、label 變成「關閉選單」、面板可見。按 Esc 後 `aria-expanded=false`，焦點回到選單鈕。點選單外側也會關閉。Esc 與點外側是用 DOM 事件觸發的。
- **Gap G-1（已修）：** `public/brand-logo.png` 是深灰單色圖（平均 RGB 48,45,42），放在 `surface-raised` 頂列上幾乎看不見。已加上 `brightness-0 invert` 轉白（6ef063a），重驗截圖為 `fix-logo-1440.png`。

## SHELL-02 分類 chip 列 — pass

- 320 寬：`ul` 的 `scrollWidth` 895 > `clientWidth` 320，是單列橫向捲動，高度 60px。
- 768 寬：`ul` 高度 112px，大於 chip 的 44px，`scrollWidth` 等於 `clientWidth`（689），確認會換行。
- 8 個 chip 逐一點擊，`aria-current` 都正確。

## SHELL-03 聯絡資訊／固定撥號列 — pass

- 320 寬在 `/abouts` 捲到底：頁尾 bottom 726px，撥號列 top 728px，撥號列沒有遮到頁尾（`callbar-bottom-320.png`）。
- 頁尾與聯絡區都顯示 contact.ts 的地址、營業時間與電話。

## SHELL-04 焦點與 skip link — pass

- 新開頁面後第一次按 Tab，焦點落在「跳到主要內容」，且焦點樣式可見（`skiplink-320.png`）。按 Enter 後 `document.activeElement.id === "main"`，URL 變成 `#main`，頁面沒有重新載入。
- 頂列連結、商品卡都有 `rgb(240,160,75) solid 2px` 焦點環（`focus-header-1440.png`、`focus-card-1440.png`）。
- 320 寬 chip 列：第 5 個 chip「無線麥克風」取得焦點後，上下各留 8px（焦點環加 offset 共 5px），焦點環完整、沒有被裁切（`chip-focus-320.png`）。

## UX-04 首頁熱銷輪播 — pass

| 項目 | 量測 | 結果 |
|------|------|------|
| 自動切換間隔 | 第 1 組：2614→7641→12669ms（約 5027ms）；第 2 組：3217→8648ms（約 5431ms） | pass，約 5000 與 5500ms |
| hover 暫停 | hover 卡片 7 秒，index 都是 0→0；移開 6 秒後 0→1 | pass |
| 鍵盤焦點暫停 | 焦點在「下一張」7 秒，2→2；焦點移走 6 秒後 2→0 | pass |
| 點擊後不黏住（觸控模擬） | 點「下一張」並把指標移開，焦點仍留在按鈕上，6.5 秒後 1→2 | pass |
| reduced-motion | `matchMedia` 為 reduce，7 秒內 0→0；手動點下一張 0→1 | pass |
| base（320）不自動 | 7 秒內 0→0；點下一張後 index 1、scrollLeft 276（卡寬 260 + gap 16）；頁面垂直位置 1183→1183→1183 | pass |
| base 提示 | 畫面上有「← 左右滑動看更多 →」 | pass |

用手指滑動後 activeIndex 不會同步，這是已知行為（RESEARCH Open Q9）。

## UX-05 舊網址與列表控制 — pass

8 條路由的 h1、目前 chip 與商品數：

| 路由 | h1 | 數量 |
|------|----|------|
| /all-products | 所有商品 | 20 |
| /new-products | 最新商品 | 20 |
| /krd-products | KRD | 12 |
| /micgo-products | MICGO | 5 |
| /wireless-micphone | 無線麥克風 | 5 |
| /wired-micphone | 有線麥克風 | 5 |
| /trumpet | 擴大機 / 喇叭 | 7 |
| /accessories | 配件 | 3 |

- 列表檢視：「列表」按鈕 `aria-pressed=true`（`all-products-list-1440.png`）。
- 排序：選項為 `name:依名稱`、`newest:最新優先`。切換後第一張從 BB1 變成「線材」。

## UX-06 關於我們 — pass

聯絡區與首頁共用 ContactBlock，頁尾為含地址版。地址、電話、時間只出現一次，都來自 contact.ts。

## UX-07 圖片與載入穩定 — pass

- `/all-products` 用 PerformanceObserver（buffered）量 5 秒，CLS 為 **0.0025**（< 0.1）。
- 載入時顯示 8 張骨架卡與「正在載入產品資訊...」。
- production 20 筆商品都有圖，沒有破圖可以實測。「暫無圖片」由 ProductCard／ImagePlaceholder 的元件測試涵蓋。

## Gap G-2（已修）：手機分類卡名稱變直排

320 寬時分類卡寬約 145px，名稱和「看看 →」並排，名稱被擠成一字一行（見 `home-320.png` 修正前）。base 改成上下排列，md 以上維持並排（6ef063a）。重驗截圖 `fix-categories-320.png`：名稱最多 2 行，符合 UI-SPEC「手機 136，容納兩行 Heading 名稱」。

修正後 `npm test` 407/407、lint、build 全綠。

## 請使用者確認：A5（兩組熱銷輪播的版面）

- 截圖：`uat/a5-featured-1440.png`、`uat/a5-featured-320.png`
- 示意稿的「這陣子大家都在問」只有一組卡片，按鈕和 h2 在同一列。
- 實作時發現首頁其實有兩組互相獨立的熱銷（熱門推薦系列、頂級精選系列），而且有契約測試保證兩者獨立。所以改成同一個 h2 底下放兩個 `role="group"`，每組各有一排「上一張／下一張」與指示點。
- 如果希望只留一組，或改成其他排法，請告訴我，會在 Phase 10 一併調整。

## human-needed（D-14，延到 Phase 11 上線前）

- [ ] Windows Chrome：傾斜卡片與戳章文字的 antialias 是否模糊
- [ ] 實機觸控：手機滑動便條卡、chip 列橫捲的手感
- [ ] iOS safe-area：底部固定撥號列在有 home indicator 的 iPhone 上是否被遮住（A3）
