---
phase: 10-link-wiring
type: uat
status: passed
date: 2026-11-11
tool: chrome-devtools MCP（主 session）
server: npm run dev -- --port 5173 --strictPort（Vite proxy → https://api.krd.com.tw，20 筆商品）
---

# Phase 10 真實瀏覽器 UAT

截圖都在 `uat/`。測完已停止 dev server，5173 埠已釋放。

## 結果

| # | 項目 | 量測 | 結果 |
|---|------|------|------|
| 1 | 分類頁卡片語意（D-01） | `/trumpet` 1440：7 張卡都是 `<a href="/products/{id}">`；`main` 內 `[role=button]` 為 0；卡內巢狀互動元素為 0；Tab 聚焦時 `:focus-visible` 外框為 `rgb(240,160,75) solid 2px`（`link-card-focus-1440.png`） | pass |
| 2 | grid 點卡片 | 點「BB1 變色龍」後進入 `/products/0191dae4-…`，h1「BB1 變色龍」，`[role=dialog]` 為 0（`link-list-detail-1440.png`） | pass |
| 3 | 站內返回 | 詳情頁顯示 `<button>`「← 回上一頁」，點擊後回到 `/trumpet`，h1「擴大機 / 喇叭」 | pass |
| 4 | list 點圖片區（D-02/D-03） | 切換為列表檢視（「列表」`aria-pressed=true`，`link-list-1440.png`），點「KRD CPX-3800」的縮圖（96×96）後進入 `/products/a6e70b88-…`，h1「KRD CPX-3800」，dialog 為 0；「← 回上一頁」回到 `/trumpet` | pass |
| 5 | 首頁便條卡語意（D-04/D-06） | 1440：熱門推薦系列 3 個連結、頂級精選系列 2 個連結，`aria-label` 都是「查看 {名稱} 詳情」，href 為 `/products/{id}`，卡內巢狀互動元素為 0；md+ 只渲染視窗內的卡（`link-home-1440.png`） | pass |
| 6 | 首頁點擊導向 | 第 1 組「KRD K-67非凡」→ `/products/fd9caa7f-…`；第 2 組「開關」→ `/products/eecdb1d3-…`；h1 正確，dialog 為 0 | pass |
| 7 | 鍵盤聚焦暫停（D-05） | 聚焦第 1 組第一張便條卡（`:focus-visible` 為 true），7 秒內指示點維持在「第 2 張」；blur 後 6 秒內切到「第 3 張」 | pass |
| 8 | hover 暫停 | hover 便條卡 7 秒，維持在「第 2 張」；移到其他區塊後 6 秒內切到「第 3 張」 | pass |
| 9 | 點擊後不黏住 | 用真實指標點擊便條卡，先以一次性 capture listener 攔下導航，模擬 ctrl+click 開新分頁、焦點留在原頁的情況。焦點留在群組內（`:focus-visible` 為 false），指標移開後 6.5 秒內從「第 2 張」切到「第 3 張」 | pass |
| 10 | reduced-motion | `matchMedia` 為 reduce，12 秒內維持在「第 1 張」；按「下一張」後變成「第 2 張」 | pass |
| 11 | base（390×844 觸控） | `scrollWidth` 390；7 秒內維持在「第 1 張」，不會自動切換；點「KRD K-67」便條卡 → `/products/01b094d6-…`；點分類卡「擴大機 / 喇叭」→ `/trumpet`，7 張卡、`[role=button]` 為 0（`link-home-390.png`） | pass |
| 12 | 09 WR-01 回歸 | 在「KRD K-67」詳情頁按複製後顯示「已複製」，接著用 `pushState` 加 `popstate` 在同一路由元件內切到「KRD K-67非凡」（`main` 元素沒有卸載），按鈕顯示「複製詢價訊息」。另外也測了經過首頁再進入的路徑，結果同樣是重置 | pass |

## 觀察（不阻擋）

- 第 2 組（頂級精選系列）目前只有 2 筆商品，這是資料造成的，不是版面限制。
- 手指滑動後 activeIndex 不會同步，這是 Phase 8 已知行為（RESEARCH Open Q9），本 phase 沒有變更。

## human-needed（延到 Phase 11 上線前）

- [ ] 實機觸控：點便條卡與商品卡導向詳情頁的手感，以及有沒有誤觸滑動
- [ ] 實機手機上點詳情頁「← 回上一頁」與瀏覽器返回手勢的一致性
