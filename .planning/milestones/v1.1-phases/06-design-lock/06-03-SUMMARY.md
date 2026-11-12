---
phase: 06-design-lock
plan: 03
subsystem: dependencies
tags: [maint, npm, tailwind, cleanup]
requires: [06-01]
provides:
  - devDependencies 不再含 @tailwindcss/postcss 與 @types/react-router-dom
affects: [package.json, package-lock.json, CLAUDE.md, .planning/codebase/STACK.md, .planning/codebase/CONCERNS.md]
key-files:
  modified:
    - package.json
    - package-lock.json
    - CLAUDE.md
    - .planning/codebase/STACK.md
    - .planning/codebase/CONCERNS.md
key-decisions:
  - "兩個套件以獨立 commit 移除，先 tailwind 後 types（D-14）"
requirements-completed: [MAINT-01]
metrics:
  tasks: 2
  files: 5
  completed: 2026-11-11
---

# Phase 6 Plan 03: 移除未使用的 devDependencies Summary

以兩個獨立 commit 移除 `@tailwindcss/postcss` 與 `@types/react-router-dom`，CSS 產出經 sha256 比對確認不變，並同步更新三份文件。

## Commits

- 5584cd0: chore(06): 移除未使用的 @tailwindcss/postcss
- 1a9c815: chore(06): 移除過時的 @types/react-router-dom

## 驗證

- 移除 `@tailwindcss/postcss` 前後 CSS sha256 相同：`9fee6d55ac2100ca088e96b33d691351c36901cf39da851e29bc4327f940b8cc`（比對產物僅在 $TMPDIR，未提交）。
- 每個 commit 前 `npm test`、`npm run lint`、`npm run build`（含 tsc -b 與 dist 憑證掃描）皆通過。
- package.json 與三份文件對兩個套件的 grep 皆為 0。

## Deviations from Plan

- [Rule 3] 第二個 commit 的 CONCERNS.md 編輯第一次因 sed 語法失敗而部分未套用，已改用 sed 刪行加 python 插入補齊，commit 前確認 diff 正確；無其他偏離。
- 未遇到權限守衛拒絕。

## Known Stubs

無。

## Self-Check: PASSED

兩個 commit 皆存在，SUMMARY 已建立，`.planning/config.json` 未被提交。
