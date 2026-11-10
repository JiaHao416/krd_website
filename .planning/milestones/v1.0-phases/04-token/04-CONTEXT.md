# Phase 4: 上線驗證與撤銷 token - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

確認 Phase 1–3 的新版官網已部署到 `www.krd.com.tw`，並在 production 實測商品分類頁、首頁熱銷、Logo、導覽、關於我們全部正常（REL-01）。通過後由 Owner 在 Airtable 手動撤銷舊官網使用的 token，撤銷後再次實測網站，並確認舊 token 已失效（REL-02）。

**本 phase 範圍內：** REL-01、REL-02；推送尚未 push 的 docs commit 並確認 Cloudflare Pages 部署成功；production 瀏覽器實測與線上 bundle 掃描；撤銷前的依賴檢查與 Owner 操作指引；撤銷後驗證；更新規劃文件，並關閉 Phase 3 轉移過來的威脅 TR-03-01。

**不在本 phase：** 任何程式功能或外觀修改（實測發現的 bug 另走 `/gsd-quick` 或 `/gsd-debug` 修正）；刪除 Airtable base；刪除 Cloudflare 舊部署；改寫 git 歷史；長期監控。

</domain>

<decisions>
## Implementation Decisions

> 使用者在討論時選「你決定」。以下都是 Claude 依專案限制、Phase 3 的作法，以及 2026-11-10 查到的事實所選的預設，規劃時直接採用。
> 前面 phase 的決策以 `P3 D-xx` 引用。

### 討論前查到的事實（2026-11-10）
- `origin/main` 為 `b703948`，已包含 Phase 3 全部程式碼；本機只比遠端多 2 個 docs commit（`.planning/` 內容，不影響 bundle）。
- production `https://www.krd.com.tw/` 目前載入 `assets/index-Uubi7cXK.js`：`airtable` 出現 0 次，`api.krd.com.tw` 出現 1 次，所以**新版已經上線**。
- 鄰近 repo 掃描：`KRD-Inventory`、`KRD-Inventory-desktop-ui` 沒有 Airtable 引用。`KRD-Inventory-Backend`（以及舊 worktree `KRD-Backend-fix`）有一次性的商品搬遷 CLI `npm run import:airtable`，token 從**環境變數** `AIRTABLE_TOKEN` 讀取，沒有寫死。其 `docs/DEPLOY.md` 要求另外建立**唯讀 PAT**，跑完後撤銷。production 後端已有 20 筆商品，表示搬遷已完成。
- Phase 3（2026-11-10）仍用舊官網 token 唯讀查詢過 Airtable，所以這組 token **目前仍有效**，而且它還留在 git 歷史，以及 Cloudflare 每個舊部署的 bundle 裡。

### 部署前置（REL-01 前提）
- **D-01:** 實測前先 push 本機尚未推送的 docs commit，等 Cloudflare Pages 對最新 HEAD 部署成功後再測，確保測的是最後的 build。push 屬於對外操作，執行時要先徵得使用者同意（沿用 Phase 3 的作法）。
- **D-02:** 確認 production 正在跑最新的 build：比對 production `index.html` 引用的 asset 檔名與本機 `npm run build` 產生的檔名。因為 docs commit 不影響 bundle，hash 應相同；不同時要查原因，不能直接略過。可以搭配 Cloudflare Pages 部署紀錄（`gh`／Cloudflare dashboard 的最新部署狀態）。

### Production 實測（REL-01）
- **D-03:** 由 orchestrator 用 Chrome DevTools MCP 對 `https://www.krd.com.tw` 實測，與 Phase 3 目視驗收的方式相同。結果整理成文字證據，交給使用者做 checkpoint 確認；使用者確認通過後，才能進入撤銷步驟。
- **D-04:** 實測清單：
  - 首頁：兩組熱銷輪播都有商品，內容各自等於當下 API `featured=1`、`featured=2` 的結果。
  - 8 個分類頁（`/all-products`、`/new-products`、`/krd-products`、`/micgo-products`、`/wireless-micphone`、`/wired-micphone`、`/trumpet`、`/accessories`）：顯示的商品數等於**實測當下**用相同查詢條件打 API 得到的數量。不寫死 20／12／5 這類數字，因為家人隨時可能上下架。抽查圖片來自 `img.krd.com.tw` 而且載入成功，點圖可以放大。
  - Logo：`/brand-logo.png` 正常顯示；favicon 仍為 `/logo.png`。
  - 導覽：桌機（1280px）選單、手機（375px）漢堡選單，以及 SideMenu 的 8 項順序都與 P3 D-01 相同，再加上「商店介紹」。
  - `/abouts`：6 張圖卡的圖片、名稱、順序都正確。
  - 深層連結：9 條路徑（8 個分類頁加 `/abouts`）直接開啟都回 200 並正確渲染（SPA fallback）。
  - 網域：`https://krd.com.tw`（apex）也要測。若會轉址到 www，記錄下來即可；若直接提供網站，也要確認讀得到商品，因為後端 CORS 允許這兩個網域。
