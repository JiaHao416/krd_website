---
phase: 2
slug: api
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-11-10
---

# Phase 2 — Validation Strategy

> 每個 phase 的驗證契約：執行期間的回饋取樣方式。本檔為 phase 完成後由 `/gsd-validate-phase 2` 依產出物回推（State B）建立。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.12（jsdom 31 + @testing-library/react 16 + @testing-library/jest-dom 7） |
| **Config file** | `vite.config.ts`（`test.projects`：`unit` = node 跑 `*.test.ts`；`component` = jsdom 跑 `*.test.tsx`，setup 為 `src/test/setup.ts`） |
| **Quick run command** | `npx vitest run <檔案或目錄>` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | 約 2 秒（12 個檔案、172 個測試，2026-11-10 實測 1.56s） |

---

## Sampling Rate

- **每次任務 commit 後：** 執行 `npx vitest run <相關檔案>`
- **每個 plan wave 後：** 執行 `npm test && npm run build`
- **`/gsd-verify-work` 之前：** 全部測試必須綠燈
- **最大回饋延遲：** 10 秒

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | UX-01、UX-02、PROD-06 | T-02-SC | 新增套件發行者與拼字由人工確認，版本鎖 caret，lockfile 已 commit | manual | —（blocking-human checkpoint） | — | ✅ green（人工核可） |
| 02-01-02 | 01 | 1 | UX-02 | — | N/A | unit | `npx vitest run src/services/products.test.ts src/services/errors.test.ts` | ✅ | ✅ green |
| 02-01-03 | 01 | 1 | UX-01、UX-02、PROD-06 | T-02-01、T-02-03 | 依賴改用 `JSON.stringify` 避免重抓；不自動重試；StrictMode 時 abort 前一次請求 | component | `npx vitest run src/hooks` | ✅ | ✅ green |
| 02-02-01 | 02 | 2 | PROD-01、PROD-03、PROD-07 | T-02-05、T-02-06、T-02-07 | 文字以 JSX 跳脫；圖片網址只放在 `img src`；測試 mock 掉網路 | component | `npx vitest run src/App.test.tsx src/pages/ProductPageTemplate.test.tsx src/services/catalog.test.ts` | ✅ | ✅ green |
| 02-02-02 | 02 | 2 | PROD-05、UX-01、UX-02、UX-03 | T-02-04、T-02-08 | 錯誤卡片只顯示 `getErrorMessage`，不洩漏後端原文 | component | `npx vitest run src/pages/ProductPageTemplate.test.tsx` | ✅ | ✅ green |
| 02-03-01 | 03 | 2 | PROD-02、PROD-03 | T-02-10、T-02-12 | JSX 跳脫；測試 mock 掉網路 | component | `npx vitest run src/pages/HomePage.test.tsx` | ✅ | ✅ green |
| 02-03-02 | 03 | 2 | UX-01、UX-02、UX-03 | T-02-09、T-02-11 | 錯誤框只顯示固定中文訊息；只能手動重試 | component | `npx vitest run src/components/FeaturedCarousel.test.tsx src/pages/HomePage.test.tsx` | ✅ | ✅ green |
| 02-04-01 | 04 | 3 | PROD-04、PROD-03 | T-02-13、T-02-14、T-02-15 | 破圖切換佔位、不重試；價格只用 `priceText` | component | `npx vitest run src/components/ProductCard.test.tsx` | ✅ | ✅ green |
| 02-04-02 | 04 | 3 | PROD-04、PROD-03 | — | N/A | component | `npx vitest run src/pages/ProductPageTemplate.test.tsx` | ✅ | ✅ green |
| 02-05-01 | 05 | 4 | 全部（phase gate） | T-02-17 | 原始碼無 `dangerouslySetInnerHTML`；商品頁／首頁無 `airTable` | integration | `npm test && npm run build && ! grep -rn "dangerouslySetInnerHTML" src` | ✅ | ✅ green |
| 02-05-02 | 05 | 4 | 全部（目視驗收） | T-02-16 | N/A | manual | —（human-verify checkpoint） | — | ✅ green（人工核可） |
| 02-06-01 | 06 | gap | PROD-04 | T-02-06-01、T-02-06-02 | 名稱 `line-clamp-2`、描述 `line-clamp-1` 截斷 | component | `npx vitest run src/components/ProductCard.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### 需求 → 測試對照

| Requirement | 主要測試 | 狀態 |
|-------------|----------|------|
| PROD-01 | `App.test.tsx`（8 條路徑各自以對應查詢呼叫後端）、`catalog.test.ts`（頁面 → 查詢字串） | COVERED |
| PROD-02 | `HomePage.test.tsx`（featured=1／2 各自呼叫並顯示） | COVERED |
| PROD-03 | `ProductPageTemplate.test.tsx`（img alt／src、點圖開燈箱）、`ProductCard.test.tsx` | COVERED |
| PROD-04 | `ProductCard.test.tsx`（單價、區間價、價格洽詢）、`format.test.ts` | COVERED |
| PROD-05 | `ProductPageTemplate.test.tsx`（選「最新優先」以 sort=newest 重新呼叫）、`catalog.test.ts` | COVERED |
| PROD-06 | `useProducts.test.tsx`（不快取：同參數重新掛載會再抓一次） | COVERED（真實後端快取時間另見人工驗證） |
| PROD-07 | `App.test.tsx`（`PRODUCT_PAGES` 路徑等於舊網址） | COVERED |
| UX-01 | `useProducts.test.tsx`、`ProductPageTemplate.test.tsx`、`FeaturedCarousel.test.tsx`（載入中） | COVERED |
| UX-02 | `ProductPageTemplate.test.tsx`（429、network、重新載入）、`FeaturedCarousel.test.tsx`、`errors.test.ts`（500） | COVERED |
| UX-03 | `ProductPageTemplate.test.tsx`、`FeaturedCarousel.test.tsx`、`HomePage.test.tsx`（空狀態） | COVERED |

---

## Wave 0 Requirements

現有測試基礎設施已涵蓋本 phase 全部需求（Wave 0 由 02-01 Task 2 建立：jsdom、Testing Library、`src/test/setup.ts`、Vitest 雙 project）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 新增 devDependency 的發行者與拼字合法 | —（T-02-SC） | 需人工到 npmjs.com 判斷 | 確認 jsdom、@testing-library/* 的官方發行者，版本與 RESEARCH 相符 |
| 家人在後台改商品後，重新整理即看到變更 | PROD-06 | 依賴真實後端與其快取時間，單元測試只能證明前端不快取 | 在 KRD-Inventory App 修改一筆商品，等待快取過期後重新整理 `www.krd.com.tw` 對應頁面 |
| 對 production API 目視驗收 8 個分類頁與首頁 | 全部 | 視覺與真實資料一致性需人眼確認 | 依 02-05-PLAN Task 2 步驟，在本機 dev proxy 下逐頁瀏覽 |

---

## Validation Sign-Off

- [x] 每個自動任務都有 `<automated>` 驗證，或依賴 Wave 0
- [x] 取樣連續性：沒有連續 3 個任務缺少自動驗證
- [x] Wave 0 涵蓋所有 MISSING 參照（無 MISSING）
- [x] 沒有 watch-mode 旗標（`npm test` = `vitest run`）
- [x] 回饋延遲 < 10s
- [x] frontmatter 已設定 `nyquist_compliant: true`

**Approval:** approved 2026-11-10

---

## Validation Audit 2026-11-10

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
