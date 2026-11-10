# Roadmap: KRD 官網（krd_website）

## Overview

把官網從 Airtable 整個切換出來：先建立測試與 API 資料層，再讓商品頁與首頁熱銷改讀後端公開 API，接著在 token 仍有效時把 Logo／導覽／關於我們固化成 repo 靜態檔並移除 Airtable 程式，最後在 production 實測後由 Owner 撤銷 token。每個 phase 結束時網站都必須可運作（`npm run build` 通過），因為 push 到 `main` 即自動部署。

## Phases

- [x] **Phase 1: 測試與 API 資料層基礎** - 導入 Vitest、建立 API client／轉換邏輯與 Vite proxy，皆有單元測試 (completed 2026-11-10)
- [x] **Phase 2: 商品頁與首頁熱銷改讀後端 API** - 8 個分類頁與首頁輪播顯示後端資料，含載入／錯誤／空狀態 (completed 2026-11-10)
- [x] **Phase 3: 靜態內容固化與移除 Airtable** - Logo、導覽、關於我們改為 repo 靜態內容，移除 Airtable 程式與 token (completed 2026-11-10)
- [ ] **Phase 4: 上線驗證與撤銷 token** - production 實測全站正常後，由 Owner 撤銷 Airtable token

## Phase Details

### Phase 1: 測試與 API 資料層基礎

**Goal**: 開發者能用 `npm test` 跑測試，並在本機 `npm run dev` 透過 proxy 讀到後端商品資料；API 呼叫與資料轉換邏輯已有測試保護
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):

  1. 開發者執行 `npm test` 能跑 Vitest，且全部測試通過
  2. 開發者在本機 `npm run dev` 時，能透過 Vite proxy 取得後端商品 JSON，不被 CORS 擋下
  3. API base URL 由 `VITE_` 環境變數控制，未設定時預設指向 production `https://api.krd.com.tw/api/v1/public`
  4. 單元測試涵蓋：API 回應轉畫面資料（含價格 ÷100、`null` 價格）、分類頁到查詢參數對照（含中文 encode）、網路／非 2xx／`success:false` 錯誤轉換
  5. `npm run build` 成功，現有網站行為不變

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — 導入 Vitest、VITE_API_BASE_URL、Vite dev proxy，並建立 client 與 fetchProducts 最薄端到端切片（Wave 1）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — 價格格式與 API 商品 → 畫面 Product 轉換，含單元測試（Wave 2）
- [x] 01-03-PLAN.md — 商品頁／首頁熱銷查詢設定與 buildProductParams，斷言中文 encode 查詢字串（Wave 2）

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — ApiError 錯誤分類與中文訊息，fetchProducts 完整化（驗證、轉換、不重試、筆數警告）（Wave 3）

### Phase 2: 商品頁與首頁熱銷改讀後端 API

**Goal**: 訪客在所有商品頁與首頁看到的商品，與家人在後台維護的資料一致，且載入、失敗、無資料都有明確畫面
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):

  1. 訪客在 8 個分類頁看到的商品，與 BRIEF 對照表查詢結果一致，且所有現有網址仍可開啟
  2. 首頁兩組熱銷輪播分別顯示 `featured=1`、`featured=2` 的商品；卡片顯示後端名稱與圖片，點圖可放大
  3. 有價格的商品顯示含稅價（區間時顯示範圍），價格為 `null` 時顯示「洽詢」類文字
  4. 訪客選「最新」排序時，順序依後端 `published_at`；後台修改商品後重新整理即看到變更
  5. 載入中顯示載入狀態；API 失敗（網路、5xx、429）顯示錯誤訊息與重試按鈕；無商品時顯示「目前沒有商品」

**Plans:** 6/6 plans complete

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — 套件合法性確認、jsdom／Testing Library 測試環境、fetchProducts 支援取消、useProducts hook（Wave 1，含 checkpoint）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — 8 個分類頁由設定產生路由並讀後端，含載入／錯誤重試／空／排序淡化／截斷（Wave 2）

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — 首頁兩組熱銷輪播改讀 featured=1／2，各自處理載入／錯誤／空狀態（Wave 3）
- [x] 02-04-PLAN.md — ProductCard 元件：價格、破圖佔位、鍵盤開燈箱，商品頁改用（Wave 3）

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-05-PLAN.md — Phase gate 自動檢查與本機對 production API 目視驗收、Pages 建置確認（Wave 4，含 checkpoint）
**UI hint**: yes

### Phase 3: 靜態內容固化與移除 Airtable

**Goal**: Logo、導覽列、關於我們都來自 repo 內靜態檔，且打包後的前端完全不含 Airtable 憑證
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: STAT-01, STAT-02, STAT-03, SEC-01, SEC-04
**Success Criteria** (what must be TRUE):

  1. 訪客看到的 Logo 來自 `public/` 內圖片，外觀與現行一致（須在撤銷 token 前用現有 token 抓取完成）
  2. 桌機 NavBar、手機選單與商品頁側邊選單的項目與順序與現行一致，且與 `App.tsx` 路由取自同一份定義
  3. 關於我們頁的文字與圖片與現行一致，內容來自 repo 內容檔，圖片存放於 repo
  4. Airtable service、相關型別與未使用的 `ProductView.tsx` 已移除，`dist/` 搜尋不到 Airtable 網址、token 或 Base ID
  5. `npm run build` 成功，全站頁面可正常瀏覽

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — 導覽與 Logo 切片：PRODUCT_PAGES 改現行選單順序、NAV_ITEMS 單一來源、SideMenu／NavBar 改讀靜態清單、Logo 存入 public/brand-logo.png（Wave 1）
- [x] 03-02-PLAN.md — 關於我們切片：6 張圖存入 public/abouts/、ABOUT_SERVICES 內容檔、AboutPage 改讀靜態內容（Wave 1）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-03-PLAN.md — 刪除 Airtable service 與 ProductView、原始碼掃描測試、npm run check:dist、文件更新（Wave 2）

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-04-PLAN.md — Phase gate 自動檢查＋使用者本機目視驗收後 push（Wave 3）

**UI hint**: yes

### Phase 4: 上線驗證與撤銷 token

**Goal**: 新版官網在 production 實測正常後，Airtable token 被撤銷且網站不受影響
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: REL-01, REL-02
**Success Criteria** (what must be TRUE):

  1. 在 `www.krd.com.tw` 實測，商品分類頁、首頁熱銷、Logo、導覽、關於我們全部顯示正常
  2. Owner 手動撤銷 Airtable token（本流程最後一步，須在 REL-01 通過後）
  3. 撤銷後重新整理 production 網站，所有頁面仍正常運作

**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 測試與 API 資料層基礎 | 4/4 | Complete   | 2026-11-10 |
| 2. 商品頁與首頁熱銷改讀後端 API | 6/6 | Complete   | 2026-11-10 |
| 3. 靜態內容固化與移除 Airtable | 4/4 | Complete    | 2026-11-10 |
| 4. 上線驗證與撤銷 token | 0/TBD | Not started | - |