- **D-05:** Network 與 Console 判準：不得有任何對 `airtable.com` 或 `imgur.com` 的請求；資料請求只能指向 `api.krd.com.tw/api/v1/public/products` 與 `img.krd.com.tw`；Console 不得有 CORS 錯誤或未處理的例外。
- **D-06:** 線上 bundle 掃描：抓 production `index.html` 及它引用的所有 `assets/*.js`、`assets/*.css`，套用與 `scripts/check-dist.mjs` **同一組** FORBIDDEN 規則，命中數必須為 0。輸出只能有「檔名：規則名稱」或計數，不得輸出匹配內容（P3 D-14、T-03-10）。
- **D-07:** 判準只看 REL-01 列出的功能正不正常。已知、已延後的外觀問題（例如 1024px 導覽折行，屬 UI 重設計）**不算失敗**，記錄在 Notes 就好。
- **D-08:** 實測有任何項目失敗時，**不得撤銷 token**。先停下來回報，用 `/gsd-quick` 或 `/gsd-debug` 修正並重新部署後，再重跑 D-04～D-06。不得為了「先恢復」而回滾到 Airtable 版的舊部署；若真的必須回滾，也只能在撤銷前做，而且要先問使用者。

### 撤銷前檢查（REL-02 前提）
- **D-09:** 撤銷目標只有「舊官網寫死在前端的那組 token」。撤銷前在 checkpoint 列出依賴檢查結果給 Owner 確認：官網 `src/`、`dist/` 與線上 bundle 都已不再使用這組 token；後端搬遷 CLI 用的是環境變數裡另一組唯讀 PAT，而且搬遷已完成，撤銷官網 token 不影響後端。另外請 Owner 確認沒有其他外部工具（例如 Zapier、試算表腳本）也共用這組 token。
- **D-10:** 只撤銷（或刪除）token，**不刪除 Airtable base 或其中的資料**，把它保留為歷史備份。刪除無法復原，也不是 REL-02 的要求。
- **D-11:** 撤銷由 Owner 本人在 Airtable Builder Hub → Personal access tokens（舊式 API key 則在帳號頁）手動操作，Claude 不登入 Airtable。計畫中這一步是 `checkpoint:human-action`，附上繁體中文的逐步說明。說明中可以描述 token 的**名稱或用途**，例如「官網用」，但不得出現 token 值。
- **D-12:** 同一個 checkpoint 順便提醒 Owner：如果後端搬遷用的唯讀 PAT 還在，依後端 DEPLOY.md 建議一併撤銷。這是建議，不是 REL-02 的完成條件，Owner 不撤銷也不影響本 phase 結束。

### 撤銷後驗證（REL-02）
- **D-13:** 撤銷後強制重新整理 production，重跑精簡版實測：首頁熱銷、每種分類至少抽 2 頁、`/abouts`、Logo、桌機與手機導覽，再加上 D-05 的 Network 判準。
- **D-14:** 客觀確認舊 token 已失效：用**單一 shell 指令**從 git 歷史讀出舊 token 存進變數，呼叫 Airtable 唯讀端點（例如 `GET https://api.airtable.com/v0/meta/whoami`），**只輸出 HTTP 狀態碼**，預期為 401（或 403）。token 不得被 echo，也不得寫進檔案、log、文件或 commit 訊息，指令結束後即丟棄。若回 200，代表撤銷沒有成功，退回 D-11 請 Owner 重新確認。
- **D-15:** Cloudflare Pages 舊部署（不可變的 `*.pages.dev` 網址）的 bundle 仍含舊 token，但撤銷後就無害，**不刪除舊部署**。在 Phase 4 SECURITY 記為「已藉由撤銷消除」。

### 收尾
- **D-16:** 更新規劃文件：REQUIREMENTS 的 REL-01、REL-02 打勾；PROJECT.md 的 Active 移到 Validated，Key Decisions 的 Outcome 欄從 Pending 改為實際結果；STATE、ROADMAP 進度隨之更新。實測證據寫在 Phase 4 的 SUMMARY／VERIFICATION，以文字表格記錄（頁面、商品數與 API 數、Network 網域、HTTP 狀態碼）。截圖只存在 scratch，不 commit。
- **D-17:** Phase 4 驗證要明確關閉 Phase 3 的轉移威脅 TR-03-01（T-03-12、T-03-17），證據就是 D-14 的狀態碼。
- **D-18:** 不新增 commit 進 repo 的 production 監控或 smoke 腳本（屬長期監控，放在 deferred）。D-06 的線上掃描用一次性指令完成即可，見下方 Claude's Discretion。
- **D-19:** Phase 4 完成後的建議順序：`/gsd-audit-milestone` → `/gsd-complete-milestone` → 再依專案記憶開 UI 重設計分支與新 milestone。

