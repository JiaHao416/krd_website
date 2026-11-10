---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
fixed_at: 2026-11-10T16:08:00Z
review_path: .planning/phases/05-vite-favicon-wr-06-check-dist-wr-01/05-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 5：程式碼審查修正報告

**修正時間：** 2026-11-10T16:08:00Z
**審查來源：** .planning/phases/05-vite-favicon-wr-06-check-dist-wr-01/05-REVIEW.md
**迭代：** 1

**摘要：**
- 範圍內問題（critical + warning）：2
- 已修正：2
- 略過：0
- IN-01、IN-02 不在本次範圍（fix_scope = critical_warning），未處理

每個修正提交前都跑過 `npm test`（211 passed）、`npm run lint`（無問題）、`npm run build`（含 tsc 與 dist 掃描，通過）。

## 已修正

### WR-01：點擊箭頭或指示點後焦點留在按鈕上，自動播放會一直停住

**修改檔案：** `src/components/FeaturedCarousel.tsx`、`src/components/FeaturedCarousel.test.tsx`
**提交：** 8d6248c
**狀態：** fixed: requires human verification（屬互動邏輯，建議在實機瀏覽器確認一次）
**修正內容：**
- 沒有採用審查建議的 `event.target.matches(":focus-visible")`。實測 jsdom 29.1.1 對任何 `.focus()` 都判定 `:focus-visible` 為 true（等同 `:focus`），所以在測試環境裡無法區分滑鼠點擊和鍵盤焦點，寫不出能抓到這個 bug 的測試。
- 改用可以測試的做法：用 `useRef` 記錄「指標按下中」。`onPointerDown` 設為 true，`onPointerUp` 清除；`onFocus` 只有在不是指標按下期間才設定 `hasFocusWithin`，處理完也會清除旗標。瀏覽器點擊的事件順序是 pointerdown → focus → pointerup → click，所以點擊帶來的焦點不會暫停，Tab 等鍵盤焦點仍會暫停（WCAG 2.2.2 行為不變）。
- Safari 點擊按鈕本來就不會給焦點，旗標會在 pointerup 時清掉，不影響之後的鍵盤操作。
- 新增測試「用滑鼠點擊按鈕取得焦點時不暫停，仍會自動切換」：照 pointerDown → focus → pointerUp → click 的順序觸發，確認按鈕保有焦點且 5 秒後仍會切到下一張。已確認這個測試在修正前會失敗、修正後通過。原本的鍵盤焦點暫停測試照常通過。

### WR-02：觸控裝置上 mouseenter 會殘留，輪播被黏在暫停狀態

**修改檔案：** `src/components/FeaturedCarousel.tsx`、`src/components/FeaturedCarousel.test.tsx`
**提交：** 507c390
**狀態：** fixed: requires human verification（建議用手機實機確認）
**修正內容：**
- `onMouseEnter`／`onMouseLeave` 改成 `onPointerEnter`／`onPointerLeave`；只有 `pointerType === "mouse"` 才設定 `isHovered`，離開時一律清除。
- 原本的滑鼠停留測試改用 `fireEvent.pointerEnter/pointerLeave`，並帶 `pointerType: "mouse"`。這個測試確認了 jsdom 會把 pointerType 傳給 React，滑鼠停留確實會暫停。
- 新增測試「觸控進入輪播時不暫停，仍會自動切換」（`pointerType: "touch"`）。注意：這個案例在舊程式碼上也會通過，因為舊程式碼根本沒有監聽 pointer 事件。它的作用是防止之後拿掉 pointerType 篩選造成回歸，不能用來證明舊 bug 存在。

---

_修正時間：2026-11-10T16:08:00Z_
_修正者：Claude (gsd-code-fixer)_
_迭代：1_
