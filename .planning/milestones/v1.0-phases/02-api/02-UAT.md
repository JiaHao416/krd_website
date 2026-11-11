---
status: complete
phase: 02-api
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-06-SUMMARY.md]
started: 2026-11-10T05:06:00Z
updated: 2026-11-10T05:26:00Z
---

## Current Test

[testing complete]

## 驗收方式

依 02-05-PLAN Task 2 的 how-to-verify，由 orchestrator 以 Chrome DevTools MCP 對本機 `npm run dev`（dev proxy → production 公開 API）實測，使用者授權代為驗收（「你自己去網頁上幫我驗收」）。
production 資料目前沒有任何商品填價格或描述、也沒有缺圖，因此第 4 項的邊界情況以瀏覽器端攔截 XHR 回應、改寫資料的方式重現（只改瀏覽器內回應，未動後端與程式碼）。

## Tests

### 1. 首頁兩組熱銷輪播
expected: 熱門推薦／頂級精選各自顯示後台熱銷 1／熱銷 2 商品，有藍／紫漸層，首頁無價格
result: pass
note: 熱銷 1 = KRD K-67、KRD K-67非凡、KRD K-87；熱銷 2 = 配件、開關，與 `featured=1`／`featured=2` API 結果一致

### 2. 8 個分類頁（PROD-07）
expected: 標題與舊版相同，商品與後台該分類／品牌一致
result: pass
note: 8 頁卡片名稱集合與 API 完全相同（20／20／5／12／5／5／7／3 筆）；目前無空分類，空狀態僅由元件測試涵蓋

### 3. grid 卡片版面（價格、長名稱、長描述）
expected: 名稱兩行、有價格、描述兩行截斷時內容不溢出、不與「點擊查看大圖」重疊
result: issue
reported: "名稱兩行＋價格＋兩行描述時，grid 卡片（固定 h-96 = 384px）內容超出卡片底部，描述第二行與「點擊查看大圖」列被裁掉"
severity: major
resolution: "02-06 修正（commit dbaef99）：grid 描述 line-clamp-1、.product-info py-4 px-5、價格 mb-1；1280px 實測有描述 8px／無描述 17px，皆 ≥ 4px，重測通過"

### 4. 缺圖／破圖／鍵盤燈箱／列表檢視
expected: 缺圖與破圖顯示「暫無圖片」且不可點；有圖卡片 Tab＋Enter 開燈箱；列表檢視正常
result: pass

### 5. 排序
expected: /wired-micphone 選「最新優先」列表淡化後依上架時間排序；/new-products 無排序下拉；切到 /trumpet 排序回到「依名稱」
result: pass

### 6. 錯誤狀態與重試
expected: 分類頁離線顯示錯誤卡片與「重新載入」，恢復後重試成功；首頁兩組各自錯誤框、左右對稱；375px 正常
result: pass
note: 首頁兩個錯誤框寬 593／592px、同高同頂；右側錯誤框深色底較不明顯（cosmetic，未列 gap）

### 7. 後台修改即時反映（PROD-06，可選）
expected: 修改後台商品，快取過期後重新整理可見
result: pass
note: 以機制驗證（API max-age=60、邊緣不快取、前端無快取），詳見 02-HUMAN-UAT.md 第 1 項

### 8. Cloudflare Pages 建置（Node 版本）
expected: push main 後 Pages 建置成功、Node 為 .nvmrc 版本
result: pass
note: 2026-11-10 push 4c89b38，Pages 建置 success、線上新版正常；詳見 02-HUMAN-UAT.md 第 2 項

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "grid 卡片在名稱兩行、有價格、描述兩行時內容不溢出，「點擊查看大圖」列完整可見"
  status: resolved
  reason: "User reported: 名稱兩行＋價格＋兩行描述時，grid 卡片內容超出 h-96 卡片底部，描述第二行與「點擊查看大圖」列被裁掉"
  severity: major
  test: 3
  root_cause: "src/components/ProductCard.tsx grid 卡片固定 h-96、圖片 h-64，product-info 只剩約 128px；名稱 line-clamp-2（min-h 2.5rem）＋價格行＋描述 line-clamp-2＋底部列超過可用高度。02-UI-SPEC 已規定放不下時描述縮為 line-clamp-1（以不溢出為準），02-04 在 jsdom 無法量測版面而未套用"
  artifacts: ["src/components/ProductCard.tsx"]
  missing: ["grid 模式描述改為 line-clamp-1（list 模式維持 line-clamp-2）", "對應元件測試斷言 grid 描述 class"]
  debug_session: ""
  resolved_by: "02-06（dbaef99）— 瀏覽器重測通過，見 02-06-SUMMARY「瀏覽器實測」"
