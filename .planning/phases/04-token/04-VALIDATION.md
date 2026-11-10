---
phase: 4
slug: token
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-11-10
---

# Phase 4 — Validation Strategy

> 每個 phase 的驗證契約，用來規定執行期間何時、用什麼指令取得回饋。
> 本 phase 幾乎不改程式，驗證以 shell 指令和 orchestrator 的瀏覽器實測為主。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest（unit：node；component：jsdom），目前 17 檔／205 測試 |
| **Config file** | 既有 `vite.config.ts`／`vitest` 設定（見 `.planning/codebase/TESTING.md`） |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run lint && npm run build && npm run check:dist` |
| **Estimated runtime** | ~40 秒 |

---

## Sampling Rate

- **每個任務 commit 後（多為 docs commit）：** 執行 `npm test`
- **每個 plan wave 結束後：** 執行完整測試指令
- **執行 `/gsd:verify-work` 前：** 完整測試全綠、04-01 使用者 checkpoint 已通過，而且 D-14 撤銷後狀態碼為 401 或 403
- **最長回饋延遲：** 60 秒

---

## Per-Task Verification Map

> Task ID 由 planner 定案後回填；以下依 RESEARCH 建議的拆分（04-01 實測、04-02 撤銷）預填。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-xx | 01 | 1 | REL-01 | — | 部署的是最新 HEAD | shell | `gh api repos/JiaHao416/krd_website/commits/<HEAD>/check-runs` 中 Cloudflare Pages 的 conclusion 為 `success` | ✅ | ⬜ pending |
| 4-01-xx | 01 | 1 | REL-01 | — | production 檔案與本機 build 相同 | shell | 比對 index.html 引用的檔名，並 `cmp` 下載的 JS 與 `dist/assets/` | ✅ | ⬜ pending |
| 4-01-xx | 01 | 1 | REL-01 | T-03-15 | 線上 bundle 不含憑證 | shell | 一次性 scan-prod 腳本（放 scratch、從 check-dist.mjs 讀規則）：exit 0、0 命中 | ✅ scratch | ⬜ pending |
| 4-01-xx | 01 | 1 | REL-01 | — | 9 條深層連結都回 200 | shell | `curl -s -o /dev/null -w '%{http_code}'` 逐一測試路徑 | ✅ | ⬜ pending |
| 4-01-xx | 01 | 1 | REL-01 | — | 各頁商品數等於 API 數 | shell + manual | 帶 Origin 標頭用 curl 取 `pagination.total`；用 DevTools 快照計數比對 | manual | ⬜ pending |
| 4-02-xx | 02 | 2 | REL-02 | T-03-12 | 撤銷前基準（舊 token 回 200） | shell | D-14 指令（`rtk proxy`），輸出為 `200` | ✅ | ⬜ pending |
| 4-02-xx | 02 | 2 | REL-02 | T-03-12、T-03-17 | 舊 token 已失效 | shell | D-14 指令，輸出為 `401` 或 `403` | ✅ | ⬜ pending |
| 4-02-xx | 02 | 2 | REL-02 | — | 撤銷後網站正常 | shell + manual | 重跑 bundle 掃描與深層連結，加上精簡版 DevTools 實測 | manual | ⬜ pending |
| 回歸 | 01/02 | 1–2 | — | T-03-13 | 原始碼／dist 不含憑證 | unit | `npm test`（noAirtable.test.ts）與 `npm run check:dist` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

現有測試基礎設施已涵蓋本 phase 的所有需求。線上掃描依 D-18 用一次性腳本完成，放在 session scratchpad，不進 repo。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 全站畫面、導覽、Logo、/abouts 正常；Network 沒有 airtable/imgur 請求；Console 沒有錯誤 | REL-01 | 需要真實瀏覽器 | orchestrator 用 Chrome DevTools MCP 依 04-CONTEXT D-04、D-05 實測，產出文字證據表，由使用者確認 |
| Owner 撤銷 token | REL-02 | 只有 Owner 能登入 Airtable | `checkpoint:human-action`，依中文逐步說明操作 |
| 撤銷後網站正常 | REL-02 | 需要真實瀏覽器 | 依 D-13 跑精簡版實測 |

---

## Validation Sign-Off

- [ ] 所有任務都有 `<automated>` 驗證，或依賴 Wave 0
- [ ] 取樣連續性：沒有連續 3 個任務缺少自動驗證
- [ ] Wave 0 涵蓋所有標為 MISSING 的項目
- [ ] 沒有使用 watch-mode 參數
- [ ] 回饋延遲小於 60 秒
- [ ] frontmatter 已設 `nyquist_compliant: true`

**Approval:** pending
