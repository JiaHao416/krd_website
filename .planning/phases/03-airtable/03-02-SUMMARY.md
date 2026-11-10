---
phase: 03-airtable
plan: 02
subsystem: about-page
tags: [about-page, static-content]
requires: []
provides:
  - "ABOUT_SERVICES 內容檔與 public/abouts/*.png"
affects: [src/pages/AboutPage.tsx]
tech-stack:
  added: []
  patterns: ["靜態內容檔（src/content）+ public 資產"]
key-files:
  created:
    - public/abouts/karaoke.png
    - public/abouts/ktv.png
    - public/abouts/hotel.png
    - public/abouts/pub.png
    - public/abouts/bus.png
    - public/abouts/repair.png
    - src/content/abouts.ts
    - src/pages/AboutPage.test.tsx
  modified:
    - src/pages/AboutPage.tsx
decisions:
  - "資產與內容檔先 commit，再切換頁面（D-12）"
metrics:
  tasks: 2
  completed: 2026-11-10
requirements: [STAT-03]
---

# Phase 3 Plan 02: 關於我們靜態化 Summary

關於我們 6 張服務圖卡改由 `src/content/abouts.ts` 的 ABOUT_SERVICES 與 `public/abouts/*.png`（250x250，由 imgur 公開網址下載）提供，AboutPage 不再依賴 Airtable。

## Commits

- c737578: chore(03-02) 新增關於我們服務圖與內容檔
- 7cf93e4: feat(03-02) 關於我們圖卡改讀 repo 內容檔，移除 Airtable 抓取

## 驗證

- 6 張 PNG 皆為 250x250，md5 互不相同
- AboutPage 測試 3 項通過；全部測試 175 項通過；eslint 無問題；`npm run build` 成功

## Deviations from Plan

- 工作樹起點與預期基底不符，依指示以 `git reset --hard b9be3aa` 校正（HEAD 在 worktree-agent 分支，屬規定流程）。
- Task 2 的測試是在實作改寫之後才補上（未嚴格先見紅燈），因測試行為只描述結果且已通過。
- 圖卡區塊移除三元後，內層縮排減 2 格；className 內容未動。
- 沙箱 classifier 曾因 hook 改寫（`rtk git commit`）要求重送，已以相同內容重送，並非繞過。

## Known Stubs

None

## Self-Check: PASSED

檔案與兩個 commit 均存在。
