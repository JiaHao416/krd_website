---
phase: 03-airtable
fixed_at: 2026-11-10T14:32:00Z
review_path: .planning/phases/03-airtable/03-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 3
skipped: 2
status: partial
---

# Phase 3：程式碼審查修正報告

**Fixed at:** 2026-11-10T14:32:00Z
**Source review:** .planning/phases/03-airtable/03-REVIEW.md
**Iteration:** 1

**Summary:**
- 範圍內的問題（Critical + Warning）：5
- 已修正：3
- 略過：2

每個修正 commit 都跑過 `npm test`、`npm run lint`、`npm run build`，三項全部通過（最終 205 個測試；`npm run check:dist` 也通過）。

## 已修正

### CR-01：手機選單 `max-h-96` 會裁掉後面幾個項目與「商店介紹」

**修改的檔案：** `src/components/NavBar.tsx`
**Commit:** 9e32b14
**修正內容：** 手機選單展開時的 `max-h-96` 改成 `max-h-[40rem]`（640px，內容估計約 585px），其他 class 都沒動。已確認 Tailwind 有產生 `max-h-\[40rem\]{max-height:40rem}`。jsdom 不計算版面，所以這項修正**還需要 orchestrator 用瀏覽器在 375px 寬度確認**「擴大機 / 喇叭」、「配件」、「商店介紹」都看得到、點得到。

### WR-02：`NAV_ITEMS` 在模組載入時就用未受型別保護的索引取值

**修改的檔案：** `src/services/catalog.ts`、`src/config/productPageViews.tsx`、`src/config/navigation.ts`
**Commit:** 72fd72e
**修正內容：** 清單改寫成 `PRODUCT_PAGE_LIST = [...] as const satisfies readonly ProductPageConfig[]`，再從它推導出 `ProductPagePath` 字面值聯集。對外匯出的 `PRODUCT_PAGES` 型別是 `readonly (ProductPageConfig & { path: ProductPagePath })[]`，陣列和順序都沒變。`PRODUCT_PAGE_VIEWS` 的型別從 `Record<string, …>` 改成 `Record<ProductPagePath, ProductPageView>`，`NavItem.path` 也一併收窄成 `ProductPagePath`。驗證方式：暫時刪掉 `/accessories` 的 view 後，`tsc -b` 回報 TS2741（缺少 `"/accessories"`）；還原後通過。執行期行為不變。

### WR-04：兩份 FORBIDDEN 規則各自維護，沒有機制保證一致

**修改的檔案：** `src/noAirtable.test.ts`、`scripts/check-dist.mjs`（只改註解）
**Commit:** 09927ec
**修正內容：** 採用「同步斷言」，沒有抽共用模組。原因是要讓 TS 測試 import `.mjs`，得另外加型別宣告或 `@types/node`，超出這次的範圍。新測試用 `import.meta.glob(..., { query: "?raw" })` 讀入 `check-dist.mjs`，取出 `const FORBIDDEN = [ ... ];` 區塊裡的每一行，和測試端規則序列化後的 `["名稱", /regex/flags],` 逐條雙向比對。驗證方式：暫時把腳本裡一條 regex 的 `{14}` 改成 `{15}`，測試失敗；還原後通過。審查建議的第 2 點（把 source 掃描的 glob 擴大到 `index.html`、`vite.config.ts`）依 orchestrator 指示沒有做，避免擴大範圍。

## 略過

### WR-01：`check:dist` 沒有接進 build／部署流程，而且可能掃到舊的 dist

**File:** `package.json:8,10`、`scripts/check-dist.mjs:34-43`
**Reason:** 和已鎖定的決策 D-15 及計畫 03-03 衝突。D-15 決定不在 CI 加新步驟，計畫 03-03 寫明「check:dist 不加進 build」。要把它接進 `build` 或 `postbuild`，需要使用者重新決定，這次不修改，交給 orchestrator 向使用者提出。
**Original issue:** `build` 仍然是 `tsc -b && vite build`，Cloudflare Pages 部署時不會執行 `check:dist`。另外，腳本只檢查 `dist/` 存不存在，留著舊的 `dist/` 也可能「通過」。

### WR-03：桌機導覽列在 1024px 到約 1100px 之間可能放不下

**File:** `src/components/NavBar.tsx:81-155`
**Reason:** 這只是估算值（字型寬度沒有實測），而且改版前就存在，需要在瀏覽器實際量測才能判斷要不要修、怎麼修。依 orchestrator 指示略過，由 orchestrator 用瀏覽器確認。
**Original issue:** 桌機選單從 `lg` 開始顯示，估計總寬約 1,100px，超過 1024px 寬度下的可用空間（約 992px）。外層 flex 沒有 wrap，也沒有 overflow 處理，可能擠壓或溢出。

---

_Fixed: 2026-11-10T14:32:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
