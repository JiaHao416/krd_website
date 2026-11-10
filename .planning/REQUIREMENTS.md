# Requirements: KRD 官網（krd_website）

**Defined:** 2026-11-10
**Core Value:** 官網顯示的商品必須與家人在 KRD-Inventory App 維護的後端資料一致，且前端程式中不再含任何憑證。

## v1 Requirements

### 商品資料（PROD）

- [x] **PROD-01**: 訪客在 8 個分類頁（`/all-products`、`/new-products`、`/micgo-products`、`/krd-products`、`/wired-micphone`、`/wireless-micphone`、`/trumpet`、`/accessories`）看到的商品，與後端公開 API 依 BRIEF.md 對照表查詢的結果一致
- [x] **PROD-02**: 訪客在首頁兩組熱銷輪播看到的商品，分別等於 API `featured=1`、`featured=2` 的結果
- [x] **PROD-03**: 訪客看到的每張商品卡片顯示後端的商品名稱與圖片（`img.krd.com.tw`），點圖仍可放大
- [x] **PROD-04**: 有價格的商品顯示含稅價（API 分 ÷100，min≠max 時顯示區間）；價格為 `null` 時顯示「洽詢」類文字
- [x] **PROD-05**: 訪客在分類頁選「最新」排序時，順序依後端 `sort=newest`（`published_at`）
- [x] **PROD-06**: 家人在後台修改商品（上下架、名稱、圖片、熱銷）後，訪客重新整理頁面即看到變更（受後端快取時間限制）
- [x] **PROD-07**: 現有網址路徑全部維持可用，舊連結不失效

### 靜態內容（STAT）

- [ ] **STAT-01**: 訪客看到的 Logo 來自 repo `public/` 內的圖片，外觀與現行一致
- [ ] **STAT-02**: 導覽列（桌機 NavBar、手機選單）與商品頁側邊選單的項目與順序與現行一致，且與 `App.tsx` 路由取自同一份定義
- [ ] **STAT-03**: 關於我們頁的文字與圖片與現行一致，內容來自 repo 內的內容檔，圖片存放於 repo

### 錯誤處理（UX）

- [x] **UX-01**: 商品資料載入期間，訪客看到載入中狀態
- [x] **UX-02**: API 失敗（網路錯誤、5xx、429 限流）時，訪客看到明確的錯誤訊息與重試按鈕，而非空白頁
- [x] **UX-03**: 查詢成功但沒有商品時（例如分類尚無商品），訪客看到「目前沒有商品」之類的空狀態

### 設定與安全（SEC）

- [ ] **SEC-01**: 打包後的前端程式（`dist/`）不含任何 Airtable 網址、token 或 Base ID
- [x] **SEC-02**: API base URL 由 `VITE_` 環境變數設定，未設定時預設為 production `https://api.krd.com.tw/api/v1/public`
- [x] **SEC-03**: 開發者在本機 `npm run dev` 時能透過 Vite proxy 讀到商品資料（不被 CORS 白名單擋下）
- [ ] **SEC-04**: Airtable service、相關型別與未使用的 `ProductView.tsx` 自 repo 移除

### 測試（TEST）

- [x] **TEST-01**: 專案可用 `npm test` 執行 Vitest
- [x] **TEST-02**: API 回應 → 畫面資料的轉換（欄位對應、價格換算、`null` 價格）有單元測試
- [x] **TEST-03**: 分類頁 → API 查詢參數的對照（含中文分類 encode）有單元測試
- [x] **TEST-04**: API 錯誤（網路、非 2xx、`success:false`）會被轉成可辨識的錯誤，有單元測試

### 上線（REL）

- [ ] **REL-01**: 部署到 `www.krd.com.tw` 後，所有頁面在 production 實測正常（商品、熱銷、Logo、導覽、關於我們）
- [ ] **REL-02**: 上線確認後，Owner 撤銷 Airtable token，網站仍正常運作

## v2 Requirements

延後處理，不在本輪 roadmap。

### 商品

- **PROD-V2-01**: 訪客可點進商品詳情頁（`/products/:id`）查看規格與各變體價格／圖片
- **PROD-V2-02**: 商品卡片顯示是否有現貨（`in_stock`）

### 維護

- **MAINT-V2-01**: 清除依賴不一致（Tailwind v3/v4 混裝、`@types/react-router-dom` v5）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 補 `public/_redirects` | 2026-11-10 實測 Cloudflare Pages 已預設 SPA fallback，子路徑回 200 |
| 配件拆子分類（開關、線材） | 後端已定案配件統一為分類「配件」 |
| 改寫 git 歷史移除舊 token | 撤銷 token 後即失效，改寫公開 repo 歷史成本高 |
| Logo／導覽／關於我們的後台管理 | 內容很少變動，靜態檔即可 |
| `*.pages.dev` 預覽網址讀得到商品 | 不在後端 CORS 白名單；預覽站顯示錯誤狀態可接受 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-02 | Phase 1 | Complete |
| SEC-03 | Phase 1 | Complete |
| TEST-01 | Phase 1 | Complete |
| TEST-02 | Phase 1 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 1 | Complete |
| PROD-01 | Phase 2 | Complete |
| PROD-02 | Phase 2 | Complete |
| PROD-03 | Phase 2 | Complete |
| PROD-04 | Phase 2 | Complete |
| PROD-05 | Phase 2 | Complete |
| PROD-06 | Phase 2 | Complete |
| PROD-07 | Phase 2 | Complete |
| UX-01 | Phase 2 | Complete |
| UX-02 | Phase 2 | Complete |
| UX-03 | Phase 2 | Complete |
| SEC-01 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| STAT-01 | Phase 3 | Pending |
| STAT-02 | Phase 3 | Pending |
| STAT-03 | Phase 3 | Pending |
| REL-01 | Phase 4 | Pending |
| REL-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-10*
*Last updated: 2026-11-10 after initial definition*
