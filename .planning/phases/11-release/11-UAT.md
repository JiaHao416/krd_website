---
phase: 11-release
type: uat
status: passed
date: 2026-11-11
tool: chrome-devtools MCP（主 session）
server: https://www.krd.com.tw（production，bundle index-Cml2v-pG.js，merge a69e918）
---

# Phase 11 production 實測

`git push origin main`（13:32:55）之後，Cloudflare Pages 在 13:33:34 完成部署，首頁引用的 bundle 等於本地 `MAIN_BUNDLE`。截圖放在 `uat/prod-*.png`。

## 不打 API 的確認

| 項目 | 結果 |
|------|------|
| SPA fallback：`curl /products/00000000-…` | 200 |
| 店面照片：`curl /store/storefront.webp` | 200 |
| 線上 bundle 的 grep | 相對 `/api/v1/public` 0 次，`https://api.krd.com.tw/api/v1/public` 1 次 |

## 結果

| # | 項目 | 量測 | 結果 |
|---|------|------|------|
| 1 | 首頁（1440） | 熱門推薦系列第 4780→9766ms，間隔約 4986ms；頂級精選系列第 5293→10786ms，間隔約 5493ms。XHR 只有 `featured=1`、`featured=2` 兩筆，都是 200，沒有 JS 錯誤。hero 店面照已載入（naturalWidth 1200），聯絡區有 iframe「羽程企業社 Google 地圖」和 3 張店面照片。頁面上沒有「價格請來電」「洽詢交期」，營業時間顯示「週一至週五 09:00 - 18:00」 | pass |
| 2 | 輪播暫停 | 鍵盤聚焦（`:focus-visible` 為 true）7 秒，維持在「第 1 張」，blur 後 6 秒內切到「第 2 張」；hover 7 秒，維持在「第 1 張」，移開後 6 秒內切到「第 2 張」 | pass |
| 3 | 8 條舊網址 | 與 11-PREFLIGHT 完全一致：所有商品 20、最新商品 20、MICGO 5、KRD 12、有線麥克風 5、無線麥克風 5、擴大機 / 喇叭 7、配件 3。每條間隔 2 秒，沒有 JS 錯誤，也沒有出現價格請來電或洽詢交期 | pass |
| 4 | 深連結與重新整理 | 直接開 `/products/6d660a71-…` 後重新整理：h1「BB1」，title「BB1 \| KRD」，XHR 只有 1 筆詳情請求（200）。沒有價格區塊，CTA 為「複製詢價訊息」和「打電話問 (04) 2279-8787」，「← 回到…」連到 `/trumpet`（`prod-detail-1440.png`） | pass |
| 5 | 找不到商品 | `/products/00000000-0000-4000-8000-000000000000`：h1「找不到這個商品」，title「找不到商品 \| KRD」 | pass |
| 6 | 找不到頁面 | `/whatever-404`：h1「找不到這一頁」，title「找不到頁面 \| KRD」 | pass |
| 7 | RWD | `/`、`/all-products`、`/products/{id}` 在 320（mobile、touch）、768、1440 三種寬度下，`scrollWidth` 都 ≤ `innerWidth`；320 寬時地圖 iframe 為 237×140（`prod-home-320.png`、`prod-detail-320.png`） | pass |

## human-needed（交給使用者以實機確認）

- [ ] iPhone Safari：底部固定撥號列與 safe-area、複製詢價訊息的剪貼簿權限
- [ ] 實機觸控：便條卡、商品卡、chip 列的滑動與點擊
- [ ] Windows Chrome：傾斜卡片與文字的 antialias
- [ ] 手機返回手勢與「← 回上一頁」是否一致
- [ ] 日後出現多變體或有價商品時，用真實資料再看一次版面
- [ ] Google 商家：把週六改成休息、打烊時間設為 18:00，與官網一致
