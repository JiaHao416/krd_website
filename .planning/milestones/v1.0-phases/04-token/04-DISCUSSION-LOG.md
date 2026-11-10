# Phase 4: 上線驗證與撤銷 token - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-10
**Phase:** 04-上線驗證與撤銷 token
**Areas discussed:** （使用者選「你決定」，全部交給 Claude）

---

## 灰色地帶選擇

| Option | Description | Selected |
|--------|-------------|----------|
| production 實測方式 | 由誰測、測哪些頁面與寬度、證據怎麼記錄、要不要掃線上 bundle | |
| 撤銷前的安全檢查 | 確認 token 沒有其他依賴；只撤銷 token，還是連 base 一起處理 | |
| 撤銷後如何驗證 | 只看網站，還是也確認舊 token 回 401；舊 pages.dev 部署怎麼處理 | |
| 收尾與文件 | 文件更新、smoke 腳本、milestone 稽核時機 | |

**User's choice:** 你決定
**Notes:** 和 Phase 3 一樣全權交給 Claude。Claude 在寫 CONTEXT 前補查：production bundle 已不含 airtable；鄰近 repo 只有後端搬遷 CLI 用環境變數讀另一組唯讀 PAT。

## Claude's Discretion

全部四個區域，詳見 04-CONTEXT.md D-01～D-19 與 Claude's Discretion 小節。

## Deferred Ideas

- Production 長期監控或 smoke 檢查
- 刪除 Airtable base
- 刪除 Cloudflare 舊部署
- UI 重設計（milestone 後）
