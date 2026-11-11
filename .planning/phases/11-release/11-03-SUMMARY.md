---
phase: 11-release
plan: 03
subsystem: release
tags: [production, uat]
requires: ["11-02"]
provides:
  - production 實測（11-UAT.md）
affects: []
key-files:
  created:
    - .planning/phases/11-release/11-UAT.md
  modified: []
requirements-completed: []
completed: 2026-11-11
---

# Phase 11 Plan 03：production 實測與回滾判定

**www.krd.com.tw 的 7 項實測全部通過，沒有阻擋性問題，不需要回滾。**

- 實測內容（D-06）：深連結與重新整理、找不到商品、找不到頁面、8 條舊網址、熱銷輪播的間隔與暫停、3 頁 × 3 寬度的 RWD。另外也確認上線前調整都已生效：hero 店面照、Google 地圖、3 張店面照片、營業時間 18:00，以及沒有價格請來電和洽詢交期。
- API 請求約 15 次，遠低於每分鐘 60 次的上限。
- 回滾判定（D-07）：沒有阻擋性問題，不執行回滾。回滾指引見 11-02-SUMMARY。
- human-needed 實機項目列在 11-UAT.md，交給使用者確認。
