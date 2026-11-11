# KRD 官網（krd_website）

## What This Is

KRD 音響／麥克風盤商的品牌官網（`www.krd.com.tw`），給客戶瀏覽品牌、商品分類與熱銷商品。Vite + React 19 單頁應用，部署在 Cloudflare Pages（push 到 GitHub `main` 自動部署）。v1.0 起商品讀 KRD 後端公開 API，Logo／導覽／關於我們為 repo 內靜態檔，已完全停用 Airtable、前端不含任何憑證。v1.1 起改為 C5a 深色「有人味」設計，有 `/products/:id` 商品詳情頁，聯絡區有 Google 地圖與店面照片。

## Current State

- **Shipped:** v1.1 UI 重新設計與商品詳情頁（2026-11-11，6 phases／26 plans，merge `a69e918`，詳見 `.planning/MILESTONES.md`）
- **Shipped:** v1.0 API 遷移與停用 Airtable（2026-11-10，5 phases／22 plans）
- 測試：Vitest 557 項；`npm run build` 內含 `tsc -b` 與 dist 憑證掃描；`designTokens.test.ts` 掃描禁用的 class
- production（www.krd.com.tw）已實測：詳情頁深連結、NotFound、8 條舊網址、輪播、RWD、地圖與店面照片
- 營業資訊（`src/config/contact.ts` 單一來源）：週一至週五 09:00-18:00、見紅休、(04) 2279-8787；Google 商家名「羽程企業社」

## Next Milestone Goals

尚未開立。候選項目（由使用者決定）：
- 待決定的設計問題：A5 兩組熱銷輪播版面、分類 tag 與麵包屑文字統一、便條卡 aria-label 符合 WCAG 2.5.3（IN-01）
- 實機確認：iOS safe-area 與剪貼簿、觸控手感、Windows antialias
- 依賴整理：Tailwind v3/v4 混裝（MAINT-V2-01）

<details>
<summary>v1.1 開發期間的 Current State 與 Milestone 說明（封存）</summary>


- **Shipped:** v1.0 API 遷移與停用 Airtable（2026-11-10，5 phases／22 plans，詳見 `.planning/MILESTONES.md`）
- 測試：Vitest 215 項；`npm run build` 內含 `tsc -b` 與 dist 憑證掃描
- 舊 Airtable token 已撤銷並確認失效
- v1.1 Phase 6 完成（2026-11-11）：UI-SPEC（C5a）核准、215 項測試盤點為契約 201／呈現 14、移除兩個未使用的 devDependencies
- v1.1 Phase 7 完成（2026-11-11）：商品詳情資料層（型別、service、錯誤分類、useProductDetail），測試 314 項
- v1.1 Phase 8 完成（2026-11-11）：C5a token、膠囊頂列、分類 chip、一行頁尾、手機撥號列、skip link，首頁／分類頁／關於我們改版；真實瀏覽器 UAT 通過，測試 413 項
- v1.1 Phase 9 完成（2026-11-11）：`/products/:id` 詳情頁（變體、價格、燈箱、複製詢價、麵包屑／返回、標題）、找不到商品與全域 NotFound；瀏覽器 UAT 通過，測試 525 項
- v1.1 Phase 10 完成（2026-11-11）：分類頁商品卡與首頁熱銷便條卡改為連到 `/products/{id}` 的單一連結，列表頁移除燈箱；輪播暫停行為不退步，卡片連結名稱只念商品名稱與價格；瀏覽器 UAT 通過，測試 541 項
- v1.1 Phase 11 完成（2026-11-11）：上線前追加移除「價格請來電」「洽詢交期」、營業時間改為週一至週五 09:00 - 18:00 見紅休、聯絡區嵌入 Google 地圖與店面照片；redesign 合併回 main 並 push（a69e918），www.krd.com.tw production 實測通過，測試 557 項

### 開發期間的 Milestone 說明：v1.1 UI 重新設計與商品詳情頁

