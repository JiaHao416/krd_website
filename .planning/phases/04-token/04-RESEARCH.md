# Phase 4: 上線驗證與撤銷 token - Research

**Researched:** 2026-11-10
**Domain:** Cloudflare Pages 部署確認、production 驗收、Airtable token 撤銷驗證（ops／verification，幾乎不改程式碼）
**Confidence:** HIGH（所有關鍵事實都在本 session 以 curl／gh／本機 build 實測）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
D-01 ~ D-19 全部鎖定（原文見 `04-CONTEXT.md`），摘要如下，規劃時以原文為準：
- D-01 實測前先 push 尚未推送的 docs commit（需先徵得使用者同意），等 Cloudflare Pages 對最新 HEAD 部署成功。
- D-02 以 asset 檔名比對確認 production 為最新 build；不同要查原因。
- D-03 orchestrator 用 Chrome DevTools MCP 實測，文字證據交使用者 checkpoint 確認後才能撤銷。
- D-04 實測清單：首頁兩組熱銷、8 個分類頁（商品數等於實測當下 API 數）、Logo、桌機 1280／手機 375 導覽、`/abouts`、9 條深層連結、apex 網域。
- D-05 Network 不得有 `airtable.com`／`imgur.com`；資料只能指向 `api.krd.com.tw/api/v1/public/products` 與 `img.krd.com.tw`；Console 無 CORS 錯誤或未處理例外。
- D-06 線上 bundle 以同一組 FORBIDDEN 規則掃描，命中必須 0；只輸出檔名：規則名稱或計數。
- D-07 已知延後的外觀問題不算失敗。
- D-08 任何項目失敗不得撤銷 token，不得回滾到 Airtable 版。
- D-09 撤銷前依賴檢查清單交 Owner 確認；D-10 只撤銷不刪 base；D-11 Owner 手動撤銷（`checkpoint:human-action`，不含 token 值）；D-12 建議一併撤銷後端搬遷 PAT（非完成條件）。
- D-13 撤銷後精簡版實測；D-14 單一 shell 指令只輸出 HTTP 狀態碼，預期 401／403；D-15 不刪舊部署。
- D-16 更新規劃文件；D-17 關閉 TR-03-01（T-03-12、T-03-17）；D-18 不 commit 監控／smoke 腳本；D-19 後續順序 audit-milestone → complete-milestone → UI 重設計。

### Claude's Discretion
- D-06 線上掃描做法（一次性指令，或 check-dist 支援網址模式；規則只能一份且被一致性測試涵蓋）。
- D-02 比對部署版本的具體方式。
- 計畫拆分（建議 2 個 plan：04-01、04-02）。
- D-04 商品數比對方式（瀏覽器 Console fetch 或 curl 帶 Origin）。

### Deferred Ideas (OUT OF SCOPE)
- Production 長期監控／定期 smoke 檢查。
- 刪除 Airtable base／帳號資料。
- 刪除 Cloudflare Pages 舊部署。
- UI 重設計。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REL-01 | 新版官網在 production 實測正常後才進入撤銷 | 部署確認（gh check-runs + 位元組比對）、線上 bundle 掃描腳本、API 數量比對方式、Chrome DevTools 清單 |
| REL-02 | Owner 撤銷 Airtable token，撤銷後網站仍正常且舊 token 失效 | token 格式為 PAT（已確認）、`whoami` 狀態碼設計、撤銷前基準測試、Builder Hub 步驟 |
</phase_requirements>

## Summary

本 phase 不需要新增任何 library 或程式碼。所有需要的工具本機都已具備（`gh` 已登入、`curl`、`node` v24.13.0），`wrangler` 未安裝且**不需要**。已實測確認：production 目前載入的 `index-Uubi7cXK.js`／`index-BMkSc_3Z.css` 與本機 `npm run build` 產出**檔名相同且 JS 位元組完全一致**（`cmp` 通過），表示 Vite 建置在此專案是確定性的，部署版本比對可用「檔名 + `cmp`」完成。`origin/main`（`b703948`）在 GitHub 上有 `Cloudflare Pages` check-run 且 `completed/success`；本機另有 4 個 docs commit 未 push（只動 `.planning/`，不影響 bundle）。

