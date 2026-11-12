---
phase: 10-link-wiring
reviewed: 2026-11-11T04:18:45Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/ProductCard.tsx
  - src/components/ProductCard.test.tsx
  - src/pages/ProductPageTemplate.tsx
  - src/pages/ProductPageTemplate.test.tsx
  - src/components/FeaturedCarousel.tsx
  - src/components/FeaturedCarousel.test.tsx
  - src/pages/HomePage.test.tsx
findings:
  critical: 0
  warning: 3
  info: 6
  total: 9
status: fixed
---

# Phase 10：程式碼審查報告

**審查時間：** 2026-11-11T04:18:45Z
**深度：** standard
**審查檔案數：** 7（`git diff 5467bcc..HEAD -- src`）
**狀態：** issues_found

## 摘要

Phase 10 把 `ProductCard`（grid／list）與首頁便條卡 `NoteCard` 的根元素改成 `<Link to="/products/{id}">`，並從 `ProductPageTemplate` 移除燈箱。以下幾項已逐一確認：

- 燈箱殘留已清乾淨。`onImageClick`、`handleImageClick`、`interactiveProps`、`cursorClass`、`KeyboardEvent` import 都已移除；`ImageModal` 只剩 `ProductDetailView.tsx` 在用（D-02）。
- 卡內沒有巢狀互動元素。圖示都有 `aria-hidden`，「查看詳情 →」也有 `aria-hidden`。
- focus-visible 焦點環由 `src/index.css:32` 的全域 `:focus-visible`（2px accent、offset 3px）提供。卡片沒有 `outline-none`，base 捲動條的 `px-4 pt-4 pb-4` 也不會把焦點環裁掉。
- `FeaturedCarousel` 狀態機本體沒有改動（D-05）。
- 4 個測試檔共 99 項，本地執行全部通過。測試都用 `MemoryRouter` 包裝，計時器用 fake timers，結果可重現。

主要問題在 `ProductCard` 連結的 accessible name（無障礙名稱）：商品名稱會念兩次，缺圖時開頭先念「暫無圖片」，list 卡還會把整段描述念進去。現有測試只用 regex 比對，所以抓不到這些問題。沒有 Critical 等級的問題。

驗證方式：用專案內的 `jsdom` 與 `dom-accessibility-api`，對元件實際輸出的 DOM 結構計算 accessible name，結果如下：

- grid 有圖：`"甲商品 品牌X 甲商品 NT$1,200洽詢交期"`
- list 缺圖：`"暫無圖片 甲商品 品牌X 價格請來電 很長的描述文字"`

## Warnings

### WR-01：ProductCard 連結的 accessible name 把商品名稱念兩次

**檔案：** `src/components/ProductCard.tsx:43-51`、`:72-95`、`:100-117`
**問題：** 根 `<Link>` 沒有 `aria-label`，名稱由內容組成。卡內的 `<img alt={product.name}>` 和 `<h3>{product.name}</h3>` 都在連結裡，所以讀屏的連結清單、Tab 朗讀與語音控制會聽到「甲商品 品牌X 甲商品 NT$1,200…」，名稱重複且冗長。UI-SPEC §商品卡規定 accessible name「由卡內文字組成（商品名稱、價格文字）」，但沒有要求圖片 alt 也算進去。依 WAI 的圖片教學，連結內的圖片如果和旁邊文字重複，alt 應設為空字串。
**修正：** 卡內圖片改成裝飾性，名稱交給 `<h3>`：

```tsx
// 卡內圖片與 h3 名稱重複；整張卡是連結，圖片視為裝飾，避免連結名稱念兩次
<img
  src={product.imageUrl as string}
  alt=""
  onError={handleImageError}
  loading="lazy"
  decoding="async"
  className="h-full w-full object-contain"
  draggable={false}
/>
```

`ProductCard.test.tsx` 和 `ProductPageTemplate.test.tsx` 中用 `getByAltText(product.name)` 找圖的斷言，要改成 `container.querySelector("img")`，或在 img 加 `data-testid`。這只是查詢方式不同，屬於呈現層調整，不影響行為契約。另一個做法是用 `useId` 讓 Link 加上 `aria-labelledby={nameId priceId}`，明確指定名稱只由名稱和價格組成，同時解決 WR-02。

### WR-02：缺圖卡開頭先念「暫無圖片」，list 卡把整段描述念進名稱

