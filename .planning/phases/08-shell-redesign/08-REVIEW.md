---
phase: 08-shell-redesign
reviewed: 2026-11-11T02:58:19Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - src/App.tsx
  - src/components/CategoryChips.tsx
  - src/components/CategoryChips.test.tsx
  - src/components/ContactBlock.tsx
  - src/components/ContactBlock.test.tsx
  - src/components/FeaturedCarousel.tsx
  - src/components/FeaturedCarousel.test.tsx
  - src/components/Footer.tsx
  - src/components/Footer.test.tsx
  - src/components/ImageModal.tsx
  - src/components/ImagePlaceholder.tsx
  - src/components/Layout.tsx
  - src/components/Layout.test.tsx
  - src/components/MobileCallBar.tsx
  - src/components/MobileCallBar.test.tsx
  - src/components/NavBar.tsx
  - src/components/NavBar.test.tsx
  - src/components/PriceTag.tsx
  - src/components/PriceTag.test.tsx
  - src/components/ProductCard.tsx
  - src/components/ProductCard.test.tsx
  - src/components/ProductCardSkeleton.tsx
  - src/components/icons.tsx
  - src/components/icons.test.tsx
  - src/config/contact.ts
  - src/config/contact.test.ts
  - src/config/productPageViews.tsx
  - src/designTokens.test.ts
  - src/hooks/useMediaQuery.ts
  - src/hooks/useMediaQuery.test.tsx
  - src/index.css
  - src/pages/AboutPage.tsx
  - src/pages/AboutPage.test.tsx
  - src/pages/HomePage.tsx
  - src/pages/HomePage.test.tsx
  - src/pages/ProductPageTemplate.tsx
  - src/pages/ProductPageTemplate.test.tsx
  - src/test/setup.ts
  - tailwind.config.js
  - vite.config.ts
findings:
  critical: 0
  warning: 4
  info: 6
  total: 10
status: warnings_fixed
fixed_at: 2026-11-11
warnings_fixed: 4
---

# Phase 8: Code Review Report

**Reviewed:** 2026-11-11T02:58:19Z
**Depth:** standard
**Files Reviewed:** 40（另有 `src/App.css`、`src/components/SideMenu.tsx`、`SideMenu.test.tsx` 已刪除，確認沒有殘留 import）
**Status:** issues_found

## Summary

審查範圍是 `git diff fcf6cba..HEAD -- src tailwind.config.js vite.config.ts`。

**沒問題的部分：**
- 安全：沒有憑證，沒有 `dangerouslySetInnerHTML`，也沒有動態 `href` 注入。LINE 連結有 `rel="noopener noreferrer"`。
- 輪播狀態機符合 D-05。`currentSlide`、計時 effect 的依賴、`isHovered`、`hasFocusWithin`、`isPointerDownRef` 與舊版逐行一致，只把 `isBase` 加進 `isPaused`。base 用 `scrollIntoView({ inline: "start", block: "nearest" })`，reduced-motion 時改成 `auto`。
- 監聽器都有清除：NavBar 只在面板開啟時掛 document listener，`useMediaQuery` 卸載時會 remove，計時器有 `clearTimeout`。
- 斷點：theme 只留 `md`、`xl`。
- 新元件的測試都有實際斷言，涵蓋 role、名稱、href、`aria-*`，以及選填欄位為 undefined、空字串、純空白的情況。

**沒有 BLOCKER。** 主要問題集中在無障礙語意，以及幾個邊界狀態不同步，見下方。

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: 「逛商品」在非 `/all-products` 的分類頁也標 `aria-current="page"`，語意錯誤

**Status:** fixed（`2edc317`）。完全符合路徑才標 `page`，屬於區段時標 `true`；NavBar 測試改為 `/all-products`=page、`/trumpet`、`/products/abc`=true。

