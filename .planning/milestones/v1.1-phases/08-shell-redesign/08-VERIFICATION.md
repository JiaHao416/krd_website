---
phase: 08-shell-redesign
verified: 2026-11-11T02:58:22Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
deferred:
  - truth: "Windows Chrome 傾斜卡片與戳章文字 antialias 不模糊"
    addressed_in: "Phase 11"
    evidence: "D-14；Phase 11 成功標準 3「上線後於 production 實測…各螢幕寬度版面正常」"
  - truth: "實機觸控：便條卡滑動、chip 列橫捲手感"
    addressed_in: "Phase 11"
    evidence: "D-14；Phase 11 成功標準 3"
  - truth: "iOS safe-area：底部固定撥號列不被 home indicator 遮住（A3）"
    addressed_in: "Phase 11"
    evidence: "D-14；Phase 11 成功標準 3"
  - truth: "A5：首頁兩組熱銷輪播的版面請使用者確認"
    addressed_in: "Phase 10"
    evidence: "08-UAT.md：若要調整，於 Phase 10（熱銷輪播接線）一併處理；屬偏好確認，不阻擋"
---

# Phase 8：Tokens、共用骨架與既有頁面改版 驗證報告

**Phase 目標：** 訪客看到全站一致的新版外觀，在各種螢幕寬度與裝置上都能順暢瀏覽，既有功能與舊網址完全不變
**驗證時間：** 2026-11-11T02:58:22Z
**狀態：** passed
**重新驗證：** 否（初次驗證）

## 目標達成

### Observable Truths（ROADMAP 成功標準 1–5）

| # | Truth | 狀態 | 證據 |
|---|-------|------|------|
| 1 | 全站只用語意 token，無寫死色碼；中文黑體堆疊、不載入 CJK webfont | ✓ VERIFIED | `tailwind.config.js` 以 `theme.colors/screens/fontSize/fontWeight/borderRadius/boxShadow` 覆寫（非 extend），色碼只在 `COLORS` 出現；`src/designTokens.test.ts` 15 條規則掃描 `src/**/*.tsx`＋`*.css`（預設色票、#hex、rgb、sm/lg/2xl、font-bold/medium、預設字級圓角陰影、outline-none…）全綠；grep `src` 非測試檔無 #hex；`fontFamily.sans` 依序 PingFang TC → Microsoft JhengHei → 微軟正黑體 → Noto Sans TC；`index.css`／`index.html` 無 @font-face、@import url、googleapis |
| 2 | 320–1440px NavBar 可用（1024 不折行）；分類 chip 列取代 SideMenu（md+ 換行、base 單列橫捲） | ✓ VERIFIED | `SideMenu.tsx` 已刪；`CategoryChips.tsx` 由 `ProductPageTemplate` 使用；UAT 實測 1024／1440 header 高 60px、按鈕 44px 無折行；320 chip `scrollWidth 895 > 320`，768 換行；8 chip `aria-current` 正確；NavBar 行動版選單 aria-expanded／Esc／點外側皆有測試 |
| 3 | 首頁聯絡區有地址、電話、營業時間；其他頁一行頁尾＋打電話問問；同源 `contact.ts`；LINE／Email 有設定才顯示 | ✓ VERIFIED | `src/config/contact.ts` 為唯一來源（grep 地址／電話只命中此檔；designTokens 測試另有「永平路」「2279」單一來源掃描）；`ContactBlock` 用於 HomePage 與 AboutPage，以 `hasText` 控制 LINE／Email；`Footer`（thanks／address 兩版）、`MobileCallBar`、NavBar「打電話問問」皆讀 `CONTACT` |
| 4 | skip link 跳到主內容，所有可互動元素有清楚焦點樣式 | ✓ VERIFIED | `Layout.tsx` 第一個元素為 `<a href="#main">跳到主要內容</a>`，`<main id="main" tabIndex={-1}>`；`index.css` 全域 `:focus-visible`；designTokens 禁 `outline-none`；UAT 實測 Tab→skip link→Enter 後 activeElement 為 main，焦點環 2px accent，chip 焦點環未被裁切 |
| 5 | 熱銷輪播保留 hover／焦點暫停、減少動態、點擊不停住並通過真實瀏覽器 UAT；分類頁 grid/list、名稱排序、8 條舊網址；商品圖固定比例與失敗替代畫面，版面不跳 | ✓ VERIFIED | `FeaturedCarousel` 狀態機 diff 只新增 `isBase` 到 `isPaused`（D-05）；`08-UAT.md` 量測 5000／5500ms 間隔、hover／焦點暫停、觸控點擊後續播、reduced-motion 與 base 不自動；`App.tsx` 路由由 `PRODUCT_PAGES` 產生未變，無 `/products/:id`；UAT 8 路由 h1 與數量正確、grid/list `aria-pressed`、排序切換；ProductCard 圖片容器 `aspect-square`、`ImagePlaceholder` `aria-label="暫無圖片"`、骨架卡；CLS 0.0025 |

