# Phase 6: 設計鎖定與測試盤點 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-11
**Phase:** 06-design-lock
**Areas discussed:** 盤點清單的形式、契約／呈現的分界、總數基準怎麼守、文件同步與依賴移除（全部交由 Claude 決定）

---

## 灰色地帶選擇

| Option | Description | Selected |
|--------|-------------|----------|
| 盤點清單的形式 | 只寫 .planning 文件，還是也在測試程式碼標記？逐條 it 還是以 describe 為單位？ | |
| 契約／呈現的分界 | 文案、data-testid、className 斷言算哪類？services unit 測試是否全算契約？ | |
| 總數基準怎麼守 | 只記錄 215，還是加自動檢查腳本？ | |
| 文件同步與依賴移除 | 是否同步 SHELL-02／ROADMAP P8 #2 的 SideMenu 文字？移除依賴時是否比對 CSS 產出？ | |

**User's choice:** 「你決定」——全部交由 Claude 決定。
**Notes:** UI-SPEC 已於同日核准，DESIGN-01 不再討論。

---

## Claude's Discretion

- 盤點形式：單一 `06-TEST-INVENTORY.md`、逐條 it、不在程式碼加標記、列數必須等於 215（D-01～D-04）
- 分界：unit 測試預設契約；UI-SPEC 保留的文案視為契約；testid／className 為呈現；混合型歸契約（D-05～D-10）
- 基準：215／17 檔；不加自動化腳本，改由各 phase verify 把關（D-11、D-12）
- 文件同步：REQUIREMENTS SHELL-02、ROADMAP P8 #2、PROJECT Target features 改為分類 chip（D-13）
- 依賴移除：兩個獨立 commit、比對 CSS 產出、同步 CLAUDE.md 與 STACK.md（D-14～D-16）

## Deferred Ideas

- 自動化測試數量／契約斷言檢查腳本（視 Phase 8 情況再評估）
- Tailwind v4 升級（MAINT-F-01）
