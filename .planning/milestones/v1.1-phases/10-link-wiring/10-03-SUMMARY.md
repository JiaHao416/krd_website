---
phase: 10-link-wiring
plan: 03
subsystem: verification
tags: [uat, link, carousel, wcag]
requires: ["10-01", "10-02"]
provides:
  - Phase 10 整體自動檢查
  - 真實瀏覽器 UAT（10-UAT.md）
  - main 同步結果
affects: []
key-files:
  created:
    - .planning/phases/10-link-wiring/10-UAT.md
    - .planning/phases/10-link-wiring/uat/
  modified: []
requirements-completed: []
duration: ~30min
completed: 2026-11-11
---

# Phase 10 Plan 03：整體檢查、真實瀏覽器 UAT 與 main 同步

**LINK-01／LINK-02 自動檢查全綠（538 項），真實瀏覽器 12 項 UAT 全數通過，main 沒有新 commit。**

## Task 1：整體自動檢查（BASE = 5467bcc）

- `npm test` 538/538 通過，`npm run lint` 無輸出，`npm run build` 成功（含 dist 憑證掃描）。
- `npx vitest list | wc -l` = **538**（≥ 525）。

### 測試數

| 測試檔 | Phase 9 結束 | Phase 10 結束 |
|--------|--------------|---------------|
| ProductCard.test.tsx | 25 | 27 |
| ProductPageTemplate.test.tsx | 22 | 24 |
| FeaturedCarousel.test.tsx | 26 | 33 |
| HomePage.test.tsx | 13 | 15 |
| **總數** | **525** | **538** |

### 範圍檢查

`git diff --name-only 5467bcc..HEAD -- src` 只列出 7 個預期中的檔案：

- `src/components/ProductCard.tsx` 與 `.test.tsx`
- `src/pages/ProductPageTemplate.tsx` 與 `.test.tsx`
- `src/components/FeaturedCarousel.tsx` 與 `.test.tsx`
- `src/pages/HomePage.test.tsx`

`src/services/`、`src/hooks/`、`ImageModal.tsx`、`ImageModal.test.tsx`、`package.json` 和 lockfile 都沒有變動。

### 結構檢查

- **D-05：** `FeaturedCarousel` 從 `const FeaturedCarousel =` 之後的函式本體，與 5467bcc 逐字相同。暫停條件、pointer 旗標、base 進入判斷、scrollLeft 對齊這 4 行各出現 1 次（見 10-02-SUMMARY）。
- **LINK：** `ProductCard.tsx` 裡 `role="button"`、`onImageClick` 都是 0 次。`ProductPageTemplate.tsx` 裡 `ImageModal` 是 0 次。全站只剩 `ImageModal.tsx` 本身和 `ProductDetailView.tsx` 引用 ImageModal。

### 契約對照（D-07）

每一項「舊斷言 → 新斷言」都對到 06-TEST-INVENTORY 的列，詳細表格在：

- `10-01-SUMMARY.md` §舊名／舊斷言 → 新名／新斷言（ProductCard、ProductPageTemplate）
- `10-02-SUMMARY.md` §FeaturedCarousel.test 舊 → 新（FeaturedCarousel、HomePage）

只有卡片語意（role、href、accessible name）的斷言被改寫。燈箱相關測試改成「導向詳情頁」，沒有刪除任何行為契約。

## Task 2：真實瀏覽器 UAT

完整紀錄在 `10-UAT.md`，12 項全部通過：

- 分類頁的 grid 和 list 檢視都能點卡片（含圖片區）進入詳情頁，不會開燈箱；「← 回上一頁」會回到列表。
- 首頁兩組便條卡都能點擊進入詳情頁。
- 輪播暫停：鍵盤聚焦、hover 都會暫停並在離開後恢復；點擊後指標移開不會卡住；reduced-motion 與 base 寬度都不自動切換。
- 09 WR-01 回歸：同一路由元件內換商品，複製狀態會重置。

## Task 3：main 同步（D-11）

`git fetch origin` 後：

- `git log redesign..origin/main`：無輸出
- `git log redesign..main`：無輸出

不需要合併，也沒有 push。

## 需求覆蓋

| 需求 | 實作 | 測試 | UAT |
|------|------|------|-----|
| LINK-01 | 10-01（ProductCard Link、移除列表頁燈箱） | ProductCard、ProductPageTemplate | #1–#4、#11 |
| LINK-02 | 10-02（NoteCard Link，狀態機不動） | FeaturedCarousel、HomePage | #5–#11 |

## Deviations

無。

## Phase 11 上線前待使用者確認

- **A5：** 兩組熱銷輪播各自有一組控制列（`08-shell-redesign/uat/a5-featured-1440.png`、`a5-featured-320.png`）。
- **分類名稱：** 分類 tag 顯示後端原始分類「喇叭」，麵包屑顯示分類頁標題「擴大機 / 喇叭」。
- **價格格式：** `NT$12,345`，沒有空格。
- **human-needed：**
  - Windows 上的 antialias
  - 實機觸控（便條卡、商品卡、固定列）
  - iOS safe-area
  - iOS 剪貼簿
  - 真實多變體資料
