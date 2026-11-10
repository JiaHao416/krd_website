---
phase: 03-airtable
plan: 01
subsystem: ui
tags: [navigation, logo, static-content, react-router]
requires: []
provides:
  - NAV_ITEMS（由 PRODUCT_PAGES 衍生的導覽清單）
  - public/brand-logo.png 靜態 Logo
affects: [03-03]
key-files:
  created:
    - src/config/navigation.ts
    - src/config/navigation.test.ts
    - src/components/SideMenu.test.tsx
    - src/components/NavBar.test.tsx
    - public/brand-logo.png
  modified:
    - src/services/catalog.ts
    - src/services/catalog.test.ts
    - src/App.test.tsx
    - src/components/SideMenu.tsx
    - src/components/NavBar.tsx
requirements-completed: [STAT-01, STAT-02]
completed: 2026-11-10
---

# Phase 3 Plan 01: 導覽與 Logo 靜態化 Summary

NavBar 與 SideMenu 改由 repo 內單一來源 NAV_ITEMS（PRODUCT_PAGES 加 PRODUCT_PAGE_VIEWS 標題衍生）產生選單，Logo 改讀 `public/brand-logo.png`，兩元件不再引用 Airtable。

## 完成內容

- PRODUCT_PAGES 重排為現行選單順序（所有商品／最新商品／KRD／MICGO／無線／有線／喇叭／配件）；App.test 路徑比對改為集合比對。
- SideMenu 移除抓取與骨架畫面，首屏直接顯示 8 項。
- NavBar Logo 為靜態 img（800×235），onError 改顯示「KRD MICGO」文字；桌機與手機選單由 NAV_ITEMS 產生，「商店介紹」維持寫死。
- Logo 驗證為 PNG 800×235，`public/logo.png`（favicon）未動。

## Commits

- 0ca0787 feat(03-01): 側邊選單改讀 NAV_ITEMS 並依現行選單順序排列
- af19dce chore(03-01): 新增導覽列 Logo 靜態圖檔
- 483140f feat(03-01): NavBar 改讀靜態 Logo 與 NAV_ITEMS，移除 Airtable 抓取

## Deviations from Plan

- worktree 起始 base 與指定 base 不符，依啟動檢查執行 `git reset --hard b9be3aa`（受許可的啟動步驟）。
- navigation.test.ts 在 node project 直接可執行，無需改名為 .tsx。
- 一次複合 Bash 指令被 worktree 守衛拒絕，拆成單純指令後執行；curl 經 hook 改寫為 `rtk curl` 並重新送審後通過。

## 驗證

`npm test` 195 項全過、eslint 無問題、`npm run build` 成功；NavBar.tsx／SideMenu.tsx 中 airtable 字樣為 0。

## Known Stubs

無。

## Self-Check: PASSED
