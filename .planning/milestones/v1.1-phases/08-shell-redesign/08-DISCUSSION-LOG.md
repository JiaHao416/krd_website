# Phase 8: Tokens、共用骨架與既有頁面改版 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-11-11
**Phase:** 08-shell-redesign
**Mode:** `--auto`（使用者要求全自動一路接續）

| Area | Question | Auto-selected (recommended) | Alternatives |
|------|----------|-----------------------------|--------------|
| A1 | 「價格請來電」如何取得 | UI 依 priceMin/priceMax null 顯示 tag，不改常數 | 改 PRICE_ON_REQUEST |
| A2 | 載入／截斷提示字串 | 原樣保留 | 改寫成口語文案 |
| 順序 | 計畫切分 | 基礎→骨架→列表→首頁→關於→收尾 | 依頁面一次到位 |
| Token | 防回歸 | 新增 designTokens 原始碼掃描測試 | 只靠人工 grep |
| UAT | 誰做瀏覽器 UAT | Claude 以瀏覽器自動化實測，無法自動的延到 Phase 11 | 每次請使用者手測 |

## Claude's Discretion
全部（--auto）。

## Deferred Ideas
- Windows antialias／實機觸控 → Phase 11
- 地圖連結 → 待素材
