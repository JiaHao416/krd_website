# Phase 6: design-lock（設計鎖定與測試盤點）- Research

**Researched:** 2026-11-11
**Domain:** 測試盤點（Vitest 4）、依賴移除、規劃文件同步（無 UI 程式碼、無新套件）
**Confidence:** HIGH（所有結論皆在本機實測或 grep 驗證）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
D-01～D-17（見 `06-CONTEXT.md`）。planner 不得改變：D-01（不在測試程式碼加標記）、D-03（盤點列數展開後 = 215）、D-12（不加自動化數量檢查腳本）、D-14（兩個依賴各自獨立 commit，先 `@tailwindcss/postcss` 後 `@types/react-router-dom`）。

### Claude's Discretion
planner 可調整計畫切分與執行順序（盤點與依賴移除可並行）。

### Deferred Ideas (OUT OF SCOPE)
- 自動化測試數量／契約斷言檢查腳本
- Tailwind v4 升級（MAINT-F-01）
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESIGN-01 | UI-SPEC 經使用者確認 | 已完成（`06-UI-SPEC.md` status: approved）；plan 只需引用並標記完成 |
| TEST-06 | 215 項測試分類＋基準 | 第 1、2 節：實測可行指令、逐檔初判、accessible name 清單 |
| MAINT-01 | 兩個依賴獨立 commit 移除 | 第 3 節：安全性驗證與 CSS 比對流程；第 4 節：同 commit 要改的文件位置 |
</phase_requirements>

## Summary

本 phase 全為文件與 package.json 變更。測試名稱可用 `npx vitest list` 直接取得，實測輸出恰為 215 行，`it.each` 已逐項展開成獨立行，因此「盤點列數 = 215」可用 `wc -l` 驗證。兩個待移除套件在 `src/`、設定檔、腳本中零引用，只出現在 `package.json`、lockfile 與文件。CSS 產出在本機兩次建置內容雜湊完全相同（可重現），因此移除前後可用串接 CSS 的 sha256 比對。

**Primary recommendation:** 以 `vitest list` 輸出（去掉 `[project]` 前綴）當盤點骨架，生成 215 列初稿後再人工填分類欄位；CSS 比對用「建置到暫存 outDir、`cat *.css | shasum -a 256`」，不碰 `dist/`。

## 1. 取得 215 項測試名稱（已實測）

**可用指令（Vitest ^4.1.12，已在專案根目錄實跑）：**

```bash
# 文字格式，每行一項：[project] 檔案 > describe > 測試名稱
npx vitest list
# 去掉 project 前綴並存檔
npx vitest list 2>/dev/null | sed 's#^\[[a-z]*\] ##' > <暫存檔>
wc -l <暫存檔>            # 實測 215

# JSON 格式：陣列，元素 {name, file, projectName?}（it.each 同樣逐項展開）
npx vitest list --json 2>/dev/null   # 實測陣列長度 215
```

重點：
- `it.each` 展開後每個參數各自一行（例如 `NavBar 選單 > 所有商品 在桌機與手機各有一個按鈕`）。因此 `it(` 出現次數（約 194）小於 215 是正常現象，差額來自三處 `it.each`：`App.test.tsx`（3 個 `it` -> 11 項）、`NavBar.test.tsx`（6 個 `it` -> 14 項）、`noAirtable.test.ts`（2 個 `it` -> 7 項，FORBIDDEN 清單 5 條 + 另 2 條）。[VERIFIED: 本機實跑]
- JSON 輸出中 unit project 的項目缺 `projectName` 欄位（HomePage 範例可見只有 component 帶）；以檔案副檔名（`.test.ts` = unit、`.test.tsx` = component）判定 project 更穩。[VERIFIED: 本機實跑]
- JSON 前面可能夾雜非 JSON 輸出，解析時從第一個 `[` 開始（`s.slice(s.indexOf("["))`）。
- 同一測試名稱若重複，`list` 仍各列一行，不會合併，因此 grep 計數可靠。

**每檔項數（實測，加總 215）：**

