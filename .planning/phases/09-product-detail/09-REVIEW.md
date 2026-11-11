---
phase: 09-product-detail
reviewed: 2026-11-11T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/App.tsx
  - src/components/Layout.tsx
  - src/components/icons.tsx
  - src/index.css
  - src/pages/ProductDetailPage.tsx
  - src/pages/NotFoundPage.tsx
  - src/pages/productDetailText.ts
  - src/components/ProductDetailView.tsx
  - src/components/VariantSelector.tsx
  - src/components/PriceBlock.tsx
  - src/components/SpecTable.tsx
  - src/components/DetailCta.tsx
  - src/components/DetailMobileBar.tsx
  - src/components/NotFoundState.tsx
  - src/hooks/useCopyInquiry.ts
  - src/config/categoryPage.ts
  - src/hooks/useCopyInquiry.test.tsx
  - src/components/ProductDetailView.test.tsx
findings:
  critical: 0
  warning: 3
  info: 5
  total: 8
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-11-11
**Depth:** standard
**Files Reviewed:** 18（範圍：`git diff a50689c..HEAD -- src`；測試檔只看斷言是否有效）
**Status:** issues_found

## Summary

整體品質不錯：`ProductDetailView` 以 `key={product.id}` 掛載，所以選中變體、燈箱和圖片失敗狀態在切換商品時都會重置。`useProductDetail` 在 render 階段就依 requestKey 衍生 loading，不會殘留舊資料。說明一律走純文字節點（沒有 `innerHTML`），也有 HTML 字樣的測試。LINE 外部連結有 `rel="noopener noreferrer"`。React 19 原生 `<title>`/`<meta>` 用法正確，`index.html` 沒有重複的靜態 description。radiogroup 的 roving tabindex 與方向鍵／Home／End 都有實作也有測試。`index.css` 把無外框規則收窄成 `main[tabindex="-1"]`，變體 chip 因此保有焦點環。斷點只用 base、md、xl。麵包屑末項有 `aria-current="page"`，返回按鈕兩種模式都有測試。

主要問題集中在「頁面層持有的複製狀態」。它不跟商品 id 綁定，同一個值失敗兩次時也不會重新朗讀。另外，手機固定列出現失敗訊息後會長高，超出 Layout 預留的 96px。沒有 BLOCKER。

## Warnings

### WR-01: 複製狀態不隨商品 id 重置，舊請求的結果會套到新商品

**File:** `src/pages/ProductDetailPage.tsx:41-48`、`src/hooks/useCopyInquiry.ts:47-79`
**Issue:** `useCopyInquiry` 掛在 `ProductDetailPage`（沒有 key，路由 `/products/:id` 切換 id 時不重掛），只有 `ProductDetailView` 會因 `key` 重置。從商品 A 切到商品 B（同一路由元件，例如之後加了相關商品連結，或 history 在兩個詳情頁之間前進後退）時有兩個問題：
1. A 的 `"failed"` 狀態會原封不動留在 B，B 從未複製卻顯示「複製失敗，請手動選取網址」，直到下次點擊；`"copied"` 也會在 B 上殘留最多 2 秒。
2. A 的 `writeText` 若在切換後才 resolve／reject，`.then`/`.catch` 只檢查 `mountedRef`，B 仍會被設成 `copied`／`failed`。

目前站內還沒有詳情頁直接連到另一個詳情頁的連結，所以列為潛在缺陷；但 Phase 10 把商品卡連到詳情頁後，就很容易觸發（例如詳情頁 → 瀏覽器上一頁／下一頁的組合）。現有測試也沒有涵蓋 id 變更。
**Fix:** 讓 hook 在 `text` 改變時重置，並丟棄過期請求的結果：
```ts
// 文字改變（切換商品）時在 render 階段重置狀態，並作廢進行中的請求
const [prevText, setPrevText] = useState(text);
const attemptRef = useRef(0);
if (prevText !== text) {
  setPrevText(text);
  setStatus("idle");
}
useEffect(() => {
  // 切換文字時清掉還原計時器、作廢舊請求
  attemptRef.current += 1;
  clearTimer(timerRef);
}, [text]);

const copy = useCallback(() => {
  if (text === null) return Promise.resolve();
  clearTimer(timerRef);
  const attempt = ++attemptRef.current;
  return writeText(text)
    .then(() => {
      if (!mountedRef.current || attempt !== attemptRef.current) return;
      // ...
    })
    .catch(() => {
      if (mountedRef.current && attempt === attemptRef.current) setStatus("failed");
    });
}, [text, writeText]);
```
另一種較簡單的做法：在 `ProductDetailPage` 外包一層，以 `key={id}` 掛載內層元件，讓整頁狀態跟著 id 重置。補一個「A 失敗後切到 B 顯示初始狀態」的測試。

