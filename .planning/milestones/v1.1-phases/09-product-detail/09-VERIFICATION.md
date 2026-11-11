---
phase: 09-product-detail
verified: 2026-11-11T11:55:00Z
status: passed
score: 5/5 roadmap 成功標準通過（PROD-08～16 共 9/9 滿足，D-01～D-15 共 15/15 符合）
overrides_applied: 0
deferred:
  - truth: "實機手機剪貼簿（iOS Safari 權限）、實機觸控（固定列、燈箱關閉）、production 出現多變體或有價商品時用真實資料再看一次版面"
    addressed_in: "Phase 11"
    evidence: "Phase 11 目標：「redesign 安全合併回 main 並上線，且 production 上所有關鍵行為都經過實測」；09-UAT.md human-needed 段落明列延到 Phase 11"
---

# Phase 9：商品詳情頁 UI、路由與 NotFound 驗證報告

**Phase 目標：** 訪客可直接開啟 `/products/:id`，看到完整商品資訊，並在各種異常網址或錯誤下得到明確的畫面
**驗證時間：** 2026-11-11T11:55:00Z
**狀態：** passed
**重新驗證：** 否（初次驗證）

## 目標達成

### 可觀察的事實（ROADMAP 成功標準）

| # | 事實 | 狀態 | 證據 |
|---|------|------|------|
| 1 | 詳情頁顯示主圖、名稱、品牌、型號、分類、說明（純文字保留換行）、保固（0／空值隱藏）；可切換變體（規格、SKU、圖片、現貨），預設選中後端預設變體；無變體時顯示單一規格 | ✓ VERIFIED | `ProductDetailView.tsx`：`whitespace-pre-line` 純文字節點；`buildSpecRows` 保固 `>0` 才加列；`selectedId` 初值 `defaultVariantId`；價格、現貨、SKU、主圖都由 `selected` 推導；`VariantSelector` 少於 2 個變體回傳 null（radiogroup、roving tabindex、方向鍵、Home/End）。對應測試 `ProductDetailView.test.tsx` 第 126～206 行；UAT #1、#11、#12 |
| 2 | 無價顯示價格請來電文案並附聯絡按鈕，有價顯示含稅；主圖可開燈箱；可一鍵複製「名稱＋型號＋網址」 | ✓ VERIFIED | `PriceBlock.tsx` 依 `priceText===null` 切換「價格請來電」與「含稅」；`DetailCta`（md+）、`DetailMobileBar`（base）都有 `tel:` 撥號鈕；主圖 `<button>` 開啟 `ImageModal`（無圖時用 `ImagePlaceholder`，不是按鈕）；`buildInquiryText` 格式為 `{name}｜型號 {model}｜{url}`，沒有型號時省略中段；`useCopyInquiry` 2 秒還原、卸載時清除計時器、失敗時顯示文案。文案依 CONTEXT D-01 改為「價格請來電」，屬已授權決策 |
| 3 | 麵包屑回分類／返回上一頁；直接開網址有可用返回連結 | ✓ VERIFIED | `location.key !== "default"` 時為 `navigate(-1)` 按鈕，否則為 `<Link to={category.path}>`「← 回到{分類}」；`findCategoryPage` 由 `PRODUCT_PAGES` 反查，找不到時退回 `/all-products`。測試第 241～261 行；UAT #6a、#6b |
| 4 | 不存在／無效網址顯示「找不到商品」；限流／網路錯誤顯示可重試畫面；任何不存在網址顯示 NotFound | ✓ VERIFIED | `ProductDetailPage.tsx` 的 notFound 分支使用 `NotFoundState`；error 分支有 `role="alert"`、`isRateLimited` 專屬文案、「重新載入」呼叫 `retry`；`App.tsx` 新增 `<Route path="*" element={<NotFoundPage />}>`。App.test 涵蓋未知路徑、`/products`、非 UUID；UAT #7、#8、#9 |
| 5 | 分頁標題與 description 顯示商品名稱；不引入列表請求；測試總數不減 | ✓ VERIFIED | 使用 React 19 原生 `<title>`／`<meta name="description">`，沒有新依賴；卸載後還原有測試（ProductDetailPage.test 第 134 行）。詳情相關檔案中 `useProducts|fetchProducts` 出現 0 次；App.test 第 142 行斷言不呼叫列表 API；UAT #2。`npx vitest list \| wc -l` = 516（> 413） |

