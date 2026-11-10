---
phase: 03-airtable
reviewed: 2026-11-10T14:30:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - package.json
  - scripts/check-dist.mjs
  - src/App.test.tsx
  - src/components/NavBar.test.tsx
  - src/components/NavBar.tsx
  - src/components/SideMenu.test.tsx
  - src/components/SideMenu.tsx
  - src/config/navigation.test.ts
  - src/config/navigation.ts
  - src/content/abouts.ts
  - src/noAirtable.test.ts
  - src/pages/AboutPage.test.tsx
  - src/pages/AboutPage.tsx
  - src/pages/HomePage.test.tsx
  - src/pages/ProductPageTemplate.test.tsx
  - src/services/catalog.test.ts
  - src/services/catalog.ts
findings:
  critical: 1
  warning: 4
  info: 5
  total: 10
status: issues_found
---

# Phase 3：程式碼審查報告

**Reviewed:** 2026-11-10T14:30:00Z
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

這次審查的範圍是 Phase 3「移除 Airtable」的變更：NavBar／SideMenu 改讀靜態的 `NAV_ITEMS`，AboutPage 改讀 `ABOUT_SERVICES`，Logo 改用 `/brand-logo.png`，調整 `PRODUCT_PAGES` 的順序，並新增兩道憑證檢查（`noAirtable.test.ts` 與 `scripts/check-dist.mjs`）。

我實際跑過的檢查：`vitest run` 17 個檔案、204 個測試全過；`npm run build` 成功；`npm run check:dist` 通過（掃了 4 個檔案）；`npm run lint` 沒有問題。`public/brand-logo.png` 確認是 800×235，`public/abouts/*.png` 六張都在。src 與 dist 都沒有 Airtable 網址、token 或 Base ID。

主要問題：
1. 手機選單的高度上限 `max-h-96` 裝不下 8 個項目加「商店介紹」，後面幾項會被裁掉、點不到（CR-01）。這個問題在改版前就有，不是這次造成的；但選單現在由程式碼固定產生，而且本 phase 的驗收標準是「外觀一致」，所以等於把這個缺陷一起保留下來。
2. 打包產物的憑證檢查 `check:dist` 沒有接進 `build`，Cloudflare Pages 部署時不會執行（WR-01）。
3. `NAV_ITEMS` 在模組載入時就用沒有型別保護的 `Record<string, …>` 取值。哪天少了對應的設定，整個網站會在 import 階段直接崩潰（WR-02）。

## Structural Findings (fallow)

這次沒有提供 structural findings。

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01：手機選單 `max-h-96` 會裁掉後面幾個項目與「商店介紹」

**File:** `src/components/NavBar.tsx:183-188`（項目在 189-262 行）
**Issue:** 手機選單展開後的高度上限是 `max-h-96`（384px），容器又有 `overflow-hidden`。實際內容的高度估算如下：
- 容器上下內距 `py-6`：48px
- 8 個項目按鈕，每個 `py-3` 加一行文字約 48px：384px
- `space-y-2` 的間距，9 個間隔各 8px：72px
- 分隔線 `my-4`：約 33px
- 「商店介紹」按鈕：48px

合計約 585px，遠超過 384px。結果是手機與平板（小於 1024px 的寬度都用這份選單）上，大約從「有線麥克風」以後的項目和「商店介紹」都會被裁掉，看不到也點不到。jsdom 不計算版面，所以現有測試抓不到這個問題。