**File:** `src/components/NavBar.tsx:29-31, 73`
**Issue:** `isShopActive` 在任一分類頁（例如 `/wired-micphone`）或 `/products/*` 都是 true，結果連往 `/all-products` 的連結被標成 `aria-current="page"`。螢幕閱讀器會念「逛商品，目前頁面」，但這個連結指的並不是目前頁面。同一頁的 CategoryChips 另有一個真正的 `aria-current="page"`（例如「有線麥克風」），於是一頁出現兩個互相矛盾的「目前頁面」。
**Fix:** 只有完全符合時才用 `"page"`，屬於這個區段時改用 `"true"`：
```tsx
// 完全符合目前路徑才是 page；只是屬於「逛商品」區段時用 true
const ariaCurrent = (path: string, isActive: boolean) =>
  pathname === path ? "page" : isActive ? "true" : undefined;
// <Link aria-current={ariaCurrent(path, isActive)} ...>
```
NavBar 測試要同步改成：`/wired-micphone` 時「逛商品」為 `aria-current="true"`。

### WR-02: ImageModal 沒有對話框語意，也沒有處理焦點

**Status:** fixed（`af6f6b3`）。補 `role="dialog"`、`aria-modal`、`aria-label="商品大圖"`；開啟時焦點移到關閉鈕、Tab 鎖在關閉鈕、關閉後還原觸發元素。新增 `ImageModal.test.tsx` 4 項。

**File:** `src/components/ImageModal.tsx:57-91`
**Issue:**
- 燈箱沒有 `role="dialog"`、`aria-modal`，也沒有 accessible name。
- 開啟時焦點不會移到「關閉圖片」按鈕，而是留在背後的商品卡上。
- Tab 會走到被遮住的頂列、chip 和撥號列。
- 關閉後焦點沒有還原。

本 phase 有改到這個檔案（換 token 與 CloseIcon），D-06 也規定燈箱要保留到 Phase 10，所以在這段期間它仍是正式上線的互動。
**Fix:**
```tsx
// 開啟時把焦點移到關閉鈕，關閉時還原到觸發元素
const closeRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  if (!show) return;
  const previous = document.activeElement as HTMLElement | null;
  closeRef.current?.focus();
  return () => previous?.focus();
}, [show]);
// 外層：<div role="dialog" aria-modal="true" aria-label="商品大圖" ...>
```
另外補一個元件測試：開啟後 `document.activeElement` 是關閉鈕，按 Esc 後焦點回到卡片。

### WR-03: 切換 base 與 md 時，捲動位置與指示點不同步

**Status:** fixed（`d07b01d`）。新增只在「由 md+ 進入 base」時作用的 effect（以 ref 記錄前一次 isBase），只讀 `currentSlide`、不改 D-05 狀態機；改用設定捲動條 `scrollLeft` 而非建議的 `scrollIntoView`，避免輪播不在畫面內時整頁垂直跳動。初次以 base 載入不動作。

**File:** `src/components/FeaturedCarousel.tsx:87, 145-152, 230-249`
**Issue:**
- 從 md+ 縮到 base 時（例如旋轉平板、拖拉視窗），`currentSlide` 保留原值，例如第 3 張的指示點仍是 `aria-current`。但捲動條是全新掛載的，`scrollLeft=0`，畫面顯示第 1 張。
- 接著按「下一張」會從第 3 張跳到第 4 張，和使用者看到的位置不一致。

手指滑動不同步是已知的 Open Q9，但這裡是程式自己造成的不一致，與手勢無關。
**Fix:** `isBase` 變成 true 時，用 effect 把目前卡片捲到定位（`behavior: "auto"`），或是重設 `setCurrentSlide(0)`：
```tsx
// 進入 base 版型時，讓捲動條與目前指示點對齊
useEffect(() => {
  if (isBase) cardRefs.current[currentSlide % Math.max(items.length, 1)]
    ?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在切換版型時對齊一次
}, [isBase]);
```

### WR-04: 被截斷時副標仍寫「共 N 項」，數量會誤導

**Status:** fixed（`3a8019a`）。UI-SPEC Copywriting 沒有截斷版文案，所以不採用建議的「先列出 N 項」新字串，只在截斷時省略「共 N 項。」、保留後半句；「僅顯示前 100 項商品」不變（D-02）。