**檔案：** `src/components/ProductCard.tsx:52-54`（`ImagePlaceholder` 帶 `role="img" aria-label="暫無圖片"`）、`:85-92`（list 描述）
**問題：** 佔位元件是 `role="img"` 且有名稱，放在連結裡就成為連結名稱的第一段。分類頁的缺圖商品，連結名稱都會以「暫無圖片」開頭，讀屏使用者在連結清單裡難以分辨各張卡。list 卡還會把最多兩行的 `description` 整段串進名稱，使用者每 Tab 一次都要聽完整段描述。
**修正：** 二選一：

1. 讓 Link 用 `aria-labelledby` 指向 `<h3>` 和價格元素的 id，描述改放 `aria-describedby`：

```tsx
// 連結名稱只取商品名稱與價格；描述當補充說明，不併入名稱
const nameId = useId();
const priceId = useId();
const descId = useId();
<Link
  to={detailPath}
  aria-labelledby={`${nameId} ${priceId}`}
  aria-describedby={product.description ? descId : undefined}
  ...
>
```

2. `ImagePlaceholder` 新增 `decorative` prop。在連結內使用時不輸出 `role="img"`／`aria-label`，改加 `aria-hidden`。

選第 2 種時，UI-SPEC 的「`role="img"` `aria-label="暫無圖片"` 不變」與現有測試 `getByRole("img", { name: "暫無圖片" })` 需要一起調整，所以第 1 種對契約的影響較小。

### WR-03：accessible name 測試只用 regex，無法發現 WR-01／WR-02

**檔案：** `src/components/ProductCard.test.tsx:217-219`、`src/pages/ProductPageTemplate.test.tsx:307`、`:396`
**問題：** `toHaveAccessibleName(/商品一/)`、`toHaveAccessibleName(/NT\$1,200/)`、`findByRole("link", { name: /甲商品/ })`、`{ name: /甲商品|乙商品/ }` 都是部分比對。名稱念兩次、多出「暫無圖片」或整段描述，這些測試照樣通過。新增這些測試是為了鎖定 accessible name（10-01-SUMMARY「accessible name 由卡內文字組成」），現在卻剛好放過名稱冗長的問題。
**修正：** 修完 WR-01／WR-02 後改用精確字串，並補上缺圖與 list 的情境：

```tsx
// 精確比對：名稱只含商品名稱與價格，不重複、不含佔位或描述
expect(screen.getByRole("link")).toHaveAccessibleName("商品一 NT$1,200");
```

## Info

### IN-01：便條卡 aria-label 不含可見文字「查看詳情」（WCAG 2.5.3 Label in Name）

**檔案：** `src/components/FeaturedCarousel.tsx:37`、`:67-70`
**問題：** 可見文字是「查看詳情 →」（手機「詳情 →」），`aria-label` 是「查看 {name} 詳情」，「查看詳情」沒有以連續字串出現在名稱裡。語音控制使用者說「點查看詳情」可能找不到這個連結。另外 `aria-label` 會蓋掉卡內內容，讀屏聽不到品牌與價格。這個字串由 UI-SPEC 定案（§熱銷便條卡、文案表第 486 行），所以列為 Info，不算實作缺陷。
**建議：** 下次修訂 UI-SPEC 時改成「{name}，查看詳情」或「{name} {價格} 查看詳情」，讓可見標籤成為名稱的子字串。

### IN-02：「點擊查看大圖」的不存在斷言已沒有意義

**檔案：** `src/components/ProductCard.test.tsx:190`、`:339`、`:352`
**問題：** 「點擊查看大圖」這段文字 Phase 8 就已從元件移除，`src/` 的非測試檔中也找不到這個字串。所以 `queryByText("點擊查看大圖")` 一定是 null，這些斷言不可能失敗，只會讓人誤以為有在防回歸。
**建議：** 刪除這些斷言，或改成真正會被移除行為影響的檢查，例如 `queryByRole("dialog")`。若是為了 D-07 的測試數量下限，保留測試本身、只換斷言即可。

### IN-03：「便條卡內沒有巢狀互動元素」測試沒有真正檢查巢狀

**檔案：** `src/components/FeaturedCarousel.test.tsx:542-547`
**問題：** 這個測試只用 1 筆資料。1 筆時 `showControls` 為 false，上一張、下一張與指示點都不會渲染，所以 `queryAllByRole("button")` 是 0 是必然的結果，並沒有驗證「連結內沒有互動元素」。
**建議：** 改用 3 筆資料，直接在每個連結內部檢查：

