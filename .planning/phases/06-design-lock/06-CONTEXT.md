# Phase 6: 設計鎖定與測試盤點 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 交付三件事，**不寫任何 UI 程式碼**：

1. **DESIGN-01（已完成）**：`06-UI-SPEC.md` 已於 2026-11-11 經 checker 第 2 輪通過並由使用者明確確認（`status: approved`）。本 phase 不再修改 UI-SPEC，planner 只需在計畫中把 DESIGN-01 標記為完成並引用該文件。
2. **TEST-06**：把現有 215 項測試（17 個檔，2026-11-11 實跑 `vitest run` 確認）分成「行為契約」與「呈現」兩類，寫成盤點文件並記錄總數基準，供 Phase 7–11 約束。
3. **MAINT-01**：以兩個獨立 commit 移除未使用的 `@tailwindcss/postcss` 與 `@types/react-router-dom`，每個 commit 都通過 `npm test`、`npm run lint`、`npm run build`。

另含一項規劃文件同步（REQUIREMENTS／ROADMAP／PROJECT 中仍寫 SideMenu 的文字改為與 UI-SPEC 一致），屬文件修正，不是新功能。

</domain>

<decisions>
## Implementation Decisions

### 盤點清單的形式
- **D-01:** 盤點寫成單一文件 `.planning/phases/06-design-lock/06-TEST-INVENTORY.md`，**不在測試程式碼內加標記**（不改 describe／it 名稱、不加註解）。理由：本 phase 不動程式碼；測試名稱在 Phase 8/10 會因改寫而變動，程式內標記反而會漂移。
- **D-02:** 顆粒度為**逐條測試**，依測試檔分節。`it.each` **每個展開項各一列**（研究後修訂，與 D-03 一致；備註欄可註明來自同一個 `it.each`）。第一欄固定為與 `npx vitest list` 同一行一致的完整名稱（`檔案 > describe > 測試名稱`，去掉 `[project]` 前綴），以便 diff 驗證。每列欄位：測試名稱（完整名稱）、分類（契約／呈現）、契約類型（role・accessible name・aria 狀態・路由／href・錯誤狀態・狀態機／計時・資料轉換・憑證掃描）、預計受影響的 phase（7/8/9/10/無）、預定處置（保留／調整斷言／改寫為新元件同語意測試）。
- **D-03:** 清單以 `npx vitest list`（或 JSON reporter）產出的實際測試名稱為來源，**文件列數展開後必須等於 215**，避免手抄漏列。
- **D-04:** 文件另附一節「accessible name 契約清單」，列出所有被測試引用的 `aria-label`／role+name（例如 `上一張`、`下一張`、`第 N 張`、`暫無圖片`、`開啟選單`、`重新載入`），標明 UI-SPEC 是否保留原字串；有改名的列出新字串與改在哪個 phase。

### 契約／呈現的分界
- **D-05:** **契約**＝role + accessible name、`aria-*` 狀態（`aria-current`、`aria-expanded`、`aria-busy`）、路由與 `href`、導向結果、錯誤狀態對應（`ApiError` 分類、`role="alert"`、重新載入）、輪播狀態機（計時、hover／焦點暫停、reduced-motion、觸控不暫停、手動切換重新計時）、資料轉換與 service 行為、`noAirtable` 憑證掃描。
- **D-06:** 所有 `*.test.ts`（unit：services、config、hooks 的資料邏輯、`noAirtable`）**預設一律為契約**；只有在逐條檢視時發現純呈現斷言才降為呈現，並寫出原因。
- **D-07:** **文案斷言**：UI-SPEC Copywriting Contract 保留原字串者（如「載入產品中...」「目前沒有精選商品」「重新載入」「上一張／下一張」）視為契約；UI-SPEC 改掉的字串（如「點擊查看大圖」、舊頁尾文字）視為呈現，並在「預定處置」寫出新字串。
- **D-08:** **`data-testid` 與 className 斷言**一律為呈現；但 UI-SPEC 明文保留者（`data-testid="product-description"`）標註「保留」。
- **D-09:** **混合型測試**（同一個 `it` 同時斷言契約與呈現）歸為**契約**，並在備註列出哪幾個斷言可以隨設計調整。
- **D-10:** UI-SPEC 已規劃改寫方向的三組測試直接照抄其決定，不重新設計：`SideMenu.test.tsx` 5 項 → `CategoryChips` 同語意測試（role 由 button 變 link，name 不變）；`NavBar.test.tsx` 依 UI-SPEC「導覽與 SideMenu 影響」改寫並補測試以維持數量；`FeaturedCarousel.test.tsx` 依 UI-SPEC「對 Phase 8 / Phase 10 測試的影響」調整。`ProductCard.test.tsx` 中 `role="button"`／燈箱相關斷言標為 Phase 10 改寫為連結語意（LINK-01）。

