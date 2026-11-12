# Project Retrospective

*每個 milestone 結束後更新，教訓帶入下一輪規劃。*

## Milestone: v1.0 — API 遷移與停用 Airtable

**Shipped:** 2026-11-10
**Phases:** 5 | **Plans:** 22

### What Was Built
- Vitest 測試基礎與 API 資料層（client、轉換、錯誤分類）
- 8 個商品分類頁與首頁熱銷改讀後端公開 API，含載入／錯誤／空狀態
- Logo、導覽、關於我們固化為 repo 靜態檔，刪除 Airtable 程式
- production 驗收後撤銷舊 token；build 內建 dist 憑證掃描
- 輪播無障礙（WCAG 2.2.2）與 Vite 範本殘留清理

### What Worked
- 依「先抓靜態內容 → 移除程式 → production 驗收 → 撤銷 token」排序，撤銷後網站零中斷
- 原始碼掃描測試加上 build 內建 dist 掃描，雙層防止憑證回歸
- 由 Claude 以真實瀏覽器（Claude in Chrome、DevTools 模擬）做 UAT，記錄每 200ms 的輪播狀態作為客觀證據

### What Was Inefficient
- 輪播暫停邏輯修了三輪：05-01 接受「點擊後停住」為取捨 → code review 視為 warning 修正（WR-01/02）→ UAT 才發現觸控事件順序（pointerup 之後才 focus）讓 WR-01 修正失效
- jsdom 對 `:focus-visible` 一律判 true，審查建議的寫法無法測試，需改以事件序列判斷

### Patterns Established
- 互動行為的 bug，測試要依瀏覽器真實事件順序觸發（滑鼠、觸控、鍵盤各一條路徑），並確認修正前紅燈
- 每次 commit 必須 `npm test`、`npm run lint`、`npm run build` 全綠，紅燈證據記在 SUMMARY 而非單獨 commit
- push `main` 即上線，push 一律等使用者確認

### Key Lessons
1. 觸控與滑鼠的事件順序不同（觸控的相容 mousedown／focus 在 pointerup 之後），處理指標狀態時要分開考慮 pointerType
2. code review 的修正建議要先確認在測試環境（jsdom）可被驗證，否則測試會給出假的安全感
3. 「已知取捨」若影響一般使用者（手機點一下就停住），應直接修正而非記錄

---

## Milestone: v1.1 — UI 重新設計與商品詳情頁

**Shipped:** 2026-11-11
**Phases:** 6 | **Plans:** 26（另有 2 個上線前 quick task）

### What Was Built
- C5a 設計規格（UI-SPEC、示意稿）與 63 條測試契約清單
- 商品詳情資料層（service、transform、`useProductDetail`，404／400／429 分類）
- 語意 token 與新骨架（膠囊頂列、分類 chip、頁尾、手機撥號列、skip link），首頁／分類頁／關於我們改版
- `/products/:id` 詳情頁（變體、價格、燈箱、複製詢價、麵包屑與返回、標題）與 NotFound
- 商品卡與熱銷便條卡連到詳情頁；上線前加入 Google 地圖、店面照片，移除價格請來電與洽詢交期

### What Worked
- 先鎖設計與測試契約（Phase 6）再寫 UI：重設計期間 215 → 557 項，63 條契約全數保留，不靠記憶判斷「這個斷言能不能刪」
- 每個 phase 由主 session 用 chrome-devtools MCP 做真實瀏覽器 UAT，抓到 jsdom 看不到的問題（Logo 對比、分類名稱被擠成直排）
- `*.pages.dev` 不在 CORS 白名單時，用 production 模式 bundle + `vite preview` proxy 做 preflight，上線後 production 實測零問題
- 初次 push 前把待確認清單攤給使用者，使用者因此在上線前提出價格文案、營業時間、地圖與照片的修正

### What Was Inefficient
- 上線前才發現網站聯絡資料（打烊時間、電話）與 Google 商家不一致，應在設計鎖定時就比對外部來源
- `gsd-sdk` 自動擷取的 milestone 成果與 audit-open 對 UAT／quick task 狀態有誤判，需要人工改寫與逐項說明
- code review 才發現整卡連結的 accessible name 重複念名稱、念到描述，名稱測試只用 regex 部分比對而沒抓到

### Patterns Established
- 整卡連結用 `aria-labelledby` 指向名稱與價格，補充資訊放 `aria-describedby`；名稱測試用精確字串
- 聯絡資訊（含地圖網址、店面照片）集中在 `src/config/contact.ts` 單一來源，並有測試確認地址只出現在一處
- 外部嵌入一律選免金鑰方案（Google Maps `output=embed`），照片轉 WebP 放 `public/`
- push 前固定流程：本機 merge → main 上全綠與 dist grep → 呈現清單等使用者明確同意 → push → 輪詢 bundle 檔名判定部署完成 → production 實測

### Key Lessons
1. 對外顯示的店家資訊要和 Google 商家等外部來源核對，並請使用者確認哪一邊正確
2. AI 修圖會改動招牌小字與場景細節，放上網站前要逐張比對原圖並告知使用者
3. 可及名稱的測試要用精確字串，否則重複或多餘的朗讀內容會漏網

### Cost Observations
- Model mix: 主 session 與子代理皆 Opus（balanced profile）
- Sessions: 2（含一次 context 壓縮）
- Notable: 2 天內完成 6 個 phase，子代理平行處理 review 與 verify 節省等待時間

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Key Change |
|-----------|--------|------------|
| v1.0 | 5 | 導入 GSD 流程、Vitest、由 Claude 以真實瀏覽器 UAT |
| v1.1 | 6 | 設計鎖定與測試契約先行、長壽分支開發、push 前 production 模式 preflight |

### Cumulative Quality

| Milestone | Tests | Notes |
|-----------|-------|-------|
| v1.0 | 215 | build 內建 dist 憑證掃描 |
| v1.1 | 557 | designTokens 掃描、63 條契約保留、每 phase 真實瀏覽器 UAT |
