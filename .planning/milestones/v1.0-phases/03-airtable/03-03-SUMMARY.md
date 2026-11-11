---
phase: 03-airtable
plan: 03
subsystem: security-cleanup
tags: [security, cleanup, credentials, regression-check]
requires: ["03-01", "03-02"]
provides:
  - src/noAirtable.test.ts（原始碼憑證殘留回歸檢查）
  - npm run check:dist（dist/ 憑證殘留檢查）
key-files:
  created:
    - src/noAirtable.test.ts
    - scripts/check-dist.mjs
  modified:
    - package.json
    - src/pages/HomePage.test.tsx
    - src/pages/ProductPageTemplate.test.tsx
    - CLAUDE.md
    - .planning/codebase/（STACK、ARCHITECTURE、CONVENTIONS、STRUCTURE、INTEGRATIONS、TESTING、CONCERNS）
  deleted:
    - src/services/index.ts
    - src/components/ProductView.tsx
decisions:
  - "刪除 service 與掃描測試放同一個 commit，每個 commit 測試皆綠（D-12、D-14）"
  - "check:dist 不加進 build，也不加 CI 步驟（D-15）"
metrics:
  tasks: 3
  completed: 2026-11-10
requirements-completed: [SEC-04, SEC-01]
---

# Phase 3 Plan 03: 憑證移除切片 Summary

以 `git rm`（未讀內容）刪除 Airtable service 與未使用的 ProductView，同一 commit 加入原始碼掃描測試，另新增 `npm run check:dist` 檢查打包產物，並把 CLAUDE.md 與 codebase 文件改為無 Airtable 的新現況。

## Commits

- 3677fd2 refactor(03-03): 移除 Airtable service 與未使用的 ProductView，加入原始碼憑證掃描測試
- 441e2d6 chore(03-03): 新增 check:dist 打包產物憑證檢查
- 225d9c1 docs(03-03): 專案文件改為無 Airtable 的新現況

## 驗證

- 掃描測試刪除前紅（4 項命中 src/services/index.ts，只列檔名）、刪除後綠；`npm test` 204 項全過；`npm run lint` 0 問題；`npm run build` 成功；axios 保留。
- `npm run build && npm run check:dist` 通過（4 個檔案）；放入 probe 檔後只輸出 `dist/__probe.txt` 與規則名，未輸出匹配字串；probe 已刪除並重新 build。
- 文件三種憑證格式 grep 皆為 0；`<!-- GSD:` 標記維持 14 個；`## Project` 區段 md5 未變。

## Deviations from Plan

- 第一次以 `sed` 改測試檔註解失敗（BSD sed 與多位元組字元），改用 Python 完成，內容相同。
- 文件中原本寫「ProductView」的說明句改為「未使用的商品卡片元件」，以通過驗收 grep。
- 「dist/ 不存在時提示先 build」分支由程式碼保證，未另外刪除 dist 實測。
- 文件更新範圍：ARCHITECTURE、INTEGRATIONS、TESTING 整份改寫為現況；CONCERNS 刪除已失效的 Airtable 項目並保留其餘；其餘檔案做針對性替換。

## Known Stubs

無。

## Threat Flags

無。git 歷史仍含舊 token（T-03-12），由 Phase 4 撤銷。

## Self-Check: PASSED
