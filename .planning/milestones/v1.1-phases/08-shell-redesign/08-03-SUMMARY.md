---
phase: 08-shell-redesign
plan: 03
subsystem: ui-shell
tags: [navbar, a11y, mobile-menu, tdd]
requires: [08-02]
provides:
  - 膠囊浮動頂列 NavBar（Logo、主選單 2 連結、打電話問問）
  - 行動版選單 Esc／點外側／點連結關閉
affects: [08-04, 08-05, 08-06]
tech-stack:
  added: []
  patterns: [面板一律渲染以 hidden 控制、document 監聽只在開啟時註冊]
key-files:
  created: []
  modified:
    - src/components/NavBar.tsx
    - src/components/NavBar.test.tsx
decisions:
  - "主選單與行動版面板共用 renderLinks()，選中規則只寫一次"
metrics:
  duration: "約 5 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 2
---

# Phase 8 Plan 03: 膠囊浮動頂列 Summary

NavBar 由 274 行深色固定頂列改為 148 行的膠囊浮動頂列：Logo（連到 /）、`<nav aria-label="主選單">` 逛商品／關於我們、右側 `tel:${CONTACT.phoneHref}` 打電話問問；手機選單鈕有完整 aria 屬性，面板可用 Esc（焦點回到選單鈕）、點外側、點連結關閉。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1+2 | NavBar 測試改寫為 15 項（RED）＋膠囊頂列實作（GREEN） | 18deede |

## 測試數（D-10）

- 起點（08-02 結束）：`npx vitest list | wc -l` = **356**
- 結束：**357**（NavBar.test 14 → 15）
- `npm test` 357 passed、`npm run lint` 無輸出、`npm run build` 成功（含 dist 掃描）。

## RED 證據

`npx vitest run src/components/NavBar.test.tsx`（舊元件）：**12 failed | 3 passed (15)**
- 失敗：Logo 連到 /；主選單依序為逛商品、關於我們，右側為打電話問問；關於我們連結指向 /abouts；打電話問問 href 為 tel:04-22798787；逛商品在 /all-products、/trumpet、/products/abc 有 aria-current=page（×3）；關於我們在 /abouts 有 aria-current=page；選單鈕 aria-expanded／aria-controls；Esc 關閉面板並把焦點還給選單鈕；點面板外側關閉；點面板內連結後關閉
- 通過：Logo 三項契約（舊元件已成立）
- 實作後 15 passed。RED 未提交。

## NavBar 舊 → 新對照（D-09）

| 舊（NavBar.test.tsx） | 新 | 變更 |
|---|---|---|
| 使用靜態 Logo 路徑與尺寸 | 同名 | 不變 |
| 載入失敗後改顯示文字並移除圖片 | 同名 | 不變（備援由 h1 改 span，斷言不變） |
| 初次渲染不顯示文字備援 | 同名 | 不變 |
| 「X 在桌機與手機各有一個按鈕」×8 | CategoryChips「$title chip 為連結且 href 為對應路徑」×8 | 移出至 CategoryChips（08-02 已建立） |
| 桌機選單依序為 8 項加商店介紹 | NavBar「主選單依序為逛商品、關於我們，右側為打電話問問」＋ CategoryChips「首屏依序顯示 8 個導覽項目」 | 拆分 |
| 商店介紹按鈕存在 | 關於我們連結指向 /abouts | 文案「商店介紹」→「關於我們」，button → link |
| 點擊無線麥克風後導向 /wireless-micphone | CategoryChips 同名測試 | 移出（08-02 已建立） |
| — | 打電話問問 href 為 tel:04-22798787 | 新增 |
| — | 逛商品 aria-current ×3、關於我們 aria-current | 新增（D-07） |
| — | 選單鈕 aria、Esc、點外側、點面板內連結 | 新增（4 項） |
| — | Logo 連到 / | 新增 |

## 呈現類改寫（舊 → 新）

| 項目 | 舊 | 新 |
|---|---|---|
| 定位 | fixed 頂列＋scroll 監聽＋`h-20` spacer | 一般流內膠囊，不 sticky／fixed |
| 導覽 | 8 分類＋商店介紹，`useNavigate` button | 逛商品、關於我們兩個 `<Link>`，加打電話問問 |
| 選中 | 只比對完整路徑、漸層樣式 | `aria-current="page"`＋`bg-block-2 font-semibold`；逛商品涵蓋 NAV_ITEMS 與 /products/* |
| 手機 | 三條線動畫鈕、面板列 9 項 | MenuIcon／CloseIcon 鈕、面板 2 項（電話交給 MobileCallBar） |
| Logo 備援 | `<h1>` | `<span>` |

## Deviations from Plan

None - plan executed exactly as written。Task 1 與 Task 2 依計畫合為 1 個 commit（RED 不提交）。D-08：`src/services/`、既有 hooks 均未修改。未遇到權限守衛拒絕。

## Known Stubs

無。

## Self-Check: PASSED

- src/components/NavBar.tsx、NavBar.test.tsx 存在；commit 18deede 存在
- acceptance grep：useNavigate／scroll／h1／2279 皆 0；主選單、aria-controls、NAV_ITEMS.some、startsWith 各 1；TOKEN_GREP 無輸出；148 行 < 200
