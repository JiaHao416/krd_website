---
phase: 10-link-wiring
verified: 2026-11-11T12:30:00Z
status: human_needed
score: 3/3 must-haves verified
overrides_applied: 0
human_verification:
  - test: "實機手機（iOS／Android）點分類頁商品卡與首頁便條卡"
    expected: "輕點後進入 /products/{id}；在便條卡上橫向滑動不會誤觸導向；點擊後輪播不會停住"
    why_human: "jsdom 與 chrome-devtools 的觸控模擬無法重現實機的觸控手感、滑動與點擊判定（延到 Phase 11 上線前）"
  - test: "實機手機上從列表進入詳情頁後，比較「← 回上一頁」與瀏覽器返回手勢"
    expected: "兩者都回到原分類列表，行為一致"
    why_human: "瀏覽器返回手勢只能在實機確認（延到 Phase 11 上線前）"
---

# Phase 10：連結接線 驗證報告

**Phase 目標：** 訪客能從分類頁與首頁熱銷輪播進入商品詳情頁，且既有的輪播無障礙行為不退步
**驗證時間：** 2026-11-11T12:30:00Z
**狀態：** human_needed（自動檢查與瀏覽器 UAT 全數通過，只剩實機觸控兩項，延到 Phase 11）
**重新驗證：** 否，初次驗證

## 目標達成

### 可觀察事實（ROADMAP 成功標準）

| # | 事實 | 狀態 | 證據 |
|---|------|------|------|
| 1 | 訪客點分類頁的商品卡片會進入該商品詳情頁；整張卡是單一連結，列表頁不再出現燈箱 | ✓ VERIFIED | `src/components/ProductCard.tsx` 的 grid 與 list 根元素都是 `<Link to={detailPath}>`，`detailPath = /products/${product.id}`。`role="button"`、`tabIndex`、`onKeyDown`、`onImageClick` 都是 0 筆。`src/pages/ProductPageTemplate.tsx` 已沒有 `ImageModal`，`ImageModal` 只剩 `ProductDetailView.tsx` 使用。`App.tsx:33` 有 `/products/:id` 路由。相關測試：ProductCard「grid 與 list 卡內只有一個互動元素：根連結」「鍵盤 Tab 聚焦卡片連結，Enter 導向 /products/p1」；Template「點有圖卡片導向 /products/{id}，不出現 dialog」「列表檢視點卡片導向…」「每張卡的連結 href 對應各自的 id」。UAT #1–#4、#11 |
| 2 | 訪客可從熱銷輪播進入商品詳情頁；聚焦連結時輪播暫停，hover、減少動態、點擊後不停住的行為不變，並再次通過真實瀏覽器 UAT | ✓ VERIFIED | NoteCard 根元素改成 `<Link to=/products/{id} aria-label="查看 {name} 詳情">`。`FeaturedCarousel` 函式本體和 5467bcc 逐字相同（自行執行 diff，無輸出）。測試：「FeaturedCarousel 便條卡連結」describe 7 項（連結、href、名稱、沒有巢狀互動元素、鍵盤聚焦暫停後恢復、滑鼠點擊不暫停、觸控點擊不黏住、視窗外的卡不在 tab 順序、base 寬度也是連結），既有的 18 項暫停／自動播放契約都還在。HomePage「點便條卡導向詳情頁」。10-UAT.md #5–#11 全部 pass（鍵盤聚焦、hover、點擊不黏住、reduced-motion、base 390） |
| 3 | 因卡片語意改變而改寫的測試只換成新語意（連結 role、href、accessible name），沒有刪除行為契約斷言，測試總數沒有減少 | ✓ VERIFIED | `npx vitest list \| wc -l` = 538（Phase 9 結束時 525）。四個檔對 5467bcc 的 diff 刪除行只有 `onImageClick`、`getByRole("button", { name: /查看/ })`、燈箱 img（「產品詳細圖片」）和 harness import。06-TEST-INVENTORY 中這四個檔的 63 列逐列對照見下方，全部都有對應的現存測試 |

