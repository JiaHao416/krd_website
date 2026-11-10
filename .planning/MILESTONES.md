# Milestones

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
