# Phase 9: 商品詳情頁 UI、路由與 NotFound - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-11-11
**Phase:** 09-product-detail
**Mode:** `--auto`

| Area | Question | Auto-selected (recommended) | Alternatives |
|------|----------|-----------------------------|--------------|
| 價格文案 | 洽詢 vs 價格請來電 | UI-SPEC「價格請來電」 | REQUIREMENTS 字面「洽詢」 |
| 分類對應 | category → 分類頁 | 由 PRODUCT_PAGES 反查，退回所有商品 | 寫死對照表 |
| 返回 | 無歷史時 | Link 到分類頁 | 一律 navigate(-1) |
| 標題 | 實作方式 | React 19 原生 metadata（研究確認） | react-helmet／useEffect |
| 固定列 | 詳情雙鈕 | 研究決定 variant 或 Layout prop | 另寫獨立元件 |
| UAT | 誰做 | 主 session 用瀏覽器自動化 | 請使用者手測 |

## Deferred Ideas
- 變體寫入 URL、詳情快取、卡片連結（Phase 10）
