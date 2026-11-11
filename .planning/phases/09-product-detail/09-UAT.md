---
phase: 09-product-detail
type: uat
status: passed
date: 2026-11-11
tool: chrome-devtools MCP（主 session）
server: npm run dev -- --port 5173 --strictPort（Vite proxy → https://api.krd.com.tw）
---

# Phase 9 真實瀏覽器 UAT

截圖在 `uat/`。dev server 測完已停止，5173 埠已釋放。

測試商品：BB1（`6d660a71-98b6-4b18-95ee-a2175aeab9c8`，MICGO／喇叭）。production 20 筆商品都是單一變體、無價、無說明（已逐筆讀取確認），所以多變體與有價版面改用 initScript 覆寫 XHR `responseText`：只改這個 id 的回應，加上 3 個變體（紅：有價 1234500 分且有現貨；黑：預設、無價、洽詢交期；白：無價、有現貨），另補說明、型號與 12 個月保固。畫面渲染、互動與 API 請求都是真實的。

## 結果

| # | 項目 | 量測 | 結果 |
|---|------|------|------|
| 1 | 成功態（1440） | h1「BB1」；`document.title`「BB1 \| KRD」（head 依序為 `BB1 \| KRD`、`KRD`）；description「MICGO 喇叭」；麵包屑「首頁 › 擴大機 / 喇叭 › BB1」，連結為 `/`、`/trumpet`；沒有 radiogroup；「價格請來電」與說明文字；「洽詢交期」；沒有「商品說明」；規格表只有 SKU；兩欄 501.8px／602.2px（5:6） | pass |
| 2 | 不打列表 API（D-12） | XHR 只有 `/api/v1/public/products/{id}`，沒有列表請求。dev 下同一請求出現 2 次，原因是 StrictMode 開發模式的 effect 重跑（第一次會被 abort），production build 只有 1 次（Phase 7 D-11 已說明） | pass |
| 3 | RWD | 320：`scrollWidth` 320；雙鈕固定列（複製詢價、打電話問問）可見，行內 CTA 隱藏；捲到底時頁尾底部 704px、固定列頂部 712px，沒有遮擋。768：行內 CTA 可見、固定列隱藏、單欄。1440：兩欄（`detail-320.png`、`detail-320-bottom.png`、`detail-768.png`、`detail-1440.png`） | pass |
| 4 | 燈箱 | 點主圖後 dialog「商品大圖」開啟，`aria-modal=true`，焦點在「關閉圖片」；按 Esc 關閉後焦點回到「放大查看 BB1 圖片」，body overflow 已還原（`detail-lightbox.png`） | pass |
| 5 | 複製詢價（1440） | 實際寫入內容為「BB1｜http://localhost:5173/products/6d660a71-…」（沒有型號，省略中段）；按鈕立即變成「已複製」，aria-live 區有內容，2.3 秒後還原為「複製詢價訊息」；沒有出現失敗訊息 | pass |
| 6a | 直接開網址返回 | 顯示 `<a href="/trumpet">`「← 回到擴大機 / 喇叭」，點擊後進入 `/trumpet` | pass |
| 6b | 站內進入返回 | 從 `/trumpet` 以 pushState（key=uat1）進入詳情，顯示 `<button>`「← 回上一頁」，點擊後回到 `/trumpet`，h1 為「擴大機 / 喇叭」 | pass |
| 7 | 不存在的 UUID | 「找不到這個商品」、title「找不到商品 \| KRD」、「回到所有商品」→ `/all-products`；320 寬為單鈕固定列（`detail-notfound-320.png`） | pass |
| 8 | 非 UUID | 「找不到這個商品」、title「找不到商品 \| KRD」，XHR 請求數為 **0** | pass |
| 9 | 全域 NotFound | `/whatever-404` 顯示「找不到這一頁」、title「找不到頁面 \| KRD」、「回到首頁」→ `/`；有單鈕固定列與頁尾（`notfound-320.png`） | pass |
| 10 | 離開後標題還原 | 從詳情點返回到 `/trumpet`：`document.title` 為「KRD」，head 只剩一個 title，沒有殘留的 description | pass |
| 11 | 變體切換（覆寫回應） | radiogroup「選擇規格」；預設選中「黑」（is_default），顯示「價格請來電」、洽詢交期、SKU UAT-BLK、保固「1 年」；點「紅」後顯示「NT$12,345」、「有現貨」、SKU UAT-RED；說明保留換行；品牌型號行為「MICGO · 型號 BB1-UAT」（`detail-variants-1440.png`） | pass |
| 12 | 鍵盤 | roving tabindex（選中為 0、其餘為 -1）；焦點在「紅」時按 ArrowRight 兩次，焦點與選取都移到「白」，`:focus-visible` 外框為 `rgb(240,160,75) solid 2px` | pass |

## 觀察（不阻擋）

- 分類 tag 顯示的是後端原始分類「喇叭」，麵包屑與返回按鈕顯示的是分類頁標題「擴大機 / 喇叭」。UI-SPEC 只寫「分類 tag，連到分類頁」，沒有規定顯示哪一種文字。兩者都正確，留給使用者決定是否統一。
- 變體有自己的 `image_url` 時主圖會切換，由元件測試涵蓋。本次覆寫的 3 個變體共用同一張圖，所以畫面上看不出切換。
- 有價格時顯示為 `NT$12,345`（沒有空格），UI-SPEC 範例是「NT$ 12,345」。這是因為 D-01 鎖定不改 `format.ts`，RESEARCH A4 已記錄。

## human-needed（延到 Phase 11 上線前）

- [ ] 實機手機上的剪貼簿（iOS Safari 的權限行為）
- [ ] 實機觸控：固定列按鈕、燈箱關閉
- [ ] production 若之後出現多變體或有價商品，用真實資料再看一次版面