**分數：** 3/3 事實驗證通過

### 必要產出物

| 產出物 | 預期 | 狀態 | 細節 |
|--------|------|------|------|
| `src/components/ProductCard.tsx` | 整張卡為單一 Link（grid／list） | ✓ VERIFIED | 兩個分支都用 `Link`，卡內沒有其他互動元素；破圖佔位、tag 列、傾斜角度都保留 |
| `src/pages/ProductPageTemplate.tsx` | 移除燈箱狀態與渲染 | ✓ VERIFIED | `ImageModal`、`selectedImage`、`handleImageClick` 都是 0 筆；剩下的 `onClick` 只有重新載入和格狀／列表切換 |
| `src/components/FeaturedCarousel.tsx` | NoteCard 改成 Link，狀態機不動 | ✓ VERIFIED | diff 只有 import Link、NoteCard 根元素（div→Link，加上 `block`、`to`、`aria-label`）和兩行註解 |
| 四個測試檔 | 新語意測試＋保留契約 | ✓ VERIFIED | ProductCard 27、Template 24、FeaturedCarousel 33、HomePage 15 |

### 關鍵連結

| 起點 | 終點 | 方式 | 狀態 | 細節 |
|------|------|------|------|------|
| ProductCard | `/products/:id`（ProductDetailPage） | `Link to=/products/${id}` | ✓ WIRED | 測試用 MemoryRouter＋Routes 探針驗證確實導向；UAT 在真實 API 資料上導向成功 |
| NoteCard | `/products/:id` | `Link` | ✓ WIRED | HomePage 測試和 UAT #6 |
| NoteCard Link focus | FeaturedCarousel `hasFocusWithin` | focus 事件冒泡到容器的 `onFocus` | ✓ WIRED | 「鍵盤聚焦便條卡連結時不自動切換，焦點離開後恢復」測試；UAT #7 |
| ImageModal | ProductDetailView | import | ✓ WIRED | 燈箱移到詳情頁（Phase 9），列表頁已沒有 |

### 資料流追蹤（Level 4）

| 產出物 | 資料變數 | 來源 | 有真實資料 | 狀態 |
|--------|----------|------|------------|------|
| ProductCard／NoteCard 的 href | `product.id` | `useProducts` → `fetchProducts`（後端公開 API） | 是（UAT 中 href 是後端 UUID） | ✓ FLOWING |

### 行為抽查

| 行為 | 指令 | 結果 | 狀態 |
|------|------|------|------|
| 全部測試 | `npm test` | 42 個檔，538 passed | ✓ PASS |
| Lint | `npm run lint` | 無輸出 | ✓ PASS |
| Build（含 tsc -b 與 dist 憑證掃描） | `npm run build` | built；「dist/ 檢查通過：3 個檔案」 | ✓ PASS |
| 測試數量 | `npx vitest list \| wc -l` | 538（≥ 525） | ✓ PASS |
| D-05 狀態機逐字未動 | `diff <(git show 5467bcc:…FeaturedCarousel.tsx \| sed -n '/^const FeaturedCarousel = /,$p') <(…目前檔案)` | 無輸出 | ✓ PASS |
| services／hooks／ImageModal 未變 | `git diff --stat 5467bcc -- src/services src/hooks src/components/ImageModal*` | 無輸出 | ✓ PASS |
| 變動範圍 | `git diff --name-only 5467bcc..HEAD -- src` | 只有預期的 7 個檔 | ✓ PASS |

### Probe 執行

本 phase 沒有宣告 probe，也沒有 `scripts/*/tests/probe-*.sh`，略過。

### 需求覆蓋

