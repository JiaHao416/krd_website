---
phase: 11-release
type: preflight
status: passed
date: 2026-11-11
tool: chrome-devtools MCP（主 session）
server: VITE_API_BASE_URL=/api/v1/public npx vite build --outDir <scratchpad>/krd-preflight-dist；npx vite preview --port 4173 --strictPort（preview.proxy → https://api.krd.com.tw）
---

# Phase 11 本機 production 模式 bundle 實測

暫存 bundle 放在 repo 外的 scratchpad，是 production 模式的建置，壓縮過且沒有 StrictMode 的 effect 重跑。唯一的差別是 API base 為相對路徑，透過 preview proxy 讀取正式 API。要部署的 `dist` 沒有受影響：測試前後的 sha256 指紋都是 `e02be75b…2c35`。截圖放在 `uat/`。

## 前置確認

| 項目 | 結果 |
|------|------|
| 暫存 bundle 為相對路徑版本 | `["'\`]/api/v1/public` 出現 1 次（正式 dist 為 0 次） |
| preview proxy | `curl /api/v1/public/products` → `200 application/json; charset=utf-8` |
| SPA fallback | `curl /products/00000000-0000-4000-8000-000000000000` 回傳的 HTML 含 `id="root"`（1 次） |

## 結果

| # | 項目 | 量測 | 結果 |
|---|------|------|------|
| 1 | 首頁與輪播（1440） | 熱門推薦系列第 4953→9962ms，間隔約 5009ms；頂級精選系列第 519→5992→11508ms，間隔約 5500ms。XHR 只有 `featured=1` 與 `featured=2` 兩筆，都是 200（production 模式沒有重複請求）。沒有 JS 錯誤（`preflight-home-1440.png`） | pass |
| 2 | hover 暫停 | hover 便條卡 7 秒，維持在「第 3 張」；移開後 6 秒內切到「第 1 張」 | pass |
| 3 | 鍵盤聚焦暫停 | 聚焦便條卡連結（`:focus-visible` 為 true）7 秒，維持在「第 1 張」；blur 後 6 秒內切到「第 2 張」 | pass |
| 4 | 8 條舊網址 | 見下表，與 Phase 8 UAT 完全一致；每條間隔 2 秒以上，沒有 JS 錯誤 | pass |
| 5 | 深連結與重新整理 | 直接開 `/products/6d660a71-98b6-4b18-95ee-a2175aeab9c8`：h1「BB1」，title「BB1 \| KRD」，XHR 只有 1 筆詳情請求（200）。重新整理後一樣正常，XHR 仍只有 1 筆，「← 回到…」連到 `/trumpet`（`preflight-detail-1440.png`） | pass |
| 6 | 找不到商品 | `/products/00000000-0000-4000-8000-000000000000`：h1「找不到這個商品」，title「找不到商品 \| KRD」（`preflight-notfound-1440.png`） | pass |
| 7 | 找不到頁面 | `/whatever-404`：h1「找不到這一頁」，title「找不到頁面 \| KRD」 | pass |
| 8 | RWD | 見下表。只改視窗大小、不重新載入，3 頁 × 3 寬度都沒有水平捲動（`preflight-home-320.png`、`preflight-detail-768.png`） | pass |

### 8 條舊網址（11-03 production 實測對照用）

| 路由 | h1 | 商品數 |
|------|----|--------|
| /all-products | 所有商品 | 20 |
| /new-products | 最新商品 | 20 |
| /micgo-products | MICGO | 5 |
| /krd-products | KRD | 12 |
| /wired-micphone | 有線麥克風 | 5 |
| /wireless-micphone | 無線麥克風 | 5 |
| /trumpet | 擴大機 / 喇叭 | 7 |
| /accessories | 配件 | 3 |

### RWD（`innerWidth` / `scrollWidth`）

| 頁面 | 320（mobile、touch） | 768 | 1440 |
|------|-----|-----|------|
| `/` | 320 / 320 | 768 / 753 | 1440 / 1425 |
| `/all-products` | 320 / 320 | 768 / 753 | 1440 / 1425 |
| `/products/{id}` | 320 / 320 | 768 / 753 | 1440 / 1440 |

桌面寬度的 `scrollWidth` 比 `innerWidth` 少 15px，差的是垂直捲軸的寬度。`scrollWidth` 都 ≤ `innerWidth`，所以沒有溢出。

## 收尾

- 停止 preview 後，4173 埠沒有任何程序在監聽（`lsof -sTCP:LISTEN` 沒有輸出）。剩下的一條連線是 Chrome 的客戶端 keep-alive。
- 暫存目錄已刪除，dist 指紋與 Task 1 相同，git 裡沒有任何暫存建置檔。
- 這段實測共發出約 20 次 API 請求（首頁 2、8 條路由 10、詳情 2、找不到 1、RWD 重新載入約 5），遠低於每分鐘 60 次的上限。