| 檔案 | 項數 | project |
|------|------|---------|
| `src/services/products.test.ts` | 30 | unit |
| `src/components/ProductCard.test.tsx` | 21 | component |
| `src/components/FeaturedCarousel.test.tsx` | 18 | component |
| `src/services/transform.test.ts` | 18 | unit |
| `src/pages/ProductPageTemplate.test.tsx` | 17 | component |
| `src/services/errors.test.ts` | 17 | unit |
| `src/services/catalog.test.ts` | 14 | unit |
| `src/components/NavBar.test.tsx` | 14（6 個 `it`，`it.each(TITLES)` 展開 8） | component |
| `src/hooks/useProducts.test.tsx` | 13 | component |
| `src/App.test.tsx` | 11（`it.each(PRODUCT_PAGES)` 展開 8） | component |
| `src/services/format.test.ts` | 10 | unit |
| `src/pages/HomePage.test.tsx` | 7 | component |
| `src/noAirtable.test.ts` | 7 | unit |
| `src/services/client.test.ts` | 6 | unit |
| `src/components/SideMenu.test.tsx` | 5 | component |
| `src/config/navigation.test.ts` | 4 | unit |
| `src/pages/AboutPage.test.tsx` | 3 | component |

注意：CONTEXT 的 code_context 把 NavBar 寫成 6、App 寫成 3，那是 `it(` 數；展開後應為 14、11。盤點文件各節標題請寫展開後項數，否則總和對不上 215。

## 2. 逐檔初判（契約／呈現）與受影響 phase

規則依 D-05～D-10。「unit」檔案預設全契約（D-06）。以下僅列需要人工逐條處理的檔案，其餘一句帶過。

**unit（全契約、無 phase 影響，預設處置「保留」）：** `services/products`(30)、`transform`(18)、`errors`(17)、`catalog`(14)、`format`(10)、`client`(6)、`config/navigation`(4，UI-SPEC 明言不受影響)、`noAirtable`(7，憑證掃描)。逐條檢視時唯一需留意：`format.test.ts` 的 `PRICE_ON_REQUEST 文案為「價格洽詢」` — 常數仍存在，UI-SPEC 只是在 UI 上另顯示「價格請來電」tag，常數斷言屬資料層契約，保留。[ASSUMED: 需 planner 開檔確認 UI-SPEC 是否改動 `PRICE_ON_REQUEST` 常數值；Phase 8 實作時才決定]

| 檔案（項數） | 初判 | 影響 phase | 說明 |
|------|------|-----------|------|
| `SideMenu.test.tsx`(5) | 契約（8 項順序、`aria-current`、導向）＋呈現（active 樣式斷言、role） | 8 | D-10：全部改為 `CategoryChips` 同語意測試，role button -> link、name 不變。「目前頁按鈕有 active 樣式」等 2 項斷言 class，宜在盤點寫明改以 `aria-current="page"` 驗證 |
| `NavBar.test.tsx`(14) | Logo 3 項契約（src/寬高 `/brand-logo.png` 800x235、失敗後文字備援 `KRD MICGO`、初次不顯示備援）；8 項 `%s 在桌機與手機各有一個按鈕`＋「桌機選單依序為 8 項加商店介紹」＋「商店介紹按鈕存在」＋「點擊無線麥克風導向」 | 8 | UI-SPEC：「8 項加商店介紹」不成立；改為頂列「逛商品、關於我們、打電話問問」；8 個分類名改在 chip 測試；導向測試移到 chip 測試；Logo 保留；新增 `tel:` href 與選單鈕 `aria-expanded` 測試補數量。`%s 在桌機與手機各有一個按鈕` 的「各一個」是呈現結構，但分類名出現在導覽的語意是契約 |
| `FeaturedCarousel.test.tsx`(18) | 狀態 3 項、操控 2 項、圖片失敗 1 項、自動播放 2 項、暫停 10 項。狀態機／計時／暫停全為契約（D-05） | 8（外觀、matchMedia mock）、10（連結） | UI-SPEC 明列：「三筆時點下一張顯示第二筆」與「圖片載入失敗改顯示佔位圖」需調整斷言（視窗 3 張）；Phase 8 第一個 commit 先擴充 `matchMedia` mock 處理 `max-width: 767px`；Phase 10 新增 link／聚焦暫停／base 不自動播放測試 |
| `ProductCard.test.tsx`(21) | 價格 7 項（有價／區間／無價：契約為 `formatPriceRange` 輸出與「價格洽詢」）；圖片與燈箱 6 項（`role="button"`、`/查看/` name、Enter／Space、`onImageClick`：Phase 10 改寫為連結語意 LINK-01；缺圖／破圖佔位 `暫無圖片` 保留）；描述與其他 8 項 | 8（外觀）、10（連結） | 呈現類（D-08）：`line-clamp-1/2`、`py-4 px-5`、`mb-1/mb-2`、`h-96`、`text-gray-500`、「grid 長名稱…h-96、h-64」— Phase 8 直接隨設計重寫（UI-SPEC 取消固定 `h-96`，grid 改 `aspect-square`）；「徽章與價格行各顯示一次」—徽章被移除，改為呈現；`data-testid="product-description"` 保留（D-08）；`點擊查看大圖` 提示為呈現（UI-SPEC 刪除） |
| `ProductPageTemplate.test.tsx`(17) | 契約：載入中／錯誤（`role="alert"`、不洩漏後端原文、重新載入）／空／`aria-busy`／淡化／排序（combobox、`sort=newest`）／檢視切換（`aria-pressed`）；LINK／燈箱相關 3 項（點有圖卡片開燈箱、缺圖不開、Enter 開燈箱） | 8（文案）、10（燈箱移除） | 三項燈箱測試在 Phase 10 隨 ProductCard 改為連結導向；其餘 UI-SPEC 保留 grid/list 切換與排序。文案變動見下表 |
| `HomePage.test.tsx`(7) | 資料來源（`featured=1/2` 呼叫）、兩組獨立、錯誤／空狀態＝契約；`熱門推薦系列`／`頂級精選系列`區塊標題文字＝呈現 | 8 | UI-SPEC 熱銷標題改為「這陣子大家都在問」，區塊標題斷言需改；HomePage 資料契約保留 |
| `AboutPage.test.tsx`(3) | 6 張圖卡順序／`src`／h4 標題＝內容契約（`ABOUT_SERVICES`）；「不再顯示載入骨架」＝契約 | 8（若改版重排圖卡則調整 heading level） | 斷言 `heading level 4`（呈現，可能隨版面改） |
| `App.test.tsx`(11) | 路徑集合、8 條舊網址、排序回 `name`＝路由契約；`findByRole("combobox")`＝排序控制 | 8 | 全數契約；唯一呈現成分是頁面標題文字取自 `title` |
| `hooks/useProducts.test.tsx`(13) | 全契約（狀態機、abort、StrictMode） | 無 | 與 UI 無關 |

