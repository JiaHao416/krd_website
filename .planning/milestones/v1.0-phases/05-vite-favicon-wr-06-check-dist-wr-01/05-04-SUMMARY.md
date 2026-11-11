---
phase: 05-vite-favicon-wr-06-check-dist-wr-01
plan: 04
subsystem: release
tags: [verification, deploy, a11y]

requires:
  - phase: 05-01
    provides: 輪播暫停
  - phase: 05-02
    provides: 範本殘留清理
  - phase: 05-03
    provides: build 串接 dist 掃描
provides:
  - Phase 5 瀏覽器驗收證據
  - production 部署確認
affects: []

key-files:
  created: []
  modified: []

key-decisions:
  - "使用者要求由 Claude 代為瀏覽器驗收；reduced-motion 以替換 matchMedia + 站內換頁重新掛載模擬（無法操作 DevTools Rendering 面板）"

requirements-completed: []

duration: 15min
completed: 2026-11-10
---

# Plan 05-04：收尾關卡（驗收與部署）

**本機 gate 全綠、瀏覽器驗收輪播暫停行為通過，經使用者同意 push main，production 已部署新版。**

## Task 1：自動化 gate

- `npm test` 209 通過、`npm run lint` exit 0、`npm run build` exit 0（輸出「dist/ 檢查通過：3 個檔案」，無 caniuse-lite 警告）
- `dist/index.html`：`lang="zh-Hant-TW"`、`type="image/png"` 各 1 處；`dist/vite.svg` 不存在
- 待 push commit 不含 Co-Authored-By／Generated with（計數 0）
- dev server 於 http://localhost:5173/ 回應 200

## Task 2：瀏覽器驗收（Chrome，localhost:5173）

使用者回覆原文：「你去驗收啊」→ 由 Claude 以 Claude in Chrome 實際操作驗收，每 200ms 記錄兩組輪播的作用中圓點。

| 項目 | 結果 |
|------|------|
| 外觀／按鈕／favicon | 通過：兩組按鈕僅上一張、下一張、第 N 張；lang 與 favicon type 正確 |
| 游標在外自動切換 | 通過：左組 5.0s、右組 5.5s 間隔 |
| 真實滑鼠 hover 左組 12 秒 | 通過：左組不動、右組切換 2 次；移開後約 3 秒恢復 |
| reduced-motion: reduce（模擬） | 通過：兩組 12 秒皆不切換；「下一張」與圓點手動切換正常 |
| 取消 reduced-motion（change 事件） | 通過：兩組恢復 5.0s／5.5s 自動切換 |

模擬方式：替換 `window.matchMedia` 對 reduced-motion 回傳可控 MQL，經 `history.pushState` + `popstate` 換頁讓輪播重新掛載（確認 2 個 listener 已訂閱），再派送 change 事件測試即時切回。驗收後重新整理還原、關閉分頁並停止 dev server。

使用者對 push 的回覆原文：「好喔推」

## Task 3：push 與 production 確認

- `git push origin main`：`16ecbd6..29aa578`（19 個 commit），未使用 --force／--no-verify；推送後 `origin/main..HEAD` 為 0
- 16:04:37 確認 https://www.krd.com.tw/ 含 `lang="zh-Hant-TW"` 與 `type="image/png"`
- 線上主要 bundle `/assets/index-CYOqhIyi.js`（與本機 build hash 相同）`grep -ci airtable` = 0
- `/vite.svg` 回傳 SPA fallback 的 index.html（非 SVG），檔案已不存在
- dev server 已停止（`lsof -i :5173` 無程序）

## Deviations

- reduced-motion 驗收未經 DevTools Rendering 面板，改以 matchMedia 替換模擬（使用者已被告知差異）。

## Self-Check: PASSED