**分數：** 5/5

### Deferred Items

| # | 項目 | 延到 | 證據 |
|---|------|------|------|
| 1 | Windows antialias | Phase 11 | D-14；Phase 11 SC3 |
| 2 | 實機觸控手感 | Phase 11 | D-14；Phase 11 SC3 |
| 3 | iOS safe-area（A3） | Phase 11 | D-14；Phase 11 SC3 |
| 4 | A5 兩組輪播版面偏好確認 | Phase 10 | 08-UAT.md，不阻擋 |

### 必要產出物

| 產出物 | 狀態 | 說明 |
|--------|------|------|
| `tailwind.config.js` | ✓ VERIFIED | theme 覆寫、語意 token、字型堆疊 |
| `src/designTokens.test.ts` | ✓ VERIFIED | 樣式掃描＋字型＋聯絡資訊單一來源，全綠 |
| `src/config/contact.ts` | ✓ VERIFIED | 必填欄位＋選填 lineUrl／email 未設值（D-15） |
| `src/components/{Layout,NavBar,Footer,MobileCallBar,CategoryChips,ContactBlock,PriceTag,ProductCardSkeleton,icons}.tsx` | ✓ VERIFIED | 皆有元件測試且被頁面使用 |
| `src/pages/{HomePage,ProductPageTemplate,AboutPage}.tsx` | ✓ VERIFIED | 改版完成，讀 contact／NAV_ITEMS／services |
| `src/hooks/useMediaQuery.ts` | ✓ VERIFIED | 新增檔（含測試），既有 hooks 未修改 |

### Key Links

| From | To | Via | 狀態 |
|------|----|-----|------|
| HomePage／AboutPage | ContactBlock → CONTACT | import | WIRED |
| Layout | NavBar／Footer／MobileCallBar | JSX | WIRED |
| ProductPageTemplate | CategoryChips → NAV_ITEMS | JSX | WIRED |
| HomePage | FeaturedCarousel（featured=1／2，5000／5500ms） | fetchProducts | WIRED |
| App.tsx | PRODUCT_PAGES／PRODUCT_PAGE_VIEWS | map 產生 Route | WIRED，未變 |

### 行為檢查（本次實際執行）

| 檢查 | 結果 | 狀態 |
|------|------|------|
| `npm test` | 29 檔 407/407 通過 | ✓ PASS |
| `npm run lint` | exit 0 | ✓ PASS |
| `npm run build` | tsc＋vite＋dist 憑證掃描通過 | ✓ PASS |
| `npx vitest list \| wc -l` | 407（> 314） | ✓ PASS |
| `git diff fcf6cba..HEAD -- src/services/` | 空 | ✓ PASS |
| `git diff fcf6cba..HEAD -- src/hooks/` | 只新增 `useMediaQuery.ts`／`.test.tsx`，無既有檔修改 | ✓ PASS |
| `/products/:id` 存在？ | `src` 無命中 | ✓ PASS（尚未加入） |
| `git rev-list redesign..main` | 0（D-17 無需合併） | ✓ PASS |

