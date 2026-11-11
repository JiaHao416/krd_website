---
phase: 11-release
plan: 01
subsystem: release
tags: [preflight, release, verification]
requires: ["10-03"]
provides:
  - 合併前檢查結果
  - 本機 production 模式 bundle 實測（11-PREFLIGHT.md）
  - 11-02 上線確認用資料
affects: []
key-files:
  created:
    - .planning/phases/11-release/11-PREFLIGHT.md
    - .planning/phases/11-release/uat/
  modified: []
requirements-completed: []
duration: ~25min
completed: 2026-11-11
---

# Phase 11 Plan 01：合併前檢查與本機 production bundle 實測

**redesign 已包含 main 的全部 commit，541 項測試、lint、build 都通過；dist 只打正式 API、不含憑證；production 模式 bundle 的 8 項實測全部通過。**

## Task 1：合併前檢查（D-01、D-02）

- 分支是 `redesign`，工作樹乾淨，只有 `.planning/config.json` 是未提交的修改。
- `git fetch origin` 成功。`git log redesign..origin/main` 與 `git log redesign..main` 都沒有輸出，表示 main 沒有 redesign 缺少的 commit，不需要合併。
- `npm test` 541/541 通過，`npm run lint` 沒有問題，`npm run build` 成功，輸出「dist/ 檢查通過：3 個檔案，無 Airtable 網址、token 或 Base ID」。
- `npx vitest list | wc -l` = **541**（≥ 541）。

### dist grep 結果

| 條件 | 結果 |
|------|------|
| `["'\`]/api/v1/public`（相對路徑） | 0 |
| `https://api.krd.com.tw/api/v1/public` | 1 |
| `localhost:<埠>` | 0 |
| `localhost` 總數／axios 後備字串 `window.location.href\|\|"http://localhost"` 出現次數 | 1 / 1 |

- dist 檔案：`assets/index-Dyy0baVP.js`、`assets/index-_Rdu5lwP.css`
- `DIST_DIGEST` = `e02be75b9ebe8ec7f2a0f07c0f5e9c3ef8e80766c34e1e4d6c7f021777612c35`

## Task 2：本機 production 模式實測（D-03）

完整紀錄在 `11-PREFLIGHT.md`。結果是 **8 項 pass，0 項 fail**，涵蓋：

- preview proxy 與 SPA fallback 的 curl 確認
- 輪播間隔與暫停
- 8 條舊網址
- 深連結與重新整理（只發 1 次 API 請求）
- 找不到商品、找不到頁面
- 3 頁 × 3 寬度的 RWD

API 請求約 20 次。收尾時 preview 已停止、暫存目錄已刪除，dist 指紋沒變。

## Deviations

- **D-02 的 localhost 條件改得更精確。** axios 第三方程式碼裡固定有 `window.location.href||"http://localhost"` 這個後備值，所以照字面要求「dist 不含 localhost」一定會失敗。改成兩個條件：`localhost:<埠>` 必須是 0；`localhost` 總數必須等於 axios 字串的出現次數。這樣檢查的仍是原本的意圖：API base 不能指向本機。

## 11-02 上線確認用

- **main 同步：** main 沒有新 commit，redesign 已包含 main 的全部內容。
- **本地 main 有 13 個從未 push 的 commit（`git log origin/main..main`）。** production 目前停在 `579faba`（v1.0 Phase 5 收尾），之後的 commit 都還沒上線，其中有 3 個是程式修正：
  - `8d6248c` fix(05): WR-01 點擊輪播按鈕後不再讓自動播放停住
  - `507c390` fix(05): WR-02 觸控裝置點擊輪播後不再黏在暫停狀態
  - `f4c22ef` fix(05-05): 觸控點擊輪播後焦點不再讓自動播放停住

  其餘 10 個是文件，以及 v1.0 封存（`cb8906d`、`bb92d3c`、`9497e01` 等）。這次 push 會把這些和 v1.1 一起帶上線。
- **待確認清單：**
  - A5：兩組熱銷輪播各自有一組控制列（`08-shell-redesign/uat/a5-featured-1440.png`、`a5-featured-320.png`）。
  - 分類 tag 顯示後端原始分類「喇叭」，麵包屑顯示分類頁標題「擴大機 / 喇叭」。
  - 價格格式是 `NT$12,345`，沒有空格。
  - human-needed 實機項目：Windows antialias、實機觸控、iOS safe-area、iOS 剪貼簿、真實多變體資料、手機返回手勢。
- **要部署的 dist JS 檔名：** `index-Dyy0baVP.js`（11-02 用來判定部署是否完成）。
