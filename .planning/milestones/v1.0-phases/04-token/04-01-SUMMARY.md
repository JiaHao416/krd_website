---
phase: 04-token
plan: 01
subsystem: release-verification
tags: [verification, deploy, production, phase-gate]
requires: []
provides:
  - "REL-01 production 驗收證據"
affects: [04-02, 04-03]
requirements-completed: [REL-01]
key-files:
  created:
    - .planning/phases/04-token/04-01-SUMMARY.md
  modified: []
duration: 約 20 分鐘
completed: 2026-11-10
---

# Phase 4 Plan 01：REL-01 Production 驗收 Summary

本 plan 不改任何程式碼，只收集 production 驗收證據。

## 部署

| 項目 | 結果 |
|------|------|
| push 前 gate | `npm test`（17 檔、205 測試）、`npm run lint`、`npm run build`、`npm run check:dist` 全部 exit 0；待 push commit 的 AI 署名計數 0、PAT／Base ID 格式計數（訊息、diff）0／0 |
| 待 push commit | 10 個，全部只改 `.planning/`（`f5fbac8`…`16ecbd6`） |
| 使用者同意 push | 是（2026-11-10，於 Task 1 checkpoint 回覆「同意 push」） |
| push | `b703948..16ecbd6  main -> main`，`git rev-list --count origin/main..HEAD` = 0 |
| HEAD SHA | `16ecbd6` |
| Cloudflare Pages check-run | head_sha 等於 HEAD，status `completed`，conclusion `success`，完成時間 2026-11-10T07:12:45Z |

## Shell 證據

| 項目 | 結果 | 指令摘要 |
|------|------|----------|
| 位元組比對：檔名 | production `index.html` 引用 `index-Uubi7cXK.js`、`index-BMkSc_3Z.css`，與本機 `dist/index.html` 完全相同 | `curl https://www.krd.com.tw/` 抽 `/assets/*` 與 `dist/index.html` 比對 |
| 位元組比對：內容 | JS 300375 bytes、CSS 57713 bytes，`cmp` 皆 exit 0 | `curl -o $S/prod/<檔名>` + `cmp dist/assets/<檔名>` |
| 線上 bundle 掃描 | 「線上掃描：3 個檔案，0 個命中」，exit 0 | `node $S/scan-prod.mjs https://www.krd.com.tw`（規則擷取自 `scripts/check-dist.mjs`，腳本放 scratchpad，未入庫） |
| 深層連結 | 9 條全為 200：/all-products、/new-products、/krd-products、/micgo-products、/wireless-micphone、/wired-micphone、/trumpet、/accessories、/abouts | `curl -w "%{http_code}"` |
| apex | `https://krd.com.tw/` → 301 `https://www.krd.com.tw/`；`https://krd.com.tw/trumpet` → 301 `https://www.krd.com.tw/trumpet` | `curl -w "%{http_code} %{redirect_url}"` |

### API 預期數量（取得時間 2026-11-10 15:13:15 CST）

查詢一律帶 `limit=100` 與 `Origin: https://www.krd.com.tw`；10 組回應 `success` 皆為 true，且 items 數皆等於 total。

| 頁面 | 查詢 | items | total |
|------|------|-------|-------|
| 首頁熱銷 1 | featured=1 | 3 | 3 |
| 首頁熱銷 2 | featured=2 | 2 | 2 |
| /all-products | （無） | 20 | 20 |
| /new-products | sort=newest | 20 | 20 |
| /krd-products | brand=KRD | 12 | 12 |
| /micgo-products | brand=MICGO | 5 | 5 |
| /wireless-micphone | category=無線麥克風 | 5 | 5 |
| /wired-micphone | category=有線麥克風 | 5 | 5 |
| /trumpet | category=喇叭 | 7 | 7 |
| /accessories | category=配件 | 3 | 3 |

## Production 實測（Chrome DevTools MCP，2026-11-10 約 15:15–15:25 CST）

使用獨立的 browser context（不帶既有 cookie／快取）。商品數的算法是「main 內 `img.krd.com.tw` 圖片數」，並用 a11y snapshot 的「查看 … 大圖」按鈕數核對（/trumpet 7、/accessories 3，兩者一致）。

