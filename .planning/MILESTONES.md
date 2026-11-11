# Milestones

## v1.1 UI 重新設計與商品詳情頁 (Shipped: 2026-11-11)

**Phases completed:** 6 phases（6–11）, 26 plans；另有 2 個上線前 quick task

**Delivered:** 官網改為 C5a「有人味」的深色設計，新增 `/products/:id` 商品詳情頁，分類頁商品卡與首頁熱銷便條卡都能點進詳情頁；聯絡區接上 Google 地圖與店面照片。已合併 main 並上線（merge `a69e918`），production 實測通過。

**Key accomplishments:**

- 鎖定 C5a 設計規格（UI-SPEC、示意稿）與 63 條測試契約清單，作為重設計期間「測試不減、契約不刪」的依據
- 商品詳情資料層：service、transform、`useProductDetail`，404／400／429 分類與重試，欄位以真實 API 回應確認
- 語意 token 與共用骨架（膠囊頂列、分類 chip、頁尾、手機撥號列、skip link），首頁、分類頁、關於我們全面改版，designTokens 掃描防止回退
- 商品詳情頁：變體選擇（roving tabindex）、價格、燈箱、複製詢價、麵包屑與返回、頁面標題，以及商品與全域 NotFound
- 商品卡與熱銷便條卡改為連到詳情頁的單一連結，列表頁移除燈箱，輪播 WCAG 2.2.2 暫停行為不退步
- 上線前依使用者要求：移除「價格請來電」「洽詢交期」，營業時間改週一至週五 09:00-18:00 見紅休，嵌入 Google 地圖（免金鑰）與三張店面照片
- 測試 215 → 557 項；每個 phase 皆有真實瀏覽器 UAT，上線後 production 實測 7 項全過

**Stats:** 152 commits on redesign（2026-11-10 → 2026-11-11）；`src` 76 files changed，+6659／−2518；`src` 約 9,900 行 TS/TSX

**Known deferred items at close:** 7（see STATE.md Deferred Items）。其中 6 項為 audit-open 誤判（UAT 皆 passed、quick task SUMMARY 皆 complete），1 項為實機確認（Phase 10 human_needed）

**Tech debt / 待決定：**

- A5：首頁熱銷兩組輪播各自有控制列，示意稿只有一組
- 詳情頁分類 tag 顯示原始分類「喇叭」，麵包屑顯示「擴大機 / 喇叭」
- IN-01：便條卡 `aria-label` 未包含可見文字「查看詳情」（WCAG 2.5.3），需改 UI-SPEC
- 實機項目：iOS safe-area 與剪貼簿、觸控手感、Windows antialias、真實多變體資料
- redesign 上的 merge 後文件 commit 尚未進 main（僅文件）

**Archive:** [v1.1-ROADMAP](milestones/v1.1-ROADMAP.md) · [v1.1-REQUIREMENTS](milestones/v1.1-REQUIREMENTS.md)

---

## v1.0 API 遷移與停用 Airtable (Shipped: 2026-11-10)

**Phases completed:** 5 phases, 22 plans

**Delivered:** 官網商品改讀 KRD 後端公開 API，Logo／導覽／關於我們改為 repo 靜態檔，前端與打包結果不再含任何 Airtable 憑證，舊 token 已撤銷。

**Key accomplishments:**

- 導入 Vitest（unit 為 node、component 為 jsdom），API client、資料轉換、錯誤分類皆有測試；本機以 Vite proxy 讀 production API
- 8 個商品分類頁與首頁兩組熱銷輪播改讀 `api.krd.com.tw` 公開 API，載入／錯誤（含限流）／空狀態都有明確畫面
- Logo、導覽列、關於我們固化為 repo 靜態內容，導覽與路由共用 `PRODUCT_PAGES` 單一來源；刪除 Airtable service
- production 實測全站正常後撤銷舊 Airtable token，whoami 確認 401 失效，網站不受影響
- `npm run build` 串接 dist 憑證掃描，含 Airtable 痕跡即建置失敗、不會部署
- 清理技術債：熱銷輪播符合 WCAG 2.2.2（hover／鍵盤焦點暫停、尊重減少動態，滑鼠與觸控點擊後不會停住）、移除 Vite 範本殘留、修正 favicon 與 `lang`

**Known deferred items at close:** 0（audit-open 全數清空）

**Tech debt carried forward:**

- WR-04：1024px 桌機導覽文字擠壓／折行（併入 UI 重新設計）
- Tailwind v3/v4 套件混裝、`@types/react-router-dom` v5（MAINT-V2-01）
- 部分僅檔內或測試使用的 export
- 輪播邊角情境：滑鼠在輪播非可聚焦區按下後拖出放開，下一次鍵盤焦點可能有一次不暫停（05-05 SUMMARY）

**Archive:** [v1.0-ROADMAP](milestones/v1.0-ROADMAP.md) · [v1.0-REQUIREMENTS](milestones/v1.0-REQUIREMENTS.md) · [v1.0-MILESTONE-AUDIT](milestones/v1.0-MILESTONE-AUDIT.md)

---