| 需求 | 來源計畫 | 說明 | 狀態 | 證據 |
|------|----------|------|------|------|
| LINK-01 | 10-01 | 點分類頁商品卡進入詳情頁（整張卡為單一連結，列表頁沒有燈箱） | ✓ SATISFIED | 事實 1 |
| LINK-02 | 10-02 | 從熱銷輪播進入詳情頁，輪播暫停行為不受影響 | ✓ SATISFIED | 事實 2 |

REQUIREMENTS.md 對應到 Phase 10 的需求只有 LINK-01 和 LINK-02，沒有孤立需求。REQUIREMENTS.md 的勾選狀態仍是 Pending，依指示不在這裡執行 mark-complete。

### 契約列對照（TEST-06／D-07）

用 `npx vitest list` 和 06-TEST-INVENTORY 對這四個檔做全名比對：inventory 63 列中，41 列全名完全相同，22 列已改名。改名的 22 列逐一對應如下：

| inventory 列（舊名） | 目前測試 | 改名 phase | 性質 |
|---|---|---|---|
| ProductCard 價格 > grid 有價：徽章與價格行各顯示一次… | grid 有價：priceText 只顯示一次，不出現價格洽詢 | 8 | 預定的調整斷言 |
| ProductCard 價格 > 只有 priceMax 有值時 grid 仍顯示價格徽章 | …仍顯示價格文字 | 8 | 同上 |
| ProductCard 價格 > grid 無價：顯示價格洽詢且沒有徽章 | grid 無價：顯示價格請來電，不出現價格洽詢 | 8 | 呈現 |
| ProductCard 價格 > list 無價：顯示價格洽詢 | list 無價：顯示價格請來電 | 8 | 呈現 |
| ProductCard 價格 > 價格洽詢使用灰色而非 accent 色 | 價格請來電 tag 使用 block-2 底而非 accent | 8 | 呈現 |
| ProductCard 描述 > grid 描述只顯示一行 | grid 不渲染說明段落 | 8 | 呈現 |
| ProductCard 描述 > grid 資訊區使用縮小的內距 py-4 px-5 | grid 卡內距 p-2 md:p-4（Phase 10 只把查詢 role 換成 link） | 8／10 | 呈現 |
| ProductCard 描述 > grid 價格行間距 mb-1…（有價） | 價格行位於標籤列（flex-wrap gap-2）：有價 | 8 | 呈現 |
| ProductCard 描述 > grid 價格洽詢行間距 mb-1… | 價格行位於標籤列（flex-wrap gap-2）：無價 | 8 | 呈現 |
| ProductCard 描述 > grid 長名稱＋有價＋長描述… | 圖片容器為 aspect-square 白底、名稱 line-clamp-2、無『點擊查看大圖』 | 8 | 呈現 |
| ProductCard 描述 > 有描述時顯示，且不顯示品牌、型號、現貨 | 有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期 | 8 | 契約（UI-SPEC 調整） |
| ProductCard 燈箱 > 有圖：…點擊呼叫 onImageClick 一次 | 圖片與連結 > 有圖：img src 為 imageUrl，整張卡為 href=/products/p1 的連結（img alt／src 斷言保留） | 10 | 卡片語意 |
| ProductCard 燈箱 > 鍵盤 Enter 開燈箱 | 鍵盤 Tab 聚焦卡片連結，Enter 導向 /products/p1 | 10 | 卡片語意 |
| ProductCard 燈箱 > 鍵盤 Space 開燈箱 | list：卡片為單一連結，沒有 role=button（inventory 預定移除 Space） | 10 | 卡片語意 |
| ProductCard 燈箱 > 缺圖：…點擊不開燈箱 | 缺圖：顯示佔位、無 button、無放大提示，卡仍為連結（佔位 role=img、無 button、無提示三項斷言保留） | 10 | 卡片語意 |
| ProductCard 燈箱 > 破圖：…點擊不開燈箱 | 破圖：onError 後顯示佔位，卡仍為連結（破圖佔位斷言保留） | 10 | 卡片語意 |
| ProductCard 燈箱 > 破圖後換成新圖片網址會重新顯示 img | 圖片與連結 > 同名（只改 describe 名稱，斷言不變） | 10 | 契約保留 |
| Template > 點有圖卡片會開燈箱顯示該圖 | 點有圖卡片導向 /products/{id}，不出現 dialog | 10 | 卡片語意 |
| Template > 缺圖商品…點擊不開燈箱 | 缺圖商品顯示「暫無圖片」佔位圖，點擊導向 /products/{id} 且不出現 dialog | 10 | 卡片語意 |
| Template > 有圖卡片以 Enter 開啟燈箱 | 有圖卡片以 Enter 導向 /products/{id} | 10 | 卡片語意 |
| Template > 同時顯示…「價格洽詢」 | 同時顯示…「價格請來電」 | 8 | 呈現 |
| HomePage > 首頁不顯示價格與價格洽詢 | 便條卡有價顯示 priceText、無價顯示價格請來電，且不出現價格洽詢 | 8 | 呈現（UI-SPEC 衝突，預定調整） |