| 頁面 | 視窗寬 | 頁面商品數 | API 數 | 實際 API 查詢 | Network 網域 | Console 錯誤 | 結果 |
|------|--------|-----------|--------|--------------|--------------|-------------|------|
| 首頁熱銷推薦（featured=1） | 1280 | 3 | 3 | featured=1&limit=100 [200] | www／api／img | 0 | ✓ |
| 首頁頂級精選（featured=2） | 1280 | 2 | 2 | featured=2&limit=100 [200] | www／api／img | 0 | ✓ |
| /all-products | 1280 | 20 | 20 | sort=name&limit=100 | www／api／img | 0 | ✓ |
| /new-products | 1280 | 20 | 20 | sort=newest&limit=100 | www／api／img | 0 | ✓ |
| /krd-products | 1280 | 12 | 12 | brand=KRD&sort=name&limit=100 | www／api／img | 0 | ✓ |
| /micgo-products | 1280 | 5 | 5 | brand=MICGO&sort=name&limit=100 | www／api／img | 0 | ✓ |
| /wireless-micphone | 1280、375 | 5 | 5 | category=無線麥克風&sort=name&limit=100 | www／api／img | 0 | ✓ |
| /wired-micphone | 1280 | 5 | 5 | category=有線麥克風&sort=name&limit=100 | www／api／img | 0 | ✓ |
| /trumpet | 1280 | 7 | 7 | category=喇叭&sort=name&limit=100 | www／api／img | 0 | ✓ |
| /accessories | 1280 | 3 | 3 | category=配件&sort=name&limit=100 [200] | www／api／img | 0 | ✓ |

### 其他檢查項目

| 項目 | 結果 |
|------|------|
| Logo | NavBar `<img src="/brand-logo.png">`，請求 200 ✓ |
| favicon | `<link rel="icon" href="/logo.png">`，請求 200 ✓ |
| 商品圖片 | 每頁圖片請求皆為 `img.krd.com.tw`，Network 狀態 200 ✓ |
| ImageModal | /accessories 點「查看 線材 大圖」可開啟（顯示 img.krd.com.tw 大圖），點「關閉圖片」可關閉 ✓ |
| 桌機導覽（1280） | 所有商品 > 最新商品 > KRD > MICGO > 無線麥克風 > 有線麥克風 > 擴大機 / 喇叭 > 配件 > 商店介紹 ✓ |
| 手機導覽（375，用 emulate 設定 375x812 mobile） | 漢堡選單打開後 9 項全部落在視窗內，順序同上；點「無線麥克風」導至 /wireless-micphone（5 張商品），截圖確認選單已收合 ✓ |
| SideMenu（/trumpet） | 8 項順序同上，「擴大機 / 喇叭」為選中樣式（`bg-gradient-to-r from-blue-500/20…`），其餘為一般樣式 ✓ |
| /abouts | 6 張圖卡依序為 卡拉OK、KTV、酒店、PUB、遊覽車、維修，`/abouts/*.png` 6 個請求皆 200，圖片皆成功載入 ✓ |
| 深層連結（瀏覽器） | 新分頁直接開 /abouts 正確渲染；直接開 apex /trumpet 也正確渲染 ✓ |
| apex | `https://krd.com.tw/trumpet` 最終網址為 `https://www.krd.com.tw/trumpet`（301），7 張商品，Console 無 CORS 錯誤 ✓ |

### Network 與 Console 判準（D-05）

- 看過的網域只有四個：`www.krd.com.tw`（同源靜態資源與 Cloudflare `cdn-cgi/rum` 回報）、`api.krd.com.tw`（只有 `/api/v1/public/products`）、`img.krd.com.tw`，以及 `static.cloudflareinsights.com`（Cloudflare Pages 自動注入的 Web Analytics beacon，不是資料請求）
- `airtable.com` 請求數 **0**；`imgur.com` 請求數 **0**
- Console：error／warn **0**；CORS 錯誤 **0**；未處理例外 **0**

### Notes（D-07 已知或非阻擋項目，不算失敗）

- Chrome DevTools Issues 面板出現「A form field element should have an id or name attribute」（分類頁的排序下拉選單），屬可近性提示，不是 Console error，留待 redesign 處理。
- 手機漢堡選單按鈕在 a11y tree 中沒有 accessible name（缺 `aria-label`），可近性小問題，留待 redesign 處理。
- 用 `resize_page` 縮小 Chrome 視窗時，實際寬度最小只能到 500px，所以 375px 改用 `emulate viewport` 測試。
- 1024px 導覽折行等已知外觀問題依 D-07 延後，不在本次範圍。

## 使用者確認

- 2026-11-10：使用者檢視證據表後回覆 **approved**，REL-01 通過，04-02 可以開始撤銷流程（D-08 放行條件成立）。

## Deviations from Plan

- 本 plan 的 interfaces 寫死了前一個 session 的 scratchpad 路徑；依 plan 的備援規則，改用本 session 的 scratchpad（不在 repo 內）。
- 4 個 task 都由 orchestrator 直接執行，沒有派 executor subagent。原因是 Task 4 需要 Chrome DevTools MCP，而且 4 個 task 中有 2 個是 checkpoint。
- 手機 375px 改用 `emulate` 設定 viewport，因為 `resize_page` 的最小寬度是 500px。

## Self-Check: PASSED
