---
phase: quick-261111-k1m
plan: 01
status: complete
subsystem: ui
tags: [contact, google-maps, store-photos, hero]
requirements: [QUICK-261111-k1m]
key-files:
  created:
    - public/store/storefront.webp
    - public/store/entrance.webp
    - public/store/screen.webp
    - src/pages/HomePage.heroFallback.test.tsx
  modified:
    - src/config/contact.ts
    - src/config/contact.test.ts
    - src/components/ContactBlock.tsx
    - src/components/ContactBlock.test.tsx
    - src/components/Footer.test.tsx
    - src/components/Layout.test.tsx
    - src/pages/HomePage.tsx
    - src/pages/HomePage.test.tsx
    - src/pages/AboutPage.test.tsx
decisions:
  - 聯絡區地圖改用免金鑰 Google 地圖 iframe（使用者核准，偏離 06-UI-SPEC「不嵌 iframe」）
  - 店面照片放 CONTACT.storePhotos；首頁 hero 取 storePhotos[0]，路徑只定義一次
  - 照片列手機單欄、md 以上三欄，不用橫向捲動（overflow 會裁掉傾斜角落與膠帶）
metrics:
  completed: 2026-11-11
  tests_before: 543
  tests_after: 557
---

# Quick 261111-k1m：店面地圖、照片與收工時間 18:00 Summary

收工時間改為「週一至週五 09:00 - 18:00」；聯絡區的地圖預留位換成羽程企業社的免金鑰 Google 地圖 iframe，下方加「在 Google 地圖開啟 →」連結；聯絡區加入 3 張店面 WebP 照片；首頁 hero 的店面照片預留位也換成店面外觀照片。三處都是設定值有內容才顯示，沒設定時退回原本的預留位。

## Commits

| Task | Commit | 訊息 |
|------|--------|------|
| 1 | 258b267 | feat(quick-261111-k1m): 收工時間改為 18:00，聯絡區嵌入 Google 地圖與開啟連結 |
| 2 | 4d5f2e5 | feat(quick-261111-k1m): 聯絡區加入三張店面照片 |
| 3 | b33ca63 | feat(quick-261111-k1m): 首頁 hero 以店面照片取代預留位 |

每個 commit 前都跑過 `npm test`、`npm run lint`、`npm run build`（含 dist 憑證掃描），全部通過。

## RED 紀錄（沒有另外做 RED commit）

**Task 1：8 則失敗（30 則通過）**
- contact.test.ts > CONTACT > 必填欄位與 UI-SPEC 完全一致
- contact.test.ts > CONTACT > mapEmbedUrl 為羽程企業社的免金鑰 Google 地圖嵌入網址
- contact.test.ts > CONTACT > mapUrl 為 Google 地圖店家頁連結
- ContactBlock.test.tsx > 顯示標題「有空來店裡坐坐」、地址與 Google 地圖嵌入
- ContactBlock.test.tsx > 「在 Google 地圖開啟 →」連結指向 mapUrl，開新分頁並防 tabnabbing
- ContactBlock.test.tsx > 顯示營業時間與休息備註
- Footer.test.tsx > address 變體預設顯示 CONTACT 的地址與營業時間
- Layout.test.tsx > footer=address 顯示地址頁尾

（兩則 fallback 測試和 splitBusinessHours 在 RED 階段就通過：fallback 驗的是原本就有的預留位行為，splitBusinessHours 是純函式，只換了輸入字串。）

**Task 2：5 則失敗（51 則通過）**
- contact.test.ts > CONTACT > storePhotos 依序為店面外觀、正門與招牌、門口屏風
- ContactBlock.test.tsx > 預設顯示 3 張店面照片，alt 與 src 依序正確
- ContactBlock.test.tsx > 店面照片皆 lazy、async 解碼、object-cover，width/height 與設定一致
- AboutPage.test.tsx > 版面與聯絡資訊 > 聯絡區顯示 3 張店面照片與 Google 地圖
- HomePage.test.tsx > 版面 > 聯絡區顯示 3 張店面照片與 Google 地圖

（「storePhotos 為空陣列／未設定時不渲染照片列」在 RED 階段就通過，因為當時照片列還不存在。）

**Task 3：2 則失敗（16 則通過）**
- HomePage.test.tsx > 版面 > hero 顯示店面照片，取代店面照片預留位
- HomePage.test.tsx > 版面 > hero 店面照片在首屏立即載入、object-cover，width/height 與設定一致

（HomePage.heroFallback.test.tsx 在 RED 階段就通過，因為驗的是原本就有的預留位。）

## 舊斷言 → 新斷言