CONTEXT 記載 Airtable `navigation` 原本也是 8 筆，所以這是既有問題，不是本 phase 造成的。不過 `NAV_ITEMS` 現在固定是 8 項，這個缺陷是確定會發生的；而手機是主要的瀏覽情境，所以仍列為 BLOCKER，請 orchestrator／使用者決定要在本 phase 修，還是另開 quick task 處理。
**Fix:**
```tsx
// 展開時改用足以容納全部項目的上限（或改成依內容高度、不設上限）
className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
  isMenuOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0"
}`}
```
修完之後，用瀏覽器的 375px 寬度實際確認「配件」和「商店介紹」都看得到、點得到。

## Warnings

### WR-01：`check:dist` 沒有接進 build／部署流程，而且可能掃到舊的 dist

**File:** `package.json:8,10`、`scripts/check-dist.mjs:34-43`
**Issue:** `build` 仍然是 `tsc -b && vite build`，`check:dist` 只能手動執行。Cloudflare Pages 部署時只跑 `npm run build`，所以這道防線在正式部署時完全不會生效。另外，腳本只檢查 `dist/` 存不存在；如果本機留著舊的 `dist/`，忘記重新 build 也會「通過」，掃到的卻不是目前程式碼的產物。
**Fix:** 把檢查接到 build 後面，每次部署都強制執行：
```json
"build": "tsc -b && vite build && node scripts/check-dist.mjs"
```
如果想保留獨立指令，可以用 `"postbuild": "node scripts/check-dist.mjs"`。npm 會在 build 後自動執行，Pages 也會跑到。

### WR-02：`NAV_ITEMS` 在模組載入時就用未受型別保護的索引取值，設定少一筆整站就會崩潰

**File:** `src/config/navigation.ts:14-17`（依賴 `src/config/productPageViews.tsx` 的 `Record<string, ProductPageView>`）
**Issue:** `PRODUCT_PAGE_VIEWS[page.path].title` 在 TS 裡的型別永遠是 `ProductPageView`（專案沒有開 `noUncheckedIndexedAccess`）。以後如果在 `PRODUCT_PAGES` 新增一頁卻忘了補 view，這行會在 import 時丟出 `TypeError`。NavBar 在每一頁都會載入，所以整個 SPA 會白畫面，而且 `tsc -b` 不會報錯。目前只靠 `App.test.tsx` 的「每個路徑都有非空 title」擋著，前提是部署前一定有跑測試；但 build 指令並不會跑測試。
**Fix:** 讓型別系統直接擋下來。把路徑做成字面值聯集，view 用 `satisfies`：
```ts
// catalog.ts：路徑型別由陣列推導
export const PRODUCT_PAGES = [
  { path: "/all-products", query: {} },
  // …
] as const satisfies readonly ProductPageConfig[];
export type ProductPagePath = (typeof PRODUCT_PAGES)[number]["path"];

