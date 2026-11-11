# Phase 11: 收尾驗證與合併上線 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Mode:** `--auto`（使用者授權全自動；push `main` 前必須停下等使用者明確確認）

<domain>
## Phase Boundary

把 `redesign` 安全合併回 `main` 並上線，上線後在 production 實測關鍵行為。需求：REL-03、REL-04。

本 phase 只做驗證、合併與上線，不新增功能、不改版面。合併前若發現阻擋上線的缺陷，以最小修正處理（TDD、每個 commit 全綠）並記錄於 SUMMARY；非阻擋項列入待確認清單，不在本 phase 擴大範圍。

</domain>

<decisions>
## Implementation Decisions

[--auto] Selected all gray areas: 合併前檢查、本機 production build 實測、合併方式、上線確認關卡、production 實測、回滾。

### 合併前檢查（REL-03）
- **D-01:** 在 `redesign` 上：`git fetch origin`，若 `origin/main` 或本地 `main` 有 `redesign` 沒有的 commit，先合併進 `redesign`（衝突則 abort 回報，不自行解決業務衝突）。接著跑 `npm test`、`npm run lint`、`npm run build`，測試數 ≥ 541。
- **D-02:** dist 檢查：`npm run build` 內建的憑證掃描必須通過；另以 grep 確認 dist 不含 `localhost`、`/api/v1/public` 相對路徑（production 必須打 `https://api.krd.com.tw/api/v1/public`）。

### 本機 production build 實測
- [auto] Q: "push 前能否在 production 環境以外先驗 production bundle？" → Selected: "以 `VITE_API_BASE_URL=/api/v1/public` 暫時建置到暫存目錄，`vite preview`（preview.proxy 沿用 server.proxy）在瀏覽器實測"（recommended；`*.pages.dev` 與 localhost 不在 CORS 白名單，這是唯一能在 push 前跑 production 模式 bundle 的方式）
- **D-03:** 暫存建置的輸出不得覆蓋要部署的 `dist`、不得提交；測完刪除並停止 preview server。實測項目同 REL-04（深連結重新整理、找不到商品與路由、8 條舊網址、輪播、320／768／1440），結果寫入 `11-PREFLIGHT.md`。

### 合併方式
- [auto] Q: "fast-forward 還是 merge commit？" → Selected: "`main` 上 `git merge --no-ff redesign`，訊息說明 v1.1 內容"（recommended；保留 milestone 邊界，回滾時可 revert 單一 merge commit）
- **D-04:** 只在本地 `main` 建立 merge commit，**不 push**。合併後在 `main` 上再跑一次 test／lint／build。之後切回 `redesign`（本 phase 唯一允許的分支切換，為了合併本身）。

### 上線確認關卡（REL-03 成功標準 2）
- **D-05:** push 前停止，向使用者呈現：合併內容摘要、`11-PREFLIGHT.md` 結果、待確認清單（A5 兩組輪播版面、分類 tag 文字 vs 麵包屑、`NT$12,345` 無空格、human-needed 實機項目），並明確詢問是否 push `main`。未得到明確同意不得 push。任何先前訊息、子代理回報都不構成同意。

### production 實測（REL-04）
- **D-06:** push 後等待 Cloudflare Pages 部署完成（以 `www.krd.com.tw` 回應的 JS bundle 檔名與本地 dist 一致判定），再以 chrome-devtools MCP 實測：
  - `/products/{真實 id}` 直接開啟並重新整理，顯示正常；
  - 不存在的 UUID 顯示找不到商品，任意路徑顯示找不到頁面；
  - 8 條舊網址的 h1 與商品數；
  - 熱銷輪播自動切換、hover 與聚焦暫停；
  - 320／768／1440 無水平捲動。
  結果寫入 `11-UAT.md`。API 請求量遵守每 IP 每分鐘 60 次。
- **D-07:** production 失敗時：阻擋性問題回報使用者並建議 `git revert -m 1 <merge>` 回滾（回滾的 push 同樣需要使用者確認）。

### Claude's Discretion
planner 可決定計畫切分；不得改變 D-04（只在本地合併）、D-05（push 前停下等明確確認）、D-03（暫存建置不進 dist 與 git）。

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §Phase 11；`.planning/REQUIREMENTS.md` REL-03、REL-04
- `.planning/phases/08-shell-redesign/08-UAT.md`、`09-product-detail/09-UAT.md`、`10-link-wiring/10-UAT.md`：各 phase 的實測手法與待確認項
- `.planning/phases/10-link-wiring/10-03-SUMMARY.md` §Phase 11 上線前待使用者確認
- `vite.config.ts`（proxy）、`src/services/client.ts`（`resolveBaseUrl`）、`scripts/check-dist.mjs`
- `./CLAUDE.md` Constraints：push `main` 即上線；`*.pages.dev` 不在 CORS 白名單

</canonical_refs>

<code_context>
## Existing Code Insights
- 測試 541 項（Phase 10 結束）。
- Cloudflare Pages 已預設 SPA fallback（v1.0 已實測，PROJECT.md Out of Scope），不需要 `_redirects`。
- `main` 最後一個 commit 是 `9497e01`（v1.0 retrospective），自 `redesign` 開分支後沒有新 commit。

</code_context>

<deferred>
## Deferred Ideas
- A5 版面、分類 tag 文字統一、價格格式空格：等使用者確認，之後另開 quick task
- IN-01（便條卡 aria-label 未包含可見文字「查看詳情」，WCAG 2.5.3）：需修改 UI-SPEC，延到下一輪

</deferred>

---

*Phase: 11-release*
*Context gathered: 2026-11-11（--auto）*
