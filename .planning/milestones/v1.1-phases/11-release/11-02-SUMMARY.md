---
phase: 11-release
plan: 02
subsystem: release
tags: [merge, release]
requires: ["11-01"]
provides:
  - 本地 main 的 v1.1 merge commit
affects: []
key-files:
  created: []
  modified: []
requirements-completed: []
completed: 2026-11-11
---

# Phase 11 Plan 02：本地合併、上線確認、push 與部署

## Task 1：在本地 main 以 --no-ff 合併 redesign（D-04）

- 前置檢查：工作樹乾淨，只有 `.planning/config.json` 是未提交的修改，且兩個分支上的 config.json 內容相同。`git fetch` 後，`redesign..origin/main` 與 `redesign..main` 都沒有輸出。
- `REDESIGN_SHA` = `d722a874a212e49bf84f6832132e25f61e0b3a4e`
- `git merge --no-ff redesign` 在 main 上建立 merge commit，訊息為繁中，逐條列出 Phase 6–10 的內容，沒有 AI 署名。沒有衝突。
- `git rev-list --parents -n 1 main` 共 3 個 SHA，第二個 parent 是 `REDESIGN_SHA`。`git diff --stat main redesign` 沒有輸出，兩邊 tree 相同。
- **MERGE_SHA** = `4a3c43cfb8feec01d53849eafa00871148a8dd63`
- 在 main 上：
  - `npm test` 541/541 通過，lint 沒有問題，build 成功並通過 dist 掃描。
  - `vitest list` = 541。
  - dist grep 結果：相對路徑 0、正式網址 1、`localhost:<埠>` 0、localhost 總數等於 axios 字串數（1 = 1）。
- **MAIN_BUNDLE** = `index-Dyy0baVP.js`
- 已切回 `redesign`，沒有任何 staged 檔案。`origin/main` 仍是 `29aa578`，尚未 push。

### 即將 push 的內容

- `origin/main`（目前 production）= `29aa578` docs(state): 補記 Phase 5 D-01 決策。`origin/main` 是 main 的祖先，所以這次會是 fast-forward push。
- 即將 push 的 commit 共 **152** 個，`git diff --stat origin/main main` 為 314 files changed、+22822、−3446。
- first-parent 清單：merge `4a3c43c`，加上 13 個 v1.0 已經 commit 但從未 push 的 commit（`579faba`～`9497e01`）。其中 3 個是輪播的程式修正：`8d6248c`、`507c390`、`f4c22ef`。

## Task 2：上線確認（D-05）

使用者第一次選擇先不 push 並提出修改，第二次回覆「好推」，見下方紀錄。

## 上線前調整後重新合併（使用者先選擇 hold，追加兩個 quick task）

- 使用者看過 preflight 後要求先修改，沒有同意 push。新增兩個 quick task：`261111-ibb`（移除價格請來電與洽詢交期、營業時間）、`261111-k1m`（18:00、Google 地圖、店面照片、hero 照片）。
- 在 main 上再次執行 `git merge --no-ff redesign`，沒有改寫既有的本地 merge `4a3c43c`。
- **MERGE_SHA（新）** = `a69e918025e139539aae00f30b9733189ad68b9d`
- main 上 557/557 通過，lint 與 build 也都通過；dist grep：相對路徑 0、正式網址 1、`localhost:<埠>` 0。
- **MAIN_BUNDLE（新）** = `index-Cml2v-pG.js`
- 即將 push 165 個 commit（326 files changed，+23848、−3448），`origin/main` 仍為 `29aa578`。

## Task 2 結果：使用者同意 push

- 使用者回覆原文：「好推」（2026-11-11 約 13:32）。在此之前，助理已呈現新的 MERGE_SHA `a69e918`、165 個 commit、驗證結果與待確認清單。
- push 前核對：`git rev-parse main` 等於 `a69e918025e139539aae00f30b9733189ad68b9d`，即將 push 的 commit 數為 165，與呈現的內容一致。

## Task 3：push 與部署

- 13:32:55 執行 `git push origin main`，結果為 `29aa578..a69e918  main -> main`（fast-forward，沒有加任何旗標）。`git rev-parse origin/main` 等於 MERGE_SHA。
- 本機 preview server 已停止，4173 埠已釋放，暫存建置已刪除。
- 部署判定：每 30 秒輪詢一次 www.krd.com.tw，直到首頁引用的 bundle 變成 `assets/index-Cml2v-pG.js`。
- 13:33:34 部署完成：首頁 bundle 已變成 `assets/index-Cml2v-pG.js`，約 31 秒，沒有逾時，不需要查 gh。
- 部署後確認：SPA fallback 回 200，`/store/storefront.webp` 回 200；線上 bundle 相對路徑 0 次、正式網址 1 次。

## 回滾指引（D-07）

- 在 main 上執行 `git revert -m 1 a69e918` 回滾 v1.1 上線前調整，需要時再 `git revert -m 1 4a3c43c` 回滾 v1.1 本體。**push 前要再取得使用者明確同意。**
- 較快的暫時手段：在 Cloudflare Pages 後台的部署清單，對上一個部署按「Rollback to this deployment」，同樣由使用者決定。

## 待辦

- redesign 在 merge 之後新增的文件 commit（11-02／11-03 SUMMARY、11-UAT）還沒進 main。只有文件，不影響網站，下次 push 時一併帶上，需要使用者另外同意。
