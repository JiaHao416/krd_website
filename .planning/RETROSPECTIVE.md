# Project Retrospective

*每個 milestone 結束後更新，教訓帶入下一輪規劃。*

## Milestone: v1.0 — API 遷移與停用 Airtable

**Shipped:** 2026-11-10
**Phases:** 5 | **Plans:** 22

### What Was Built
- Vitest 測試基礎與 API 資料層（client、轉換、錯誤分類）
- 8 個商品分類頁與首頁熱銷改讀後端公開 API，含載入／錯誤／空狀態
- Logo、導覽、關於我們固化為 repo 靜態檔，刪除 Airtable 程式
- production 驗收後撤銷舊 token；build 內建 dist 憑證掃描
- 輪播無障礙（WCAG 2.2.2）與 Vite 範本殘留清理

### What Worked
- 依「先抓靜態內容 → 移除程式 → production 驗收 → 撤銷 token」排序，撤銷後網站零中斷
- 原始碼掃描測試加上 build 內建 dist 掃描，雙層防止憑證回歸
- 由 Claude 以真實瀏覽器（Claude in Chrome、DevTools 模擬）做 UAT，記錄每 200ms 的輪播狀態作為客觀證據

### What Was Inefficient
- 輪播暫停邏輯修了三輪：05-01 接受「點擊後停住」為取捨 → code review 視為 warning 修正（WR-01/02）→ UAT 才發現觸控事件順序（pointerup 之後才 focus）讓 WR-01 修正失效
- jsdom 對 `:focus-visible` 一律判 true，審查建議的寫法無法測試，需改以事件序列判斷

### Patterns Established
- 互動行為的 bug，測試要依瀏覽器真實事件順序觸發（滑鼠、觸控、鍵盤各一條路徑），並確認修正前紅燈
- 每次 commit 必須 `npm test`、`npm run lint`、`npm run build` 全綠，紅燈證據記在 SUMMARY 而非單獨 commit
- push `main` 即上線，push 一律等使用者確認

### Key Lessons
1. 觸控與滑鼠的事件順序不同（觸控的相容 mousedown／focus 在 pointerup 之後），處理指標狀態時要分開考慮 pointerType
2. code review 的修正建議要先確認在測試環境（jsdom）可被驗證，否則測試會給出假的安全感
3. 「已知取捨」若影響一般使用者（手機點一下就停住），應直接修正而非記錄

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Key Change |
|-----------|--------|------------|
| v1.0 | 5 | 導入 GSD 流程、Vitest、由 Claude 以真實瀏覽器 UAT |

### Cumulative Quality

| Milestone | Tests | Notes |
|-----------|-------|-------|
| v1.0 | 215 | build 內建 dist 憑證掃描 |