### 會因 UI-SPEC 變動而需處置的文案斷言

| 測試引用字串 | 所在檔案 | UI-SPEC 是否保留 | 備註 |
|------|------|------|------|
| `載入產品中...`、`目前沒有精選商品`、`重新載入` | FeaturedCarousel、ProductPageTemplate | 保留（Copywriting Contract） | 契約 |
| `暫無圖片`（`role="img"`） | FeaturedCarousel、ProductCard、ProductPageTemplate、HomePage | 保留 | 契約 |
| `上一張`／`下一張`／`第 N 張`（button） | FeaturedCarousel | 保留 | 契約；「每按一次移動 1 張」 |
| `點擊查看大圖`、`/查看/` button name | ProductCard、ProductPageTemplate | 刪除（改 Link，name 由卡內文字組成；便條卡為 `查看 {name} 詳情`） | 呈現／Phase 10 |
| `瀏覽太頻繁，請稍候一分鐘再重試`（429 文案） | FeaturedCarousel、可能亦在 ProductPageTemplate | **改**為「現在逛的人有點多，等幾秒再試一次。」 | 文案呈現；不洩漏後端原文（`後端原始訊息XYZ` 不得出現）仍是契約 |
| `正在載入產品資訊...`、`此分類目前沒有上架的商品`、`僅顯示前 100 項商品` | ProductPageTemplate | UI-SPEC Copywriting 未列保留；列表空狀態改為「這裡還沒有商品」 | 呈現；`aria-busy`／截斷提示存在與否為契約。[ASSUMED: 載入中與截斷提示新字串未在 Copywriting Contract 列出，Phase 8 需補定] |
| `格狀檢視`／`列表檢視`（button name）、`aria-pressed` | ProductPageTemplate | 保留功能（UI-SPEC 291 行）；字串未明列 | 契約；planner 在 Phase 8 驗證 aria-label 沿用 |
| `開啟選單`／`關閉選單` | NavBar（新增） | 新增（Phase 8） | 現有測試未引用 |
| `KRD MICGO`（Logo 失敗後文字備援） | NavBar | 保留（UI-SPEC 428 行） | 契約 |
| `所有商品`、`最新商品`、`KRD`、`MICGO`、`無線麥克風`、`有線麥克風`、`擴大機 / 喇叭`、`配件`（分類 name） | NavBar、SideMenu、App（`前往喇叭`？） | 保留（NAV_ITEMS 不變） | 契約；role 變 link |
| `商店介紹`（NavBar button） | NavBar | 改為「關於我們」 | 呈現 |
| `卡拉OK/KTV/酒店/PUB/遊覽車/維修`、`/abouts/*.png` | AboutPage | 保留（內容） | 契約 |
| `價格洽詢`、`NT$1,200` | ProductCard、ProductPageTemplate、HomePage | 卡片改顯示「價格請來電」tag；`priceText`（`NT$…`）保留 | `價格洽詢`文字斷言＝呈現（Phase 8 改字串）；HomePage「不顯示價格」需重新對照新便條卡（UI-SPEC 便條卡底列顯示價格／價格請來電，與此測試衝突，Phase 8 需改） |