**Goal:** 全站版面重新設計並新增商品詳情頁，在 `redesign` 分支開發、整套完成後再合併回 `main` 上線。

**Target features:**
- 共用骨架重設計（膠囊浮動頂列、分類 chip 列取代 SideMenu、一行頁尾、手機固定撥號列、Layout），一併修正 WR-04（1024px 導覽文字擠壓）
- 首頁重設計（含熱銷輪播，保留 WCAG 2.2.2 行為）
- 商品分類頁重設計（8 分類共用 Template，保留 grid/list、排序；整張卡改連到詳情頁，燈箱移到詳情頁主圖）
- 關於我們頁重設計
- 新增商品詳情頁 `/products/:id`（讀 `/public/products/:id`，含 variants；列表與輪播可點入）

**Key context:**
- 視覺方向未定，於 UI phase 用 sketch／UI-SPEC 探索後決定
- 只在本機預覽（`npm run dev` + Vite proxy 讀 production API），不改後端 CORS
- 技術棧不變、舊網址全數保留、前端不含憑證、每次提交 `npm run build` 必須通過

</details>

## Core Value

官網顯示的商品必須與家人在 KRD-Inventory App 維護的後端資料一致，且前端程式中不再含任何憑證。

## Requirements

### Validated

<!-- 既有功能（由 .planning/codebase/ 分析推得） -->

- ✓ 首頁兩組熱銷商品輪播 — existing
- ✓ 8 個商品分類頁共用 `ProductPageTemplate`（grid/list 切換、名稱排序；v1.1 起點卡片進詳情頁，不再放大圖）— existing
- ✓ 關於我們頁 — existing
- ✓ 頂部導覽列（含 Logo）與 RWD；v1.1 起商品頁側邊選單改為分類 chip — existing
- ✓ Cloudflare Pages 自動部署；SPA 子路徑直接開啟回 200（2026-11-10 實測）— existing
- ✓ API base URL 由 `VITE_API_BASE_URL` 設定；本機開發用 Vite proxy 繞過 CORS 白名單 — Validated in Phase 1: 測試與 API 資料層基礎
- ✓ 導入 Vitest，API 層與資料轉換邏輯有單元測試（80 項）— Validated in Phase 1: 測試與 API 資料層基礎
- ✓ 8 個分類頁與首頁熱銷改讀後端公開 API `https://api.krd.com.tw/api/v1/public/products`（對照表見 BRIEF.md） — Validated in Phase 2: 商品改讀後端 API
- ✓ 欄位改用 API 格式（`image_url`、`name`…）；價格為含稅「分」整數，顯示時 ÷100，`null` 時顯示「洽詢」類文字 — Validated in Phase 2: 商品改讀後端 API
- ✓ 資料載入中與載入失敗（含被限流）有明確畫面，不再靜默顯示空白 — Validated in Phase 2: 商品改讀後端 API
- ✓ Logo 改用 `public/` 內圖片 — Validated in Phase 3: 靜態內容固化與移除 Airtable
- ✓ 導覽列（NavBar、SideMenu）改用程式內定義的選單清單，與 `App.tsx` 路由同一份來源 — Validated in Phase 3: 靜態內容固化與移除 Airtable
- ✓ 關於我們改用 repo 內內容檔（文字＋圖片下載進 repo） — Validated in Phase 3: 靜態內容固化與移除 Airtable
- ✓ 移除 Airtable service 與寫死的 token — Validated in Phase 3: 靜態內容固化與移除 Airtable
- ✓ 新版官網在 www.krd.com.tw production 實測正常（商品、熱銷、Logo、導覽、關於我們） — Validated in Phase 4: 上線驗證與撤銷 token
- ✓ Owner 已撤銷舊官網 Airtable token，舊 token 經 whoami 確認失效，網站不受影響 — Validated in Phase 4: 上線驗證與撤銷 token
- ✓ 熱銷輪播符合 WCAG 2.2.2（hover／鍵盤焦點暫停、尊重減少動態；滑鼠與觸控點擊後不會停住）— v1.0（Phase 5）
- ✓ `npm run build` 自動擋下 dist 內的 Airtable 痕跡 — v1.0（Phase 5）
- ✓ UI-SPEC（C5a 溫暖在地小店 × 深石板藍）經使用者確認（DESIGN-01） — Validated in Phase 6: 設計鎖定與測試盤點
- ✓ 215 項測試盤點與總數基準，契約類標示不得刪除（TEST-06） — Validated in Phase 6: 設計鎖定與測試盤點
- ✓ 移除未使用的 `@tailwindcss/postcss` 與 `@types/react-router-dom`（MAINT-01） — Validated in Phase 6: 設計鎖定與測試盤點
- ✓ 詳情資料層 service／transform／hook 含 404／400／429 分類，有單元測試（TEST-05） — Validated in Phase 7: 詳情資料層
- ✓ 語意 token、字型堆疊、新版骨架（頂列、chip、頁尾、撥號列、skip link）與首頁／分類頁／關於我們改版（DESIGN-02/03、SHELL-01~04、UX-04~07） — Validated in Phase 8: Tokens、共用骨架與既有頁面改版
- ✓ 商品詳情頁、錯誤／找不到狀態、全域 NotFound、頁面標題（PROD-08~16） — Validated in Phase 9: 商品詳情頁 UI、路由與 NotFound
- ✓ 商品卡與熱銷便條卡連到詳情頁（LINK-01、LINK-02） — Validated in Phase 10: 連結接線
- ✓ 合併上線與 production 實測（REL-03、REL-04） — Validated in Phase 11: 收尾驗證與合併上線
- ✓ 無價商品不顯示任何價格文字，移除「洽詢交期」；聯絡區嵌入 Google 地圖（免金鑰）與店面照片 — v1.1（quick 261111-ibb、261111-k1m）