### 測試總數基準
- **D-11:** 基準為 **215 項／17 個檔（2026-11-11）**，同時寫入盤點文件開頭與 `STATE.md` 的 Decisions。
- **D-12:** **不新增自動化的測試數量檢查腳本**，以 plan 與 verify 把關：Phase 7–11 每個 phase 的 VERIFICATION 都要執行 `npm test` 並記錄總數 ≥ 基準，且對照盤點文件確認契約類斷言沒有被刪除。理由：真正要守的是「契約斷言沒被刪」，單看數量無法保證；把數量寫進 build 又會讓合法的「先刪後補」改寫流程卡住，且增加維護成本。

### 規劃文件同步
- **D-13:** 在本 phase 以一個獨立的 docs commit 讓需求文字與已核准的 UI-SPEC 一致：
  - `REQUIREMENTS.md` SHELL-02 改為「訪客在列表頁可用分類 chip 列切換分類（桌機／平板可換行，手機單列橫向捲動），取代舊 SideMenu」。
  - `ROADMAP.md` Phase 8 成功標準 #2 的「商品頁可用 SideMenu 切換分類，手機版可開關」改為分類 chip 列的對應描述。
  - `PROJECT.md` Target features 中「共用骨架重設計（NavBar、SideMenu、Footer、Layout）」改為與 UI-SPEC 一致（膠囊頂列、分類 chip、一行頁尾、手機固定撥號列）。
  - 只改文字，不改需求編號與 phase 對應。

### 依賴移除（MAINT-01）
- **D-14:** 兩個獨立 commit，順序為先 `@tailwindcss/postcss`、後 `@types/react-router-dom`，皆用 `npm uninstall`（同步更新 `package-lock.json`）。每個 commit 前都跑 `npm test`、`npm run lint`、`npm run build`。
- **D-15:** 移除 `@tailwindcss/postcss` 時，另外比對移除前後 `dist/assets/*.css` 的內容（hash 或 diff）必須相同，證明樣式產出不受影響（`postcss.config.js` 只用 v3 的 `tailwindcss` 與 `autoprefixer`）。比對只在本機進行，不 commit 產物。
- **D-16:** 同一個 commit 內一併更新描述這兩個套件的文件：`CLAUDE.md`（Key Dependencies 段落第 43–44 行）、`.planning/codebase/STACK.md` 與 `.planning/codebase/CONCERNS.md`（研究後納入，第 13、69–73 行一帶），避免文件說「已安裝但未使用」而實際已移除。每個 commit 只改自己那個套件相關的行。

### Phase 結尾
- **D-17:** 依 milestone 共通限制，phase 結束時把 `main` 合併進 `redesign`（目前 `main` 預期沒有新 commit，若無變動則記錄「無需合併」）。