**分數：** 5/5

### D-01～D-15 逐項核對

| 決策 | 結果 | 證據 |
|------|------|------|
| D-01 價格請來電、format.ts 不改 | ✓ | PriceBlock 文案與 UI-SPEC 相同；`src/services` 的 diff 為空 |
| D-02 findCategoryPage | ✓ | `src/config/categoryPage.ts` 與測試；`catalog.ts` 未改 |
| D-03 返回按鈕兩種情況 | ✓ | 見事實 3 |
| D-04 標題與 description | ✓ | `{name} \| KRD`、「找不到商品 \| KRD」、「找不到頁面 \| KRD」；description 取前 80 個 code point，沒有說明時改用品牌、型號、分類 |
| D-05 NotFoundState／NotFoundPage | ✓ | 兩個版本的按鈕與連結目標正確；8 條舊路由與 `/`、`/abouts` 未動（App.tsx diff 只有 +6 行） |
| D-06 非 UUID 不發請求 | ✓ | 沿用 Phase 7 hook；App.test 第 156 行、UAT #8 請求數 0 |
| D-07 可重試錯誤 | ✓ | 見事實 4；`ERROR_MESSAGES` 未改 |
| D-08 複製詢價 | ✓ | 兩處共用頁面持有的 `useCopyInquiry`；外層 `aria-live="polite"` |
| D-09 變體 radiogroup | ✓ | 見事實 1 |
| D-10 燈箱 | ✓ | 關閉鈕 `aria-label="關閉圖片"`；`ImageModal.tsx` 的 diff 為空 |
| D-11 手機雙鈕固定列 | ✓ | Layout 新增 `mobileBar` slot，預設仍為 `MobileCallBar`；只有 success 才傳入 DetailMobileBar（`grid-cols-[2fr_3fr]`、`shadow-float`、`md:hidden`） |
| D-12 骨架、無列表 API、無 innerHTML | ✓ | `aria-busy="true"` 骨架；src 非測試檔中 `innerHTML` 出現 0 次；另有測試確認 HTML 字樣以字面文字呈現 |
| D-13 測試、lint、build 全綠，契約不刪 | ✓ | 見下方實測 |
| D-14 真實瀏覽器 UAT | ✓ | `09-UAT.md` 12 項 pass（320／768／1440） |
| D-15 main 同步 | ✓ | `git merge-base --is-ancestor main HEAD` 成立；沒有 push |

### 必要產出物

| 產出物 | 狀態 | 說明 |
|--------|------|------|
| `src/pages/ProductDetailPage.tsx` | ✓ VERIFIED | 4 種狀態，有掛到 `/products/:id` |
| `src/components/ProductDetailView.tsx` | ✓ VERIFIED | 由頁面渲染，資料來自 `useProductDetail` → 後端 |
| `src/components/{VariantSelector,PriceBlock,SpecTable,DetailCta,DetailMobileBar,NotFoundState}.tsx` | ✓ VERIFIED | 都有被 View 或 Page 使用 |
| `src/pages/NotFoundPage.tsx` | ✓ VERIFIED | 有掛到 `*` 路由 |
| `src/config/categoryPage.ts`、`src/pages/productDetailText.ts`、`src/hooks/useCopyInquiry.ts` | ✓ VERIFIED | 純函式與 hook 都有測試，也都有被使用 |

### 關鍵接線

