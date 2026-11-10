---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
reviewed: 2026-11-10T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - CLAUDE.md
  - index.html
  - package.json
  - src/App.css
  - src/components/FeaturedCarousel.test.tsx
  - src/components/FeaturedCarousel.tsx
  - src/hooks/usePrefersReducedMotion.ts
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 5：程式碼審查報告

**Reviewed:** 2026-11-10
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

審查範圍為 dde1dbe..HEAD 的差異。favicon 修正（`type="image/png"`，`public/logo.png` 為 250x250 PNG）、`lang` 改為 `zh-Hant-TW`、App.css 移除 Vite 範本殘留樣式、build 串接 `check-dist` 皆正確。`usePrefersReducedMotion` 實作正確（初值同步讀取、有清理監聽）。沒有安全問題。主要問題在輪播「暫停」邏輯在觸控與點擊情境下會讓自動播放長期停住。

## Warnings

### WR-01：點擊箭頭或指示點後焦點留在按鈕上，自動播放會一直停住

**File:** `src/components/FeaturedCarousel.tsx:137-148`
**Issue:** `hasFocusWithin` 只在焦點離開輪播時才還原。使用者用滑鼠或觸控點「上一張／下一張／指示點」後，按鈕保有焦點（Chrome、Firefox 皆然），`onBlur` 不會觸發，所以 `isPaused` 保持 true，輪播不再自動切換，直到使用者點別處。對一般瀏覽者來說，輪播會在第一次互動後就「壞掉」。現有測試只用 `.focus()/.blur()` 模擬，沒有涵蓋這個情境。
**Fix:** 只在鍵盤焦點時暫停，用 `event.target.matches(":focus-visible")` 判斷。

```tsx
onFocus={(event) => {
  if (event.target.matches(":focus-visible")) setHasFocusWithin(true);
}}
```

### WR-02：觸控裝置上 mouseenter 會殘留，輪播被黏在暫停狀態

**File:** `src/components/FeaturedCarousel.tsx:137-139`
**Issue:** 行動瀏覽器在點擊後會模擬 `mouseenter`，但不會在手指離開時送出 `mouseleave`，要等點到輪播外才會觸發。結果是手機使用者點過輪播一次後，自動播放就停住。
**Fix:** 改用 pointer 事件並排除觸控。

```tsx
onPointerEnter={(e) => { if (e.pointerType === "mouse") setIsHovered(true); }}
onPointerLeave={() => setIsHovered(false)}
```

測試請同步改用 `fireEvent.pointerEnter`，並加一個 `pointerType: "touch"` 不暫停的案例。

## Info

### IN-01：onBlur 的型別斷言

**File:** `src/components/FeaturedCarousel.tsx:142`
**Issue:** `event.relatedTarget as Node | null` 是不必要的斷言（`relatedTarget` 型別為 `EventTarget | null`，`contains` 接受 `Node | null`，斷言只是在繞過型別檢查）。
**Fix:** 用 `event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)` 判斷。

### IN-02：自動播放計時器依賴 currentSlide

**File:** `src/components/FeaturedCarousel.tsx:46-52`
**Issue:** 這個設計是刻意的（手動切換後重新計時，且有測試覆蓋），不是缺陷。不過 `currentSlide` 在 `items` 縮短後可能超出範圍，計時器依賴只靠 `activeIndex` 取模處理，目前沒有問題。
**Fix:** 無需修改，僅提醒日後調整 `items` 來源時留意。

---

_Reviewed: 2026-11-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