**D-04 的 accessible name 清單**（盤點文件應列的 role + name）：`上一張`、`下一張`、`第 N 張`（button）；`暫無圖片`（img）；`重新載入`（button）；`格狀檢視`、`列表檢視`（button，`aria-pressed`）；`商品名稱`（img alt）；分類 8 項（button 現為 -> link）；`商店介紹`；`/查看/`（button，Phase 10 變為 link）；`開啟選單`（UI-SPEC 新增，現有測試只有 D-04 範例提及，grep 現有測試未見）。

> 觀察：`grep` 現有測試未找到 `開啟選單`，CONTEXT D-04 把它列在範例中，實為 UI-SPEC 新增字串；盤點文件應標註「現有測試未引用，Phase 8 新增」，避免誤當既有契約。

## 3. MAINT-01 安全性驗證

**引用檢查（已實測）：** 排除 `node_modules`、`dist`、`.git`、`package-lock.json` 後 grep `tailwindcss/postcss|types/react-router-dom`，只命中 `package.json`、`CLAUDE.md`、`.planning/**` 的文件。`postcss.config.js` 只有 `tailwindcss` 與 `autoprefixer`；`package.json` 中兩個套件各一行（第 23、30 行，devDependencies）。`src/`、`vite.config.ts`、`scripts/` 無引用。[VERIFIED: 本機 grep]

**CSS 比對（已實測可行）：** `dist/` 已被 gitignore（`git check-ignore dist` 回傳 dist）。Vite 輸出檔名含內容 hash，本機連續兩次建置結果完全一致（`index-CIqOYEpz.css`，sha256 `9fee6d55…940b8cc`）。若不想動 `dist/`，用暫存 outDir：

```bash
# 移除前：基準
S=<暫存目錄>
npx vite build --outDir $S/before --emptyOutDir
cat $S/before/assets/*.css | shasum -a 256

# npm uninstall @tailwindcss/postcss 後
npx vite build --outDir $S/after --emptyOutDir
cat $S/after/assets/*.css | shasum -a 256
# 兩個 sha256 必須相同（檔名 hash 也應相同）
```

- 用「串接所有 CSS 再 sha256」而非比檔名，是因為若未來有多個 CSS chunk，檔名排序不影響結果（`cat` 以 glob 字母序，兩邊一致）。
- 比對 `postcss` 升降級風險：`npm uninstall` 可能連帶移除只被它依賴的 transitive 套件（lockfile 變動），若 `tailwindcss` v3 與 `postcss` 版本被重新解析，CSS 可能改變，這正是 D-15 要偵測的。比對失敗時用 `diff` 看差異。
- 完整驗證仍是 `npm test && npm run lint && npm run build`（`build` 含 `tsc -b` 與 `check-dist.mjs`）。`@types/react-router-dom` 移除後，`tsc -b` 是主要驗證點（react-router-dom v6 自帶型別）。
- 風險：舊 `@types/react-router-dom@5` 附帶 `@types/react-router` v5；移除後若有隱性型別依賴，`tsc -b` 會報錯。grep 零引用，風險低。

## 4. 需同步的文字位置（已定位）

**D-13（獨立 docs commit）：**