### Claude's Discretion
- D-06 線上 bundle 掃描的做法：一次性指令，或讓 `scripts/check-dist.mjs` 支援網址模式。若改腳本，FORBIDDEN 規則仍只能有一份，而且要被 `noAirtable.test.ts` 的一致性測試涵蓋，不得出現第三份規則清單。
- D-02 比對部署版本的具體方式（asset hash、Cloudflare 部署 API、`gh`）。
- 計畫拆分方式。建議 2 個 plan：04-01 為 push、production 實測、線上掃描，最後以使用者確認通過作為 checkpoint；04-02 為撤銷前檢查、Owner 撤銷（human-action）、撤銷後驗證、文件收尾。
- D-04 的商品數比對要逐頁打 API（在瀏覽器 Console 執行 `fetch`），還是用 `curl` 帶 `Origin` 標頭。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 背景與定案
- `.planning/BRIEF.md` — 官網停用 Airtable 的定案，以及「上線確認後由 Owner 撤銷 token」
- `.planning/PROJECT.md` — 限制：push `main` 即上線、前端不得含憑證、撤銷是最後一步
- `.planning/REQUIREMENTS.md` — REL-01、REL-02
- `.planning/ROADMAP.md` — Phase 4 成功標準

### 前面 phase 的成果與轉移項目
- `.planning/phases/03-airtable/03-CONTEXT.md` — P3 D-01（選單順序）、D-11／D-14（token 不得寫入任何地方、只描述格式）
- `.planning/phases/03-airtable/03-SECURITY.md` — TR-03-01：T-03-12、T-03-17 轉移給 Phase 4
- `.planning/phases/03-airtable/03-04-SUMMARY.md` — Phase 3 目視驗收的方法與當時各頁商品數（僅供參考，不得當成固定判準）
- `.planning/phases/03-airtable/03-VERIFICATION.md` — 註明「尚未 push；production 驗證與撤銷屬 Phase 4」

### 驗證工具與規則
- `scripts/check-dist.mjs` — FORBIDDEN 規則（D-06 必須沿用同一組）
- `src/noAirtable.test.ts` — 原始碼掃描與規則一致性測試
- `src/services/catalog.ts` — `PRODUCT_PAGES` 查詢條件（D-04 比對 API 數量用）

### 外部依賴
- `../KRD-Inventory-Backend/docs/DEPLOY.md` §「Airtable 商品資料搬遷（一次性）」— 後端搬遷 CLI 使用另一組唯讀 PAT（環境變數 `AIRTABLE_TOKEN`），跑完建議撤銷（D-09、D-12）

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `npm run check:dist`：本機 `dist/` 憑證掃描，規則可以直接沿用到線上 bundle。
- `npm test`（17 檔、205 測試）、`npm run lint`、`npm run build`：push 前的 gate。
- Phase 3 的 Chrome DevTools 驗收流程（桌機 1280、手機 375、Network 網域檢查），本 phase 改測 production 網址。

### Established Patterns
- 任何輸出都不得包含 token 或 Base ID 的值，只能輸出規則名稱或計數（T-03-10、T-03-11）。
- 對外操作（push、部署）要先取得使用者同意；Owner 專屬操作（撤銷 token）用 `checkpoint:human-action`。

### Integration Points
- GitHub `main` → Cloudflare Pages 專案 `krd-website` 自動部署 → `www.krd.com.tw`。
- 後端公開 API `https://api.krd.com.tw/api/v1/public/products`：CORS 只允許 `www.krd.com.tw`、`krd.com.tw`；每個 IP 每分鐘限流 60 次，實測時要控制請求量，避免連續刷新觸發 429 而誤判失敗。

</code_context>

<specifics>
## Specific Ideas

- 「網站不受影響」的判準：撤銷前後實測結果一致，而且整個過程中從未出現對 Airtable 的請求。
- 本 phase 預期幾乎不改程式碼，主要產出是驗證證據與規劃文件的更新。

</specifics>

<deferred>
## Deferred Ideas

- Production 長期監控或定期 smoke 檢查（例如 Postman Monitor、uptime 監控）：之後另開 phase。
- 刪除 Airtable base／帳號資料：Owner 確定不再需要歷史資料後自行決定。
- 刪除 Cloudflare Pages 舊部署：撤銷後已無害，不處理。
- UI 重設計：milestone 完成後另開分支（見專案記憶）。

</deferred>

---

*Phase: 04-token*
*Context gathered: 2026-11-10*
