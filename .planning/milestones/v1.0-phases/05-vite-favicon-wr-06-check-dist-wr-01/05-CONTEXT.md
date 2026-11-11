# Phase 5: 清理技術債 - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning
**決策方式：** 使用者授權「你都幫我做完就好」，以下決策全部由 Claude 依專案慣例與既有決策代為選定（見 Claude's Discretion）。

<domain>
## Phase Boundary

清掉 `.planning/v1.0-MILESTONE-AUDIT.md` 列出的非阻擋技術債，**不新增任何功能、不改視覺設計**：

1. `check:dist` 接進 build，Cloudflare 部署時自動擋下憑證殘留（WR-01）
2. 首頁熱銷輪播可暫停、尊重減少動態設定（WR-06，WCAG 2.2.2）
3. 移除 Vite 範本殘留、修正 favicon MIME 與 `<html lang>`、更新 Browserslist 資料
4. 規劃文件補齊（SUMMARY frontmatter、ROADMAP 清單）

push `main` 即上線：每個 commit 都必須通過 `npm run build`（含 `tsc -b`，本 phase 起也含 `check:dist`）、`npm test`、`npm run lint`。

**不在範圍：** WR-04 桌機 1024px 導覽擠壓（留給 UI 重設計 milestone）、合併兩份 logo（Phase 3 D-05 已決定 `logo.png` 為 favicon、`brand-logo.png` 為 NavBar Logo）。

</domain>

<decisions>
## Implementation Decisions

### check:dist 接線（WR-01）
- **D-01:** **推翻 Phase 3 D-15 的「不在部署流程加步驟」。** `package.json` 的 `build` 改為 `tsc -b && vite build && node scripts/check-dist.mjs`（明確串接，不用隱含的 `postbuild` hook）。Cloudflare Pages 只跑 `npm run build`，因此 dist 一旦含 Airtable 網址、token 或 Base ID 格式，部署就會失敗、不會上線。理由：D-15 當時的顧慮是「不在 CI 加新步驟」，但串在 `build` 內不需要改 Cloudflare 設定，成本為零，且 token 已撤銷後這是唯一的上線前防線。
- **D-02:** 保留 `npm run check:dist` 指令供單獨執行。由於 `vite build` 會先清空 `dist/`，串在 `build` 內就不會掃到舊產物，「掃到舊 dist」的問題在主要路徑上自然解決；單獨執行時維持現狀（找不到 dist 就失敗），不另加時間戳檢查。
- **D-03:** 修改後需實測：正常 build 通過；暫時在 dist 放一個含 `airtable` 字樣的檔案再跑腳本，確認以非 0 結束（測完移除，不 commit）。並更新 `CLAUDE.md`／`.planning/codebase/` 中描述 `build` 指令與 D-15 的文字。

### 輪播暫停行為（WR-06）
- **D-04:** `FeaturedCarousel` 在以下情況**不自動切換**：
  - 使用者系統開啟 `prefers-reduced-motion: reduce` → 完全不自動播放，只保留手動上一張／下一張／圓點
  - 滑鼠移入輪播區（hover）或焦點在輪播內（focus-within）→ 暫停，離開後恢復
- **D-05:** **不新增可見的暫停按鈕**，避免在 UI 重設計前改版面；hover/focus 暫停 + reduced-motion 停用已滿足 WCAG 2.2.2 的實務要求。
- **D-06:** 使用者手動切換（上一張／下一張／圓點）後重新計時，避免剛點完馬上又被切走。
- **D-07:** 必測行為（jsdom + fake timers，沿用 `FeaturedCarousel.test.tsx`）：reduced-motion 時經過間隔不切換；hover 時不切換、離開後恢復；focus 進入時不切換；手動切換後計時重置。`matchMedia` 在 jsdom 需 mock。

### 範本殘留與衛生
- **D-08:** 刪除未被引用的 `src/assets/react.svg`、`public/vite.svg`（刪前再 grep 確認無引用）。
- **D-09:** `src/App.css` 只保留 `#root` 規則，刪除 `.logo`、`logo-spin` 等 Vite 範本樣式；檔案與 `App.tsx` 的 import 保留。
- **D-10:** `index.html`：favicon 的 `type` 改為 `image/png`；`<html lang="en">` 改為 `lang="zh-Hant-TW"`（網站內容為繁體中文）。`<title>` 不動。
- **D-11:** 執行 `npx update-browserslist-db@latest` 更新 `caniuse-lite`（只動 `package-lock.json`），build 後確認警告消失。
- **D-12:** **不縮小 export 範圍。** `formatPrice`、`UNNAMED_PRODUCT` 有被測試引用；`PublicPagination`、`FeaturedGroup` 屬 API／設定型別，保持匯出；`ERROR_MESSAGES` 改動價值低。避免無功能價值的變動。

