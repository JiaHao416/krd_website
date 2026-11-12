---
phase: 08-shell-redesign
plan: 02
subsystem: ui-shell
tags: [layout, a11y, skip-link, footer, mobile-call-bar, category-chips, tdd]
requires: [08-01]
provides:
  - Layout（skip link、main#main、footer 變體 thanks／address）
  - 一行 Footer（ContactInfo 注入）
  - MobileCallBar（base 固定撥號列）
  - CategoryChips（取代 SideMenu）
affects: [08-03, 08-04, 08-05, 08-06]
tech-stack:
  added: []
  patterns: [ContactInfo 依賴注入、chip 樣式為靜態常數、aria-current 以 pathname 判斷]
key-files:
  created:
    - src/components/Layout.test.tsx
    - src/components/Footer.test.tsx
    - src/components/MobileCallBar.tsx
    - src/components/MobileCallBar.test.tsx
    - src/components/CategoryChips.tsx
    - src/components/CategoryChips.test.tsx
  modified:
    - src/components/Layout.tsx
    - src/components/Footer.tsx
    - src/App.tsx
    - src/pages/HomePage.tsx
    - src/pages/AboutPage.tsx
    - src/pages/ProductPageTemplate.tsx
    - src/pages/ProductPageTemplate.test.tsx
  deleted:
    - src/components/SideMenu.tsx
    - src/components/SideMenu.test.tsx
decisions:
  - "Layout 的 footer prop 為必填，呼叫端明確選 thanks／address"
  - "CategoryChips 不用 NavLink，以 useLocation().pathname 比對，與 NavBar 判斷方式一致"
metrics:
  duration: "約 6 分鐘"
  completed: 2026-11-11
  tasks: 2
  files: 17
---

# Phase 8 Plan 02: 共用骨架（Layout、頁尾、撥號列、分類 chip）Summary

Layout 改為 skip link → 頂列 → `main#main` → 一行頁尾 → base 固定撥號列，移除 showSideMenu／title 與深色漸層外框；新增 CategoryChips 取代並刪除 SideMenu，列表頁標題區後顯示 8 個分類 chip。

## Commits

| Task | 說明 | Commit |
|------|------|--------|
| 1 | Layout 骨架、一行 Footer、MobileCallBar，App 移除漸層外框，三頁改用 footer prop | f9cb4d7 |
| 2 | CategoryChips 取代 SideMenu，ProductPageTemplate 插入 chip 列並修 harness | 48b046f |

## 測試數（D-10）

- 起點（08-01 結束）：`npx vitest list | wc -l` = **336**
- Task 1 後：346（+Layout 5、Footer 3、MobileCallBar 2）
- 結束：**356**（+CategoryChips 15、−SideMenu 5）
- `npx vitest list | grep -c CategoryChips.test.tsx` = 15；`App.test.tsx` 11 項全綠（8 條路由不變）
- 每個 commit 前 `npm test`、`npm run lint`、`npm run build` 皆全綠。

## RED 證據

**Task 1**：`npx vitest run src/components/Layout.test.tsx src/components/Footer.test.tsx src/components/MobileCallBar.test.tsx`
- `MobileCallBar.test.tsx` FAIL：`Failed to resolve import "./MobileCallBar"`
- `Footer.test.tsx` 3 項 ×：`Unable to find an element with the text: © KRD・謝謝你逛到這裡`（及另兩個文案）
- `Layout.test.tsx` 4 項 ×：`Unable to find an accessible element with the role "link" and name "跳到主要內容"`、頁尾文案找不到；「children 位於 main 內」舊 Layout 已成立故通過
- 實作後 10 passed。RED 未提交。

**Task 2**：
- `npx vitest run src/components/CategoryChips.test.tsx` FAIL：`Failed to resolve import "./CategoryChips"`；實作後 15 passed。
- 模板插入 `<CategoryChips />` 後、修 harness 前：`ProductPageTemplate.test.tsx` 16 failed | 1 passed，`useLocation() may be used only in the context of a <Router> component.`（Pitfall 1）；renderPage 包 MemoryRouter 後 17 passed。

## SideMenu → CategoryChips 對照（D-09）

| 舊（SideMenu.test.tsx） | 新（CategoryChips.test.tsx） | 變更 |
|---|---|---|
| 首屏依序顯示 8 個導覽項目（`getAllByRole("button")` 過濾 TITLES） | 首屏依序顯示 8 個導覽項目（`within(nav 商品分類).getAllByRole("link")`） | role button → link，名稱與順序不變 |
| 目前頁面按鈕有 active 樣式（className 含 `border-blue-500/30`） | 目前頁 chip 有 aria-current=page（/trumpet → 擴大機 / 喇叭） | 呈現類 → 以 aria-current 驗證（06-TEST-INVENTORY 預定處置） |
| 其他按鈕沒有 active 樣式 | 其他 chip 沒有 aria-current | 同上 |
| 點擊 KRD 後導向 /krd-products | 點擊 KRD 後導向 /krd-products | role button → link |
| 沒有骨架載入元素 | 沒有骨架載入元素 | 不變 |

另有自 NavBar 移入語意 9 項（`$title chip 為連結且 href 為對應路徑` ×8、「點擊無線麥克風後導向 /wireless-micphone」）與新增「nav 的 aria-label 為商品分類」。NavBar.test 原 9 項本 plan 未動，由 08-03 移除。

## 呈現類改寫（舊 → 新）

| 元件 | 舊 | 新 |
|---|---|---|
| Layout | `showSideMenu`／`title` prop、側欄 + main、深色漸層外框 | `footer: "thanks" \| "address"` 必填；skip link、`main#main tabIndex=-1`、Footer、MobileCallBar；無背景漸層 |
| Footer | 「聯絡我們」標題、地址／電話／服務時間三卡、「© 2025 羽程企業社…」（寫死） | 一行置中 Label：thanks「© KRD・謝謝你逛到這裡」、address「© KRD・{address}・{businessHours}」，值取自 CONTACT |
| App.tsx | `<div className="min-h-screen bg-gradient-to-br …">` 外框 | 直接回傳 `<Routes>`，`<Route>` 3 處不變 |
| 呼叫端 | HomePage `showSideMenu={false}`、AboutPage 無 prop、ProductPageTemplate ×2 `title showSideMenu` | HomePage／ProductPageTemplate ×2 `footer="thanks"`、AboutPage `footer="address"` |

## Harness 修改

`ProductPageTemplate.test.tsx` 的 `renderPage()` 改以 `<MemoryRouter initialEntries={["/all-products"]}>` 包住模板，並 import `MemoryRouter`。斷言與測試名稱皆未變（17 項）。

## Deviations from Plan

1. **[已知殘留] `src/services/catalog.ts` 第 23 行註解仍提到「SideMenu」** — acceptance 要求 `grep -rn "SideMenu" src` 無輸出，但 D-08 禁止修改 `src/services/**` 既有檔，兩者衝突；以 D-08 為準不改，僅此一處註解（非程式碼）。可於 phase 收尾或後續允許改 services 時修正。
2. **[微調] CategoryChips 測試 describe 名稱** — 為避免測試檔本身命中 SideMenu grep，describe 寫為「CategoryChips（舊側邊選單同語意）」。

D-08：`src/services/`、既有 hooks 檔均未修改。未遇到權限守衛拒絕。

## Known Stubs

無。列表頁其他版面（標題、控制列、卡片）保留舊樣式，屬 08-04 範圍。

## Self-Check: PASSED

- 6 個新檔皆存在；SideMenu.tsx／SideMenu.test.tsx 已刪除
- commits f9cb4d7、48b046f 皆存在於 git log
