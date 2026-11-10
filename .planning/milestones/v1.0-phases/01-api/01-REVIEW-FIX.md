---
phase: 01-api
fixed_at: 2026-11-10T03:40:21Z
review_path: .planning/phases/01-api/01-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 01: Code Review 修正報告

**修正時間：** 2026-11-10T03:40:21Z
**來源審查：** .planning/phases/01-api/01-REVIEW.md
**輪次：** 1

**摘要：**
- 範圍內問題：6（Critical 1、Warning 5；Info 不在 `critical_warning` 範圍）
- 已修正：6
- 已略過：0

每個行為修正都先補一個會失敗的測試（紅燈），再改程式（綠燈），測試和修正放在同一個 commit。每個 commit 後都確認 `vitest run`、`npm run build`（含 `tsc -b`）通過，改到的檔案也跑過 `npx eslint`。測試數從 80 增加到 91。

## 已修正問題

### CR-01：單筆商品格式不符時拋出 TypeError，不是 ApiError，而且整頁失敗

**修改檔案：** `src/services/products.ts`、`src/services/products.test.ts`
**Commit：** c8f81e3
**修正內容：** 新增 `isPublicProduct` 型別守衛，逐筆檢查 `id`、`name`、`category` 是字串、`in_stock` 是布林。`fetchProducts` 先過濾再 `map(toProduct)`；有項目被略過時 `console.warn` 一次。這裡選擇「略過」而不是整批拋出 `ApiError`，是為了不讓一筆壞資料讓整頁都無法顯示。新增測試涵蓋 `name: null`、元素為 `null`、`in_stock` 非布林，以及 warn 只觸發一次。
**狀態：** fixed: requires human verification（屬資料處理邏輯，請確認「略過」策略符合預期）
**備註：** 價格欄位（`price_min`/`price_max`）沒有驗證型別；缺少這兩個欄位時 `priceText` 可能變成 `NT$NaN`，但不會拋錯。審查建議的最低欄位已經涵蓋，要不要加嚴可在 Phase 2 再決定。

### WR-01：`.env.example` 照慣例複製成 `.env` 會讓 production 打包改打相對路徑

**修改檔案：** `.env.example`
**Commit：** 7cbef6f
**修正內容：** `VITE_API_BASE_URL` 預設改成註解，範例值改為 production 絕對網址，並說明不要在 `.env` 填相對路徑；dev 用的相對路徑已經寫在 `.env.development`。

### WR-02：請求被取消時被歸類為 network 錯誤

**修改檔案：** `src/services/errors.ts`、`src/services/errors.test.ts`、`src/services/products.test.ts`
**Commit：** 343e815
**修正內容：** `ApiErrorKind` 新增 `"canceled"`。`normalizeError` 在判斷網路錯誤之前先用 `axios.isCancel(error)` 攔下取消的請求。JSDoc 註明 UI 應依 `kind === "canceled"` 忽略；`getErrorMessage` 遇到 canceled 時退回通用文案。新增 normalizeError 與 fetchProducts 的取消測試。
**狀態：** fixed: requires human verification（新增錯誤種類，Phase 2 的 UI 需要配合略過 canceled）

### WR-03：`VITE_PROXY_TARGET` 使用 `VITE_` 前綴，註解「不會進入前端 bundle」不正確

**修改檔案：** `vite.config.ts`、`.env.example`
**Commit：** 8bb9f0d
**修正內容：** 變數改名為 `KRD_PROXY_TARGET`，`loadEnv(mode, ".", "")` 載入所有前綴（結果只在 node 端使用），並更正註解說明為什麼不用 `VITE_` 前綴。repo 目前沒有 `.env.development.local`，不需要搬移既有設定。
**注意：** `01-CONTEXT.md`、`01-RESEARCH.md`、`01-01-PLAN.md`、`01-PATTERNS.md` 仍寫 `VITE_PROXY_TARGET`。這些是歷史規劃文件，本次沒有修改；之後若要在本機連後端，請在 `.env.development.local` 使用 `KRD_PROXY_TARGET`。

### WR-04：name 與 brand/model 全部缺值時，商品名稱是空字串

**修改檔案：** `src/services/transform.ts`、`src/services/transform.test.ts`
**Commit：** a379897
**修正內容：** 名稱邏輯抽成 `resolveName`，順序是：trim 後的 `name` → trim 後的 `brand`/`model` 組合（非字串視為缺值）→ 新匯出的常數 `UNNAMED_PRODUCT = "未命名商品"`。有名稱時改回傳 trim 後的值，和 fallback 分支的行為一致。新增 3 個測試：前後空白、全部 null、全部只有空白。
**狀態：** fixed: requires human verification（保底文案「未命名商品」請確認是否合適）

### WR-05：total 超過 items 時只在 console 警告，呼叫端無法得知資料被截斷

**修改檔案：** `src/services/products.ts`、`src/services/products.test.ts`
**Commit：** 5d165c4
**修正內容：** `ProductListResult` 新增 `truncated: boolean`，值為 `total > 後端實際回傳筆數`；因 CR-01 被略過的格式不符商品不算截斷。既有的「查無商品」測試改為預期 `truncated: false`，另新增 true/false 兩個測試。同一個 commit 也順手把 CR-01 加的 JSDoc 說明移到 `@param` 前面（只調整註解位置）。Phase 2 的 UI 可以依這個旗標顯示提示。

---

_修正時間：2026-11-10T03:40:21Z_
_修正者：Claude (gsd-code-fixer)_
_輪次：1_
