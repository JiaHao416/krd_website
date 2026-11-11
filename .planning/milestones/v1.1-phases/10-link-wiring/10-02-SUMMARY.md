---
phase: 10-link-wiring
plan: 02
subsystem: ui
tags: [react-router, link, carousel, a11y, wcag-2.2.2, vitest]
requires:
  - phase: 10-link-wiring
    provides: "10-01 商品卡連結（測試起點 529）"
  - phase: 08-shell-redesign
    provides: "FeaturedCarousel 便條卡、base 不自動、WR-03 對齊 effect"
provides:
  - "首頁熱銷便條卡整張為連到 /products/{id} 的 Link（名稱「查看 {name} 詳情」）"
affects: [10-03, 11]
tech-stack:
  added: []
  patterns:
    - "renderCarousel 以 { wrapper: MemoryRouter } 包住，DOM 結構不變"
key-files:
  created: []
  modified:
    - src/components/FeaturedCarousel.tsx
    - src/components/FeaturedCarousel.test.tsx
    - src/pages/HomePage.test.tsx
key-decisions:
  - "便條卡連結以 aria-label「查看 {name} 詳情」命名，「查看詳情 →」維持 aria-hidden 視覺提示"
  - "FeaturedCarousel 本體逐字未動，聚焦暫停靠 Link focus 事件冒泡到既有容器 onFocus"
requirements-completed: [LINK-02]
duration: 10min
completed: 2026-11-11
---

# Phase 10 Plan 02: 熱銷便條卡連到詳情頁 Summary

**NoteCard 根元素由 div 改為 `<Link to="/products/{id}" aria-label="查看 {name} 詳情">`，FeaturedCarousel 狀態機逐字未動；補連結語意、聚焦暫停、點擊不黏住、視窗外不在 tab 順序與首頁兩組連結測試，測試 529 → 538。**

## Performance

- **Duration:** 約 10 分鐘
- **Completed:** 2026-11-11
- **Tasks:** 2
- **Files modified:** 3（＋本 SUMMARY）

## Accomplishments

- NoteCard：`import { Link }`，根元素改 Link（className 前加 `block`，其餘不變）；NoteCard 上方註解與底列註解改寫為「整張卡已是連結」敘述
- FeaturedCarousel.test：harness 改包 MemoryRouter，新增「FeaturedCarousel 便條卡連結」describe 7 項
- HomePage.test：新增「HomePage 便條卡連到詳情頁」describe 2 項；HomePage.tsx 未改（D-09 兩組版面不變）

## Task Commits

1. **Task 1：便條卡改 Link、FeaturedCarousel 測試** - `f28ccc5`（feat）
2. **Task 2：首頁兩組便條卡連結測試＋SUMMARY** - 見本 commit（test）

## 測試數

| 時點 | 總數 | FeaturedCarousel.test | HomePage.test |
|---|---|---|---|
| 起點（10-01 結束） | 529 | 26 | 13 |
| Task 1 後 | 536 | 33 | 13 |
| Task 2 後 | 538 | 33 | 15 |

## RED 證據（Task 1，未提交）

改 harness＋新增 7 項、元件未動時 `npx vitest run src/components/FeaturedCarousel.test.tsx`：**7 failed | 26 passed (33)**。失敗 7 項即新增的 7 項（舊 div 版找不到 link）；既有 26 項在包 MemoryRouter 後全數通過，確認 harness 不影響 DOM（`container.firstElementChild` 仍為輪播根容器）。實作後 33 passed；全套 536 passed、lint、build 全綠後提交。

## FeaturedCarousel.test 舊 → 新（D-07）

既有 26 項名稱與斷言**全部不變**，唯一改動為 `renderCarousel` 改用 `render(..., { wrapper: MemoryRouter })`。

