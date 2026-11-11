---
phase: 7
slug: detail-data
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-11-11
---

# Phase 7 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.12（unit／node、component／jsdom）|
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npx vitest run <檔案>` |
| **Full suite command** | `npm test && npm run lint && npm run build` |
| **Estimated runtime** | 約 30 秒 |

## Sampling Rate

- **每個 task commit 後：** `npx vitest run <該 task 的測試檔>`（RED commit 預期失敗、GREEN commit 預期通過）
- **每個 plan wave 後：** full suite
- **verify 前：** full suite 全綠，`npm test` 總數 > 215 並記錄
- **Max feedback latency:** 60 秒

## Per-Task Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| TEST-05 | toProductDetail：null 價格無 NT$NaN、0 保固→null、attributes 字串化、預設變體、壞 variant 略過 | unit | `npx vitest run src/services/transformDetail.test.ts` | ❌ W0（TDD 新建）| ⬜ |
| TEST-05 | fetchProductDetail：成功、invalid_response；classifyDetailError：404/400→notFound、429/500/503/網路→retryable；isUuid | unit | `npx vitest run src/services/productDetail.test.ts` | ❌ W0（TDD 新建）| ⬜ |
| TEST-05 | useProductDetail：四狀態、非 UUID 不發請求、id 變更 abort、卸載、retry | component | `npx vitest run src/hooks/useProductDetail.test.tsx` | ❌ W0（TDD 新建）| ⬜ |
| TEST-05 | noAirtable 掃描涵蓋新檔 | grep | `grep -n "import.meta.glob" src/noAirtable.test.ts` 含 `/src/**/*.{ts,tsx}` | ✅ | ⬜ |
| TEST-06 | 總數不減、既有契約不刪 | 指令 | `npx vitest list \| wc -l` > 215；`git diff --stat <phase base>..HEAD -- $(既有測試檔)` 為空 | ✅ | ⬜ |

## Wave 0 Requirements

三個新測試檔由 TDD 的 RED task 建立，無需額外框架。

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 真實 API 欄位與實作一致 | TEST-05 | 需打 production | 以 07-API-SAMPLES.md 樣本對照型別；必要時 `npm run dev` 後在 console 呼叫一次 |

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true`

**Approval:** pending
