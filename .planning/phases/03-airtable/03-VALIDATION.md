---
phase: 3
slug: airtable
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-11-10
---

# Phase 3 — 驗證策略（Validation Strategy）

> 本 phase 執行期間的回饋取樣合約。

---

## 測試基礎設施（Test Infrastructure）

| 項目 | 值 |
|------|----|
| **Framework** | Vitest ^4.1.12（jsdom + Testing Library） |
| **Config file** | `vite.config.ts`（`unit`=node `*.test.ts`；`component`=jsdom `*.test.tsx`，setup `src/test/setup.ts`） |
| **Quick run command** | `npx vitest run <相關測試檔>` |
| **Full suite command** | `npm test && npm run lint && npm run build && npm run check:dist` |
| **Estimated runtime** | ~30 秒 |

---

## 取樣頻率（Sampling Rate）

- **每個 task commit 後：** `npx vitest run <相關測試檔>` + `npm run build`（專案規定每次 commit 都要 build 成功）
- **每個 wave 後：** `npm test && npm run lint && npm run build`
- **`/gsd:verify-work` 前：** Full suite 全綠，且 `check:dist` 零命中
- **最長回饋延遲：** 60 秒

---

## 逐 Task 驗證對照（Per-Task Verification Map）

> Task ID 格式：`{plan}-T{n}`。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-T1 | 03-01 | 1 | STAT-02 | T-03-03 | SideMenu 不再 import Airtable service | unit + component | `npx vitest run src/config/navigation.test.ts src/components/SideMenu.test.tsx src/services/catalog.test.ts src/App.test.tsx && npm run build` | ✅ | ✅ green |
| 03-01-T2 | 03-01 | 1 | STAT-01、STAT-02 | T-03-01、T-03-02、T-03-03 | Logo 為已驗證 PNG 800×235；NavBar 不再 import Airtable service | component + 檔案檢查 | `file public/brand-logo.png \| grep -q "PNG image data, 800 x 235" && npx vitest run src/components/NavBar.test.tsx && npm test && npm run build` | ✅ | ✅ green |
| 03-02-T1 | 03-02 | 1 | STAT-03 | T-03-05、T-03-06 | 6 張圖皆為 PNG 250×250 且互不相同；內容檔無憑證 | 檔案檢查 + build | `file public/abouts/*.png`（6 行 250 x 250）`&& npm run build` | ✅ | ✅ green |
| 03-02-T2 | 03-02 | 1 | STAT-03 | T-03-07 | AboutPage 不再 import Airtable service | component | `npx vitest run src/pages/AboutPage.test.tsx && npm test && npm run build` | ✅ | ✅ green |
| 03-03-T1 | 03-03 | 2 | SEC-04 | T-03-08、T-03-11、T-03-13 | `src/` 無 Airtable 網址／Base ID／token 格式，測試只輸出檔名 | unit（原始碼掃描） | `npx vitest run src/noAirtable.test.ts && npm test && npm run lint && npm run build` | ✅ | ✅ green |
| 03-03-T2 | 03-03 | 2 | SEC-01 | T-03-09、T-03-10 | `dist/` 零命中；命中時只輸出檔名與規則名（probe 驗證） | build 後腳本 | `npm run build && npm run check:dist` | ✅ | ✅ green |
| 03-03-T3 | 03-03 | 2 | SEC-04 | T-03-11 | 文件不含憑證格式、不描述已刪檔案為現存 | grep | 見 03-03-PLAN Task 3 `<automated>` | ✅ | ✅ green |
| 03-04-T1 | 03-04 | 3 | 全部 | T-03-15、T-03-16 | Full suite + 資產 + 殘留檢查 | full | `npm test && npm run lint && rm -rf dist && npm run build && npm run check:dist` | ✅（前序 plan 建立） | ✅ green |
| 03-04-T2 | 03-04 | 3 | STAT-01～03 | T-03-15 | Network 無 Airtable／imgur 請求 | 手動目視 | checkpoint:human-verify | — | ✅ green（手動，03-04 已驗收並於上線站確認） |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 需求

- [x] `src/config/navigation.test.ts` — STAT-02
- [x] `src/components/NavBar.test.tsx` — STAT-01、STAT-02
- [x] `src/components/SideMenu.test.tsx` — STAT-02
- [x] `src/pages/AboutPage.test.tsx` — STAT-03
- [x] `src/noAirtable.test.ts` — SEC-04（與刪除 `src/services/index.ts` 同一 commit 或之後加入，確保每個 commit 綠燈）
- [x] `scripts/check-dist.mjs` + `package.json` `check:dist` — SEC-01

框架已安裝，不需新增套件。

---

## 手動驗證項目（Manual-Only Verifications）

| 行為 | 需求 | 為何手動 | 檢查步驟 |
|------|------|----------|----------|
| 下載圖檔為正確 PNG 與尺寸 | STAT-01、STAT-03 | imgur 限流時可能回 HTML／removed.png | `file public/brand-logo.png public/abouts/*.png`；`sips -g pixelWidth -g pixelHeight`（Logo 800×235、圖卡 250×250） |
| 全站頁面外觀與現行一致 | STAT-01～03 | 視覺比對 | `npm run dev` 瀏覽首頁、商品頁、關於我們，比對 Logo、選單順序、6 張圖卡 |

---

## 驗證簽核（Validation Sign-Off）

- [x] 所有 task 都有 `<automated>` 驗證或依賴 Wave 0
- [x] 取樣連續性：不會連續 3 個 task 沒有自動驗證
- [x] Wave 0 涵蓋所有 MISSING 參照
- [x] 沒有 watch 模式旗標
- [x] 回饋延遲 < 60 秒
- [x] frontmatter 設定 `nyquist_compliant: true`

**Approval:** approved 2026-11-10

---

## Validation Audit 2026-11-10

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

- Wave 0 檔案皆存在：`navigation.test.ts`、`NavBar.test.tsx`、`SideMenu.test.tsx`、`AboutPage.test.tsx`、`noAirtable.test.ts`、`scripts/check-dist.mjs`
- 相關測試：7 個檔案／58 個測試通過
- Full suite：`npm test` 17 個檔案／205 個測試通過；`npm run lint` 無問題；`rm -rf dist && npm run build` 成功；`npm run check:dist` 4 個檔案零命中
- 資產檢查：`brand-logo.png` 為 PNG 800×235；`public/abouts/*.png` 6 張皆為 PNG 250×250，md5 互不相同
- 03-03-T3 文件憑證格式 grep 計數 0（見 03-SECURITY.md T-03-11）
