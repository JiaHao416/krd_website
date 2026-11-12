# Phase 10: 連結接線 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Mode:** `--auto`（使用者授權全自動）

<domain>
## Phase Boundary

把分類頁商品卡（`ProductCard` grid/list）與首頁熱銷便條卡（`FeaturedCarousel`）改為連到 `/products/{id}` 的單一 `<Link>`，移除列表頁的燈箱，並確認輪播 WCAG 2.2.2 行為不退步、再做一次真實瀏覽器 UAT。這是本里程碑唯一改變既有測試語意的 phase。

需求：LINK-01、LINK-02。UI 契約：`.planning/phases/06-design-lock/06-UI-SPEC.md` §商品卡 `ProductCard`（Phase 10 接線）、§熱銷便條卡（含「既有輪播行為契約如何保留」與「對 Phase 8 / Phase 10 測試的影響」）。

</domain>

<decisions>
## Implementation Decisions

[--auto] Selected all gray areas: 卡片連結語意、燈箱移除範圍、輪播連結與暫停、測試改寫規則、A5 版面、UAT。

### 商品卡（LINK-01）
- **D-01:** `ProductCard` 根元素改為 `<Link to={`/products/${product.id}`}>`（grid 與 list 皆同），移除 `role="button"`、`tabIndex`、`onClick`、`onKeyDown`、`onImageClick` prop 與「查看 … 大圖」aria-label；卡內不得再嵌其他互動元素。accessible name 由卡內文字組成（UI-SPEC）。外觀、tag、破圖佔位、skeleton 不變；hover／focus-visible 依 UI-SPEC（2px accent，不改版面尺寸）。
- **D-02:** `ProductPageTemplate` 移除 `ImageModal` 狀態與渲染、`handleImageClick`／關閉處理；`ImageModal` 元件本身保留（詳情頁使用）。ImageModal 自身測試不動。
- **D-03:** 列表頁不得再出現 dialog：新增測試「點卡片不開燈箱、導向 /products/{id}」（以 MemoryRouter + Routes 斷言路徑）。

### 熱銷便條卡（LINK-02）
- **D-04:** 便條卡由 Phase 8 的非連結 `<div>` 改為 `<Link to={`/products/${id}`} aria-label={`查看 ${name} 詳情`}>`，樣式不變；「查看詳情 →」／手機「詳情 →」保留為卡內文字（非獨立連結，`aria-hidden` 或納入 name 皆可，但不得產生巢狀互動元素）。
- **D-05:** 輪播狀態機（activeIndex、intervalMs、isHovered、hasFocusWithin、isPointerDownRef 與 pointer/focus/blur 處理、Phase 8 的 base 不自動與 WR-03 對齊 effect）**一律不動**，只改便條卡元素。新增測試：便條卡為 link、href、accessible name；鍵盤聚焦連結時暫停、離開恢復；滑鼠點擊連結（pointerdown→focus）不黏住（沿用既有手法）。
- **D-06:** md+ 視窗外的卡不渲染（不在 tab 順序內）——沿用 Phase 8 行為，以測試確認 tab 順序只含視窗內 3 張。

### 測試改寫規則（TEST-06／成功標準 3）
- **D-07:** 只允許把「卡片語意」相關斷言改為新語意（role `button`→`link`、`href`、accessible name「查看 X 大圖」→卡內文字／「查看 X 詳情」）；行為契約斷言（排序、grid/list、截斷提示、價格 tag、破圖佔位、輪播暫停各項）一律保留。燈箱相關測試（列表頁「點卡片開大圖」等）依 06-TEST-INVENTORY 的預定處置改寫為「點卡片導向詳情頁」，不是刪除。每個改寫在 SUMMARY 列「舊斷言 → 新斷言」與 inventory 列對照；`npx vitest list | wc -l` 不得低於 525。
- **D-08:** 每個 commit `npm test`、`npm run lint`、`npm run build` 全綠；TDD（RED 只記錄於 SUMMARY）；元件改動造成其他測試檔失敗時，該測試調整必須在同一 commit。`src/services/`、既有 hooks 不改；designTokens 掃描持續通過。

### A5（兩組輪播版面）
- [auto] Q: "使用者尚未回覆 A5 截圖，是否改版面？" → Selected: "維持 Phase 8 現狀（兩組各自控制列），不阻擋；Phase 11 上線前再列入使用者確認清單"（recommended；兩組獨立是契約測試）
- **D-09:** 不改兩組輪播的版面結構。

### UAT
- **D-10:** 收尾 plan 由主 session 以 chrome-devtools MCP 實測：分類頁點卡片進詳情（grid／list 各一）、無燈箱；首頁兩組便條卡點擊進詳情；Tab 聚焦便條卡連結時輪播暫停、離開恢復；hover 暫停；觸控點擊後（指標移開）不黏住；reduced-motion 與 base 不自動；從列表進詳情後「← 回上一頁」回到列表（站內歷史）。結果寫 `10-UAT.md`。
- **D-11:** Phase 結束時檢查 main 是否有新 commit（有則本地合併，衝突 abort 回報），永不 push。

### Claude's Discretion
planner 可決定計畫切分；不得改變 D-01（整卡單一連結、無燈箱）、D-05（狀態機不動）、D-07（契約斷言不刪、數量不減）。

</decisions>

<canonical_refs>
## Canonical References

- `.planning/phases/06-design-lock/06-UI-SPEC.md` — §商品卡、§熱銷便條卡、§既有輪播行為契約、§對 Phase 8 / Phase 10 測試的影響
- `.planning/phases/06-design-lock/06-TEST-INVENTORY.md` — ProductCard／ProductPageTemplate／FeaturedCarousel／HomePage 各列的預定處置
- `.planning/phases/08-shell-redesign/08-04-SUMMARY.md`、`08-05-SUMMARY.md`、`08-REVIEW.md`（WR-03 對齊 effect、IN：ProductCard role=button 留給 Phase 10）
- `.planning/phases/09-product-detail/09-REVIEW.md`（WR-01：詳情頁互連後複製狀態重置——已修，Phase 10 UAT 再確認）
- `.planning/REQUIREMENTS.md` LINK-01/02；`.planning/ROADMAP.md` §Phase 10
- 程式：`src/components/ProductCard.tsx`、`FeaturedCarousel.tsx`、`src/pages/ProductPageTemplate.tsx`、`HomePage.tsx` 與其測試

</canonical_refs>

<code_context>
## Existing Code Insights
- 測試 525 項（Phase 9 結束）。
- `/products/:id` 路由與詳情頁已存在（Phase 9）。

</code_context>

<deferred>
## Deferred Ideas
- A5 版面調整（待使用者回覆）
- 分類 tag 顯示原始分類 vs 分類頁標題（待使用者回覆）

</deferred>

---

*Phase: 10-link-wiring*
*Context gathered: 2026-11-11（--auto）*
