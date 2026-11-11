# Requirements: KRD 官網（krd_website）

**Defined:** 2026-11-10
**Milestone:** v1.1 UI 重新設計與商品詳情頁（開發分支 `redesign`）
**Core Value:** 官網顯示的商品必須與家人在 KRD-Inventory App 維護的後端資料一致，且前端程式中不再含任何憑證。

## v1.1 Requirements

### 設計基礎（DESIGN）

- [x] **DESIGN-01**: 視覺方向、設計 token（色彩、字級、間距、圓角、陰影）、字型堆疊與斷點表寫成 UI-SPEC，經使用者確認後才寫 UI 程式碼
- [x] **DESIGN-02**: 全站樣式使用 `tailwind.config.js` 的語意 token，不再散落寫死的色碼
- [x] **DESIGN-03**: 中文字型在 Windows、Mac、手機都顯示對應的黑體（字型堆疊補 `PingFang TC`、`Noto Sans TC`，不載入 CJK webfont）

### 共用骨架（SHELL）

- [x] **SHELL-01**: 訪客在 320–1440px 各寬度都能正常使用新版 NavBar，1024px 導覽文字不再擠壓或折行（WR-04）
- [x] **SHELL-02**: 訪客在列表頁可用分類 chip 列切換分類（桌機／平板可換行，手機單列橫向捲動），取代舊 SideMenu
- [x] **SHELL-03**: 訪客可以找到地址、電話、營業時間：首頁「有空來店裡坐坐」聯絡區完整呈現三者，其他頁以一行頁尾（地址、營業時間）＋頂列／手機底部固定列的「打電話問問」提供電話（單一來源 `src/config/contact.ts`；LINE／Email 有設定才顯示）
- [x] **SHELL-04**: 鍵盤使用者可用 skip link 跳到主內容，所有可互動元素都有清楚的焦點樣式

### 既有頁面改版（UX）

- [x] **UX-04**: 訪客看到新版首頁，熱銷輪播保有 WCAG 2.2.2 行為（hover／焦點暫停、尊重減少動態、滑鼠與觸控點擊後不停住），並通過真實瀏覽器 UAT
- [x] **UX-05**: 訪客在新版分類頁仍可切換 grid/list、依名稱排序；8 條舊網址皆正常
- [x] **UX-06**: 訪客看到新版關於我們頁，聯絡資訊與 Footer 同一來源
- [x] **UX-07**: 商品圖片有固定長寬比與載入失敗的替代畫面，載入時版面不跳動

### 商品詳情頁（PROD）

- [x] **PROD-08**: 訪客開啟 `/products/:id` 可看到商品主圖、名稱、品牌、型號、分類、說明（純文字保留換行）與保固（保固為 0 或空值時隱藏）
- [x] **PROD-09**: 訪客可看到並切換變體（規格屬性、SKU、圖片、是否有現貨），預設選中後端標記的預設變體；沒有變體時顯示單一規格
- [x] **PROD-10**: 價格為空時顯示「洽詢」並附聯絡按鈕；有價格時顯示含稅價格
- [x] **PROD-11**: 訪客可點詳情頁主圖以燈箱放大
- [x] **PROD-12**: 訪客可透過麵包屑回到所屬分類，或返回上一頁；直接開啟網址時也有可用的返回連結
- [x] **PROD-13**: 商品不存在或網址無效（後端 404／400）時顯示「找不到商品」；限流與網路錯誤時顯示可重試的錯誤畫面
- [x] **PROD-14**: 訪客可一鍵複製「商品名稱＋型號＋網址」的詢價訊息
- [x] **PROD-15**: 瀏覽器分頁標題與 description 顯示該商品名稱
- [x] **PROD-16**: 任何不存在的網址都顯示 NotFound 頁，不再是空白頁

### 連結接線（LINK）