舊 token 為 **PAT 格式**（git 歷史中 PAT 格式命中 2 行、去重後 1 組值、舊式 `key…` 格式 0 筆），分布在 2 個 commit。PAT 在 Airtable 沒有到期，要撤銷就必須由 Owner 在 Builder Hub 手動刪除。`GET /v0/meta/whoami` 不需任何 scope，對無效 token 與無 token 都回 **401**（以假 PAT 與無 Authorization 各打一次實測），因此「401」本身無法區分「撤銷」與「指令寫壞」，**必須在撤銷前先跑同一指令得到 200 作為基準**，且指令要在 token 變數為空時中止。

後端 API 的 `pagination` 含 `total`（`{"offset":0,"limit":100,"total":20}`），前端用 `limit=100`（API 上限，`limit=101` 回 400），目前 20 筆遠低於上限，不會被截斷；用 `data.items.length` 或 `pagination.total` 皆可比對頁面商品數。apex `krd.com.tw` 以 301 轉址到 `https://www.krd.com.tw/`。

**Primary recommendation:** 用「一次性、不入庫」的 node 腳本（從 `scripts/check-dist.mjs` 原始碼擷取 FORBIDDEN 區塊，不複製規則）掃描線上 bundle；用 `gh api .../check-runs` + asset 檔名/`cmp` 確認部署；D-14 用 `printf | curl -H @-` 單一指令，並在撤銷前先跑出 200 基準。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 部署最新 `main` | CDN / Static（Cloudflare Pages） | GitHub（來源） | push main 自動部署，無自有後端 |
| 商品資料 | API / Backend（api.krd.com.tw） | Browser（顯示） | 官網只讀公開 API |
| 導覽／Logo／關於我們 | CDN / Static | Browser | repo 內靜態檔，無網路依賴 |
| Token 失效 | 外部服務（Airtable） | Owner 手動操作 | Claude 不登入 Airtable |
| 驗收 | Browser（Chrome DevTools MCP） | shell（curl／node） | 渲染結果需瀏覽器；bundle／狀態碼用 shell |

## Standard Stack

本 phase 不安裝任何新套件。

| 工具 | 版本／狀態 | 用途 |
|------|-----------|------|
| gh CLI | 已安裝、已登入 [VERIFIED: `which gh`、`gh auth status`] | 查 check-runs、push 後確認部署 |
| curl | `/usr/bin/curl` [VERIFIED] | 狀態碼、header、API 比對 |
| node | v24.13.0 [VERIFIED] | 一次性掃描腳本（內建 `fetch`） |
| wrangler | **未安裝** [VERIFIED: `which wrangler` 無輸出] | 不需要，也不要安裝（需登入 Cloudflare） |
| Chrome DevTools MCP | orchestrator 使用 | production 目視驗收 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 一次性掃描腳本 | 為 `check-dist.mjs` 加 `--url` 模式 | 要改腳本、補測試，且 D-18 傾向不入庫；一次性即可 |
| `gh` check-runs | `wrangler pages deployment list` | 需安裝並登入 Cloudflare，過度 |

## Package Legitimacy Audit

本 phase 不安裝任何外部套件，故無需 slopcheck。**Packages removed:** none。**Packages flagged:** none。

## Architecture Patterns

### 流程圖

```
本機 4 個 docs commit ──(使用者同意)──> git push origin main
        │                                      │
        │                                      ▼
        │                         GitHub check-run "Cloudflare Pages"
        │                         (gh api commits/<sha>/check-runs → success)
        ▼                                      ▼
 npm run build (本機) ──檔名/cmp──> production index.html + assets 比對 (D-02)
                                               │
              ┌────────────────────────────────┼───────────────────────────┐
              ▼                                ▼                           ▼
   線上 bundle 掃描 (D-06)        curl+Origin 取 API 數量 (D-04)   Chrome DevTools 實測 (D-03/D-05)
   一次性 node 腳本                 items.length / pagination.total   桌機/手機/Network/Console
              └────────────────────────────────┴───────────────────────────┘
                                               ▼
                        文字證據表 → 使用者 checkpoint 確認 (REL-01)
                                               ▼
        撤銷前：D-14 指令基準（預期 200）→ D-09 依賴清單 → Owner 手動撤銷 (human-action)
                                               ▼
        撤銷後：D-14 指令（預期 401/403）→ 精簡版實測 (D-13) → 文件收尾、關閉 TR-03-01
```