### Active

（下一個 milestone 開立時以 `/gsd-new-milestone` 定義）

### Out of Scope

- 補 `public/_redirects` — 實測 Cloudflare Pages 已預設 SPA fallback，不需要
- Tailwind v3/v4 套件混裝、`@types/react-router-dom` v5 等依賴不一致 — 與停用 Airtable 無關且可能影響樣式，另案處理
- 配件拆子分類（開關、線材）— 後端已定案配件統一為分類「配件」
- 改寫 git 歷史移除舊 token — 撤銷 token 即可使其失效
- 用 Google Places API 抓商家照片或地圖 — 需要 API 金鑰，違反前端不得含憑證；改用免金鑰嵌入與 repo 內靜態照片
- 在官網顯示「價格請來電」「洽詢交期」 — 使用者於 v1.1 上線前要求移除

## Context

- 後端 `../KRD-Inventory-Backend` Phase 15 已完成公開商品目錄 API（免登入、唯讀、限流每 IP 每分鐘 60 次、CORS 只允許 `https://www.krd.com.tw`、`https://krd.com.tw`）。回應格式 `{ success: true, data: { items, pagination } }`。
- Production（2026-11-11）：20 筆商品，喇叭 7、有線麥克風 5、無線麥克風 5、配件 3；每筆都只有 1 個變體、無價格、無說明；圖片在 `https://img.krd.com.tw`（Cloudflare R2）。
- 分類值是中文，query string 需 `encodeURIComponent`。
- 交接背景：`.planning/BRIEF.md`（後端 session 已與 Owner 定案的項目）。
- 既有程式碼分析：`.planning/codebase/`（已於 Phase 5 後同步為 v1.0 現況）。
- v1.0 已知技術債：WR-04 桌機導覽擠壓（v1.1 已隨重設計修正）、Tailwind v3/v4 混裝、少數未使用 export、輪播滑鼠拖出邊角情境。
- v1.1 程式規模：`src` 約 9,900 行 TS/TSX；設計規格 `.planning/milestones/v1.1-phases/06-design-lock/06-UI-SPEC.md`（C5a）。
- 店面照片在 `public/store/`（Gemini 修圖後轉 WebP，外觀照中間屏風與門口屏風兩側小字與現場略有出入）。