### 規劃文件補齊
- **D-13:** 在本 phase 的計畫內補 SUMMARY frontmatter `requirements-completed`：`02-06-SUMMARY.md` → `[PROD-04]`、`03-02-SUMMARY.md` → `[STAT-03]`、`04-02-SUMMARY.md` → `[REL-02]`（皆有 VERIFICATION 佐證）。
- **D-14:** ROADMAP：Phase 2 計畫清單補列 `02-06-PLAN.md`；最上方 Phases 清單與 Progress 表格補上 Phase 5；Phase 5 區塊移到 Progress 表格之前，並填寫 Goal 與 Success Criteria。
- **D-15:** `/gsd-validate-phase 1`（補 Phase 1 VALIDATION.md）與 `/gsd-secure-phase 4`（04-SECURITY 由 draft 轉 verified）**不放進本 phase 計畫**，它們是獨立的 GSD 稽核指令，在本 phase 完成後、`/gsd-complete-milestone` 前另外執行。

### Claude's Discretion
使用者在討論階段將全部灰色地帶交由 Claude 決定，上述 D-01～D-15 皆為 Claude 代選的建議方案。planner 可調整實作細節（例如輪播暫停的 state 寫法、計畫切分），但不得改變 D-01（build 串接 check:dist）、D-05（不加可見按鈕）、D-12（不縮 export）這三個方向。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 稽核來源
- `.planning/v1.0-MILESTONE-AUDIT.md` — 本 phase 的技術債清單來源（frontmatter `tech_debt`）

### 被推翻／沿用的先前決策
- `.planning/phases/03-airtable/03-CONTEXT.md` — D-05（兩份 logo 分工，沿用）、D-14（原始碼掃描規則）、D-15（本 phase D-01 推翻）
- `.planning/phases/03-airtable/03-REVIEW-FIX.md` — WR-01、WR-04 略過原因
- `.planning/phases/02-api/02-REVIEW-FIX.md` — WR-06 原始問題與略過原因
- `.planning/phases/02-api/02-UI-SPEC.md` — 輪播自動播放條件（第 156 行附近），本 phase 擴充暫停條件

### 程式碼
- `scripts/check-dist.mjs`、`src/noAirtable.test.ts` — 兩者 FORBIDDEN 規則有同步斷言，不要改規則
- `src/components/FeaturedCarousel.tsx`、`src/components/FeaturedCarousel.test.tsx`
- `package.json`、`index.html`、`src/App.css`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FeaturedCarousel.tsx`：已有 `goPrev`／`goNext`、圓點按鈕（`aria-label="第 N 張"`），自動播放 effect 依賴 `[status, items.length, intervalMs]`，暫停邏輯可加入這個 effect 的條件
- `FeaturedCarousel.test.tsx`：既有 jsdom 測試可沿用 fake timers 寫法
- `scripts/check-dist.mjs`：已處理 dist 不存在與空目錄的失敗情況

### Established Patterns
- 雙引號、分號、2 空格縮排；註解用繁體中文
- 每個 commit 跑 `npm run build`、`npm test`、`npm run lint`

### Integration Points
- `package.json` `build` 指令即 Cloudflare Pages 建置指令
- `HomePage.tsx` 渲染兩個 `FeaturedCarousel`（featured=1/2），暫停行為各自獨立

</code_context>

<specifics>
## Specific Ideas

- 不改任何視覺樣式；輪播外觀、間隔時間（intervalMs）維持現狀
- 驗收時在瀏覽器以 DevTools 模擬 `prefers-reduced-motion: reduce` 確認首頁輪播不自動切換

</specifics>

<deferred>
## Deferred Ideas

- WR-04 桌機 1024px 導覽擠壓 → UI 重設計 milestone
- 可見的輪播暫停／播放按鈕 → UI 重設計 milestone
- 縮小內部 export 範圍 → 不處理
- MAINT-V2-01 Tailwind v3/v4 混裝、`@types/react-router-dom` v5 → 已列 v2 需求

</deferred>

---

*Phase: 05-vite-favicon-wr-06-check-dist-wr-01*
*Context gathered: 2026-11-10*