### 建議計畫拆分（沿用 CONTEXT）
- **04-01**：Task 1 push（`checkpoint:human-verify` 取得同意）+ 部署確認；Task 2 線上掃描 + API 數量基準 + 位元組比對；Task 3 Chrome DevTools 實測（orchestrator 執行）；Task 4 `checkpoint:human-verify` 使用者確認 REL-01。
- **04-02**：Task 1 撤銷前基準（D-14 預期 200）與依賴檢查表；Task 2 `checkpoint:human-action` Owner 撤銷；Task 3 撤銷後 D-14（預期 401/403）+ 精簡實測；Task 4 文件收尾（REQUIREMENTS、PROJECT、STATE、ROADMAP、03-SECURITY TR-03-01 關閉、Phase 4 SECURITY）。

### Pattern 1：確認部署版本（D-02）
三層證據，由弱到強：
1. `gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs|map({n:.name,s:.status,c:.conclusion})'`：已實測，`origin/main` 回 `Cloudflare Pages / completed / success`。`gh run list` 為空（repo 沒有 GitHub Actions），`deployments` 與 `statuses` API 皆為 `[]`，**只有 check-runs 有資訊**。 [VERIFIED: gh api]
2. production `index.html` 引用的檔名 = 本機 `dist/index.html` 引用的檔名（目前皆為 `index-Uubi7cXK.js`、`index-BMkSc_3Z.css`）。 [VERIFIED]
3. 位元組比對：`curl -sS https://www.krd.com.tw/assets/<js> -o $S/prod/a.js; cmp $S/prod/a.js dist/assets/<js>`，已實測 IDENTICAL。 [VERIFIED]

push 後等部署：輪詢 check-runs 直到 `completed`。docs-only commit 的 bundle hash 不變，所以 push 後檔名應仍相同；check-run 的 `head_sha` 要等於 push 的 HEAD。若 Cloudflare 對 docs commit 也建置（會），check-run 是 push 後唯一的「已完成」信號。

### Pattern 2：線上 bundle 掃描（D-06，推薦：一次性腳本、不入庫）
**What:** 腳本在 scratchpad（不 commit），從 `scripts/check-dist.mjs` 原始碼用與 `noAirtable.test.ts` 相同的 regex 擷取 `const FORBIDDEN = [...]` 區塊，`new Function` 還原，再掃線上檔案。**沒有第三份規則清單**，且 FORBIDDEN 變動時自動跟隨；一致性測試仍只涵蓋兩份，不受影響。
**已在本機對 production 實測：** 輸出「線上掃描：3 個檔案，0 個命中」，exit 0。 [VERIFIED]
**關鍵防呆（Pitfall 1）：** 不存在的 asset 路徑也回 200 + `text/html`（SPA fallback，已實測），所以腳本必須檢查 content-type 為 js/css，否則會掃到 HTML 而誤判通過。
```js
// 一次性掃描（scratchpad，勿 commit）。只輸出「檔名：規則名稱」與計數，不輸出匹配內容。
import { readFileSync } from "node:fs";
const BASE = process.argv[2] ?? "https://www.krd.com.tw";
const src = readFileSync("scripts/check-dist.mjs", "utf8");
const block = src.match(/const FORBIDDEN = \[\n([\s\S]*?)\n\];/)?.[1];
if (!block) { console.error("找不到 FORBIDDEN 區塊"); process.exit(2); }
const FORBIDDEN = new Function(`return [${block}];`)();
if (FORBIDDEN.length < 5) { console.error("規則數量異常"); process.exit(2); }
const get = async (path) => {
  const res = await fetch(new URL(path, BASE));
  if (!res.ok) throw new Error(`${path}：HTTP ${res.status}`);
  return { text: await res.text(), type: res.headers.get("content-type") ?? "" };
};
const html = await get("/");
const assets = [...html.text.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
if (assets.length === 0) { console.error("index.html 沒有引用 assets"); process.exit(2); }
let hits = 0;
for (const [n, re] of FORBIDDEN) if (re.test(html.text)) { hits++; console.error(`index.html：${n}`); }
for (const a of assets) {
  const { text, type } = await get(a);
  if (!/javascript|css/.test(type)) { console.error(`${a}：content-type 非 js/css`); process.exit(2); }
  for (const [n, re] of FORBIDDEN) if (re.test(text)) { hits++; console.error(`${a}：${n}`); }
}
console.log(`線上掃描：${assets.length + 1} 個檔案，${hits} 個命中`);
process.exit(hits ? 1 : 0);
```
完整、已驗證的副本在 `/private/tmp/claude-501/-Users-howard-KRD-krd-website/a3cfae6f-96c1-42cc-a117-ef8935679e26/scratchpad/scan-prod.mjs`（session 暫存，planner 可讓 executor 重建）。執行需在 repo 根目錄（讀相對路徑 `scripts/check-dist.mjs`）。
**補強：** 位元組比對通過（Pattern 1）+ 本機 `npm run check:dist` 通過，即證明 production 與本機 dist 相同。

