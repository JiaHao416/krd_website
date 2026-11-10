---
status: complete
phase: 05-vite-favicon-wr-06-check-dist-wr-01
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-REVIEW-FIX.md]
started: 2026-11-10T16:20:00+08:00
updated: 2026-11-10T16:40:00+08:00
---

## Current Test

[testing complete]

## 驗收方式

使用者回覆「你去驗收啊」，由 Claude 在 localhost:5173 以 Claude in Chrome（真實滑鼠／鍵盤）與 Chrome DevTools MCP（prefers-reduced-motion 模擬）實測。
以每 200ms 讀取兩組輪播 `h3` 標題的方式記錄切換時間點。

## Tests

### 1. 點擊箭頭或指示點後輪播繼續自動播放
expected: 滑鼠點「上一張／下一張／指示點」後移出輪播，約 5 秒後自動切到下一張，不會因按鈕保有焦點而停住（WR-01 修正）
result: pass
evidence: 真實滑鼠點左組「第 2 張」後移出，焦點仍在該按鈕，約 5 秒後切到「KRD K-87」

### 2. 滑鼠停在輪播上暫停、移開後恢復
expected: 滑鼠停在任一組輪播上超過 5 秒，該組不切換（另一組照常切換）；移開後恢復自動切換
result: pass
evidence: 真實滑鼠停在左組約 10 秒，左組不動、右組切換；移開後左組恢復切換

### 3. 觸控點擊輪播後繼續自動播放
expected: 在手機（或觸控模擬）點一下輪播的箭頭，手指離開後約 5 秒輪播仍自動切換，不會黏在暫停狀態（WR-02 修正）
result: pass
retest: 2026-11-10 05-05（f4c22ef）修正後重測：同一組觸控事件序列點「下一張」，焦點仍在按鈕上，左組於 5.2s、10.2s 照常自動切換
original_issue: "依 Android Chrome 觸控點擊事件順序（pointerdown/pointerup(touch) → mouseover/mouseenter/mousedown → focus → mouseup → click）合成事件點左組「下一張」，手動切換成功，但之後 12 秒左組未再自動切換；手動 blur 按鈕後 5 秒內恢復"
note: 以合成事件模擬（非實機），事件順序依 Chrome 觸控相容滑鼠事件規則

### 4. 鍵盤焦點在輪播內時暫停
expected: 用 Tab 鍵把焦點移到輪播的按鈕上，輪播不自動切換；再按 Tab 移出輪播後恢復自動切換
result: pass
evidence: 真實 Tab 進入左組「上一張」，約 10 秒左組不動；Shift+Tab 移出後約 5 秒恢復

### 5. 系統「減少動態」設定時不自動播放
expected: 開啟減少動態效果時輪播不自動切換，但手動點箭頭、指示點仍可切換
result: pass
evidence: DevTools 模擬 prefers-reduced-motion: reduce，兩組 12 秒不切換；手動「下一張」正常切換

### 6. 分頁 favicon 正常顯示
expected: 瀏覽器分頁圖示顯示 KRD Logo（不是 Vite 閃電圖示或空白）
result: pass
evidence: `<link rel="icon" type="image/png" href="/logo.png">`，GET /logo.png 回 200、content-type image/png

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "觸控點擊輪播的箭頭或指示點後，輪播仍會自動播放，不會黏在暫停狀態"
  status: resolved
  resolved_by: 05-05（f4c22ef）
  retest: "觸控序列後自動切換正常；觸控後再 Tab 進入仍暫停；真實滑鼠點指示點後移出約 5 秒恢復切換（皆於 Chrome localhost:5173 實測）"
  reason: "User reported: 依 Android Chrome 觸控事件順序點「下一張」後，12 秒未自動切換；blur 後才恢復"
  severity: major
  test: 3
  root_cause: "WR-01 修正以 isPointerDownRef 在 pointerdown 設 true、pointerup 清除，只涵蓋滑鼠（滑鼠的 focus 發生在 mousedown，介於 pointerdown 與 pointerup 之間）。觸控時瀏覽器在 pointerup 之後才送相容 mousedown 並把焦點給按鈕，此時旗標已清除，onFocus 判定為鍵盤焦點，hasFocusWithin=true，自動播放停住直到焦點離開。WR-02（pointerType 判斷 hover）本身正確，問題不在 hover。"
  artifacts:
    - src/components/FeaturedCarousel.tsx
    - src/components/FeaturedCarousel.test.tsx
  missing:
    - "觸控情境下 pointerup 之後的 focus 也要視為指標焦點（例如改以最近一次輸入是否為鍵盤判斷，或改在 click 時清除旗標）"
    - "測試加入觸控事件順序（pointerdown→pointerup→focus→click）後仍自動播放的案例，修正前須紅燈"