| 從 | 到 | 方式 | 狀態 |
|----|----|------|------|
| App.tsx | ProductDetailPage / NotFoundPage | `<Route path="/products/:id">`、`<Route path="*">` | WIRED |
| ProductDetailPage | useProductDetail → 後端詳情 API | `useParams` 的 id | WIRED（UAT XHR 只打 `/api/v1/public/products/{id}`） |
| ProductDetailPage | Layout.mobileBar | 只有 success 時傳入 DetailMobileBar | WIRED |
| DetailCta／DetailMobileBar | useCopyInquiry | 頁面持有 status 與 copy，傳給兩處 | WIRED |

### 行為實測（本驗證者親自執行）

| 項目 | 指令 | 結果 | 狀態 |
|------|------|------|------|
| 測試 | `npm test` | 42 個檔案，516/516 通過 | ✓ PASS |
| Lint | `npm run lint` | No issues | ✓ PASS |
| Build | `npm run build` | tsc + vite 成功，dist 掃描通過 | ✓ PASS |
| 測試數 | `npx vitest list \| wc -l` | 516（> 413） | ✓ PASS |
| 範圍 | `git diff a50689c..HEAD -- src/services` 與 4 個既有 hooks、ImageModal、package*.json | 空 | ✓ PASS |
| 契約保護 | 既有測試檔的刪除行數（`^-[^-]`） | 0 | ✓ PASS |
| 路由 | `git diff a50689c..HEAD -- src/App.tsx` | 只有 +6 行（2 個 import、2 條 Route） | ✓ PASS |
| 文案 | 對照 UI-SPEC Copywriting Contract | 找不到商品／找不到頁面／可重試錯誤／429／重新載入／無價／含稅／有現貨／洽詢交期／複製詢價訊息／複製詢價／已複製／複製失敗／打電話問 {phone}／打電話問問／← 回上一頁（備援：回到{分類}）全部一致 | ✓ PASS |

### Probe 執行

不適用（本 phase 沒有宣告 probe）。

### 需求覆蓋

| 需求 | 狀態 | 證據 |
|------|------|------|
| PROD-08 | ✓ SATISFIED | 事實 1 |
| PROD-09 | ✓ SATISFIED | 事實 1 |
| PROD-10 | ✓ SATISFIED | 事實 2（「洽詢」依 D-01 與已核准的 UI-SPEC 改為「價格請來電」） |
| PROD-11 | ✓ SATISFIED | 事實 2 |
| PROD-12 | ✓ SATISFIED | 事實 3 |
| PROD-13 | ✓ SATISFIED | 事實 4 |
| PROD-14 | ✓ SATISFIED | 事實 2 |
| PROD-15 | ✓ SATISFIED | 事實 5 |
| PROD-16 | ✓ SATISFIED | 事實 4 |

沒有孤立需求。REQUIREMENTS.md 的勾選與 traceability 表仍是 Pending，屬文件狀態，由 orchestrator 更新。

### 反模式掃描

src 內 TBD／FIXME／XXX／TODO 出現 0 次；沒有空實作或寫死的空資料流到畫面。`index.css` 把焦點去框選擇器從 `[tabindex="-1"]` 收窄為 `main[tabindex="-1"]`，這是刻意修正，讓變體 chip 保留焦點環（UAT #12 已確認外框）。

### 觀察（不阻擋）

- 分類 tag 顯示後端原始分類（例如「喇叭」），麵包屑顯示分類頁標題（「擴大機 / 喇叭」）。UI-SPEC 沒有規定，留給使用者決定。
- 有價時顯示 `NT$12,345`，UI-SPEC 範例為 `NT$ 12,345`。這是 D-01 鎖定 format.ts 不改的結果。

### 需要人工驗證

本 phase 沒有。實機剪貼簿、觸控與真實多變體資料依計畫延到 Phase 11（見 frontmatter `deferred`）。

### 缺口總結

沒有缺口。路由、4 種狀態、變體、價格、燈箱、複製、返回、標題、NotFound 都已實作並接線，有單元或元件測試，也經過真實瀏覽器 UAT。範圍限制（services、hooks、依賴、契約測試）都經實測確認沒有被破壞。

---

_驗證時間：2026-11-11T11:55:00Z_
_驗證者：Claude（gsd-verifier）_