| 檔案 | 行 | 現行文字 | 改為 |
|------|----|----------|------|
| `.planning/REQUIREMENTS.md` | 18 | `SHELL-02: 訪客在商品頁可用新版 SideMenu 切換分類，手機版可開關` | 依 D-13：列表頁可用分類 chip 列切換分類（桌機／平板可換行，手機單列橫向捲動），取代舊 SideMenu |
| `.planning/ROADMAP.md` | 71（Phase 8 成功標準 #2） | `…商品頁可用 SideMenu 切換分類，手機版可開關` | 改為分類 chip 列的對應描述（ROADMAP 第 35 行 Phase 8 摘要已寫「分類 chip（取代 SideMenu）」，不需動） |
| `.planning/PROJECT.md` | 18 | `共用骨架重設計（NavBar、SideMenu、Footer、Layout）…` | 膠囊頂列、分類 chip、一行頁尾、手機固定撥號列，WR-04 修正保留 |

- `PROJECT.md` 第 50 行「Validated in Phase 3」屬歷史紀錄，**不要改**。
- `REQUIREMENTS.md` 第 93 行的追蹤表只有編號，不動。

**D-16（與 `@tailwindcss/postcss` / `@types/react-router-dom` 移除各自同一 commit）：**

| 檔案 | 行 | 內容 |
|------|----|------|
| `CLAUDE.md` | 43 | `@tailwindcss/postcss`（Key Dependencies） |
| `CLAUDE.md` | 44 | `@types/react-router-dom` |
| `.planning/codebase/STACK.md` | 46、47 | 同上兩行（行號對應） |
| `.planning/codebase/CONCERNS.md` | 13、69–73 | 描述版本混用與過時型別（CONTEXT D-16 未列，但移除後會過時，建議一併改；至少標註已於 Phase 6 解決） |

建議：commit 1 只刪 `CLAUDE.md` 第 43 行與 `STACK.md` 第 46 行（及 CONCERNS 對應敘述）；commit 2 刪第 44 行與 `STACK.md` 第 47 行。這樣兩個 commit 各自文件與依賴一致。`.planning/research/*`、`milestones/*`、`MILESTONES.md` 為歷史文件，不改。

## Architecture Patterns / Don't Hand-Roll

| 問題 | 不要自己寫 | 用 |
|------|-----------|-----|
| 取得測試清單 | 手抄或自寫 parser 掃 `it(` | `npx vitest list`（已展開 `it.each`） |
| 檢查 CSS 不變 | 自寫比對腳本入 repo | 本機 `shasum`，不 commit（D-15） |
| 測試數量守門 | 自動化檢查腳本 | D-12：靠 VERIFICATION 流程人工對照盤點文件 |

## Common Pitfalls

1. **用 `it(` 次數當總數：** 194 vs 215。盤點必須以 `vitest list` 展開為準。
2. **盤點列數對不上：** `it.each` 在 D-02 要求「一列並註明展開數」，但 D-03 要求「展開後等於 215」。解法：每個 `it.each` 的展開項各自一列（或一列旁註 N 項並於驗證時以展開數加總）。建議逐項一列（grep 友善、與 `vitest list` 一對一），否則驗證指令要處理加總。
3. **以為 `dist/` 檔名 hash 會變：** 內容相同時 hash 相同；比對失敗才是真正訊號。
4. **移除套件後 lockfile 未同步：** 一律用 `npm uninstall`，確認 `git diff --stat` 只含 `package.json`、`package-lock.json` 與對應文件。
5. **兩個依賴合成一個 commit：** 違反 D-14；每個 commit 都要單獨跑 test/lint/build。
6. **誤把 UI-SPEC 新增字串（如 `開啟選單`）當既有契約：** 盤點要區分「現有測試引用」與「Phase 8 新增」。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node / npm | 全部指令 | 可用 | 本機已跑通 vitest、vite build | — |
| Vitest | `vitest list`／`npm test` | 可用 | ^4.1.12 | — |
| `shasum` | CSS 比對 | 可用（macOS） | — | `openssl dgst -sha256` |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.12，兩個 project：unit（node）、component（jsdom），定義於 `vite.config.ts` |
| Config file | `vite.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run lint && npm run build` |

