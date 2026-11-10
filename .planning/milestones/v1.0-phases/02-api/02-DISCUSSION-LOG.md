# Phase 2: 商品頁與首頁熱銷改讀後端 API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-10
**Phase:** 02-商品頁與首頁熱銷改讀後端 API
**Areas discussed:** （使用者全數交由 Claude 決定）

---

## 灰色地帶選擇

| Option | Description | Selected |
|--------|-------------|----------|
| 失敗與空狀態畫面 | 錯誤畫面樣式、重試按鈕位置；首頁某組輪播失敗或無商品時的處理 | |
| 商品卡片內容 | 價格全為 null 時「價格洽詢」放哪；缺圖佔位圖樣式 | |
| 排序下拉選單行為 | `/new-products` 鎖定排序時下拉選單隱藏或停用；切換排序的載入方式 | |
| 路由與頁面設定搬遷 | App.tsx 8 條 Route 改由設定產生，或只換資料來源 | |

**User's choice:** 「都你決定」
**Notes:** 四個區域皆由 Claude 依專案限制與 Phase 1 決策選定預設，見 CONTEXT.md D-01～D-18。

---

## Claude's Discretion

- 失敗與空狀態：共用 hook、商品頁錯誤卡片 + 重新載入、首頁兩組輪播獨立處理（D-01～D-05）
- 商品卡片：價格徽章僅在有價時顯示、內文顯示「價格洽詢」、inline 佔位圖、缺圖不開燈箱（D-06～D-10）
- 排序：鎖定排序的頁面隱藏下拉選單、切換時保留舊列表淡化（D-11～D-13）
- 路由：title/description/icon 搬入設定、Route 由設定產生、路徑不變並有測試（D-14～D-16）
- 測試：導入 jsdom + testing-library，元件與 hook 行為測試（D-17～D-18）

## Deferred Ideas

- 多頁抓取、現貨顯示、跨頁快取、NavBar/SideMenu 共用設定（Phase 3）
