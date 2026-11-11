---
phase: 08-shell-redesign
plan: 07
subsystem: ui-about
tags: [about-page, contact-block, single-source, tdd]
requires: [08-05]
provides:
  - C5a 關於我們（h1 → 公司介紹 → ContactBlock → 服務圖卡），聯絡資訊單一來源 contact.ts
affects: [08-08]
tech-stack:
  added: []
  patterns: [直接重用 ContactBlock（不加 variant）、服務圖卡固定 aspect-square 白底]
key-files:
  created: []
  modified:
    - src/pages/AboutPage.tsx
    - src/pages/AboutPage.test.tsx
decisions:
  - "原 h3「KRD MICGO」降為 h2 下的副行文字，避免多一個 heading 層級"
  - "原 hero 導言與「我們的服務」副標文案未沿用（plan 結構未列，避免新增未定稿文案）"
metrics:
  duration: "約 6 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 2
---

# Phase 8 Plan 07: 關於我們改版 Summary

AboutPage 由 332 行縮為 73 行：h1「關於我們」→ 羽程企業社介紹（原文案、10+／1000+ 以 dl 呈現）→ `<ContactBlock />` → 「我們的服務」6 張 h3 圖卡（沿用 ABOUT_SERVICES 與 /abouts/*.png）。寫死的地址、電話 `(04) 22798787`、`tel:04-22798787`、營業時間與頁底 CTA 全數移除（D-16、UX-06）。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1+2 | AboutPage 測試 3→6（RED 未提交）＋頁面重寫 | b8f87fc |

## 測試數（D-10）

- 起點（08-06 結束）：384
- 結束：`npx vitest list | wc -l` = **387**（= 384 + 3）
- commit 前 `npm test`（387 passed）、`npm run lint`（無問題）、`npm run build`（dist 掃描通過）全綠
- `git diff HEAD~1 --stat -- src/services src/hooks src/content` 無輸出（D-08、D-16）

## RED 證據

`npx vitest run src/pages/AboutPage.test.tsx`（舊頁面）：`Tests 4 failed | 2 passed (6)`
- 圖卡標題 h3：`expected [] to deeply equal [ '卡拉OK', 'KTV', … ]`（舊頁圖卡為 h4）
- 不再顯示載入骨架：`expected … to have a length of +0 but got 1`（舊頁裝飾圓點帶 animate-pulse）
- 聯絡區：`Unable to find an accessible element with the role "heading" and name "有空來店裡坐坐"`
- 不含舊電話格式：`expected <div> to be null`（舊頁有 `(04) 22798787`）
- 「h1 為關於我們」在舊頁即通過（舊 h1 文字相同，只是樣式不同），屬回歸防護而非 RED 驅動項；「6 張圖卡 src」契約不變亦通過
- 實作後 6 passed。

## AboutPage.test.tsx 舊 → 新對照（3 → 6）

| # | 舊 | 新 | 類型 |
|---|---|---|---|
| 1 | 首屏同步顯示 6 張圖卡，圖片 src 為 /abouts/*.png 且順序正確 | 不變 | 契約 |
| 2 | 「圖卡標題 h4 依序為…」`level: 4` | 「圖卡標題 h3 依序為…」`level: 3` | 呈現（heading level，06-TEST-INVENTORY／Open Q8） |
| 3 | 不再顯示載入骨架：`.glass-card.animate-pulse` 長度 0 | `.animate-pulse` 長度 0 | 呈現（className 選擇器；斷言更嚴格） |

新增 3 項：h1 為關於我們；聯絡區 h2「有空來店裡坐坐」＋ `CONTACT.address`、`CONTACT.businessHours`；不含舊電話格式 `(04) 22798787`。

## Deviations from Plan

- **文案取捨**：舊 hero 導言「專業音響設備供應商，致力於…」與服務區副標「提供全方位的音響解決方案…」不在 plan 的新結構中，未保留。
- 圖片 `key` 由 `service.image` 改為 plan 指定的 `service.name`（兩者皆唯一）；移除舊的 inline `filter` 樣式（白底上直接顯示原圖）。
- Task 1 與 Task 2 合併為單一 commit（plan Output 即 1 個 commit，RED 不提交）。

無 guard 拒絕、無驗證閘門。

## Threat 對應

- T-08-14：`grep -cE "永平路|2279|22798787|09:00" src/pages/AboutPage.tsx` = 0；聯絡資訊只經 ContactBlock／Footer 讀 CONTACT。

## Known Stubs

- 聯絡區地圖預留位（ContactBlock 內，08-05 已記錄，D-15）。

## Self-Check: PASSED

- FOUND: src/pages/AboutPage.tsx、src/pages/AboutPage.test.tsx
- FOUND: b8f87fc