## Constraints

- **Tech stack**: 沿用 Vite 6 + React 19 + TypeScript + Tailwind + axios — 專案既有選擇
- **Compatibility**: 維持現有網址路徑（`/all-products`、`/wired-micphone`、`/trumpet`…）— 避免舊連結失效
- **Security**: 前端不得含任何憑證 — repo 公開，打包後也公開
- **Dependencies**: 依賴後端公開 API 的 CORS 白名單與限流；預覽網址 `*.pages.dev` 不在白名單內
- **Deployment**: push `main` 即上線 — 每次提交都必須 `npm run build` 成功（含 `tsc -b`）
- **Sequencing**: 必須在撤銷 Airtable token 前抓好靜態內容

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 商品資料改接後端公開 API | 後端已是商品唯一來源；Airtable 不再更新 | ✓ Good — Phase 2 上線；Phase 4 production 商品數與 API 一致 |
| Logo／導覽列／關於我們改為 repo 靜態檔（依 BRIEF，取代先前「暫留 Airtable」） | 完全停用 Airtable 才能撤銷公開的 token；這些內容很少變動 | ✓ Good — Phase 3 完成；Phase 4 撤銷 token 後網站正常 |
| 靜態內容由執行階段用現有 token 抓取 | 省去 Owner 手動匯出 | ✓ Good — Phase 3 抓取完成，token 已於 Phase 4 撤銷 |
| 導覽清單與路由共用同一份定義 | 避免選單與路由不同步 | ✓ Good — NAV_ITEMS 衍生自 PRODUCT_PAGES |
| 導入 Vitest | 使用者規則要求測試先行；與 Vite 原生整合 | ✓ Good — npm test 持續把關（含 noAirtable 掃描） |
| 本輪不做詳情頁、不清依賴 | 控制範圍，專注停用 Airtable | ✓ Good — 範圍維持在停用 Airtable，詳情頁與依賴整理留待下一輪 |
| 加開 Phase 5 清理稽核技術債 | v1.0 稽核為 tech_debt，趁重設計前先清乾淨 | ✓ Good — WR-06、WR-01 與範本殘留皆修正 |
| check:dist 接進 `npm run build` | 讓 Cloudflare 建置時自動擋下憑證殘留 | ✓ Good — 反向測試確認會失敗 |
| 輪播以指標事件序列判斷點擊焦點，不用 `:focus-visible` | jsdom 無法區分 `:focus-visible`，無法測試 | ✓ Good — 滑鼠／觸控／鍵盤三路徑 UAT 通過 |
| UI 重設計排在 v1.0 之後、另開分支 | `main` push 即上線，半成品不能上線 | ✓ Good — v1.1 在 `redesign` 開發，上線前才合併 |
| 重設計期間測試不減、契約斷言不刪（TEST-06） | 確保改版不悄悄丟掉行為 | ✓ Good — 215 → 557 項，63 條契約全數保留 |
| 每個 phase 由主 session 做真實瀏覽器 UAT | 子代理沒有瀏覽器工具；jsdom 測不到版面與焦點 | ✓ Good — 抓到 Logo 對比、分類卡直排等問題 |
| push 前用 production 模式 bundle 在本機 preflight | `*.pages.dev` 不在 CORS 白名單，無法預覽部署 | ✓ Good — 上線後 production 實測零問題 |
| 地圖用免金鑰 Google 嵌入、照片放 repo 靜態檔 | 前端不得含憑證；照片屬網站內容 | ✓ Good — 已上線 |
| 無價商品不顯示任何價格元素 | 使用者要求移除「價格請來電」 | — Pending（若日後開價需再看版面） |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-11 after v1.1 milestone*