| # | 測試（describe > 名稱） | 處置 | 06-TEST-INVENTORY 列 |
|---|---|---|---|
| 1 | 狀態 > 載入中顯示「載入產品中...」 | 斷言不變（harness：MemoryRouter） | 321 |
| 2 | 狀態 > 失敗時只顯示固定中文訊息，並可重新載入 | 同上 | 322 |
| 3 | 狀態 > 成功但沒有商品時顯示「目前沒有精選商品」 | 同上 | 323 |
| 4 | 操控 > 只有一筆時不顯示箭頭與指示點 | 同上 | 324 |
| 5 | 操控 > 三筆時有箭頭與指示點，點下一張顯示第二筆 | 同上（inventory 註「Phase 10 新增 link 測試」→ 由新增 #1 涵蓋） | 325 |
| 6 | 圖片載入失敗 > 圖片載入失敗時改顯示佔位圖，不留破圖 | 同上 | 326 |
| 7 | 自動播放 > 成功且多筆時依 intervalMs 切換下一筆 | 同上 | 327 |
| 8 | 自動播放 > 載入中推進時間不報錯也不切換 | 同上 | 328 |
| 9 | 暫停 > 系統偏好減少動態時不自動切換，手動仍可切換 | 同上 | 329 |
| 10 | 暫停 > 滑鼠移入時不自動切換，移出後恢復 | 同上 | 330 |
| 11 | 暫停 > 觸控進入輪播時不暫停，仍會自動切換 | 同上 | 331 |
| 12 | 暫停 > 焦點在輪播內時不自動切換，焦點離開後恢復 | 同上 | 332 |
| 13 | 暫停 > 用滑鼠點擊按鈕取得焦點時不暫停，仍會自動切換 | 同上 | 333 |
| 14 | 暫停 > 觸控點擊按鈕取得焦點時不暫停，仍會自動切換 | 同上 | 334 |
| 15 | 暫停 > 觸控點擊後再以鍵盤讓焦點進入，仍會暫停 | 同上 | 335 |
| 16 | 暫停 > 觸控被取消（pointercancel）後鍵盤焦點仍會暫停 | 同上 | 336 |
| 17 | 暫停 > 觸控點在非按鈕區域後鍵盤焦點仍會暫停 | 同上；**情境變化**見下 | 337 |
| 18 | 暫停 > 手動切換後重新計時，不會在原排程時間被切走 | 同上 | 338 |
| 19 | 便條卡 > 3 筆中第 2 張破圖時只有那張變佔位圖 | 同上 | Phase 8 新增（08-05） |
| 20 | 便條卡 > md+ 只渲染 3 張且循環 | 同上 | Phase 8 新增 |
| 21 | 便條卡 > 筆數少於 3 時不重複渲染 | 同上 | Phase 8 新增 |
| 22 | 便條卡 > 便條卡無價顯示價格請來電、有價顯示 priceText | 同上 | Phase 8 新增 |
| 23 | base 寬度 > base 不自動播放，點下一張以 smooth 把第二張捲到起點 | 同上 | Phase 8 新增 |
| 24 | base 寬度 > base 且減少動態時 behavior 為 auto | 同上 | Phase 8 新增 |
| 25 | base 寬度 > base 點第 3 張指示點捲到第 3 張 | 同上 | Phase 8 新增 |
| 26 | base 寬度 > 由 md 切到 base 時，捲動條直接對齊目前指示點（不垂直捲動頁面） | 同上 | Phase 8 新增（WR-03） |

**#17 情境變化：** 點擊目標 `getByText("商品1")`（h3）改版後位於 Link 內，因此不再是「非互動區域」；觸控 pointerdown→pointerup→click 序列中旗標在 click 清除、未取得焦點，之後鍵盤 focus 仍暫停，斷言不改且通過。「觸控點擊連結本身」的情境改由新增 #5 涵蓋。

**新增 7 項（RED 新增）— describe「FeaturedCarousel 便條卡連結」：**
1. 便條卡為連結，href 為 /products/{id}、名稱為查看 {name} 詳情
2. 便條卡內沒有巢狀互動元素（1 筆：link 1、button 0、「查看詳情 →」位於 aria-hidden 祖先內）
3. 鍵盤聚焦便條卡連結時不自動切換，焦點離開後恢復
4. 用滑鼠點擊便條卡連結時不暫停，仍會自動切換
5. 觸控點擊便條卡連結後不黏住（新 describe 內以同序列實作 `touchTapLink`，既有 `touchTap` 未動）
6. md+ 5 筆時只有視窗內 3 張為連結（id-1..3，下一張後 id-2..4，D-06）
7. base 寬度時便條卡也是連結

