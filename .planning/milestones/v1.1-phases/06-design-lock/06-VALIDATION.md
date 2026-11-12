---
phase: 6
slug: design-lock
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-11-11
---

# Phase 6 — Validation Strategy

> 本 phase 的驗證契約（執行期間的回饋取樣）。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.12（unit／node、component／jsdom 兩個 project）|
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run lint && npm run build` |
| **Estimated runtime** | 約 30 秒（test 約 2 秒、build 含 tsc 與 check:dist）|

---

## Sampling Rate

- **每個 task commit 後：** `npm test`
- **每個 plan wave 後：** `npm test && npm run lint && npm run build`
- **`/gsd:verify-work` 前：** 完整套件全綠，且 `npx vitest list | wc -l` = 215
- **Max feedback latency:** 60 秒

---

## Per-Task Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| DESIGN-01 | UI-SPEC 已核准 | grep | `grep -n "status: approved" .planning/phases/06-design-lock/06-UI-SPEC.md` | ✅ | ⬜ pending |
| TEST-06 | 盤點文件列數 = 215 | 檔案檢查 | 抽出盤點第一欄後 `wc -l` = 215 | ❌（本 phase 交付物）| ⬜ pending |
| TEST-06 | 盤點名稱與實際一致 | diff | `diff <(npx vitest list 2>/dev/null \| sed 's/^\[[^]]*\] //' \| sort) <(盤點第一欄 \| sort)` 無輸出 | ❌（本 phase 交付物）| ⬜ pending |
| TEST-06 | 基準寫入 STATE.md | grep | `grep -n "215" .planning/STATE.md` | ✅ | ⬜ pending |
| MAINT-01 | 套件已移除 | grep | `grep -c "tailwindcss/postcss\|types/react-router-dom" package.json` = 0 | ✅ | ⬜ pending |
| MAINT-01 | 兩個獨立 commit | git | `git log --oneline` 可見兩個各自移除一個套件的 commit | — | ⬜ pending |
| MAINT-01 | CSS 產出不變 | sha256 | 移除前後 `npx vite build --outDir <暫存>`，`cat assets/*.css \| shasum -a 256` 相同 | — | ⬜ pending |
| MAINT-01 | 每個 commit 全綠 | 指令 | `npm test && npm run lint && npm run build` | ✅ | ⬜ pending |
| D-13／D-16 | 文件同步 | grep | `grep -n "tailwindcss/postcss\|types/react-router-dom" CLAUDE.md .planning/codebase/STACK.md` = 0；SHELL-02 不再含 SideMenu | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.（唯一新建檔案為交付物 `06-TEST-INVENTORY.md`，不需測試樁。）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 契約／呈現分類正確 | TEST-06 | 需人工判斷斷言語意 | 抽查 SideMenu、NavBar、FeaturedCarousel、ProductCard 各節，與 UI-SPEC「測試影響」段落一致 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
