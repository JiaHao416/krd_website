---
phase: 08-shell-redesign
plan: 05
subsystem: ui-home
tags: [featured-carousel, note-card, contact-block, tdd, a11y, wcag-2.2.2]
requires: [08-01, 08-02]
provides:
  - 便條卡外觀的 FeaturedCarousel（狀態機不變；md+ 視窗 3 張循環；base 橫向捲動且不自動播放）
  - ContactBlock（首頁＝關於我們共用聯絡區，讀 contact.ts，LINE／Email 選填）
affects: [08-06, 08-07, 08-08, phase-10]
tech-stack:
  added: []
  patterns: [狀態機原樣保留只加暫停條件、NoteCard 子元件自管破圖、base 以 scrollIntoView 定位（block nearest）、聯絡區依賴注入 info?: ContactInfo]
key-files:
  created:
    - src/components/ContactBlock.tsx
    - src/components/ContactBlock.test.tsx
  modified:
    - src/components/FeaturedCarousel.tsx
    - src/components/FeaturedCarousel.test.tsx
    - src/pages/HomePage.tsx
    - src/pages/HomePage.test.tsx
decisions:
  - "intervalMs 改為選填，預設 5000（依 plan 介面）；HomePage 仍明確傳 5000／5500"
  - "載入骨架外包 grid md:grid-cols-3，骨架加 aria-hidden，避免讀屏重複朗讀"
  - "HomePage 價格測試的 fixture 改為有價＋無價兩筆，以同時斷言 priceText 與「價格請來電」"
metrics:
  duration: "約 10 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 6
---

# Phase 8 Plan 05: 便條卡輪播與共用聯絡區 Summary

FeaturedCarousel 換成「便條卡」外觀（surface-raised、膠帶、傾斜、170/200 白底圖、PriceTag），md+ 只渲染視窗內最多 3 張並循環，base（max-width: 767px）渲染全部卡片為橫向捲動條、以 `isBase` 併入既有 `isPaused` 停止自動播放，按鈕／指示點以 `scrollIntoView({ behavior, block: "nearest", inline: "start" })` 定位；計時 effect、hover／焦點／指標旗標 handler 逐字未動（D-05）。另新增 ContactBlock 供首頁與關於我們共用。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1 | FeaturedCarousel 便條卡＋base 不自動播放；HomePage 移除 accent；測試 18→25、HomePage 價格項改寫 | c67ec3e |
| 2 | ContactBlock 元件＋6 項測試 | 3d8bfbb |

## 測試數（D-10）

- 起點（08-04 結束）：`npx vitest list | wc -l` = **365**
- Task 1 後：372（FeaturedCarousel 18 → 25；HomePage 維持 7）
- 結束：**378**（ContactBlock +6），= 365 + 13，符合「≥ 前一個 plan + 13」
- 每個 commit 前 `npm test`、`npm run lint`、`npm run build` 全綠（378 passed、ESLint 無問題、dist 掃描通過）。
- `git diff HEAD~2 --stat -- src/hooks src/services` 無輸出（D-08）。

## RED 證據

**Task 1**：`npx vitest run src/components/FeaturedCarousel.test.tsx src/pages/HomePage.test.tsx`（舊元件）
- `Tests 23 failed | 9 passed (32)`
- FeaturedCarousel 22 項 ×：harness 拿掉 `accent` 後，舊元件 `ACCENT_CLASSES[undefined]` 丟出 `TypeError: Cannot read properties of undefined (reading 'icon' / 'overlay')`（成功／空狀態全部失敗）；新 7 項（無 listitem、無 scrollIntoView、無「價格請來電」）亦失敗
- HomePage 1 項 ×：「便條卡有價顯示 priceText、無價顯示價格請來電…」（舊首頁不顯示價格）
- 實作後 32 passed。RED 未提交。

**Task 2**：`npx vitest run src/components/ContactBlock.test.tsx`
- `Error: Failed to resolve import "./ContactBlock"` → Test Files 1 failed、no tests
- 實作後 6 passed。

## FeaturedCarousel.test.tsx 舊 → 新對照（18 → 25）

全檔 harness：`renderCarousel` 移除 `accent="blue"`；`afterEach` 補 `vi.restoreAllMocks()`；新增 `firstCard()` helper。