### Pattern 3：API 數量比對（D-04，推薦 curl + Origin）
- 回應形狀 `{success, data:{items, pagination:{offset, limit, total}}}` [VERIFIED: curl]。
- 前端固定 `limit=100`（`PRODUCT_LIMIT`，`catalog.ts`），API 上限 100（`limit=101` → 400）；目前 total 20，不會被截斷。比對時用 `pagination.total` 與 `items.length` 兩者皆可，兩者應相等。
- 參數鍵順序 brand、category、featured、sort、limit；`sort=newest` 只用於 `/new-products`；`featured` 時不送 sort。中文 category 用 `curl -G --data-urlencode "category=無線麥克風"`。
- 回應 header 帶 `ratelimit: "60-in-1min"; r=<剩餘>`，可監看剩餘額度。
- 請求預算：首頁 2 + 8 分類 = 10 次 curl；瀏覽器每頁 1 次；apex 測試 +1。整個撤銷前驗收約 30 次，**分批、不要連續強刷**；若出現 429 等 60 秒。撤銷後的精簡實測另算一輪。
- CORS：`Origin: https://www.krd.com.tw` → `access-control-allow-origin` 回該值；`Origin: https://krd.com.tw` 回 200；`*.pages.dev` Origin 回 200 但**不帶** `access-control-allow-origin`（瀏覽器會擋，符合專案 Constraints）。 [VERIFIED: curl]
```bash
H='Origin: https://www.krd.com.tw'; B='https://api.krd.com.tw/api/v1/public/products'
curl -sS -H "$H" -G "$B" --data-urlencode "category=喇叭" --data-urlencode "limit=100" \
 | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(j.data.items.length,j.data.pagination.total)'
```

### Pattern 4：apex 網域（D-04）
`https://krd.com.tw/` 回 **301 → `https://www.krd.com.tw/`** [VERIFIED: curl -I]。記錄即可；不需另測 apex 直連的 CORS。深層連結 `https://www.krd.com.tw/trumpet` 直接回 200（SPA fallback 已運作）。注意 apex 301 只驗到根路徑，可順便測 `https://krd.com.tw/trumpet` 是否保留路徑（未測，LOW，列入實測項）。