// productPageViews.tsx：缺任何一個路徑都會編譯失敗
export const PRODUCT_PAGE_VIEWS = { /* … */ } satisfies Record<ProductPagePath, ProductPageView>;
```
如果不想動型別，至少在 `navigation.ts` 加上明確的失敗訊息：
```ts
const view = PRODUCT_PAGE_VIEWS[page.path];
if (!view) throw new Error(`PRODUCT_PAGE_VIEWS 缺少 ${page.path} 的設定`);
```

### WR-03：桌機導覽列在 1024px 到約 1100px 之間可能放不下

**File:** `src/components/NavBar.tsx:81-155`
**Issue:** 桌機選單從 `lg`（1024px）開始顯示，可用寬度約 992px（扣掉 `px-4`）。估算寬度：Logo 容器約 164px（800/235×40 再加內距與邊框），8 個按鈕（`px-5`、`text-sm`，最長的是「擴大機 / 喇叭」與「無線麥克風」）加上 `space-x-2` 約 760px，分隔線約 33px，「商店介紹」按鈕約 140px，合計約 1,100px，超過 992px。外層 `flex justify-between` 沒有 wrap，也沒有 overflow 處理，接近 `lg` 的寬度會擠壓或溢出。這是估算值（字型寬度沒有實測），而且改版前一樣是 8 項，屬於既有問題；但選單內容現在已經寫死，值得在瀏覽器實際確認。
**Fix:** 在 1024–1120px 的寬度實測。如果真的溢出，可以把桌機選單的斷點改成 `xl:flex`，手機選單改成 `xl:hidden`；或縮小按鈕的 `px-5`，改成 `px-3 xl:px-5`。

### WR-04：兩份 FORBIDDEN 規則各自維護，沒有機制保證一致；source 掃描範圍有缺口

**File:** `src/noAirtable.test.ts:7-23`、`scripts/check-dist.mjs:12-18`
**Issue:**
1. 兩個檔案的 regex 清單目前完全相同，但只靠註解「需保持一致」來約束。以後只改一邊（例如放寬規則來解決誤報）時，不會有任何檢查失敗。
2. `import.meta.glob("/src/**/*.{ts,tsx}")` 只掃 src 底下的 TS 原始碼。repo 根目錄的 `index.html`、`vite.config.ts`、`.env*`、`public/` 都不在範圍內。dist 檢查涵蓋了 `index.html` 與 public 的非圖片檔，但 `vite.config.ts` 的 `define`、`.env` 這類「進入 bundle 之前」的來源，要等 build 之後才查得到，而 WR-01 說明了 build 時其實不會檢查。
**Fix:** 在 `noAirtable.test.ts` 加一個同步斷言，用 `?raw` 讀入 `check-dist.mjs`，確認每條 regex 的 `source` 都出現在其中。或者把規則抽成 `scripts/forbidden-patterns.mjs`，讓腳本 import（測試端可以用 `?raw` 比對）。glob 可以擴大成 `["/src/**/*.{ts,tsx}", "/index.html", "/vite.config.ts"]`。

## Info

### IN-01：dist 掃描的 regex 對第三方程式碼可能誤報，而且無法「改名」解決

**File:** `scripts/check-dist.mjs:15,17,21`
**Issue:** `\bapp[A-Za-z0-9]{14}\b`、`\bkey[A-Za-z0-9]{14}\b` 會命中任何以 app／key 開頭、後面剛好接 14 個英數字的識別字（例如 `keyboardShortcuts`）。測試註解說「若誤報請改名」，但 dist 裡的第三方套件與 minify 結果沒辦法改名，以後升級套件可能突然讓檢查失敗。另外，`SKIP_EXT` 只排除常見圖片格式；字型（`.woff2`）、`.avif` 這類二進位檔會被當成 UTF-8 文字掃描。
**Fix:** 把二進位格式補進 `SKIP_EXT`（`.woff`、`.woff2`、`.ttf`、`.avif`、`.bmp`、`.mp4`）。誤報的處理方式寫在腳本註解裡，例如改用更精確的前後文規則，或加上檔案層級的允許清單（只記檔名、不記內容）。

### IN-02：AboutPage 的「查看產品目錄」按鈕沒有任何行為

**File:** `src/pages/AboutPage.tsx:319-321`
**Issue:** CTA 按鈕沒有 `onClick`，點了沒反應（既有問題，本 phase 沒有修改這段）。
**Fix:** 用 `useNavigate()` 導到 `/all-products`，或改成 `<Link to="/all-products">`。

### IN-03：About 圖卡沒有尺寸與錯誤備援，跟 Logo 的處理方式不一致

**File:** `src/pages/AboutPage.tsx:257-266`、`src/content/abouts.ts:8-15`
**Issue:** Logo 補了 `width`/`height` 和 `onError` 備援，但 6 張服務圖（都是 250×250）沒有 `width`/`height`（會造成版面位移，CLS），圖片遺失時也只會顯示破圖。
**Fix:** `<img width={250} height={250} … />`。需要的話，在 `AboutService` 加上尺寸欄位，或統一用一個 fallback 處理。

### IN-04：source／dist 掃描保護不到 git 歷史，撤銷 token 是唯一的真正修復

**File:** `src/noAirtable.test.ts:3-5`
**Issue:** b9be3aa 之前的歷史裡仍有已刪除檔案中的 token（repo 是公開的）。這兩道檢查只保證 HEAD 與打包產物乾淨，無法降低外洩風險。
**Fix:** 依專案的 Sequencing 限制，在後續 phase 確實到 Airtable 撤銷該 token，並在驗收時記錄撤銷時間。不需要改寫歷史，撤銷才是根本解法。

### IN-05：手機選單收合時，按鈕仍然可以用鍵盤聚焦

**File:** `src/components/NavBar.tsx:183-264`
**Issue:** 收合狀態只用 `max-h-0 opacity-0` 隱藏，9 個按鈕仍留在 DOM 和 tab 順序中。鍵盤或螢幕閱讀器使用者會聚焦到看不見的按鈕（既有問題）。
**Fix:** 收合時加上 `inert` 或 `aria-hidden` 搭配 `tabIndex={-1}`，或者收合後不渲染內容；漢堡按鈕補上 `aria-expanded={isMenuOpen}` 和 `aria-label`。

---

_Reviewed: 2026-11-10T14:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
