# Phase 7: 詳情資料層 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-11-11
**Phase:** 07-detail-data
**Mode:** `--auto`（使用者要求全自動一路接續所有 phase）
**Areas discussed:** API 契約實測、型別與轉換模型、錯誤分類、hook 介面、檔案配置與測試（全部自動選取）

---

| Area | Question | Auto-selected (recommended) | Alternatives considered |
|------|----------|-----------------------------|-------------------------|
| API 契約實測 | 欄位以什麼為準？ | 先 curl production 實測再寫型別 | 直接採研究文件型別 |
| 型別與轉換 | 是否重用 toProduct？ | 新增 toProductDetail | 擴充 toProduct |
| 型別與轉換 | 無價時資料層是否產生文案？ | 不產生（priceText null），UI 決定 | 沿用 PRICE_ON_REQUEST |
| 錯誤分類 | 分類放哪？ | 新純函式 classifyDetailError，不改 errors.ts | 擴充 ApiErrorKind |
| 錯誤分類 | 非 UUID 是否打 API？ | 前端預檢、不打 API | 交給後端回 400 |
| Hook | 回傳形狀 | 判別聯合四狀態 + retry | 沿用 useProducts 的 status 字串 + 多欄位 |
| 檔案 | 放在哪 | 新檔 productDetail.ts，apiTypes/transform 只追加 | 寫進 products.ts |

## Claude's Discretion

全部（--auto）。

## Deferred Ideas

- 詳情快取／去重
- 變體寫入 URL