### Pattern 5：Chrome DevTools MCP 驗收清單結構
executor subagent 可能沒有瀏覽器工具，所以：
- 計畫中以 **orchestrator 執行的 `checkpoint:human-verify`（或明標「由 orchestrator 以 DevTools MCP 執行」的 task）** 呈現，產出文字證據表（頁面、視窗、商品數 vs API 數、Network 網域、Console 錯誤數）。
- 自動可做的部分（curl API 數量、bundle 掃描、header 狀態）寫成 shell task，先於瀏覽器步驟完成並把「預期數量」存下來；瀏覽器步驟只負責比對。
- 每頁固定動作：`navigate_page` → `take_snapshot`（計商品卡片數）→ `list_network_requests`（過濾網域，確認無 `airtable.com`／`imgur.com`）→ `list_console_messages`（無 error）。桌機 `resize_page` 1280、手機 375。
- 取 API 數與頁面快照盡量同一時間點，降低家人上下架造成的誤差；差異時重打 API 再比。
- 截圖只放 scratchpad，不 commit。
- 撤銷後的精簡實測（D-13）：同一模板，只跑首頁、每種分類抽 2 頁（建議 `/wireless-micphone`、`/trumpet`、`/krd-products`、`/new-products`）、`/abouts`、Logo、桌機與手機導覽；強制重新整理（`ignoreCache`）。

### Anti-Patterns to Avoid
- **只看 401 就宣告撤銷成功：** 無 token／壞 token 也是 401，必須有撤銷前 200 基準（Pitfall 2）。
- **掃描時沒檢查 content-type：** SPA fallback 會讓壞路徑回 200 HTML（Pitfall 1）。
- **把 token 放進命令列參數：** `curl -H "Authorization: Bearer $T"` 會在 `ps` 暫時可見；用 `printf ... | curl -H @-`。
- **為了「先恢復」回滾到 Airtable 版：** D-08 禁止。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 部署狀態 | 解析 Cloudflare dashboard／裝 wrangler | `gh api .../check-runs` | 已登入、免 Cloudflare 憑證 |
| 掃描規則 | 第三份 FORBIDDEN | 從 `check-dist.mjs` 擷取 | 一致性測試只管兩份 |
| Token 失效驗證 | 自己解析 Airtable 回應內容 | 只取 `%{http_code}` | 避免輸出敏感內容 |
| 監控腳本 | 新增 smoke script 入庫 | 一次性指令 | D-18 |

## Runtime State Inventory

本 phase 是「撤銷／停用」，不是改名，但適用同樣思維：

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Airtable base 保留為歷史備份；後端已有 20 筆商品 | 無（D-10 不刪） |
| Live service config | Airtable Builder Hub 的 PAT 在 Airtable 後台（不在 git）；Cloudflare Pages 舊部署（不可變 `*.pages.dev`）bundle 內含舊 token | Owner 撤銷 PAT；舊部署不處理（D-15，撤銷後無害） |
| OS-registered state | None — 官網為純靜態前端，無排程／常駐程序 | 無 |
| Secrets/env vars | 官網前端無 env 憑證；後端搬遷 CLI 用環境變數 `AIRTABLE_TOKEN`（另一組唯讀 PAT） | D-12 僅建議撤銷，非完成條件 |
| Build artifacts | git 歷史 2 個 commit 含舊 token（PAT 格式 1 組） | 不改寫歷史；撤銷後該值失效（D-17） |

## Common Pitfalls

### Pitfall 1：SPA fallback 讓錯誤路徑回 200
**What goes wrong:** `/assets/不存在.js` 回 200 `text/html`，掃描或比對把 HTML 當 bundle。
**How to avoid:** 檢查 content-type（js 為 `application/javascript`）與檔名取自 index.html。
**Warning signs:** 掃描檔案數異常少、檔案大小為 450B（index.html 大小）。

### Pitfall 2：401 的假陽性
**What goes wrong:** D-14 指令若 grep 不到 token，`$T` 為空，Airtable 回 401，看似「撤銷成功」。
**How to avoid:** (a) 擷取後 `[ -n "$T" ] || exit 1`；(b) **撤銷前先跑同一指令，必須得到 200**，撤銷後才跑第二次；(c) 無 token 與假 PAT 皆回 401 已實測 [VERIFIED: curl]。
**Warning signs:** 撤銷前基準不是 200。

