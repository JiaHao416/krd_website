---
phase: 04-token
plan: 02
subsystem: security
tags: [security, token-revocation, verification]
requires:
  - "04-01（REL-01 approved）"
provides:
  - "REL-02 撤銷證據（撤銷前 200 基準、D-09 依賴清單、Owner 撤銷、撤銷後狀態碼）"
affects: [04-03]
token-revoked: true
revoked-status: 401
key-files:
  created:
    - .planning/phases/04-token/04-02-SUMMARY.md
  modified: []
duration: 約 15 分鐘
completed: 2026-11-10
---

# Phase 4 Plan 02：撤銷舊 Airtable token Summary

本 plan 不改程式碼、不刪 Airtable base、不刪 Cloudflare 舊部署（D-10、D-15）。token 值從未輸出到 stdout、檔案或 commit；D-14 腳本放在 repo 外的 scratchpad，用完即刪。

## 撤銷前基準（D-14）

- 放行條件：04-01-SUMMARY 含 `requirements-completed: [REL-01]` ✓
- 撤銷前 whoami：200（2026-11-10 15:17:40 CST）。腳本從 git 歷史擷取 token，去重後恰為 1 組，透過 `curl -H @-` 只輸出狀態碼。

## D-09 依賴檢查清單

| 項目 | 指令摘要 | 結果 |
|------|----------|------|
| 3a 官網原始碼 | `npm test`；`grep -rliE airtable src --include='*.ts' --include='*.tsx'`（排除 noAirtable.test.ts） | 17 檔、205 測試通過；src 中提到 airtable 的檔案數 0（對照：含測試檔為 1，證明 grep 有正確執行） |
| 3b 官網 dist | `rm -rf dist && npm run build && npm run check:dist` | exit 0，「4 個檔案，無 Airtable 網址、token 或 Base ID」 |
| 3c 線上 bundle | `node $S/scan-prod.mjs https://www.krd.com.tw` | 「3 個檔案，0 個命中」，exit 0 |
| 3d 鄰近 repo 寫死的 PAT | 每個目錄先 `test -d`，再對 PAT 格式 `grep -rlE`（排除 node_modules、.git、dist） | KRD-Inventory-Backend：0；KRD-Backend-fix：0；KRD-Inventory：0；KRD-Inventory-desktop-ui：0（4 個目錄都存在） |
| 3e 後端搬遷 CLI | `grep -rl AIRTABLE_TOKEN KRD-Inventory-Backend`；DEPLOY.md §「Airtable 商品資料搬遷（一次性）」 | 8 個檔案從環境變數 `AIRTABLE_TOKEN` 讀 token；DEPLOY.md 寫明搬遷要另建 `data.records:read` 唯讀 PAT，只在 Render Shell 用 `export` 設定。結論：後端用的是另一組唯讀 PAT，搬遷已完成（production 已有商品），撤銷官網 token 不影響後端 |

待 Owner 回答：是否有其他外部工具（例如 Zapier、試算表腳本）也使用「官網用」這組 token？

註：後端 DEPLOY.md 寫著「舊 PAT 視為已洩漏，Owner 應已撤銷」，但撤銷前基準是 200，表示官網這組舊 token 實際上還沒撤銷，本 plan 就是在補這一步。

## Owner 撤銷

- Owner 對外部工具共用問題的回答：**無**（沒有其他工具使用這組 token）。
- Owner 確認已刪除官網 token：Owner 在 checkpoint 中明確要求 Claude 代為刪除（覆寫 D-11「Claude 不登入、不代為操作」）。Claude 用 Owner 已登入的 Chrome（Claude in Chrome，沒有輸入任何密碼）開啟 Builder hub → Personal access tokens：
  - 清單上只有 1 組 token：名稱「KRD Table」，2023-12-06 建立，Access 1 base，Scope `data.records:read` 等 4 項。
  - 刪除前在本機只用計數比對：這組 token 的公開 Token ID 正是 git 歷史中洩漏 token 的前綴（計數 1）。
  - 向 Owner 說明「無法復原」並取得「確認刪除」後，選 Delete token → 確認視窗按 Delete。頁面變成「You have no personal access tokens」（2026-11-10 約 15:26 CST）。
  - **只刪 token**，Airtable base 與資料都沒有動（D-10）。
- D-12 後端搬遷用的唯讀 PAT：Owner 同意刪除，但 Builder hub 清單上**不存在**這組 PAT（已經不在帳號中），所以不必處理。

## 撤銷後驗證

- 撤銷後 whoami：401（2026-11-10 15:26:34 CST）。用的是同一支 `d14-whoami.sh`，內容未修改，撤銷前為 200。
- 線上 bundle 掃描：「3 個檔案，0 個命中」，exit 0。
- 9 條深層連結：全為 200。
- API 抽查（數字與撤銷前完全相同）：

| 頁面 | 撤銷前 items/total | 撤銷後 items/total |
|------|-------------------|-------------------|
| /wireless-micphone | 5 / 5 | 5 / 5 |
| /trumpet | 7 / 7 | 7 / 7 |
| /krd-products | 12 / 12 | 12 / 12 |
| /new-products | 20 / 20 | 20 / 20 |

- D-15：Cloudflare Pages 的舊部署（`*.pages.dev`）bundle 裡仍有舊 token，但 token 已經撤銷失效，依決策不刪舊部署。
- D-17：TR-03-01（T-03-12、T-03-17）的關閉證據是撤銷前 200、撤銷後 401 的狀態碼對照。
- REL-02 完成標記留給 04-03：撤銷後還要做瀏覽器精簡實測，並由使用者確認。

## Deviations from Plan

- **Task 2 由 Claude 代為操作**：計畫原本規定由 Owner 手動刪除（D-11），但 Owner 在 checkpoint 明確要求 Claude 代刪。Claude 改用 Owner 已登入的 Chrome 操作，比對 Token ID 前綴並再取得一次刪除確認後才刪；全程沒有輸入密碼，也沒有輸出 token 值。
- 計畫寫死前一個 session 的 scratchpad 路徑，依備援規則改用本 session 的 scratchpad。
- D-09 3a 第一次 grep 在 zsh 下因為 `--include=*.ts` 沒加引號而中止，產生了不可信的 0；加上引號重跑，並用「含測試檔為 1」作對照。

## Self-Check: PASSED