1. contact.test.ts「必填欄位與 UI-SPEC 完全一致」：`businessHours: "週一至週五 09:00 - 17:30"` → `"週一至週五 09:00 - 18:00"`（phone 不變）
2. contact.test.ts splitBusinessHours：輸入 `"週一至週五 09:00 - 17:30"`、期望 `["週一至週五", "09:00 - 17:30"]` → 輸入 `"… 18:00"`、期望 `["週一至週五", "09:00 - 18:00"]`（「全年無休」案例保留）
3. ContactBlock.test.tsx「顯示營業時間與休息備註」：`/週一至週五 09:00 - 17:30/` → `/週一至週五 09:00 - 18:00/`
4. ContactBlock.test.tsx「顯示標題「有空來店裡坐坐」、地址與地圖預留位」：`getByRole("img", { name: "地圖（待嵌入）" })` 存在 → 改名為「…地址與 Google 地圖嵌入」：`getByTitle("羽程企業社 Google 地圖")` 是 IFRAME、src 等於 `CONTACT.mapEmbedUrl`、loading=lazy、referrerpolicy=no-referrer-when-downgrade，且 `queryByRole("img", { name: "地圖（待嵌入）" })` 為 null。原本驗預留位的部分改由新增的 fallback 測試保留（未設定 mapEmbedUrl/mapUrl → 顯示預留位、沒有 iframe、沒有開啟連結；mapEmbedUrl 純空白 → 顯示預留位）
5. Footer.test.tsx、Layout.test.tsx：「© KRD・411 台中市太平區永平路二段320之1號・週一至週五 09:00 - 17:30」→「…・週一至週五 09:00 - 18:00」
6. HomePage.test.tsx「店面照片預留位 role=img 名稱為店面照片（待提供）」：`getByRole("img", { name: "店面照片（待提供）" })` 存在 → 改為「hero 顯示店面照片，取代店面照片預留位」：`getByAltText("羽程企業社店面外觀")` 的 src 為 `/store/storefront.webp`，且 `queryByRole("img", { name: "店面照片（待提供）" })` 為 null。另新增「hero 店面照片在首屏立即載入…」（loading=eager、width 1200、height 900、object-cover）。預留位的斷言搬到 `HomePage.heroFallback.test.tsx`，在那裡用 `vi.mock` 把 `CONTACT.storePhotos` 設成 undefined

## 偏離 UI-SPEC 的說明（iframe）

`.planning/phases/06-design-lock/06-UI-SPEC.md` §素材預留位的「地圖」列原本寫「不嵌 iframe，避免第三方腳本」。這次使用者明確核准改用 Google 地圖 iframe 嵌入（核准來源：本 quick task 計畫 261111-k1m-PLAN.md 的 context 段落），以本計畫為準，UI-SPEC 本身沒有修改。降低風險的做法：只用免金鑰的公開網址、`loading="lazy"`、`referrerPolicy="no-referrer-when-downgrade"`、不加 allowfullscreen；`ContactBlock.tsx` 內也用繁中註解記下這個偏離。

## Deviations from Plan

1. **[範圍追加，orchestrator 核准] Task 3：首頁 hero 店面照片。** 計畫原本寫「hero 預留位不在本次範圍」，後來 orchestrator 核准追加。hero 取 `CONTACT.storePhotos?.[0]`，路徑沒有寫兩次。alt 用「羽程企業社店面外觀」，有 width/height、eager、object-cover。照片框沿用預留位的高度（200/320/420px）、圓角（block / md:panel）和傾斜（1.5deg / md:2deg），不會造成版面位移。邊框從虛線改成實線 `border-dash`，和地圖框一致，粗細不變，所以框的尺寸也不變。原本的 hero 預留位並沒有膠帶樣式，所以沒有膠帶需要保留。fallback 用 `storePhotos` 是否有值判斷，成本很低，所以有做，並有獨立測試。
2. 其他照計畫執行。沒有遇到任何守衛拒絕。

## 驗證

- `npm test`：557 passed（原本 543）
- `npx vitest list | wc -l`：557
- `npm run lint`：通過；`npm run build`：通過，dist 掃描通過，`dist/store/` 內有 3 張 webp
- `grep -rn "17:30" src`：0 筆
- 非測試的 ts/tsx 中，「永平路」只出現在 `src/config/contact.ts`；`storefront.webp` 路徑也只在 contact.ts 定義一次
- `.planning/config.json`、`.planning/phases/11-release/11-02-SUMMARY.md` 都沒有 stage；仍在 redesign 分支，沒有 push

## Known Stubs

無。地圖和 hero 的預留位只在設定值缺少時才會出現，屬於刻意保留的 fallback。

## Self-Check: PASSED

- 3 張 webp、HomePage.heroFallback.test.tsx 都存在
- commit 258b267、4d5f2e5、b33ca63 都在 git log 裡