### WR-02: 連續複製失敗時 aria-live 不會再次朗讀

**File:** `src/hooks/useCopyInquiry.ts:64-78`、`src/components/DetailCta.tsx:25,55`、`src/components/DetailMobileBar.tsx:25-30`
**Issue:** 第二次點擊時狀態從 `"failed"` 再設成 `"failed"`，React 不更新 DOM，live region 內容沒變，螢幕閱讀器使用者按了按鈕卻沒有任何回饋（看起來像沒反應）。同理，`"copied"` 期間再按一次（重新計時）也不會再次朗讀。
**Fix:** 在 `copy()` 一開始、`writeText` 呼叫之後同步 `setStatus("idle")`（setState 不會消耗使用者手勢，寫入仍在同一個 tick 內發出），讓每次嘗試都產生一次 DOM 變化；或在訊息節點加上嘗試次數作為 `key` 強制重建。補一個「連續兩次失敗，訊息節點被重新插入」的測試。

### WR-03: 手機固定列顯示失敗訊息後超出 Layout 預留高度，遮住頁尾

**File:** `src/components/DetailMobileBar.tsx:26-30`、`src/components/Layout.tsx:21`（`pb-24`）
**Issue:** Layout 在 base 固定預留 96px（`pb-24`）。雙鈕列本身是 `p-4`＋`h-14`＝88px，失敗訊息出現後多了一行 `text-label` 加 `gap-2`，列高大約 120px 以上，比預留空間多出 24px 以上，最底部的頁尾地址會被固定列蓋住而無法捲出來。失敗狀態會一直維持，所以遮擋不是暫時的。
**Fix:** 把失敗訊息改成絕對定位在列的上方（`absolute bottom-full inset-x-4 mb-2 ...`），不影響列高；或讓 Layout 依 `mobileBar` 決定 padding（例如詳情頁失敗時加 `pb-32`）。前者比較簡單，也不必改 Layout 的介面。

## Info

### IN-01: 載入中與錯誤狀態沒有設定分頁標題

**File:** `src/pages/ProductDetailPage.tsx:59,73-95`
**Issue:** loading 和 error 分支沒有 `<title>`，分頁標題退回 `index.html` 的「KRD」。D-04 沒有規定這兩個狀態，但錯誤頁的分頁上沒有任何提示，和 notFound 分支的作法不一致。
**Fix:** 在錯誤分支加 `<title>商品暫時載入不出來 | KRD</title>`（或沿用站名，但在 UI-SPEC 明確記錄）。

### IN-02: 圖片失敗只記住最後一個網址

**File:** `src/components/ProductDetailView.tsx:46,55,121`
**Issue:** `failedImageUrl` 只有一格。變體 A 的圖片失敗後切到 B（也失敗）再切回 A，A 會重新請求，先閃一下破圖才變回佔位圖。
**Fix:** 改成 `useState<Set<string>>` 累積失敗的網址，判斷時用 `!failed.has(imageUrl)`。

### IN-03: 選中變體無價時，文案說「這個商品沒有標價」

**File:** `src/components/PriceBlock.tsx:16`、`src/components/ProductDetailView.tsx:52`
**Issue:** 多變體商品中，只要選中的那個變體沒有價格就會顯示「這個商品沒有標價」，但其他變體可能有價，文案不精確。
**Fix:** 有多個變體時改用「這個規格沒有標價…」，或在 UI-SPEC Copywriting 補上規格層級的文案。

### IN-04: 詢價文字不含選中的變體，網址也可能帶追蹤參數

**File:** `src/pages/ProductDetailPage.tsx:41-44`
**Issue:** 文字只有名稱、型號和 `window.location.href`，符合 D-08，但客人選了規格後，複製出去的內容沒有 SKU，店家無從得知選了哪個規格。`location.href` 也會把 `?fbclid=`、`utm_*`、hash 一起帶進去。
**Fix:** 下一輪考慮把選中變體的 SKU 或屬性加入詢價文字（需調整 D-08）；網址改用 `origin + pathname`。

### IN-05: 主按鈕樣式字串重複四份

**File:** `src/pages/ProductDetailPage.tsx:12-13`、`src/components/DetailCta.tsx:16-17`、`src/components/NotFoundState.tsx:16-17`（另有列表頁）
**Issue:** `PRIMARY_BUTTON_CLASS` 完全相同的字串複製了好幾份，日後調整主按鈕外觀時很容易漏改。
**Fix:** 抽到共用模組（例如 `src/components/buttonStyles.ts`）匯出常數。

---

_Reviewed: 2026-11-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
