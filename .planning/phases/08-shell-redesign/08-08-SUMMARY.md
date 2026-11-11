---
phase: 08-shell-redesign
plan: 08
subsystem: design-system
tags: [tailwind, design-tokens, vitest, regression-guard]
status: partial  # Task 1、2 完成；Task 3（瀏覽器 UAT）待主 session 完成
requires:
  - phase: 08-shell-redesign
    provides: 08-01～08-07 全部元件已遷移至語意 token
provides:
  - src/designTokens.test.ts（15 條樣式規則＋字型 2 項＋聯絡單一來源 2 項＋防空轉 1 項，共 20 項）
  - tailwind.config.js theme 覆寫（DESIGN-02 第二道防線）
  - index.css 移除 LEGACY 區塊
affects: [phase-09, phase-10, phase-11]
tech-stack:
  added: []
  patterns:
    - "import.meta.glob ?raw 掃描原始碼（比照既有憑證掃描測試）"
    - "Vitest unit project 以 css.include 讓 CSS ?raw 回傳原文"
key-files:
  created:
    - src/designTokens.test.ts
  modified:
    - src/index.css
    - tailwind.config.js
    - vite.config.ts
key-decisions:
  - "unit project 加 css: { include: [/\\.css\\?raw$/] }：Vitest 預設把 CSS 換成空字串，不加則 .css 掃描空轉"
  - "字型順序測試比對含引號的字型名稱，避免命中設定檔註解"
metrics:
  completed: 2026-11-11
  tasks_done: 2/3
---

# Phase 8 Plan 08：收尾——token 掃描測試、theme 覆寫、契約核對（暫時版）Summary

> **狀態：Task 1、Task 2 完成；Task 3（真實瀏覽器 UAT，checkpoint:human-verify）待主 session 以 chrome-devtools MCP 執行並寫 `08-UAT.md`，完成後再補本檔 UAT 摘要。** 本計畫尚未標記為 complete。

刪除 index.css 的 LEGACY 樣式，新增 20 項的 designTokens 掃描測試（15 條樣式規則、DESIGN-03 字型、SHELL-03／UX-06 聯絡單一來源）。tailwind 改用 theme 覆寫，sm/lg/2xl 斷點、預設色票、字重、字級不再產生 CSS，成為掃描測試以外的第二道防線。

## Tasks

| Task | 內容 | Commit |
|---|---|---|
| 1 | 刪除 LEGACY、新增 designTokens.test.ts、unit project 啟用 CSS ?raw | 387e58a |
| 2 | tailwind theme 覆寫、dist 檢查、契約與總數核對、main 同步 | 2d8ef6a |
| 3 | 真實瀏覽器 UAT | **待主 session** |

## 測試數（D-10）

- 起點（08-07）：387
- 結束：**407**（`npx vitest list | wc -l`），+20 項 designTokens；> 314 且 ≥ 387
- `npm test` 407 passed；`npm run lint` 無問題；`npm run build` 成功（含 dist 憑證掃描）

## designTokens RED 紀錄

LEGACY 刪除前，以 grep 確認 src 的 .tsx（非測試）沒有使用 glass-card／product-*／zoom-icon／text-shadow／animate-fade-in／animate-slide-up。

第一次執行 `npx vitest run src/designTokens.test.ts`：**2 failed | 18 passed (20)**

| 失敗項 | 原因 | 處置 |
|---|---|---|
| 字型堆疊順序 | `indexOf` 命中 tailwind.config.js 註解「Mac→蘋方、Windows→微軟正黑體、Android→Noto Sans TC」，順序變成 `[811, 838, 724, 738]` | 測試改為比對含引號的字型名稱（`"PingFang TC"` 等）。這是測試本身的誤判，規則沒有放寬 |
| index.css 不載入 webfont | `INDEX_CSS.length` 為 0：Vitest 預設把 CSS 模組換成空字串，`?raw` 也一樣。這也代表 15 條規則原本完全沒掃到 .css | vite.config.ts 的 unit project 加 `css: { include: [/\.css\?raw$/] }`，修正後確認 index.css 原文讀得到 |

**15 條樣式規則在 src 原始碼沒有命中任何檔案**：08-01～08-07 遷移時都已改用 token，所以本 task 不需要修改任何 .tsx。

另外，第一次跑全套測試時，既有的憑證掃描測試抓到新測試檔的檔頭註解含有該字樣，已改寫註解，規則不變。

## dist CSS 檢查（Task 2 action 2）

| 檢查 | 結果 |
|---|---|
| 不含 `.bg-slate-`、`.text-gray-`、`.font-bold`、`.text-sm`、`.sm\:`、`.lg\:` | 通過（no violations） |
| 不含 `@font-face` | 通過 |
| 含 `line-clamp-2` | 通過 |
| 含 outline-offset 3px | 通過（CSS 壓縮後寫成 `outline-offset:3px`，沒有空格，所以 plan 的 `outline-offset: 3px` 字面 grep 要改成無空格版本） |

覆寫前後各用 tailwindcss CLI 編譯一次，比對產生的 class selector：覆寫後只少了 `.rounded`。這個 class 來自 designTokens.test.ts 裡的規則字面（tailwind content 會掃到 .ts 檔），沒有元件使用，所以沒有任何實際使用的 class 消失。dist CSS 從 24.38 kB 降到 24.19 kB。

## 契約核對（D-09，對照 06-TEST-INVENTORY）