- [x] **LINK-01**: 訪客點分類頁的商品卡片進入該商品詳情頁（整張卡為單一連結，列表頁不再有燈箱）
- [x] **LINK-02**: 訪客可從熱銷輪播進入商品詳情頁，輪播暫停行為不受影響

### 品質與維護（TEST／MAINT）

- [x] **TEST-05**: 詳情頁資料層（service、transform、hook，含 404／400／429 分類）有單元測試，欄位以真實 API 回應確認
- [x] **TEST-06**: 重設計過程中測試總數不減少；行為契約類斷言（role、accessible name、路由、錯誤狀態）不得刪除
- [x] **MAINT-01**: 移除未使用的 `@tailwindcss/postcss` 與 `@types/react-router-dom`（獨立 commit，build 通過）

### 上線（REL）

- [x] **REL-03**: `redesign` 合併回 `main` 前 test、lint、build 全綠，經使用者確認後才 push
- [x] **REL-04**: 上線後於 production 實測：詳情頁深連結重新整理、找不到商品、8 條舊網址、輪播、RWD

## Future Requirements

延後處理，不在本輪 roadmap。

- **PROD-F-01**: 「新品」徽章（上架天數閾值待 Owner 決定；已有 `/new-products` 頁）
- **PROD-F-02**: 詳情頁「相關商品」區塊（多一次 API 請求，限流壓力）
- **PROD-F-03**: 商品級 OG／LINE 分享預覽與 JSON-LD（純 CSR 爬蟲不執行 JS，需 Pages Functions 或預渲染）
- **PROD-F-04**: 分類篩選與站內搜尋
- **MAINT-F-01**: Tailwind v4 升級（重設計完成後單獨進行）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 購物車／結帳 | 盤商型錄站，轉換為洽詢 |
| 顯示庫存數量 | API 只回 `in_stock` 布林 |
| 評論、比較、會員登入 | 與盤商洽詢流程無關 |
| 詢價表單後端 | 需新後端與防濫用，改用複製詢價訊息＋既有聯絡管道 |
| 無限捲動、多圖縮圖 | 商品數少；API 只有單一主圖與變體圖 |
| 新增 `public/404.html` 或 `_redirects` | 會關閉 Cloudflare Pages SPA fallback；改用前端 `*` 路由 |
| `*.pages.dev` 預覽讀得到商品 | 不在後端 CORS 白名單；只在本機以 Vite proxy 預覽 |
| 更換技術棧／升級 router v7、Vite 大版本 | 無必要，維持既有選擇 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESIGN-01 | Phase 6 | Complete |
| TEST-06 | Phase 6 | Complete |
| MAINT-01 | Phase 6 | Complete |
| TEST-05 | Phase 7 | Complete |
| DESIGN-02 | Phase 8 | Complete |
| DESIGN-03 | Phase 8 | Complete |
| SHELL-01 | Phase 8 | Complete |
| SHELL-02 | Phase 8 | Complete |
| SHELL-03 | Phase 8 | Complete |
| SHELL-04 | Phase 8 | Complete |
| UX-04 | Phase 8 | Complete |
| UX-05 | Phase 8 | Complete |
| UX-06 | Phase 8 | Complete |
| UX-07 | Phase 8 | Complete |
| PROD-08 | Phase 9 | Complete |
| PROD-09 | Phase 9 | Complete |
| PROD-10 | Phase 9 | Complete |
| PROD-11 | Phase 9 | Complete |
| PROD-12 | Phase 9 | Complete |
| PROD-13 | Phase 9 | Complete |
| PROD-14 | Phase 9 | Complete |
| PROD-15 | Phase 9 | Complete |
| PROD-16 | Phase 9 | Complete |
| LINK-01 | Phase 10 | Complete |
| LINK-02 | Phase 10 | Complete |
| REL-03 | Phase 11 | Complete |
| REL-04 | Phase 11 | Complete |

**Coverage:**
- v1.1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-11-10*
*Last updated: 2026-11-10 after roadmap creation (Phases 6-11 mapped)*