指定的行為契約都還在：
- 排序：Template「query 鎖定 newest…」「一般頁面選最新優先…」，全名不變
- grid／list 切換：「切換列表檢視後 aria-pressed 更新，且仍顯示價格行」，全名不變
- 截斷提示：「truncated 為 true 時顯示截斷提示，false 時不顯示」，全名不變
- 價格 tag：ProductCard 價格顯示 8 項（Phase 10 只改 harness）
- 破圖佔位：ProductCard 破圖兩項、FeaturedCarousel「圖片載入失敗時改顯示佔位圖」「3 筆中第 2 張破圖…」
- 輪播暫停：inventory 的 FeaturedCarousel 18 列全名都在，Phase 10 對這些測試的 diff 只改了 `renderCarousel` 的 wrapper

**沒有任何 inventory 列找不到現存測試，沒有缺口。**

### 反模式掃描

7 個變動檔裡，`TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER` 都是 0 筆，沒有 stub，也沒有寫死的空資料。

| 檔案 | 行 | 模式 | 嚴重度 | 影響 |
|------|----|------|--------|------|
| — | — | 無 | — | — |

ℹ️ 資訊：FeaturedCarousel「觸控點在非按鈕區域後鍵盤焦點仍會暫停」的點擊目標（h3）現在位於 Link 內，情境和原本字面上的「非按鈕區域」不完全相同。斷言不變而且通過；「觸控點擊連結」這個情境另由新增測試涵蓋（10-02-SUMMARY 已記錄）。不影響目標。

### 需要人工驗證

真實瀏覽器 UAT（10-UAT.md，12 項全部 pass）已由主 session 完成。只剩下面兩項實機項目，延到 Phase 11 上線前處理，不算缺口：

#### 1. 實機觸控點卡片

**測試：** 在實機手機上點分類頁商品卡和首頁便條卡，並在便條卡上橫向滑動。
**預期：** 輕點後進入 `/products/{id}`；滑動時不會誤觸導向；點擊後輪播不會停住。
**為何需要人工：** 模擬無法重現實機的觸控判定。

#### 2. 實機返回一致性

**測試：** 從列表進入詳情頁後，分別用「← 回上一頁」和系統返回手勢返回。
**預期：** 兩者都回到原列表。
**為何需要人工：** 返回手勢只能在實機確認。

### 缺口摘要

沒有缺口。ROADMAP 三條成功標準在程式碼、測試與 UAT 都有證據；D-05 狀態機逐字未動；services、hooks、ImageModal 都沒有變動；測試數 538 ≥ 525；06-TEST-INVENTORY 中這四個檔的 63 列都有對應的現存測試。狀態是 human_needed 而不是 passed，原因只有上面兩項實機觸控檢查，已排到 Phase 11。

---

_驗證時間：2026-11-11T12:30:00Z_
_驗證者：Claude（gsd-verifier）_