```tsx
// 每張便條卡連結內不得有其他可聚焦元素
for (const link of screen.getAllByRole("link")) {
  expect(link.querySelector("a, button, input, select, textarea, [tabindex]")).toBeNull();
}
```

### IN-04：詳情頁路徑組法重複兩處，且 id 沒有編碼

**檔案：** `src/components/ProductCard.tsx:68`、`src/components/FeaturedCarousel.tsx:36`
**問題：** `` `/products/${product.id}` `` 在兩個元件各寫一次。`id` 型別是 `string`（`src/services/apiTypes.ts:14`），後端沒有保證格式。如果 id 含有 `/`、`?`、`#`、`%`，路由就會解析錯誤或對不到。目前後端 id 應該不含這些字元，所以列為 Info。
**建議：** 集中成一個 helper，例如 `src/config/routes.ts` 的 `productDetailPath(id)`，內部使用 `encodeURIComponent(id)`。`useParams` 會自動解碼，詳情頁不需要改。

### IN-05：list 卡沒有 active 狀態（UI-SPEC：active 與 hover 相同）

**檔案：** `src/components/ProductCard.tsx:74`
**問題：** grid 卡有 `active:ring-2 active:ring-inset active:ring-accent`，list 卡只有 `hover:`，觸控使用者按下時沒有回饋。這是 5467bcc 之前就有的問題，不是本 phase 造成的，但卡片改成連結後，按下回饋變得更重要。
**建議：** list 卡 className 補上 `active:ring-2 active:ring-inset active:ring-accent`，並加一個 class 斷言測試。

### IN-06：詳情頁探針與路由包裝在 3 個測試檔重複定義

**檔案：** `src/components/ProductCard.test.tsx:22-37`、`src/pages/ProductPageTemplate.test.tsx:63-82`、`src/pages/HomePage.test.tsx:61-77`
**問題：** `DetailProbe` 與 `renderWithDetailRoute` 在 3 個檔案各寫一份，寫法幾乎一樣，以後改其中一份很容易漏改其他兩份。
**建議：** 移到共用測試輔助檔，例如 `src/test/routerHelpers.tsx`，匯出 `DetailProbe` 和 `renderWithRoutes(element, path)`。

---

_審查時間：2026-11-11T04:18:45Z_
_審查者：Claude（gsd-code-reviewer）_
_深度：standard_

## 修正紀錄

**修正時間：** 2026-11-11
**範圍：** Warning 全部（WR-01～WR-03）；Info 只處理可單純強化測試者
**結果：** Warning 3／3 已修正；測試數 538 → 541，`npm test`、`npm run lint`、`npm run build` 皆通過

| 項目 | 結果 | Commit | 說明 |
|------|------|--------|------|
| WR-01 | 已修正 | `ea9560d` | Link 以 `useId` 加 `aria-labelledby={nameId priceId}`，名稱只取 `<h3>` 與價格文字，不再因 img alt 念兩次；img `alt={product.name}` 保留 |
| WR-02 | 已修正 | `ea9560d` | 同上，名稱不再以「暫無圖片」開頭、不含 list 描述；`ImagePlaceholder` 的 `role="img"` `aria-label="暫無圖片"` 不變。「洽詢交期」與 list 描述改走 `aria-describedby` |
| WR-03 | 已修正 | `ea9560d` | `ProductCard.test.tsx`、`ProductPageTemplate.test.tsx` 改為精確字串比對，新增 grid、list（不含描述）、缺圖三個名稱測試 |
| IN-01 | 略過 | — | 不在範圍；字串由 UI-SPEC 定案 |
| IN-02 | 略過 | — | 沒有單純強化斷言的做法：卡片已無燈箱，換成 `queryByRole("dialog")` 一樣不可能失敗；又不得刪除斷言 |
| IN-03 | 已修正 | `7ad8bfa` | 改用 3 筆資料，逐張檢查連結內沒有可聚焦元素 |
| IN-04～IN-06 | 略過 | — | 不在範圍 |

修正後的連結 accessible name：

- 有價：`"{name} {priceText}"`，例如 `"商品一 NT$1,200"`
- 無價：`"{name} 價格請來電"`，例如 `"甲商品 價格請來電"`
- 缺貨：名稱同上，accessible description 為 `"洽詢交期"`
- list 有描述：名稱同上，description 含描述文字（缺貨時為 `"洽詢交期 {描述}"`）

`PriceTag` 新增選填 `id` prop 供參照，外觀與 class 不變；首頁便條卡不受影響。

_修正者：Claude（gsd-code-fixer）_
