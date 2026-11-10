# Phase 1: 測試與 API 資料層基礎 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-10
**Phase:** 01-測試與 API 資料層基礎
**Areas discussed:** 無（使用者全部交由 Claude 決定）

---

## 灰色地帶選擇

| Option | Description | Selected |
|--------|-------------|----------|
| 價格與欄位顯示規則 | 價格格式、區間、null 文字、缺圖或缺名稱的處理 | |
| 錯誤分類與訊息 | 429 是否分開處理、錯誤分類、改成往上拋 | |
| 分類對照與筆數上限 | limit=100 或抓完所有分頁、排序交給前端或後端、對照表放哪裡 | |
| 本機開發 proxy | 只連 production 或可切本機後端、.env.example | |

**User's choice:** 「你決定」
**Notes:** 四個灰色地帶都由 Claude 選預設，記錄在 CONTEXT.md D-01～D-16。

## Claude's Discretion

- 全部四個灰色地帶（價格格式、錯誤分類、查詢對照與 limit、proxy 與環境變數）
- 測試環境（node）、HTTP mock 方式、檔案位置、Vitest 設定位置

## Deferred Ideas

- 多頁抓取（超過 100 筆時）
- 元件測試（Phase 2）
- 頁面標題、描述、圖示搬進設定陣列（Phase 2／3）
