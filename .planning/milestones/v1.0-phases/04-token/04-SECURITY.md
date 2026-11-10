---
phase: 04
slug: token
status: draft
threats_open: 0
asvs_level: 1
created: 2026-11-10
---

# Phase 4 — 安全稽核

> 本 Phase 的威脅登記、接受風險與 TR-03-01 關閉紀錄。待 `/gsd-secure-phase 4` 稽核後改為 verified。

## 信任邊界

| 邊界 | 說明 | 跨越的資料 |
|------|------|-----------|
| 本機 repo → GitHub main → Cloudflare Pages | push 即上線，屬對外操作 | 待 push 的 commit |
| production bundle → 公開網路 | 任何人都能下載 index.html 與 assets | 不得含 token、Base ID |
| git 歷史 → shell 變數 | 舊 token 只在 D-14 腳本執行期間存在於記憶體 | 已外洩的舊憑證 |
| 本機 → api.airtable.com | 用舊 token 呼叫唯讀的 whoami 端點 | 只取 HTTP 狀態碼 |
| Owner → Airtable 後台 | 只有 Owner 帳號能撤銷（本次由 Owner 授權 Claude 透過 Owner 已登入的瀏覽器操作） | token 刪除動作 |
| 驗收輸出 → SUMMARY（公開 repo） | 證據會被 commit | 只記狀態碼、計數、檔名 |

## 威脅登記

| Threat ID | 類別 | 元件 | 處置 | 驗證證據 | 狀態 |
|-----------|------|------|------|----------|------|
| T-04-01 | Tampering | git push origin main | mitigate | push 前 test（205）／lint／build／check:dist 全綠；待 push commit 的 AI 署名 0、PAT／Base ID 格式（訊息、diff）0／0；使用者回覆「同意 push」後才 push（04-01-SUMMARY「部署」） | closed |
| T-04-02 | Info Disclosure | production bundle | mitigate | 線上掃描「3 個檔案，0 個命中」（含 content-type 檢查）；JS、CSS 與本機 dist `cmp` 一致（04-01-SUMMARY「Shell 證據」） | closed |
| T-04-03 | Info Disclosure | 掃描輸出／SUMMARY | mitigate | 腳本只輸出計數；04-01／02／03-SUMMARY 對 PAT／Base ID 格式 grep 計數 0 | closed |
| T-04-04 | Tampering | 掃描規則漂移 | mitigate | scan-prod.mjs 用 regex 從 `scripts/check-dist.mjs` 擷取 FORBIDDEN；腳本放 scratchpad，`git ls-files` 中沒有 | closed |
| T-04-05 | DoS | API 限流誤判 | accept | 見 AR-04-01；實測期間沒有遇到 429 | closed |
| T-04-06 | Tampering | 驗收失敗時回滾 | mitigate | 04-01 全部通過、使用者 approved 後才進入 04-02；沒有回滾 | closed |
| T-04-07 | Info Disclosure | git 歷史與 Cloudflare 舊部署中的舊 token（TR-03-01） | mitigate | token 已刪除；撤銷前 whoami 200、撤銷後 401（04-02-SUMMARY） | closed |
| T-04-08 | Info Disclosure | d14-whoami.sh 執行過程 | mitigate | 只輸出狀態碼；token 經 stdin 傳給 `curl -H @-`；腳本放 scratchpad，用完已刪除 | closed |
| T-04-09 | Spoofing | 401 假陽性 | mitigate | 同一支腳本撤銷前先得 200 基準；腳本會檢查去重後 token 數為 1 | closed |
| T-04-10 | Tampering | REL-01 未通過前撤銷 | mitigate | 04-02 Task 1 放行檢查 `requirements-completed: [REL-01]` 通過後才撤銷 | closed |
| T-04-11 | DoS | 撤銷範圍過大 | mitigate | D-09 依賴清單全部通過；Owner 回答沒有其他工具共用；刪除前用計數比對 Token ID 前綴與洩漏 token 一致，並再次取得確認；只刪 token、不刪 base | closed |
| T-04-12 | Info Disclosure | SUMMARY／文件／commit 訊息 | mitigate | 每次 commit 前 staged diff 與訊息對 PAT／Base ID 格式計數 0；Phase 4 文件、REQUIREMENTS、PROJECT、03-SECURITY 計數 0 | closed |
| T-04-13 | DoS | 撤銷後網站可用性 | mitigate | 撤銷後 shell 再驗證（掃描 0、深層連結 9/9、API 抽查 4 頁）與 DevTools 精簡實測（6 組商品數相同、Console 0），使用者 approved（04-02、04-03-SUMMARY） | closed |
| T-04-14 | Repudiation | TR-03-01 關閉的可追溯性 | mitigate | 03-SECURITY 與本檔都引用 04-02-SUMMARY 的 200／401 對照 | closed |
| T-04-15 | Tampering | docs commit 破壞 build | mitigate | 04-03 commit 前 `npm test && npm run build` exit 0；04-03 不 push | closed |

*狀態：open · closed*

## 接受風險紀錄

| Risk ID | 威脅參照 | 理由 | 接受者 | 日期 |
|---------|----------|------|--------|------|
| AR-04-01 | T-04-05 | 實測請求分批、遠低於每分鐘 60 次；遇 429 等 60 秒重試，不算網站失敗 | 專案 Owner（依 PLAN 處置） | 2026-11-10 |

## TR-03-01 關閉

Phase 3 轉移過來的 TR-03-01（T-03-12 git 歷史舊 token、T-03-17 已上線舊版與歷史 token）由本 Phase 關閉：

- 2026-11-10 刪除 Airtable 上唯一一組 token「KRD Table」（Token ID 前綴與 git 歷史中的洩漏 token 一致）。
- 同一支 D-14 指令：撤銷前 200（15:17:40）、撤銷後 401（15:26:34）。證據在 `04-02-SUMMARY.md`。

## 已藉由撤銷消除

- **Cloudflare Pages 舊部署（`*.pages.dev`）**：舊部署的 bundle 仍含舊 token 值，但 token 已失效，依 D-15 不刪除舊部署。
- **git 歷史中的舊值**：不改寫歷史；值已失效，沒有剩餘風險。

## 稽核軌跡

| 稽核日期 | 威脅總數 | 已關閉 | 未關閉 | 執行者 |
|----------|----------|--------|--------|--------|
| 2026-11-10 | 15 | 15 | 0 | Phase 4 執行（04-03 收尾，待 secure-phase 稽核） |
