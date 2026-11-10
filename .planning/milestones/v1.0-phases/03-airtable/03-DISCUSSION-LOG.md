# Phase 3: 靜態內容固化與移除 Airtable - Discussion Log

> **僅供稽核留存。** 不得作為規劃、研究或執行代理的輸入。
> 決策以 CONTEXT.md 為準；本檔只保留當時考慮過的選項。

**Date:** 2026-11-10
**Phase:** 03-靜態內容固化與移除 Airtable
**Areas discussed:** 列出 4 個灰色地帶，使用者全部交由 Claude 決定

---

## 列出的灰色地帶

| 灰色地帶 | 問題 | 採用 |
|----------|------|------|
| 導覽順序與單一來源 | 調整 PRODUCT_PAGES 的順序，還是另寫一份導覽順序清單？「商店介紹」要不要納入？ | 調整 PRODUCT_PAGES 的順序並衍生出 NAV_ITEMS；「商店介紹」不納入（D-01～D-04） |
| Logo 檔案與備援 | 用新檔名，還是覆蓋 favicon？載入失敗時要不要顯示文字備援？ | 新檔 `public/brand-logo.png`；onError 時改顯示文字（D-05～D-07） |
| 關於我們內容檔 | 圖片放 public 還是 assets？內容檔用 TS 還是 JSON？寫死的文案要不要一起抽出？ | 圖片放 `public/abouts/`，內容檔用 TS（`src/content/abouts.ts`），只抽 6 張圖卡（D-08～D-10） |
| 抓取方式與憑證檢查 | 手動抓一次，還是 commit 抓取腳本？用自動檢查還是人工 grep？ | 執行時手動抓一次、不留腳本；用原始碼掃描測試，再加上 build 後 grep dist（D-11～D-15） |

**使用者的選擇：** 「你決定」
**備註：** 決策前已唯讀查詢 Airtable 三張表，發現導覽順序和 PRODUCT_PAGES 不同、Logo 不是現有的 public/logo.png、關於我們只有 6 張圖卡是動態內容，這些都反映在預設選擇中。

## Claude's Discretion

全部 4 個灰色地帶都由 Claude 決定，細項見 CONTEXT.md 的「Claude's Discretion」。

## Deferred Ideas

- 關於我們其他寫死的文案抽成內容檔
- 圖片格式最佳化
- UI 重設計（milestone 後）