| # | 測試（名稱不變） | 舊斷言 → 新斷言 | 類型 |
|---|---|---|---|
| 1 | 載入中顯示「載入產品中...」 | 不變 | 契約 |
| 2 | 失敗時只顯示固定中文訊息，並可重新載入 | 不變（固定文案、不洩漏後端原文、retry） | 契約 |
| 3 | 成功但沒有商品時顯示「目前沒有精選商品」 | 不變 | 契約 |
| 4 | 只有一筆時不顯示箭頭與指示點 | 不變 | 契約 |
| 5 | 三筆時有箭頭與指示點，點下一張顯示第二筆 | `getByText("商品2")` 存在 → `firstCard()` 含「商品2」 | 呈現（視窗 3 張） |
| 6 | 圖片載入失敗時改顯示佔位圖，不留破圖 | 不變（1 筆情境） | 契約 |
| 7 | 成功且多筆時依 intervalMs 切換下一筆 | getByText 商品1／商品2 → firstCard 含商品1／商品2 | 呈現 |
| 8 | 載入中推進時間不報錯也不切換 | 不變 | 契約 |
| 9 | 系統偏好減少動態時不自動切換，手動仍可切換 | getByText → firstCard（商品1、2、2） | 呈現 |
| 10 | 滑鼠移入時不自動切換，移出後恢復 | getByText → firstCard | 呈現 |
| 11 | 觸控進入輪播時不暫停，仍會自動切換 | getByText → firstCard | 呈現 |
| 12 | 焦點在輪播內時不自動切換，焦點離開後恢復 | getByText → firstCard | 呈現 |
| 13 | 用滑鼠點擊按鈕取得焦點時不暫停 | getByText → firstCard（toHaveFocus 不變） | 呈現 |
| 14 | 觸控點擊按鈕取得焦點時不暫停 | getByText → firstCard | 呈現 |
| 15 | 觸控點擊後再以鍵盤讓焦點進入，仍會暫停 | getByText → firstCard | 呈現 |
| 16 | 觸控被取消（pointercancel）後鍵盤焦點仍會暫停 | getByText → firstCard（事件仍打在 `container.firstElementChild`） | 呈現 |
| 17 | 觸控點在非按鈕區域後鍵盤焦點仍會暫停 | 點擊目標仍 `getByText("商品1")`；結果斷言 → firstCard | 呈現 |
| 18 | 手動切換後重新計時 | getByText → firstCard | 呈現 |

新增 7 項：3 筆中第 2 張破圖時只有那張變佔位圖、md+ 只渲染 3 張且循環、筆數少於 3 時不重複渲染、便條卡無價顯示價格請來電／有價顯示 priceText、base 不自動播放且點下一張 smooth 捲到第二張、base 且減少動態時 behavior 為 auto、base 點第 3 張指示點捲到第 3 張。

## HomePage.test.tsx 舊 → 新（維持 7 項）

| 舊 | 新 | 類型 |
|---|---|---|
| 「首頁不顯示價格與價格洽詢」：單筆有價 fixture，`queryByText(/9,999/)` 為 null、無「價格洽詢」 | 「便條卡有價顯示 priceText、無價顯示價格請來電，且不出現價格洽詢」：有價＋無價兩筆 fixture，`getAllByText("NT$ 9,999")`、`getAllByText("價格請來電")` 存在，「價格洽詢」為 null | 呈現（D-01，依 06-TEST-INVENTORY 預定處置） |

其他 6 項不動（`getSection` 仍靠 HomePage 的 `div.space-y-8`，08-06 改版時再換）。

## Deviations from Plan

- **[Rule 2 - a11y] 載入骨架加 `aria-hidden`、外包 `grid md:grid-cols-3`**：plan 只寫 3 個 skeleton，未指定容器；加容器讓 md+ 與成功狀態同排版，骨架對讀屏隱藏。Commit c67ec3e。
- **[Rule 3 - 型別] `src={product.imageUrl ?? undefined}`**：`imageUrl` 為 `string | null`，img src 不接受 null（已在 showImage 判斷後，行為不變）。
- goPrev／goNext 保留原 `setCurrentSlide((activeIndex ∓ 1 + n) % n)` 表達式，另算同值 `target` 傳 scrollToCard（依 plan）。

無 guard 拒絕、無驗證閘門。

## Threat 對應

- T-08-09：LINE 連結 `target="_blank" rel="noopener noreferrer"`，ContactBlock.test 斷言。
- T-08-10：錯誤狀態仍只顯示 `getErrorMessage`，「不洩漏後端原文」測試保留。
- T-08-11：NoteCard 只用 React 文字節點。

## Known Stubs

- `src/components/ContactBlock.tsx` 地圖預留位「地圖（待嵌入）」：D-15 明定無素材即正式呈現。
- 便條卡「查看詳情 →」為 aria-hidden 裝飾文字，卡片非連結：Phase 10 改為 Link。

## Self-Check: PASSED

- FOUND: src/components/ContactBlock.tsx、src/components/ContactBlock.test.tsx、src/components/FeaturedCarousel.tsx
- FOUND: c67ec3e、3d8bfbb
