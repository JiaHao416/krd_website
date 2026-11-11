---
phase: 8
slug: shell-redesign
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-11-11
---

# Phase 8 — Validation Strategy

> 來源：08-RESEARCH.md §Validation Architecture。plan 編號對應 08-01～08-08（基礎／骨架／NavBar／分類頁／輪播＋聯絡區／首頁／關於／收尾）。


## Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.12（unit／node：`src/**/*.test.ts`；component／jsdom：`src/**/*.test.tsx`，setup `src/test/setup.ts`）|
| Config file | `vite.config.ts`（`test.projects`）|
| Quick run command | `npx vitest run <檔案>` |
| Full suite command | `npm test && npm run lint && npm run build` |
| 數量 | `npx vitest list \| wc -l`（基準 314）|

## Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESIGN-02 | 元件與 CSS 不含預設色票、hex、rgb、white/black 濫用、漸層毛玻璃 | unit（原始碼掃描）| `npx vitest run src/designTokens.test.ts` | ❌ 08-08 |
| DESIGN-02 | 覆寫後違規 class 不產生 CSS | build | `npm run build && ! grep -E "\.bg-slate-|\.text-gray-|\.font-bold" dist/assets/*.css`（覆寫於 08-08）| ✅（指令）|
| DESIGN-03 | 字型堆疊順序、不載入 webfont | unit + build | `npx vitest run src/designTokens.test.ts -t 字型`；`! grep -l "@font-face" dist/assets/*.css` | ❌ 08-08（設定於 08-01）|
| SHELL-01 | 頂列順序、tel、選單鈕 aria、Esc／外側關閉、aria-current | component | `npx vitest run src/components/NavBar.test.tsx` | ✅ 改寫（08-03）|
| SHELL-01 | 1024px 不折行、320–1440 正常 | manual-auto（MCP）| UAT：`resize_page` + `evaluate_script` 量 header 高度 + 截圖 | 08-UAT.md |
| SHELL-02 | 8 chips 順序、aria-current、導向、nav label | component | `npx vitest run src/components/CategoryChips.test.tsx` | ❌ 08-02 |
| SHELL-02 | base 單列橫捲、md 換行 | manual-auto | UAT：320／768 截圖 + `scrollWidth > clientWidth` | 08-UAT.md |
| SHELL-03 | contact 欄位值、選填判斷、拆營業時間 | unit | `npx vitest run src/config/contact.test.ts` | ❌ 08-01 |
| SHELL-03 | 聯絡區三項、LINE／Email 有值才顯示；頁尾兩種文案；固定列 tel | component | `npx vitest run src/components/ContactBlock.test.tsx src/components/Footer.test.tsx src/components/MobileCallBar.test.tsx` | ❌ 08-02（Footer／MobileCallBar）／08-05（ContactBlock）|
| SHELL-03／UX-06 | 地址、電話只存在 contact.ts | unit | `npx vitest run src/designTokens.test.ts -t 聯絡` | ❌ 08-08 |
| SHELL-04 | skip link 第一個 tab stop、指向 main#main | component | `npx vitest run src/components/Layout.test.tsx` | ❌ 08-02 |
| SHELL-04 | 不使用 outline-none；全域 :focus-visible | unit + grep | `npx vitest run src/designTokens.test.ts -t 焦點`；`grep -n "focus-visible" src/index.css` | ❌ 08-08（:focus-visible 於 08-01）|
| UX-04 | 自動播放、暫停契約 18 項 + base 不自動、scrollIntoView、視窗 3 張 | component | `npx vitest run src/components/FeaturedCarousel.test.tsx` | ✅ 調整（08-01 mock／08-05）|
| UX-04 | 兩組獨立、便條卡價格、hero／分類卡連結 | component | `npx vitest run src/pages/HomePage.test.tsx` | ✅ 調整（08-05 價格項／08-06）|
| UX-04 | 真實瀏覽器 hover／焦點／觸控／減少動態／base | manual-auto（MCP，主 session）| UAT（見 Environment）| 08-UAT.md |
| UX-05 | 8 路由 h1 與查詢、排序回到 name | component | `npx vitest run src/App.test.tsx` | ✅ 不動 |
| UX-05 | grid／list aria-pressed、排序 combobox、副行、結尾區塊 | component | `npx vitest run src/pages/ProductPageTemplate.test.tsx` | ✅ 調整（08-02 Router／08-04）|
| UX-06 | 關於我們 h1、聯絡區讀 CONTACT、6 圖卡 | component | `npx vitest run src/pages/AboutPage.test.tsx` | ✅ 調整（08-07）|
| UX-07 | aspect-square、lazy、破圖佔位、無價 tag | component | `npx vitest run src/components/ProductCard.test.tsx src/components/PriceTag.test.tsx` | ✅ 08-04／❌ 08-01 |
| UX-07 | 載入不跳動 | manual-auto | UAT：PerformanceObserver CLS < 0.1 | 08-UAT.md |
| TEST-06（全 phase）| 數量單調、契約未刪 | 指令 | `npx vitest list \| wc -l`；對照 06-TEST-INVENTORY 的契約列 | ✅ |

## Sampling Rate
- **每個 task：** `npx vitest run <該 task 測試檔>`（RED 階段預期失敗，只記錄於 SUMMARY、不 commit；GREEN 全綠才 commit）
- **每個 plan 結束：** `npm test && npm run lint && npm run build`，加 `npx vitest list | wc -l` 寫進 SUMMARY
- **Phase gate：** 全綠、總數 > 314、08-UAT.md 完成，才能 `/gsd:verify-work`

## Wave 0 Gaps
- [ ] `src/test/setup.ts` 加 scrollIntoView polyfill（08-01 Task 1）
- [ ] `FeaturedCarousel.test.tsx` 的 `mockMatchMedia` 擴充（08-01 Task 1，Phase 8 第一個 commit）
- [ ] 新測試檔由各 plan 的 RED task 建立；不需要新框架


## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 真實瀏覽器 RWD／輪播互動／CLS | SHELL-01/02、UX-04、UX-07 | 需真實瀏覽器 | 主 session 以 chrome-devtools MCP 於 320/768/1024/1440 實測，寫入 08-UAT.md |
| Windows 文字 antialias、實機觸控 | DESIGN-03、UX-04 | 需實機 | 延到 Phase 11 上線前請使用者確認（D-14）|

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true`

**Approval:** pending
