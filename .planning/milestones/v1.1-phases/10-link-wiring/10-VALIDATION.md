---
phase: 10
slug: link-wiring
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-11-11
---

# Phase 10 — Validation Strategy

| Property | Value |
|----------|-------|
| Framework | Vitest 4（unit／node、component／jsdom）|
| Quick run | `npx vitest run <檔案>` |
| Full suite | `npm test && npm run lint && npm run build` |
| 數量 | `npx vitest list \| wc -l`（基準 525，不得減少）|

## Requirements → Test Map

| Req | Behavior | Type | Command |
|-----|----------|------|---------|
| LINK-01 | ProductCard grid/list 為單一 link、href=/products/{id}、無 role=button、無巢狀互動 | component | `npx vitest run src/components/ProductCard.test.tsx` |
| LINK-01 | 列表頁點卡片導向詳情、無 dialog | component | `npx vitest run src/pages/ProductPageTemplate.test.tsx` |
| LINK-02 | 便條卡為 link、name「查看 X 詳情」、href；聚焦暫停／離開恢復；點擊不黏住；視窗外卡不在 tab 順序 | component | `npx vitest run src/components/FeaturedCarousel.test.tsx` |
| LINK-02 | 首頁兩組便條卡連結 | component | `npx vitest run src/pages/HomePage.test.tsx` |
| TEST-06 | 契約斷言未刪、總數 ≥ 525 | 指令 | `npx vitest list \| wc -l`；對照 06-TEST-INVENTORY |
| LINK-01/02 | 真實瀏覽器點擊、輪播暫停 | manual-auto（主 session MCP）| 10-UAT.md |

## Sampling
- 每個 task commit：該 task 測試檔；每個 plan 結束：full suite + 數量。

## Manual-Only
| Behavior | Why | Instructions |
|----------|-----|--------------|
| 實機觸控點便條卡 | 需實機 | 延到 Phase 11 |

## Sign-Off
- [x] nyquist_compliant: true
