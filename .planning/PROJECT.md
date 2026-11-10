# KRD 官網（krd_website）

## What This Is

KRD 音響／麥克風盤商的品牌官網（`www.krd.com.tw`），給客戶瀏覽品牌、商品分類與熱銷商品。Vite + React 19 單頁應用，部署在 Cloudflare Pages（push 到 GitHub `main` 自動部署）。目前內容全部來自 Airtable；本輪要把它改成「商品讀後端公開 API、其餘內容為 repo 內靜態檔」，完全停用 Airtable。

## Core Value

官網顯示的商品必須與家人在 KRD-Inventory App 維護的後端資料一致，且前端程式中不再含任何憑證。

## Requirements

### Validated

<!-- 既有功能（由 .planning/codebase/ 分析推得） -->

- ✓ 首頁兩組熱銷商品輪播 — existing
- ✓ 8 個商品分類頁共用 `ProductPageTemplate`（grid/list 切換、名稱排序、點圖放大）— existing
- ✓ 關於我們頁 — existing
- ✓ 頂部導覽列（含 Logo）與商品頁側邊選單，RWD — existing
- ✓ Cloudflare Pages 自動部署；SPA 子路徑直接開啟回 200（2026-11-10 實測）— existing

### Active

- [ ] 8 個分類頁與首頁熱銷改讀後端公開 API `https://api.krd.com.tw/api/v1/public/products`（對照表見 BRIEF.md）
- [ ] 欄位改用 API 格式（`image_url`、`name`…）；價格為含稅「分」整數，顯示時 ÷100，`null` 時顯示「洽詢」類文字
- [ ] API base URL 改由 `VITE_` 環境變數設定；本機開發用 Vite proxy 繞過 CORS 白名單
- [ ] Logo 改用 `public/` 內圖片
- [ ] 導覽列（NavBar、SideMenu）改用程式內定義的選單清單，與 `App.tsx` 路由同一份來源
- [ ] 關於我們改用 repo 內內容檔（文字＋圖片下載進 repo）
- [ ] 移除 Airtable service 與寫死的 token
- [ ] 資料載入中與載入失敗（含被限流）有明確畫面，不再靜默顯示空白
- [ ] 導入 Vitest，為 API 層與資料轉換邏輯補單元測試
- [ ] 上線驗證後由 Owner 撤銷 Airtable token

### Out of Scope

- 商品詳情頁（`/products/:id`、變體）— 本輪專注替換 Airtable，留待下一輪
- 補 `public/_redirects` — 實測 Cloudflare Pages 已預設 SPA fallback，不需要
- Tailwind v3/v4 套件混裝、`@types/react-router-dom` v5 等依賴不一致 — 與停用 Airtable 無關且可能影響樣式，另案處理
- 配件拆子分類（開關、線材）— 後端已定案配件統一為分類「配件」
- 改寫 git 歷史移除舊 token — 撤銷 token 即可使其失效

## Context

- 後端 `../KRD-Inventory-Backend` Phase 15 已完成公開商品目錄 API（免登入、唯讀、限流每 IP 每分鐘 60 次、CORS 只允許 `https://www.krd.com.tw`、`https://krd.com.tw`）。回應格式 `{ success: true, data: { items, pagination } }`。
- Production（2026-11-10）：20 筆商品，喇叭 7、有線麥克風 5、無線麥克風 5、配件 3；全部 `show_price=false`（價格皆 `null`）；圖片在 `https://img.krd.com.tw`（Cloudflare R2）。
- 分類值是中文，query string 需 `encodeURIComponent`。
- 交接背景：`.planning/BRIEF.md`（後端 session 已與 Owner 定案的項目）。
- 既有程式碼分析：`.planning/codebase/`。重點：每個元件在 `useEffect` 自行抓資料；Airtable 錯誤被吞成 `[]`；`ProductView.tsx` 未被引用；無測試框架。
- Airtable 的 `logo`、`navigation`、`abouts` 內容由執行階段用現有 token 抓取轉成靜態檔（在撤銷 token 前完成）。

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
| 商品資料改接後端公開 API | 後端已是商品唯一來源；Airtable 不再更新 | — Pending |
| Logo／導覽列／關於我們改為 repo 靜態檔（依 BRIEF，取代先前「暫留 Airtable」） | 完全停用 Airtable 才能撤銷公開的 token；這些內容很少變動 | — Pending |
| 靜態內容由執行階段用現有 token 抓取 | 省去 Owner 手動匯出 | — Pending |
| 導覽清單與路由共用同一份定義 | 避免選單與路由不同步 | — Pending |
| 導入 Vitest | 使用者規則要求測試先行；與 Vite 原生整合 | — Pending |
| 本輪不做詳情頁、不清依賴 | 控制範圍，專注停用 Airtable | — Pending |

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
*Last updated: 2026-11-10 after initialization*