### Claude's Discretion
使用者在討論階段將全部灰色地帶（盤點形式、分類分界、總數基準、文件同步與依賴移除）交由 Claude 決定，D-01～D-17 皆為 Claude 代選的建議方案。planner 可調整計畫切分與執行順序（例如盤點與依賴移除可並行），但不得改變以下方向：D-01（不在測試程式碼加標記）、D-03（列數必須等於 215）、D-12（不加自動化數量檢查腳本）、D-14（兩個依賴各自獨立 commit）。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 設計契約（已核准）
- `.planning/phases/06-design-lock/06-UI-SPEC.md` — 已核准的 UI 契約；盤點時特別引用「熱銷便條卡 → 既有輪播行為契約如何保留／對 Phase 8 / Phase 10 測試的影響」「導覽與 SideMenu 影響」「商品卡 ProductCard」「Copywriting Contract」四節
- `.planning/phases/06-design-lock/mockups/` — 7 份示意稿（本 phase 只供參照，不實作）

### 需求與路線
- `.planning/REQUIREMENTS.md` — DESIGN-01、TEST-06、MAINT-01；SHELL-02 需依 D-13 同步
- `.planning/ROADMAP.md` §Phase 6 — 成功標準 1–4；§Phase 8 成功標準 #2 需依 D-13 同步
- `.planning/PROJECT.md` — Target features 需依 D-13 同步

### 研究
- `.planning/research/PITFALLS.md` #3（測試綁標記）— 契約型／呈現型分類的理由與 accessible name 清單要求
- `.planning/research/SUMMARY.md` — 「設計鎖定與測試盤點」phase 的建議範圍

### 測試與技術棧
- `.planning/codebase/TESTING.md` — Vitest 兩個 project（unit/node、component/jsdom）、mock 慣例
- `.planning/codebase/STACK.md` — 依賴描述，需依 D-16 更新
- `CLAUDE.md` — Key Dependencies 段落需依 D-16 更新
- `postcss.config.js` — 證明未使用 `@tailwindcss/postcss`

</canonical_refs>

<code_context>
## Existing Code Insights

### 測試檔現況（215 項，2026-11-11 全數通過）
- unit（`*.test.ts`）：`services/products`（30）、`services/transform`（18）、`services/errors`（17）、`services/catalog`（14）、`services/format`（10）、`services/client`（6）、`config/navigation`（4）、`noAirtable`（2）
- component（`*.test.tsx`）：`ProductCard`（21）、`FeaturedCarousel`（18）、`ProductPageTemplate`（17）、`hooks/useProducts`（13）、`HomePage`（7）、`NavBar`（6）、`SideMenu`（5）、`App`（3）、`AboutPage`（3）
- 上述括號為 `it(` 出現次數（合計約 194），與 215 的差額來自 `it.each` 展開；盤點時以 `vitest list` 為準。

### Established Patterns
- 頁面測試以 `vi.mock` 取代 `../components/Layout` 與 `../services/products`；路由元件以 `MemoryRouter` 包裹
- `FeaturedCarousel` 測試以 fake timers + `matchMedia` mock 驗證 WCAG 2.2.2 行為（UI-SPEC 指出 Phase 8 需先擴充 mock 處理 `max-width: 767px`）

### Integration Points
- `package.json` devDependencies：`@tailwindcss/postcss ^4.1.7`、`@types/react-router-dom ^5.3.3` 除 `package.json`、`package-lock.json` 與文件外**無任何程式引用**（2026-11-11 grep 確認）
- `npm run build` = `tsc -b && vite build && node scripts/check-dist.mjs`；移除型別套件後 `tsc -b` 是主要驗證點

</code_context>

<specifics>
## Specific Ideas

- 使用者的設計偏好（不要制式、要並排多個示意畫面挑選）已反映在 UI-SPEC，本 phase 不再有視覺決策。
- 盤點文件是 Phase 8、10 改寫測試時的對照表，格式要方便 grep（每列一條測試、保留原始測試名稱）。

</specifics>

<deferred>
## Deferred Ideas

- 自動化測試數量／契約斷言檢查腳本 — 若 Phase 8 改寫時發現人工對照容易漏，再另案評估（D-12 先不做）
- Tailwind v4 升級 — 已列為 MAINT-F-01，重設計完成後單獨進行

</deferred>

---

*Phase: 06-design-lock*
*Context gathered: 2026-11-11*
