---
phase: 2
slug: api
status: verified
threats_open: 0
asvs_level: 1
created: 2026-11-10
---

# Phase 2 — Security

> 每個 phase 的安全契約：威脅登記表、接受風險紀錄與稽核軌跡。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| 瀏覽器 → 後端公開 API | 商品資料由 `services/products` 取得（唯讀，無憑證） | 商品名稱、描述、圖片 URL、價格（公開資料） |
| 後端回應 → React 渲染 | 後端字串進入 JSX | 不受信任文字與圖片 URL |
| 開發環境 → 本機 dev server | 冒煙測試時短暫開啟 :5199 | 無敏感資料 |
| npm registry → 專案 | 測試依賴安裝 | 第三方套件 |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation / Evidence | Status |
|-----------|----------|-----------|-------------|-----------------------|--------|
| T-02-SC | Tampering | npm 測試依賴 | mitigate | package.json:23-26,36 皆為 caret 版本；package-lock.json 已受 git 追蹤 | closed |
| T-02-01 | DoS | useProducts effect deps | mitigate | src/hooks/useProducts.ts:54 以 `JSON.stringify(buildProductParams(...))` 為依賴；無自動重試（僅手動 retry，:58）；useProducts.test.tsx:135-143 斷言新物件字面值不重新請求（呼叫 1 次） | closed |
| T-02-04 | Info Disclosure | ProductPageTemplate 錯誤卡 | mitigate | ProductPageTemplate.tsx:48 只渲染 `getErrorMessage(error)`；ProductPageTemplate.test.tsx:152-158 斷言「後端原始訊息XYZ」不出現 | closed |
| T-02-05 | XSS | ProductCard 名稱/描述 | mitigate | 全 src 無 `dangerouslySetInnerHTML`（grep 為空）；ProductCard.tsx 以 JSX 文字節點渲染 | closed |
| T-02-06 | Tampering | 圖片 URL | mitigate | imageUrl 僅用於 `<img src>`（ProductCard.tsx:73,135；FeaturedCarousel.tsx:135；ImageModal.tsx:94）；ProductCard/ImageModal 無 href 或 style 使用 URL | closed |
| T-02-07 | Info Disclosure | 元件測試 | mitigate | 各測試 `vi.mock("../services/products")` 與 Layout（ProductPageTemplate.test.tsx:13-16、HomePage.test.tsx:13-16、App.test.tsx:12-15、useProducts.test.tsx:13）；ProductCard/FeaturedCarousel 測試為純元件，不涉及網路 | closed |
| T-02-09 | Info Disclosure | FeaturedCarousel 錯誤框 | mitigate | FeaturedCarousel.tsx:69 只渲染 `getErrorMessage(result.error)`；FeaturedCarousel.test.tsx:72-80 斷言原始文字不出現 | closed |
| T-02-10 | XSS | 輪播 name/description | mitigate | 無 `dangerouslySetInnerHTML`；JSX 文字節點 | closed |
| T-02-12 | Info Disclosure | HomePage 測試 | mitigate | HomePage.test.tsx:13,16 mock Layout 與 services/products | closed |
| T-02-13 | XSS | ProductCard 名稱/描述/aria-label | mitigate | 無 `dangerouslySetInnerHTML`；僅 JSX 文字與屬性字串 | closed |
| T-02-14 | Tampering | ProductCard 圖片 URL | mitigate | ProductCard.tsx:24 僅作為 onImageClick 參數、:73/:135 為 `<img src>`；:34 `handleImageError` 設定 failedImageUrl 後切換為 placeholder（:21），無重試迴圈 | closed |
| T-02-17 | Info Disclosure | dev server 埠 | mitigate | 02-05-SUMMARY.md:39「5199 埠已清空」；稽核時 `lsof -i :5199` 無輸出 | closed |
| T-02-06-02 | DoS | ProductCard 版面 | mitigate | ProductCard.tsx:173 名稱 `line-clamp-2`、:180 描述 `line-clamp-1`（list 版 :91 亦有 line-clamp-2） | closed |
| T-02-02 | Info Disclosure | useProducts error 值 | accept | 見 Accepted Risks Log | closed |
| T-02-03 | DoS | StrictMode 重複請求 | accept | 見 Accepted Risks Log | closed |
| T-02-08 | DoS | 重載按鈕 / 排序切換 | accept | 見 Accepted Risks Log | closed |
| T-02-11 | DoS | 首頁雙請求 + 重試 | accept | 見 Accepted Risks Log | closed |
| T-02-15 | Spoofing | 價格顯示 | accept | 見 Accepted Risks Log | closed |
| T-02-16 | DoS | 冒煙測試請求量 | accept | 見 Accepted Risks Log | closed |
| T-02-18 | Info Disclosure | 打包產物 | accept | 見 Accepted Risks Log | closed |
| T-02-06-01 | Tampering | ProductCard 描述 | accept | 見 Accepted Risks Log | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-02 | useProducts 僅儲存 ApiError，不直接渲染，風險低 | 計畫階段（Plan 02-01/02） | 2026-11-10 |
| AR-02-02 | T-02-03 | StrictMode 雙請求僅限 dev，並已 abort 前一次請求 | 計畫階段 | 2026-11-10 |
| AR-02-03 | T-02-08 | 重載/排序會 abort 前一次請求；載入中隱藏按鈕、select disabled；後端限流 60/min | 計畫階段 | 2026-11-10 |
| AR-02-04 | T-02-11 | 首頁兩個請求遠低於 60/min，僅手動重試 | 計畫階段 | 2026-11-10 |
| AR-02-05 | T-02-15 | 價格文字來自 Phase 1 已測試的 priceText helper | 計畫階段 | 2026-11-10 |
| AR-02-06 | T-02-16 | 冒煙測試僅 curl x2 加手動瀏覽，量極小 | 計畫階段 | 2026-11-10 |
| AR-02-07 | T-02-18 | Airtable service 仍存在（NavBar/SideMenu/AboutPage）；憑證移除與 dist 掃描屬 Phase 3 SEC-01 | 計畫階段 | 2026-11-10 |
| AR-02-08 | T-02-06-01 | 僅 CSS class 變更，描述仍為 JSX 文字節點 | 計畫階段 | 2026-11-10 |

---

## Unregistered Flags

無（各 SUMMARY 無 Threat Flags 區段）。

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-10 | 21 | 21 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-10
