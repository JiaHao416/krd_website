---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
plan: 03
subsystem: infra
tags: [build, check-dist, security, docs]

requires:
  - phase: 05-01
    provides: 輪播暫停
  - phase: 05-02
    provides: 範本殘留清理
provides:
  - npm run build 串接 dist 憑證掃描
  - CLAUDE.md 與 codebase 文件同步
affects: [05-04]

key-files:
  modified: [package.json, CLAUDE.md, .planning/codebase/STACK.md, .planning/codebase/TESTING.md, .planning/codebase/INTEGRATIONS.md, .planning/codebase/CONCERNS.md, .planning/codebase/STRUCTURE.md]

key-decisions:
  - "D-01 推翻 Phase 3 D-15：build 明確串接 check-dist，不用 postbuild"
  - "D-02 保留 check:dist 單獨指令"

requirements-completed: []

duration: 5min
completed: 2026-11-10
---

# Phase 5 Plan 03: build 串接 dist 掃描 Summary

**`npm run build` 現為 `tsc -b && vite build && node scripts/check-dist.mjs`，dist 含 Airtable 痕跡即建置失敗，Cloudflare 不會部署。**

## Commits

- bfc0a1f: build(05-03): npm run build 串接 dist 憑證掃描（WR-01）
- 2a93325: docs(05-03): 文件同步 build 串接 dist 掃描與已修正的衛生問題

## 實測結果（D-03）

- 正向：`npm run build` 成功，輸出「dist/ 檢查通過：3 個檔案，無 Airtable 網址、token 或 Base ID」
- 反向：放入 `dist/__neg_test.txt`（內容 `airtable`）後 `node scripts/check-dist.mjs` exit=1，stderr「dist/__neg_test.txt：airtable 字樣」
- 移除暫存檔後再跑 exit=0；暫存檔不存在，`git status` 乾淨（dist 被 .gitignore 忽略）
- `npm test` 209 通過、`npm run lint` 無問題

## 文件更新

- CLAUDE.md（Deployment 約束、npm scripts、防回歸兩處）、STACK、TESTING、INTEGRATIONS 改為串接後的描述
- CONCERNS 移除已修正的 lang 與 favicon 問題（保留 meta description 問題）、部署描述更新
- STRUCTURE 移除已不存在的 `assets/`

## Deviations from Plan

None - plan executed as written。

## Self-Check: PASSED

- bfc0a1f、2a93325 存在；文件 grep 驗收通過
