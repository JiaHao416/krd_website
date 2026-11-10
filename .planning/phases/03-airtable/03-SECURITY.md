---
phase: 03
slug: airtable
status: verified
threats_open: 0
asvs_level: 1
created: 2026-11-10
---

# Phase 3 — 安全稽核

> 本 Phase 的威脅登記、接受風險與稽核紀錄。

## 信任邊界

| 邊界 | 說明 | 跨越的資料 |
|------|------|-----------|
| repo／dist bundle → 公開網路 | repo 公開、打包後也公開 | 不得含 Airtable token、Base ID |
| 靜態資產（public/*.png） | 由 Airtable 抓取後入庫 | 圖檔完整性 |
| git 歷史 → 公開 | 舊 token 仍在歷史中 | 已外洩之舊憑證（轉移至 Phase 4） |

## 威脅登記

| Threat ID | 類別 | 元件 | 處置 | 驗證證據 | 狀態 |
|-----------|------|------|------|----------|------|
| T-03-01 | Tampering | public/brand-logo.png | mitigate | `file`：PNG 800 x 235 | closed |
| T-03-02 | Info Disclosure | 下載流程／commit 訊息 | mitigate | `git ls-files` 無抓取腳本（僅 scripts/check-dist.mjs 與測試）；全部 commit 訊息對 token／Base ID 格式 grep 計數 0 | closed |
| T-03-03 | Info Disclosure | NavBar／SideMenu | mitigate | `grep -ci airtable`：NavBar 0、SideMenu 0、navigation.ts 0 | closed |
| T-03-04 | DoS | 導覽可用性 | accept | 見接受風險 AR-03-01 | closed |
| T-03-05 | Tampering | public/abouts/*.png | mitigate | 6 張皆 PNG 250 x 250；md5 去重後 6 種 | closed |
| T-03-06 | Info Disclosure | src/content/abouts.ts | mitigate | grep airtable = 0；無抓取腳本 | closed |
| T-03-07 | Info Disclosure | AboutPage | mitigate | AboutPage.tsx grep airtable = 0 | closed |
| T-03-08 | Info Disclosure | 舊 src/services/index.ts | mitigate | 檔案不存在（src/services 僅剩 apiTypes/catalog/client/errors/format/products/transform 及測試）；src 內僅 noAirtable.test.ts 含字樣（規則本身）；測試涵蓋 5 種格式 | closed |
| T-03-09 | Info Disclosure | dist bundle | mitigate | 本次重跑 `npm run build`（exit 0）與 `npm run check:dist`：4 個檔案，0 命中 | closed |
| T-03-10 | Info Disclosure | 測試／腳本失敗輸出 | mitigate | check-dist.mjs 只輸出 `相對路徑：規則名稱`；noAirtable.test.ts 只收集檔名，不輸出匹配內容 | closed |
| T-03-11 | Info Disclosure | 測試／腳本／文件／commit | mitigate | regex 只描述格式；03-*.md（SUMMARY、VERIFICATION、REVIEW、REVIEW-FIX、CONTEXT）對 token／Base ID 格式 grep 計數 0 | closed |
| T-03-12 | Info Disclosure | git 歷史舊 token | transfer | 見轉移紀錄 TR-03-01 | closed |
| T-03-13 | Tampering | 未來加回 Airtable | mitigate | noAirtable.test.ts 在 `npm test`（本次 17 檔 205 測試全過）；含 `files.length > 20` sanity check 與兩份 FORBIDDEN 一致性測試 | closed |
| T-03-14 | DoS | check:dist 誤報擋部署 | accept | 見接受風險 AR-03-02；build script 為 `tsc -b && vite build`，未含 check:dist | closed |
| T-03-15 | Info Disclosure | 上線 bundle | mitigate | 同 T-03-09 零命中；03-04-SUMMARY 記錄以 Chrome DevTools 驗收。注意：03-VERIFICATION 註記當時尚未 push，部署後實際 bundle 驗證歸 Phase 4 REL-01 | closed |
| T-03-16 | Info Disclosure | SUMMARY 驗收紀錄 | mitigate | SUMMARY 僅記 exit code／數量／檔名；憑證格式 grep 計數 0 | closed |
| T-03-17 | Info Disclosure | 已上線舊版與歷史 token | transfer | 見轉移紀錄 TR-03-01 | closed |

*狀態：open · closed*

## 接受風險紀錄

| Risk ID | 威脅參照 | 理由 | 接受者 | 日期 |
|---------|----------|------|--------|------|
| AR-03-01 | T-03-04 | 導覽改為編譯期常數（NAV_ITEMS），不再依賴網路，無新增可用性風險 | 專案 Owner（依 PLAN 處置） | 2026-11-10 |
| AR-03-02 | T-03-14 | check:dist 刻意不放進 build（D-15），誤報不會阻擋部署；僅為人工／pre-push gate | 專案 Owner（依 PLAN 處置） | 2026-11-10 |

## 轉移紀錄

| Transfer ID | 威脅參照 | 轉移對象 | 文件依據 |
|-------------|----------|----------|----------|
| TR-03-01 | T-03-12、T-03-17 | Phase 4 REL-02（Owner 撤銷 Airtable token） | 03-04-PLAN threat_model；03-VERIFICATION 註明撤銷屬 Phase 4 |

## 未登記旗標

無（SUMMARY 無未對應威脅之 Threat Flags）。

## 稽核軌跡

| 稽核日期 | 威脅總數 | 已關閉 | 未關閉 | 執行者 |
|----------|----------|--------|--------|--------|
| 2026-11-10 | 17 | 17 | 0 | gsd-security-auditor |

## 簽核

- [x] 所有威脅皆有處置（mitigate / accept / transfer）
- [x] 接受風險已記錄
- [x] `threats_open: 0` 已確認
- [x] frontmatter `status: verified`

**核准：** verified 2026-11-10
