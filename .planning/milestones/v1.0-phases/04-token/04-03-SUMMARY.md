---
phase: 04-token
plan: 03
subsystem: release-verification
tags: [verification, docs, phase-gate]
requires:
  - "04-01（REL-01 approved）"
  - "04-02（token-revoked: true、revoked-status: 401）"
provides:
  - "撤銷後瀏覽器精簡實測證據（D-13）與文件收尾"
affects: []
requirements-completed: [REL-01, REL-02]
key-files:
  created:
    - .planning/phases/04-token/04-03-SUMMARY.md
    - .planning/phases/04-token/04-SECURITY.md
  modified:
    - .planning/REQUIREMENTS.md
    - .planning/PROJECT.md
    - .planning/phases/03-airtable/03-SECURITY.md
    - .planning/phases/04-token/04-VALIDATION.md
duration: 約 15 分鐘
completed: 2026-11-10
---

# Phase 4 Plan 03：撤銷後實測與文件收尾 Summary

## 撤銷後實測（D-13）

放行條件：04-02-SUMMARY 含 `token-revoked: true`、`revoked-status: 401`，以及「撤銷後 whoami：401」✓

實測時間 2026-11-10 約 15:27–15:32 CST（撤銷後約 1～6 分鐘），使用全新的獨立 browser context，每個分類頁都以 `reload ignoreCache` 強制重新整理。API 數量在 15:27:11 用 curl 帶 Origin 取得。

| 頁面 | 視窗寬 | 頁面商品數 | API 數（撤銷後） | 撤銷前（04-01） | Network 網域 | Console 錯誤 | 結果 |
|------|--------|-----------|-----------------|----------------|--------------|-------------|------|
| 首頁熱銷推薦（featured=1） | 1280 | 3 | 3 | 3 | www／api／img | 0 | ✓ |
| 首頁頂級精選（featured=2） | 1280 | 2 | 2 | 2 | www／api／img | 0 | ✓ |
| /wireless-micphone | 1280 | 5 | 5 | 5 | www／api／img | 0 | ✓ |
| /trumpet | 1280、375 | 7 | 7 | 7 | www／api／img | 0 | ✓ |
| /krd-products | 1280 | 12 | 12 | 12 | www／api／img | 0 | ✓ |
| /new-products | 1280 | 20 | 20 | 20 | www／api／img | 0 | ✓ |

首頁商品數以輪播指示點計算（「第 n 張」按鈕共 5 個 = 3 + 2）；分類頁以 main 內 `img.krd.com.tw` 圖片數計算（04-01 已用 a11y snapshot 核對過這個方法）。

| 項目 | 結果 |
|------|------|
| Logo | `/brand-logo.png` 200 ✓ |
| favicon | `/logo.png` ✓ |
| 桌機導覽（1280） | 所有商品 > 最新商品 > KRD > MICGO > 無線麥克風 > 有線麥克風 > 擴大機 / 喇叭 > 配件 > 商店介紹 ✓ |
| 手機導覽（375，emulate） | 漢堡選單打開後 9 項都在視窗內，順序同上；點「擴大機 / 喇叭」導至 /trumpet，截圖確認選單已收合 ✓ |
| /abouts | 卡拉OK、KTV、酒店、PUB、遊覽車、維修，6 張 `/abouts/*.png` 皆 200 且成功載入 ✓ |
| Network | `airtable.com` 請求 **0**、`imgur.com` 請求 **0**；資料請求只有 `api.krd.com.tw/api/v1/public/products` 與 `img.krd.com.tw`（另有同源資源與 Cloudflare Web Analytics beacon） |
| Console | error／warn **0**、CORS 錯誤 **0**、未處理例外 **0** |

Notes（不算失敗）：重新整理時有 2 張商品圖回 206（瀏覽器發出的 Range 部分內容請求，屬正常行為）；可近性小問題沿用 04-01 Notes。

## 使用者確認

- 2026-11-10：使用者檢視撤銷後證據表後回覆 **approved**（撤銷後網站正常）。REL-02 完成；REL-01 已在 04-01 完成，這裡再列一次。

## 文件收尾

- REQUIREMENTS.md：REL-01、REL-02 改為 `[x]`，Traceability 兩列改為 Complete。
- PROJECT.md：Active 改為「（本 milestone 無剩餘項目）」；Validated 新增 2 項 Phase 4；Key Decisions 6 列的 Outcome 全部改為 ✓ Good；Last updated 也已更新。
- 03-SECURITY.md：新增「TR-03-01 已關閉（Phase 4）」說明，引用 04-02-SUMMARY；稽核軌跡新增 Phase 4 一列。
- 04-SECURITY.md：新建，登記 T-04-01～T-04-15（全部 closed）、AR-04-01、TR-03-01 關閉，以及「已藉由撤銷消除」段落（D-15）。
- 04-VALIDATION.md：Per-Task 全部改為 ✅ green，`nyquist_compliant: true`、`status: complete`，Sign-Off 已勾選。
- 憑證格式檢查：Phase 4 全部文件、REQUIREMENTS、PROJECT、03-SECURITY 對 PAT／Base ID 格式 grep 計數皆為 0。
- `npm test && npm run build` exit 0；本 plan 沒有 push。

## 後續建議（D-19）

`/gsd-audit-milestone` → `/gsd-complete-milestone` → 開 UI 重設計分支與新 milestone。

## Deviations from Plan

- 計畫寫死前一個 session 的 scratchpad 路徑，依備援規則改用本 session 的 scratchpad。
- 首頁商品數以輪播指示點計算，因為首頁一次只顯示一張商品圖。

## Self-Check: PASSED