### Pitfall 3：限流 429 被誤判為網站壞掉
**How to avoid:** 60 次/分鐘/IP；瀏覽器 + curl 共用同一 IP 額度。分批執行，必要時等 60 秒。從 `ratelimit` header 的 `r=` 看剩餘。

### Pitfall 4：把動態商品數寫死
**How to avoid:** D-04 已規定；比對值每次由 API 即時取得，並與頁面快照同一時段。

### Pitfall 5：push 後立刻實測
**How to avoid:** 先確認 check-run completed 且 head_sha 為剛 push 的 HEAD；docs commit 也會觸發建置，Cloudflare 切換前可能短暫仍是舊版（檔名相同，不影響判斷，但仍要等 completed）。

### Pitfall 6：舊 token 僅在歷史中，歷史搜尋範圍
**How to avoid:** 使用 `git log -p --all -S 'api.airtable.com' -- src/services/index.ts`（涵蓋所有 ref，已確認 2 commit：`3677fd2`、`b12b45d`）。擷取後用 `sort -u | head -1`。

### Pitfall 7：rtk hook 改寫指令輸出
**What goes wrong:** 本環境的 shell hook 可能把 `curl`／`grep` 改寫成 `rtk ...` 並濃縮輸出（本 session 實際發生一次）。D-14 要精確的 `%{http_code}`，若輸出被改寫會失真。
**How to avoid:** 該指令用 `rtk proxy` 或直接以 `command curl` 執行，並確認輸出為三位數字。

## Code Examples

### D-14 單一指令設計（**研究階段未對真 token 執行**）
```bash
# 從 git 歷史取舊 token 到變數（不 echo、不寫檔），只輸出 HTTP 狀態碼；結束即 unset
T=$(git log -p --all -S 'api.airtable.com' -- src/services/index.ts \
    | grep -oE '\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b' | sort -u | head -1); \
[ -n "$T" ] || { echo "擷取失敗（變數為空）"; unset T; exit 1; }; \
printf 'Authorization: Bearer %s' "$T" \
  | curl -sS -o /dev/null -w '%{http_code}\n' -H @- https://api.airtable.com/v0/meta/whoami; \
unset T
```
- 撤銷前預期輸出 `200`（基準）；撤銷後預期 `401`（或 403）；回 200 代表未撤銷成功，退回 D-11。
- `printf` 為 shell 內建，token 不進 `ps`；`-H @-` 從 stdin 讀 header（curl 7.55+）。
- `whoami` 不需 scope，PAT 與 OAuth 皆可呼叫 [CITED: airtable.com/developers/web/api/get-user-id-scopes]；文件未列錯誤碼。撤銷後的確切狀態碼屬 **[ASSUMED]**：Airtable 支援文件指出被拒絕的 token 回 401 `UNAUTHORIZED`（"Invalid authentication token"），與無 token 的 `AUTHENTICATION_REQUIRED` 不同 [CITED: support.airtable.com/docs/airtable-api-common-troubleshooting（WebSearch 摘要）]。判準以狀態碼 401/403 為準，不看 body。
- 不要在 `set -x`、`bash -x` 或 CI log 下執行。

### 撤銷前 token 格式檢查（只輸出計數，已執行）
```bash
git log -p --all -S 'api.airtable.com' -- src/services/index.ts | grep -cE '\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b'   # 2（同一組值）
git log -p --all -S 'api.airtable.com' -- src/services/index.ts | grep -cE '\bkey[A-Za-z0-9]{14}\b'                       # 0
```

### Owner 撤銷步驟（供 human-action 逐步說明；不含 token 值）
1. 登入 Airtable → 右上帳號 → **Builder hub** → **Personal access tokens**（網址 `https://airtable.com/create/tokens`）。 [CITED: support.airtable.com/docs/creating-personal-access-tokens；步驟用語為 ASSUMED，以 Owner 畫面為準]
2. 找出「官網用」的 token（用名稱／建立日期／上次使用日期辨識；token ID 為 token 前 14 碼 `pat…`，可與 git 歷史格式對照但不要貼出）。
3. 開啟該 token → **Delete**（刪除）並確認。
4. 若看到後端搬遷用的另一組唯讀 PAT，依 DEPLOY.md 可一併刪除（D-12，非必要）。
5. 回報「已刪除」，不要貼 token。
- 舊式 API key：於 2024-02-01 起已停用，不再能呼叫 API [CITED: support.airtable.com/docs/airtable-api-key-deprecation-notice，WebSearch 標題確認，內文未逐字讀取]；但本專案 token 為 PAT，撤銷僅需上述步驟。