**File:** `src/pages/ProductPageTemplate.tsx:169-173, 220-224`
**Issue:** `truncated` 為 true 時，`items.length` 就是 `PRODUCT_LIMIT`（100），副標仍顯示「共 100 項」。頁底雖然另有「僅顯示前 100 項商品」，但兩句互相矛盾，而且頁首這句會先被讀到。
**Fix:**
```tsx
{hasItems && (
  <p className="mt-2 text-body text-ink-muted">
    {truncated ? `先列出 ${items.length} 項。` : `共 ${items.length} 項。`}
    看到喜歡的，直接打電話問最快。
  </p>
)}
```
並補一個 `truncated: true` 的測試。

## Info

Info 項目不在本次修正範圍內，留待後續 phase 處理（IN-02 在 Phase 10 處理）。

### IN-01: 全域 `[tabindex="-1"]:focus { outline: none }` 的範圍太大

**File:** `src/index.css:38-40`
**Issue:** 這條規則本意只是處理 skip link 的目標 `<main>`，但它會作用在所有 `tabindex="-1"` 的元素上。之後如果做 roving tabindex 或可程式化聚焦的元件（例如 Phase 9 的詳情頁、對話框），焦點環會被悄悄移除，而且 designTokens 掃描抓不到。
**Fix:** 改成只針對 main：`main[tabindex="-1"]:focus { outline: none; }`，或改用 `#main:focus`。

### IN-02: ProductCard 的 `role="button"` 讓卡內標題與標籤從無障礙樹消失

**File:** `src/components/ProductCard.tsx:55-63, 104, 137`
**Issue:** `role="button"` 的子元素會被視為純展示，`aria-label` 又覆寫了內容。結果 `<h3>` 商品名無法用標題導覽，「價格請來電」「洽詢交期」也不會被念出來。這是 D-06 刻意保留的行為，只在這裡記錄，Phase 10 改成 `<Link>` 時要一併驗證。
**Fix:** Phase 10 改成 Link 後，accessible name 改由內容組成，不要再用 `aria-label` 覆寫。

### IN-03: 破圖狀態在 md+ 視窗外會遺失

**File:** `src/components/FeaturedCarousel.tsx:28-31, 256-266`
**Issue:** md+ 只渲染視窗內 3 張，離開視窗的 NoteCard 會卸載，`failedImageUrl` 跟著遺失。轉回來時會再請求一次已知失敗的圖，短暫出現破圖後才換回佔位圖。容器高度固定，所以不影響 CLS。
**Fix:** 把失敗網址集合提升到 FeaturedCarousel（`useState<Set<string>>`），再傳給 NoteCard。

### IN-04: 寫死的 `id`（`contact-title` 等）在元件被重用時會重複

**File:** `src/components/ContactBlock.tsx:17, 21`
**Issue:** 目前每頁只渲染一次，所以沒問題。但 contact.ts 的註解提到 Phase 9 詳情頁也會用到聯絡資訊；如果同一頁渲染兩次 ContactBlock，`aria-labelledby` 會指到第一個。
**Fix:** 改用 `useId()` 產生 id。

### IN-05: designTokens 掃描沒有涵蓋 `.ts`，也沒有涵蓋 `max-md:` 這類變體

**File:** `src/designTokens.test.ts:6, 29`
**Issue:**
- 樣式規則只掃 `.tsx` 與 `.css`。`.ts` 裡的 class 常數（例如之後放進 config 的樣式字串）或寫死的色碼都抓不到。
- 「禁用斷點」規則抓不到 Tailwind 3.2+ 會自動產生的 `max-md:`／`max-xl:` 和 `min-[...]:` 任意斷點，這些都違反「只用 base/md/xl」。
**Fix:**
- glob 加上 `"/src/**/*.ts"`，並排除 `!/src/**/*.test.ts`。
- 斷點規則加入 `(?:max|min)-(?:md|xl|\[)`。

### IN-06: ImageModal 關閉時把 `body.style.overflow` 設成 `"unset"`，沒有還原原值

**File:** `src/components/ImageModal.tsx:15, 27`
**Issue:** 如果之後有其他元件也鎖定捲動（例如行動選單），這裡關閉時會把對方的鎖一起解掉。這是既有寫法，本 phase 沒有處理。
**Fix:** 先存下 `const prev = document.body.style.overflow`，cleanup 時還原成 `prev`。

---

_Reviewed: 2026-11-11T02:58:19Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