### 06-TEST-INVENTORY 契約列核對

以腳本比對 201 個契約列與現行 `vitest list`：184 列名稱完全相同；17 列改名，逐一對照：
- SideMenu 3 列 → `CategoryChips（舊側邊選單同語意）` 同名測試
- NavBar 8 列「X 在桌機與手機各有一個按鈕」→ `CategoryChips（自 NavBar 移入）'X' chip 為連結且 href…`；「桌機選單依序為 8 項加商店介紹」→「主選單依序為逛商品、關於我們…」；「點擊無線麥克風後導向」→ CategoryChips 同名
- ProductCard 價格 2 列 → 「priceText 只顯示一次」「仍顯示價格文字」（徽章移除，預定處置「調整斷言」）
- ProductCard「有描述時顯示，且不顯示品牌…」→「有描述時顯示說明與品牌，不顯示型號…」（A6，UI-SPEC 授權）
- AboutPage「圖卡標題 h4」→「h3」（heading level 屬呈現成分，標題文字順序斷言保留）

**結論：沒有契約列被刪除。**

### 需求覆蓋

| 需求 | 狀態 | 證據 |
|------|------|------|
| DESIGN-02 | ✓ SATISFIED | Truth 1 |
| DESIGN-03 | ✓ SATISFIED | Truth 1（實機顯示延 Phase 11） |
| SHELL-01 | ✓ SATISFIED | Truth 2 |
| SHELL-02 | ✓ SATISFIED | Truth 2 |
| SHELL-03 | ✓ SATISFIED | Truth 3 |
| SHELL-04 | ✓ SATISFIED | Truth 4 |
| UX-04 | ✓ SATISFIED | Truth 5，08-UAT.md |
| UX-05 | ✓ SATISFIED | Truth 5 |
| UX-06 | ✓ SATISFIED | Truth 3 |
| UX-07 | ✓ SATISFIED | Truth 5 |

無 orphaned 需求。

### CONTEXT 決策核對（D-01..D-17）

D-01 `format.ts` 未改（services diff 空），ProductCard 以 priceMin/priceMax 判斷顯示「價格請來電」✓；D-02 字串保留 ✓；D-03／D-04 8 個 plan、每步三綠 ✓；D-05 輪播狀態機只加 isBase ✓；D-06 ProductCard 仍 `role="button"`、tabIndex、`查看 … 大圖` ✓；D-07 路由不變、無 :id ✓；D-08 services 與既有 hooks 未改 ✓；D-09 契約列未刪 ✓；D-10 407 > 314 ✓；D-11 新元件皆有測試 ✓；D-12 designTokens 測試 ✓；D-13 UAT 4 寬度截圖 22 張 ✓；D-14 human 項延 Phase 11 ✓；D-15 店面照片／地圖預留位、line/email 未設 ✓；D-16 AboutPage 用 ABOUT_SERVICES＋ContactBlock ✓；D-17 main 無新 commit ✓。

### Anti-Patterns

| 檔案 | 行 | 模式 | 嚴重度 | 影響 |
|------|----|------|--------|------|
| `src/components/FeaturedCarousel.tsx` | 63–67 | 便條卡顯示「查看詳情 →」但尚非連結（`aria-hidden`） | ℹ️ Info | UI-SPEC 規定的文字；Phase 10 改為 Link；redesign 分支 Phase 11 前不上線 |

Phase 8 修改的檔案無 TBD／FIXME／XXX／TODO。

### Gaps Summary

無 gap。UAT 發現的 G-1（Logo 對比）、G-2（手機分類卡名稱直排）已於 6ef063a 修正，`home-1024.png` 等截圖與重驗截圖存在。剩餘人工項目依 D-14 延到 Phase 11，A5 為偏好確認。

---

_Verified: 2026-11-11T02:58:22Z_
_Verifier: Claude (gsd-verifier)_