## State of the Art

| Old | Current | Impact |
|-----|---------|--------|
| Airtable 舊式 API key | PAT（Builder Hub） | 本專案舊 token 為 PAT，格式命中 `pat…\.…` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 撤銷後 `whoami` 回 401（支援文件說 UNAUTHORIZED），也可能是 403 | Code Examples | 低：D-14 已允許 401/403；若為其他碼，退回 D-11 確認並向 Owner 查 Builder Hub 是否已刪 |
| A2 | Builder Hub 的按鈕名稱與路徑（Delete、`create/tokens`） | Owner 步驟 | 低：Owner 以實際畫面為準 |
| A3 | `https://krd.com.tw/<path>` 轉址是否保留路徑 | Pattern 4 | 低：僅記錄，非失敗條件 |
| A4 | 舊 token 目前確實仍有效（由 Phase 3 查詢與 CONTEXT 事實得知；本 session 未對真 token 發請求） | 撤銷前基準 | 中：若已失效，撤銷前基準就不是 200，此時需先釐清是哪組 token 失效 |

## Open Questions

1. **舊 token 現在是否真的 200？**
   - 已知：CONTEXT 稱 Phase 3 仍可用；本研究依規定不對真 token 發請求。
   - 建議：04-02 Task 1 做基準，非 200 則停下回報。
2. **Owner 是否有其他工具共用這組 token（Zapier、試算表腳本）？**
   - 無法由程式碼得知；D-09 在 checkpoint 詢問 Owner。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| gh CLI（已登入） | 部署確認、push 後輪詢 | ✓ | 已登入（帳號不記錄） | Cloudflare dashboard 目視 |
| curl | 狀態碼、API、header | ✓ | 系統內建 | — |
| node | 一次性掃描、build | ✓ | v24.13.0 | — |
| wrangler | （不需要） | ✗ | — | gh check-runs |
| Chrome DevTools MCP | D-03 | orchestrator 端（未在此驗證） | — | 使用者人工目視 |
| 網路至 api.krd.com.tw／www.krd.com.tw | 全部 | ✓ | 實測可達 | — |

**Missing dependencies with no fallback:** 無。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest（unit：node；component：jsdom），目前 17 檔／205 測試 |
| Config file | 既有（見 `TESTING.md`） |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run lint && npm run build && npm run check:dist` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REL-01 | 部署為最新 HEAD | shell | `gh api repos/JiaHao416/krd_website/commits/$(git rev-parse HEAD)/check-runs --jq '.check_runs[]\|select(.name=="Cloudflare Pages")\|.conclusion'` 預期 `success` | ✅ 無需新檔 |
| REL-01 | production 檔案 = 本機 build | shell | 比對 index.html 引用檔名 + `curl … -o a.js; cmp a.js dist/assets/<js>` | ✅ |
| REL-01 | 線上 bundle 無憑證 | shell | 一次性 `node <scratch>/scan-prod.mjs`（exit 0、0 命中） | ❌ 一次性腳本（scratch，不入庫） |
| REL-01 | 各頁商品數 = API 數 | shell + manual | curl+Origin 取數；DevTools 快照計數 | manual（orchestrator） |
| REL-01 | Network 無 airtable/imgur、Console 無錯 | manual | DevTools `list_network_requests`／`list_console_messages` | manual-only：需瀏覽器 |
| REL-01 | 深層連結 200 | shell | `for p in /all-products …; do curl -s -o /dev/null -w '%{http_code}\n' https://www.krd.com.tw$p; done`（9 條） | ✅ |
| REL-02 | 撤銷前基準 | shell | D-14 指令，預期 `200` | ✅ |
| REL-02 | 舊 token 已失效 | shell | D-14 指令，預期 `401`/`403` | ✅ |
| REL-02 | 撤銷後網站正常 | shell + manual | 重跑 bundle 掃描、深層連結、精簡 DevTools 實測 | manual（orchestrator） |
| 回歸 | 原始碼／dist 無憑證 | unit | `npm test`（`noAirtable.test.ts`）、`npm run check:dist` | ✅ |

