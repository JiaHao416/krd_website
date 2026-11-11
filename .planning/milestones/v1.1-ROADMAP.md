# Roadmap: KRD 官網（krd_website）

## Milestones

- ✅ **v1.0 API 遷移與停用 Airtable** — Phases 1-5（shipped 2026-11-10）
- 🚧 **v1.1 UI 重新設計與商品詳情頁** — Phases 6-11（開發分支 `redesign`，進行中）

## Phases

<details>
<summary>✅ v1.0 API 遷移與停用 Airtable（Phases 1-5）— SHIPPED 2026-11-10</summary>

- [x] Phase 1: 測試與 API 資料層基礎（4/4 plans）— completed 2026-11-10
- [x] Phase 2: 商品頁與首頁熱銷改讀後端 API（6/6 plans）— completed 2026-11-10
- [x] Phase 3: 靜態內容固化與移除 Airtable（4/4 plans）— completed 2026-11-10
- [x] Phase 4: 上線驗證與撤銷 token（3/3 plans）— completed 2026-11-10
- [x] Phase 5: 清理技術債（5/5 plans）— completed 2026-11-10

完整內容：[milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### 🚧 v1.1 UI 重新設計與商品詳情頁（進行中）

**Milestone 目標：** 在 `redesign` 分支重做全站外觀並新增商品詳情頁；只有最後一個 phase 才合併到 `main`（push 即上線），且須經使用者確認。

**全 milestone 共通限制：**

- 重設計只動 JSX、className、tokens；`services/`、hooks、輪播事件邏輯不動，`services/` 只新增不修改。
- 每個 commit 都須通過 `npm test`、`npm run lint`、`npm run build`（含 check:dist）。
- 每個 phase 結束時把 `main` 合併進 `redesign`，避免長壽分支漂移。
- 測試總數不得減少（TEST-06）。

- [x] **Phase 6: 設計鎖定與測試盤點** - 鎖定視覺方向與 UI-SPEC、盤點 215 項測試、清掉無用依賴（不寫 UI 程式碼） (completed 2026-11-11)
- [x] **Phase 7: 詳情資料層** - 以 TDD 完成商品詳情的型別、service、transform、hook 與錯誤分類 (completed 2026-11-11)
- [x] **Phase 8: Tokens、共用骨架與既有頁面改版** - 套用設計 token 與字型，改版為膠囊頂列、分類 chip（取代 SideMenu）、一行頁尾與手機固定撥號列，並改版首頁、分類頁、關於我們（不改連結語意） (completed 2026-11-11)
- [x] **Phase 9: 商品詳情頁 UI、路由與 NotFound** - 完成 `/products/:id` 頁面、各種狀態、頁面標題與全域 NotFound (completed 2026-11-11)
- [x] **Phase 10: 連結接線** - 分類頁卡片與熱銷輪播連到詳情頁（唯一改變測試語意的 phase） (completed 2026-11-11)
- [x] **Phase 11: 收尾驗證與合併上線** - 全綠檢查、經使用者確認後合併 `main`，並在 production 實測 (completed 2026-11-11)

## Phase Details

### Phase 6: 設計鎖定與測試盤點

**Goal**: 使用者確認視覺方向與 UI-SPEC，並且重設計前的測試保護網已盤點清楚；此 phase 不寫任何 UI 程式碼
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: DESIGN-01, TEST-06, MAINT-01
**Success Criteria** (what must be TRUE):

  1. UI-SPEC 已寫成文件，包含視覺方向、語意 token（色彩、字級、間距、圓角、陰影）、字型堆疊、單一斷點表、元件狀態與價格為空的版面，且使用者已明確確認
  2. UI-SPEC 依已定案的「整張卡連到詳情頁、燈箱移到詳情頁主圖」畫出卡片與詳情頁版面，決定熱銷輪播詳情連結的位置；`contact.ts` 欄位定案（地址、電話、營業時間沿用現有資料，LINE／Email 選填，有值才顯示）
  3. 現有 215 項測試已分成「行為契約」與「呈現」兩類清單，契約類（role、accessible name、路由、錯誤狀態）有明確標示不得刪除，並記錄測試總數基準
  4. `@tailwindcss/postcss` 與 `@types/react-router-dom` 已以獨立 commit 移除，`npm run build`、`npm test`、`npm run lint` 皆通過

**Plans**: 4 plans

Plans:
**Wave 1**

- [x] 06-01-PLAN.md — 測試盤點文件：基準、規則與資料層／低影響檔案 157 列（TEST-06）
- [x] 06-02-PLAN.md — 確認 DESIGN-01，依 D-13 同步 SHELL-02／ROADMAP／PROJECT 文字

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-03-PLAN.md — MAINT-01：兩個獨立 commit 移除未使用依賴（含 CSS sha256 比對與文件同步）

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 06-04-PLAN.md — 盤點補上高影響 4 檔與 accessible name 清單（總數 215）、STATE 基準、D-17 合併與 phase gate

**UI hint**: yes

### Phase 7: 詳情資料層

**Goal**: 前端能以真實後端契約取得單一商品詳情，並把成功、找不到、限流、網路錯誤四種結果分得清楚
**Depends on**: Phase 6（可與設計確認並行，但依序排在其後）
**Requirements**: TEST-05
**Success Criteria** (what must be TRUE):

  1. 以真實 API 回應（curl 實測，含 null 邊界）確認過欄位，詳情型別與 transform 不重用列表的 `toProduct`，價格為 null 時不會出現 `NT$NaN`
  2. 後端回 404 或 400 時資料層分類為「找不到」，回 429、5xx 或網路失敗時分類為「可重試錯誤」，並有單元測試涵蓋
  3. 詳情 hook 提供 loading／成功／找不到／錯誤四種狀態，切換商品或卸載時會取消進行中的請求，每次造訪只發出一個請求
  4. 新增測試後測試總數高於 Phase 6 基準，且 `noAirtable.test.ts` 的掃描範圍涵蓋新增檔案

**Plans**: 3 plans

Plans:
**Wave 1**

- [x] 07-01-PLAN.md — 落檔 API 實測樣本＋TDD 詳情型別與 toProductDetail（TEST-05）

**Wave 2**

- [x] 07-02-PLAN.md — TDD isUuid、classifyDetailError 與 fetchProductDetail（TEST-05）

**Wave 3**

- [x] 07-03-PLAN.md — TDD useProductDetail hook＋收尾檢查（總數 > 215、main 同步、不 push）（TEST-05）

### Phase 8: Tokens、共用骨架與既有頁面改版

**Goal**: 訪客看到全站一致的新版外觀，在各種螢幕寬度與裝置上都能順暢瀏覽，既有功能與舊網址完全不變
**Depends on**: Phase 6（UI-SPEC 確認後）
**Requirements**: DESIGN-02, DESIGN-03, SHELL-01, SHELL-02, SHELL-03, SHELL-04, UX-04, UX-05, UX-06, UX-07
**Success Criteria** (what must be TRUE):

  1. 全站樣式只使用 `tailwind.config.js` 的語意 token，程式碼中不再有散落的寫死色碼；中文在 Windows、Mac、手機都顯示對應的黑體且不載入 CJK webfont
  2. 訪客在 320–1440px 各寬度都能正常使用 NavBar（1024px 不擠壓、不折行），列表頁可用分類 chip 列切換分類（桌機／平板可換行，手機單列橫向捲動），取代舊 SideMenu
  3. 首頁聯絡區顯示地址、電話、營業時間，其他頁一行頁尾與「打電話問問」按鈕提供聯絡方式；關於我們、首頁聯絡區與頁尾來自同一份 `src/config/contact.ts`；LINE／Email 有設定才顯示
  4. 鍵盤使用者可用 skip link 跳到主內容，所有可互動元素都有清楚的焦點樣式
  5. 新版首頁熱銷輪播仍有 hover／焦點暫停、尊重減少動態、點擊後不停住的行為，並已通過真實瀏覽器 UAT；分類頁仍可切換 grid/list、依名稱排序，8 條舊網址皆正常；商品圖片有固定長寬比與載入失敗替代畫面，載入時版面不跳動

**Plans**: TBD
**UI hint**: yes

### Phase 9: 商品詳情頁 UI、路由與 NotFound

**Goal**: 訪客可直接開啟 `/products/:id`，看到完整商品資訊，並在各種異常網址或錯誤下得到明確的畫面
**Depends on**: Phase 7, Phase 8
**Requirements**: PROD-08, PROD-09, PROD-10, PROD-11, PROD-12, PROD-13, PROD-14, PROD-15, PROD-16
**Success Criteria** (what must be TRUE):

  1. 訪客開啟詳情頁看到主圖、名稱、品牌、型號、分類、說明（純文字保留換行）與保固（0 或空值時隱藏），可切換變體（規格、SKU、圖片、有無現貨），預設選中後端標記的預設變體，沒有變體時顯示單一規格
  2. 價格為空時顯示「洽詢」並附聯絡按鈕，有價格時顯示含稅價格；訪客可點主圖以燈箱放大，並可一鍵複製「商品名稱＋型號＋網址」的詢價訊息
  3. 訪客可由麵包屑回到所屬分類或返回上一頁，直接開啟網址時也有可用的返回連結
  4. 商品不存在或網址無效時顯示「找不到商品」，限流與網路錯誤時顯示可重試的錯誤畫面；任何不存在的網址都顯示 NotFound 頁而不是空白頁
  5. 瀏覽器分頁標題與 description 顯示該商品名稱；詳情頁不引入新的商品列表請求，且新增測試不使測試總數減少

**Plans**: TBD
**UI hint**: yes

### Phase 10: 連結接線

**Goal**: 訪客能從分類頁與首頁熱銷輪播進入商品詳情頁，且既有的輪播無障礙行為不退步
**Depends on**: Phase 9
**Requirements**: LINK-01, LINK-02
**Success Criteria** (what must be TRUE):

  1. 訪客點分類頁的商品卡片進入該商品詳情頁，整張卡為單一連結，列表頁不再出現燈箱
  2. 訪客可從熱銷輪播進入商品詳情頁，聚焦連結時輪播仍暫停，hover、減少動態、點擊後不停住的行為不變，並再次通過真實瀏覽器 UAT
  3. 因卡片語意改變而改寫的測試，僅調整為新語意（連結 role、href、accessible name），行為契約類斷言未被刪除，測試總數不減少

**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — 商品卡改為單一 Link、列表頁移除燈箱（LINK-01）
- [x] 10-02-PLAN.md — 熱銷便條卡改為 Link，輪播狀態機不動（LINK-02）
- [x] 10-03-PLAN.md — 收尾總檢、瀏覽器 UAT、main 同步

### Phase 11: 收尾驗證與合併上線

**Goal**: `redesign` 安全合併回 `main` 並上線，且 production 上所有關鍵行為都經過實測
**Depends on**: Phase 10
**Requirements**: REL-03, REL-04
**Success Criteria** (what must be TRUE):

  1. 合併前 `npm test`、`npm run lint`、`npm run build` 全綠，`main` 已先合併進 `redesign` 並解決衝突
  2. 使用者明確確認後才 push `main`（push 即 production 部署），未經確認不會合併
  3. 上線後於 production 實測：詳情頁深連結重新整理可正常顯示、不存在的商品與路由顯示對應的找不到畫面、8 條舊網址正常、熱銷輪播行為正確、各螢幕寬度版面正常

**Plans**: 3 plans

Plans:
**Wave 1**

- [x] 11-01-PLAN.md — 合併前檢查（main 同步、全綠、測試數 ≥ 541、dist grep）與本機 production bundle preflight（REL-03）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 11-02-PLAN.md — 本地 main `--no-ff` 合併、使用者明確同意後 push、等 Cloudflare 部署完成（REL-03）

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 11-03-PLAN.md — production 實測 11-UAT.md 與回滾判定（REL-04）

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. 測試與 API 資料層基礎 | v1.0 | 4/4 | Complete | 2026-11-10 |
| 2. 商品頁與首頁熱銷改讀後端 API | v1.0 | 6/6 | Complete | 2026-11-10 |
| 3. 靜態內容固化與移除 Airtable | v1.0 | 4/4 | Complete | 2026-11-10 |
| 4. 上線驗證與撤銷 token | v1.0 | 3/3 | Complete | 2026-11-10 |
| 5. 清理技術債 | v1.0 | 5/5 | Complete | 2026-11-10 |
| 6. 設計鎖定與測試盤點 | v1.1 | 4/4 | Complete    | 2026-11-11 |
| 7. 詳情資料層 | v1.1 | 3/3 | Complete    | 2026-11-11 |
| 8. Tokens、共用骨架與既有頁面改版 | v1.1 | 8/8 | Complete    | 2026-11-11 |
| 9. 商品詳情頁 UI、路由與 NotFound | v1.1 | 5/5 | Complete    | 2026-11-11 |
| 10. 連結接線 | v1.1 | 3/3 | Complete    | 2026-11-11 |
| 11. 收尾驗證與合併上線 | v1.1 | 3/3 | Complete    | 2026-11-11 |