### Phase Requirements -> 驗證方式
| Req ID | 行為 | 驗證類型 | 指令 | 檔案存在？ |
|--------|------|----------|------|-----------|
| DESIGN-01 | UI-SPEC 已核准 | grep | `grep -n "status: approved" .planning/phases/06-design-lock/06-UI-SPEC.md` | 已有 |
| TEST-06 | 盤點文件存在且列數 = 215 | 檔案檢查 | 見下方列數檢查 | Wave 0：待建立 `06-TEST-INVENTORY.md` |
| TEST-06 | 盤點測試名稱與實際一致 | 比對 | 見下方 diff 檢查 | 同上 |
| TEST-06 | 基準 215／17 寫入 STATE.md Decisions | grep | `grep -n "215" .planning/STATE.md` | 待更新 |
| MAINT-01 | 套件已移除、各自獨立 commit | git／grep | `git log --oneline -n 5`；`grep -c "tailwindcss/postcss\|types/react-router-dom" package.json`（應為 0） | — |
| MAINT-01 | 每個 commit 通過 test/lint/build | 指令 | `npm test && npm run lint && npm run build` | 已有 |
| MAINT-01 | CSS 產出不變 | sha256 | 第 3 節流程，前後雜湊相同 | — |
| D-13／D-16 | 文件已同步 | grep | `grep -n "SideMenu" .planning/REQUIREMENTS.md .planning/PROJECT.md`（第 18 行已改）；`grep -n "tailwindcss/postcss\|types/react-router-dom" CLAUDE.md .planning/codebase/STACK.md`（應為 0） | — |

**盤點列數與名稱檢查（建議寫進 plan 的驗證步驟）：**

```bash
# 1) 實際測試數
npx vitest list 2>/dev/null | wc -l                      # 必須 = 215
# 2) 盤點文件逐項列數（以每列開頭固定標記，例如 "| src/"；格式由 planner 決定）
grep -c "^| " 06-TEST-INVENTORY.md                        # 扣掉表頭與其他表格後 = 215
# 3) 名稱一致性：從盤點文件抽出測試名稱欄，與 vitest list 去前綴後 diff，應無差異
```

建議 planner 讓盤點的第一欄固定為完整的 `檔案 > describe > 測試名稱`（與 `vitest list` 一行一致），並讓所有表格只有這份清單帶該欄，如此 diff 檢查才能自動化而不違反 D-12（D-12 只禁止加入 repo 的自動檢查腳本，一次性驗證指令可以）。

### Sampling Rate
- **每個 commit：** `npm test && npm run lint && npm run build`
- **Phase gate：** 上述全綠＋盤點列數／名稱 diff 通過＋CSS 雜湊相同＋`git status` 乾淨

### Wave 0 Gaps
- 無測試框架缺口；唯一待建檔案為 `06-TEST-INVENTORY.md`（本 phase 的交付物，無需測試）。

## Security Domain

本 phase 不新增程式、路徑、網路請求或憑證，僅刪除未使用的 devDependencies。`noAirtable` 憑證掃描與 `check-dist.mjs` 於每次 `npm run build`／`npm test` 持續生效。ASVS 類別皆不適用；移除套件反而縮小供應鏈面積。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `PRICE_ON_REQUEST` 常數值在 Phase 8 是否更動尚未決定（UI 新增「價格請來電」tag） | 2 | 盤點時分類錯，Phase 8 才發現測試需改 |
| A2 | ProductPageTemplate「正在載入產品資訊...」「僅顯示前 100 項商品」新字串 UI-SPEC 未明列 | 2 | Phase 8 需另行決定，不影響本 phase |

所有其他主張皆經本機指令或 grep 驗證。

## Open Questions

1. **盤點 D-02「it.each 列一列」與 D-03「展開後 215」的取捨**
   - 建議逐展開項一列；planner 在 plan 中明定，並以第一欄＝`vitest list` 全名為準。
2. **`CONCERNS.md` 是否納入 D-16？**
   - 建議納入（第 13、69–73 行），否則文件會描述已不存在的問題。

## Sources

- 本機實跑：`npx vitest list`、`npx vitest list --json`、`npx vite build --outDir`（兩次，sha256 一致）、grep 引用檢查
- `06-CONTEXT.md`、`06-UI-SPEC.md`（元件契約、導覽與 SideMenu 影響、Copywriting Contract）
- 專案檔：`postcss.config.js`、`package.json`、`REQUIREMENTS.md`、`ROADMAP.md`、`PROJECT.md`、`CLAUDE.md`、`.planning/codebase/STACK.md`

## Metadata

**Confidence breakdown:**
- 測試清單取得方式：HIGH（實跑）
- 逐檔初判：MEDIUM（依測試名稱與 grep 斷言字串；逐條 `it` 內容未全部開檔，planner 執行時需逐條確認）
- MAINT-01 安全性：HIGH
- 同步位置：HIGH（grep 定位到行號）

**Research date:** 2026-11-11
**Valid until:** 2026-12-11（測試檔在 Phase 7 之後會變動，行號與項數以當時為準）