名稱比對指令（06-TEST-INVENTORY §基準）列出「inventory 有、目前 vitest list 沒有」的測試共 **30 列**，每一列都在 08-02～08-07 SUMMARY 的舊 → 新對照中找到，而且新測試目前都存在於 vitest list：

| inventory 列（舊名） | 分類 | 新位置／新名 | 依據 |
|---|---|---|---|
| NavBar「{KRD、MICGO、所有商品、擴大機 / 喇叭、最新商品、有線麥克風、無線麥克風、配件} 在桌機與手機各有一個按鈕」×8 | 契約（accessible name） | CategoryChips「'$title' chip 為連結且 href 為對應路徑」×8 | 08-03 對照表（「X 在桌機與手機各有一個按鈕」×8） |
| NavBar「桌機選單依序為 8 項加商店介紹」 | 契約（role） | NavBar「主選單依序為逛商品、關於我們，右側為打電話問問」＋CategoryChips「首屏依序顯示 8 個導覽項目」 | 08-03 |
| NavBar「商店介紹按鈕存在」 | 呈現 | NavBar「關於我們連結指向 /abouts」 | 08-03 |
| NavBar「點擊無線麥克風後導向 /wireless-micphone」 | 契約（路由） | CategoryChips 同名 | 08-02、08-03 |
| SideMenu「首屏依序顯示 8 個導覽項目」 | 契約 | CategoryChips 同名 | 08-02 |
| SideMenu「點擊 KRD 後導向 /krd-products」 | 契約（路由） | CategoryChips 同名 | 08-02 |
| SideMenu「沒有骨架載入元素」 | 契約（狀態） | CategoryChips 同名 | 08-02 |
| SideMenu「目前頁面按鈕有 active 樣式」「其他按鈕沒有 active 樣式」 | 呈現 | CategoryChips「目前頁 chip 有 aria-current=page」「其他 chip 沒有 aria-current」 | 08-02 |
| ProductCard「grid 有價：徽章與價格行各顯示一次 priceText…」 | 契約（資料轉換），預定處置「調整斷言」 | 「grid 有價：priceText 只顯示一次…」，priceText 斷言保留，徽章移除 | 08-04 |
| ProductCard「只有 priceMax 有值時 grid 仍顯示價格徽章」 | 契約（資料轉換），預定處置「調整斷言」 | 「…仍顯示價格文字」 | 08-04 |
| ProductCard「grid 無價…」「list 無價…」「價格洽詢使用灰色…」、間距 ×2、line-clamp-1、內距、h-96 長名稱 | 呈現 | 08-04 對照表各列（價格請來電、標籤列、aspect-square 等） | 08-04 |
| **ProductCard「有描述時顯示，且不顯示品牌、型號、現貨」** | 契約（資料轉換） | 「有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期」 | **經 UI-SPEC 授權的調整（A6）：改為顯示品牌；「不顯示型號」與 product-description 斷言保留**（08-04） |
| AboutPage「圖卡標題 h4 依序為…」 | 契約（預定處置「保留」） | 「圖卡標題 h3 依序為…」，標題文字與順序斷言不變，只改 heading level | 08-07（06-TEST-INVENTORY／Open Q8 授權的 heading level 調整） |
| HomePage「首頁不顯示價格與價格洽詢」 | 呈現 | 「便條卡有價顯示 priceText、無價顯示價格請來電，且不出現價格洽詢」 | 08-05 |
| ProductPageTemplate「同時顯示…「價格洽詢」」 | 呈現 | 「…「價格請來電」」 | 08-04 |

**結論：沒有契約列被刪除。** 每一列的處置都是保留、調整斷言，或改寫為新元件同語意測試；ProductCard 品牌一列是經 UI-SPEC 授權的調整（A6）。

## main 同步（D-17）

- `git fetch origin main` 成功（唯讀）
- `git log HEAD..origin/main`、`git log HEAD..main` 兩者都是空的，**main 沒有新 commit**，所以不需要 merge
- redesign 沒有設定 upstream，比 origin/main 多 89 個 commit；**沒有 push**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest 把 CSS ?raw 換成空字串，.css 掃描空轉**
- **發現於：** Task 1
- **修正：** vite.config.ts 的 unit project 加 `css: { include: [/\.css\?raw$/] }`（plan 的 files 清單沒有 vite.config.ts）
- **Commit：** 387e58a

**2. [Rule 1 - Bug] 字型順序測試命中註解**
- **修正：** 改為比對含引號的字型名稱
- **Commit：** 387e58a

**3. [Rule 1 - Bug] 新測試檔註解觸發既有憑證掃描測試**
- **修正：** 改寫註解，不放寬規則
- **Commit：** 387e58a

### 其他

- dist 檢查的 outline-offset grep 要用壓縮後的無空格寫法（見上方）
- 過程中執行過一次唯讀的 `git stash list`（沒有任何修改操作）
- 沒有遇到權限守衛拒絕；`src/services/`、既有 hooks 都沒有修改；`.planning/config.json` 沒有 stage

## Known Stubs

無。

## 待辦（Task 3，主 session）

依 08-08-PLAN Task 3 how-to-verify 步驟 1–11 執行瀏覽器 UAT，寫 `08-UAT.md` 與 `uat/*.png`。完成後補上本檔的 UAT 摘要連結，並把 status 改為 complete。

## Self-Check: PASSED

- src/designTokens.test.ts、tailwind.config.js、src/index.css 都存在
- commit 387e58a、2d8ef6a 都存在
