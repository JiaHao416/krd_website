---
phase: 3
slug: airtable
status: draft
nyquist_compliant: false
wave_0_complete: false
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

> Task ID 由 planner 產生計畫後填入；下表先以需求為單位列出。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | STAT-01 | — | N/A | component + 檔案檢查 | `npx vitest run src/components/NavBar.test.tsx`；`file public/brand-logo.png` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | STAT-02 | — | N/A | unit + component | `npx vitest run src/config/navigation.test.ts src/components/NavBar.test.tsx src/components/SideMenu.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | STAT-03 | — | N/A | component | `npx vitest run src/pages/AboutPage.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEC-04 | 憑證殘留 | `src/` 無 Airtable 網址／Base ID／token 格式，測試只輸出檔名與規則名 | unit（原始碼掃描） | `npx vitest run src/noAirtable.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEC-01 | 憑證殘留於 bundle | `dist/` 零命中，腳本不輸出匹配內容 | build 後腳本 | `npm run build && npm run check:dist` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 需求

- [ ] `src/config/navigation.test.ts` — STAT-02
- [ ] `src/components/NavBar.test.tsx` — STAT-01、STAT-02
- [ ] `src/components/SideMenu.test.tsx` — STAT-02
- [ ] `src/pages/AboutPage.test.tsx` — STAT-03
- [ ] `src/noAirtable.test.ts` — SEC-04（與刪除 `src/services/index.ts` 同一 commit 或之後加入，確保每個 commit 綠燈）
- [ ] `scripts/check-dist.mjs` + `package.json` `check:dist` — SEC-01

框架已安裝，不需新增套件。

---

## 手動驗證項目（Manual-Only Verifications）

| 行為 | 需求 | 為何手動 | 檢查步驟 |
|------|------|----------|----------|
| 下載圖檔為正確 PNG 與尺寸 | STAT-01、STAT-03 | imgur 限流時可能回 HTML／removed.png | `file public/brand-logo.png public/abouts/*.png`；`sips -g pixelWidth -g pixelHeight`（Logo 800×235、圖卡 250×250） |
| 全站頁面外觀與現行一致 | STAT-01～03 | 視覺比對 | `npm run dev` 瀏覽首頁、商品頁、關於我們，比對 Logo、選單順序、6 張圖卡 |

---

## 驗證簽核（Validation Sign-Off）

- [ ] 所有 task 都有 `<automated>` 驗證或依賴 Wave 0
- [ ] 取樣連續性：不會連續 3 個 task 沒有自動驗證
- [ ] Wave 0 涵蓋所有 MISSING 參照
- [ ] 沒有 watch 模式旗標
- [ ] 回饋延遲 < 60 秒
- [ ] frontmatter 設定 `nyquist_compliant: true`

**Approval:** pending