### Sampling Rate
- **Per task commit（若有 docs commit）：** `npm test`
- **Per wave merge：** `npm test && npm run lint && npm run build && npm run check:dist`
- **Phase gate：** 上述全綠 + 04-01 使用者 checkpoint 通過 + D-14 撤銷後狀態碼 401/403，再 `/gsd:verify-work`

### Wave 0 Gaps
- None — 現有測試基礎設施足夠；線上掃描為一次性腳本（D-18 不入庫），不需新增測試檔。
- 驗收腳本需要的暫存目錄：使用 session scratchpad，不放進 repo。

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no（官網無使用者認證） | — |
| V3 Session Management | no | — |
| V4 Access Control | no | 後端 CORS 白名單（已存在） |
| V5 Input Validation | no（無新輸入） | — |
| V6 Cryptography／Secrets | **yes** | 撤銷外洩 PAT；token 不入檔／不 echo／不進 `ps` |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 舊 token 留在 git 歷史與 Cloudflare 舊部署（TR-03-01：T-03-12、T-03-17） | Info Disclosure | Owner 撤銷 PAT；D-14 狀態碼 401/403 為關閉證據 |
| 驗證指令洩漏 token（stdout、`ps`、log、文件、commit） | Info Disclosure | 變數 + `printf \| curl -H @-`、只輸出狀態碼、不 `set -x`、文件 grep 計數 0 |
| 驗收文件夾帶 token／Base ID | Info Disclosure | Phase 4 SUMMARY／VERIFICATION／SECURITY 寫完後以 PAT／Base ID 格式 regex grep，計數須為 0 |
| 撤銷前誤回滾或誤判 | Tampering | D-08：失敗不撤銷，不回滾 |
| 撤銷範圍過大（誤刪後端搬遷用 PAT／base） | DoS | D-10：不刪 base；D-12 僅建議；依名稱辨識 |
| 線上 bundle 重新含憑證 | Info Disclosure | D-06 線上掃描 + `check:dist` + `noAirtable.test.ts` |

## Sources

### Primary (HIGH)
- 本 session 實測：`curl`（production、API、Airtable whoami 無 token／假 PAT）、`gh api`（check-runs）、`npm run build` + `cmp`、`git log -S` 格式計數
- `scripts/check-dist.mjs`、`src/noAirtable.test.ts`、`src/services/catalog.ts`、`03-SECURITY.md`、`04-CONTEXT.md`
- https://airtable.com/developers/web/api/get-user-id-scopes — whoami 無需 scope

### Secondary (MEDIUM)
- https://support.airtable.com/docs/airtable-api-common-troubleshooting — 401 AUTHENTICATION_REQUIRED vs UNAUTHORIZED（WebSearch 摘要）
- https://support.airtable.com/docs/creating-personal-access-tokens、https://support.airtable.com/docs/airtable-api-key-deprecation-notice — PAT／舊 key 停用（搜尋結果標題，內文未逐字讀取）

### Tertiary (LOW)
- Builder Hub 介面按鈕名稱（A2）

## Metadata

**Confidence breakdown:**
- Standard stack／工具可用性：HIGH — 全部實測
- 架構與流程：HIGH — 沿用 CONTEXT 與 Phase 3 方法
- 撤銷後精確狀態碼：MEDIUM — 以 401/403 判準涵蓋
- Pitfalls：HIGH — 多數為本 session 親自遇到（SPA fallback、hook 改寫、401 假陽性）

**Research date:** 2026-11-10
**Valid until:** 2026-12-10（Airtable UI 與 Cloudflare check-run 行為相對穩定）