**HomePage.test 新增 2 項（非 RED，屬回歸／整合保護，Task 1 後直接通過）** — describe「HomePage 便條卡連到詳情頁」：
- 兩組便條卡各自連到對應商品的 /products/{id}
- 點便條卡導向詳情頁（MemoryRouter＋Routes 探針）

既有 13 項未動。

## D-05 證據

```
diff <(git show "${BASE}:src/components/FeaturedCarousel.tsx" | sed -n '/^const FeaturedCarousel = /,$p') \
     <(sed -n '/^const FeaturedCarousel = /,$p' src/components/FeaturedCarousel.tsx)
→ 無輸出（逐字相同）
```

關鍵行（`grep -cF`，對 src/components/FeaturedCarousel.tsx）：
- `const isPaused = prefersReducedMotion || isBase || isHovered || hasFocusWithin;` → 1
- `if (!isPointerDownRef.current) setHasFocusWithin(true);` → 1
- `const isEnteringBase = isBase && !wasBaseRef.current;` → 1
- `track.scrollLeft = targetCard.offsetLeft - firstCard.offsetLeft;` → 1

其他 acceptance：aria-label 行（`grep -cF`）= 1；「尚非連結」= 0；`git diff --stat $BASE -- src/services src/hooks src/pages/HomePage.tsx package.json package-lock.json` 無輸出；Task 1 commit 恰含 2 檔；HomePage.test「查看 熱銷一號 詳情」= 2。

## inventory／UI-SPEC「Phase 10 新增測試」對照

| 要求 | 測試全名 |
|---|---|
| 便條卡為 link | FeaturedCarousel 便條卡連結 > 便條卡為連結，href 為 /products/{id}、名稱為查看 {name} 詳情；> base 寬度時便條卡也是連結 |
| href | 同上；HomePage 便條卡連到詳情頁 > 兩組便條卡各自連到對應商品的 /products/{id} |
| accessible name | FeaturedCarousel 便條卡連結 > 便條卡為連結…名稱為查看 {name} 詳情 |
| 鍵盤聚焦暫停／離開恢復 | FeaturedCarousel 便條卡連結 > 鍵盤聚焦便條卡連結時不自動切換，焦點離開後恢復 |
| 點擊不黏住 | > 用滑鼠點擊便條卡連結時不暫停，仍會自動切換；> 觸控點擊便條卡連結後不黏住 |
| base 不自動 | FeaturedCarousel base 寬度 > base 不自動播放，點下一張以 smooth 把第二張捲到起點（既有，斷言不變） |
| 減少動態不自動 | FeaturedCarousel 暫停自動播放 > 系統偏好減少動態時不自動切換，手動仍可切換（既有） |
| 視窗外不在 tab 順序 | FeaturedCarousel 便條卡連結 > md+ 5 筆時只有視窗內 3 張為連結（不在視窗內的卡不在 tab 順序內） |
| 導向詳情頁 | HomePage 便條卡連到詳情頁 > 點便條卡導向詳情頁 |

## Deviations from Plan

None - plan executed exactly as written.

備註（非偏離）：acceptance 中 `srccode … | grep -c 'aria-label={`查看 ${product.name} 詳情`}'` 在 macOS BSD grep 的 BRE 下因 `{` 解讀回傳 0，改用 `grep -cF` 固定字串比對結果為 1，程式碼內容符合要求。另在 zsh 下 `$BASE:src/...` 會被當成 `:s` 修飾詞，需寫成 `"${BASE}:src/..."`。

## Known Stubs

None.

## Next Phase Readiness

10-03（收尾總檢、瀏覽器 UAT、main 同步）可開始；測試總數 538。

## Self-Check: PASSED

- FOUND: src/components/FeaturedCarousel.tsx、FeaturedCarousel.test.tsx、src/pages/HomePage.test.tsx
- FOUND: f28ccc5
