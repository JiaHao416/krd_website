---
phase: 9
slug: product-detail
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-11-11
---

# Phase 9 — Validation Strategy

> 來源：09-RESEARCH.md §Validation Architecture。


## 測試框架
| 屬性 | 值 |
|------|----|
| 框架 | Vitest 4.1.12（projects：unit=node `src/**/*.test.ts`；component=jsdom `src/**/*.test.tsx`，setup `src/test/setup.ts`） |
| 設定檔 | `vite.config.ts` 的 `test.projects` |
| 快速執行 | `npx vitest run <檔案路徑>` |
| 完整套件 | `npm test && npm run lint && npm run build` |
| 數量檢查 | `npx vitest list \| wc -l`（起點 413，每個 plan 不得減少） |

## 需求 → 測試對照
| 需求 | 行為 | 類型 | 自動化指令 | 檔案存在？ |
|------|------|------|------------|------------|
| PROD-08 | 名稱、品牌·型號、分類 tag、說明 pre-line、保固 null 隱藏 | component | `npx vitest run src/components/ProductDetailView.test.tsx src/pages/ProductDetailPage.test.tsx src/components/SpecTable.test.tsx` | ❌ 新增 |
| PROD-09 | radiogroup 只在 ≥2 時出現、預設選中、方向鍵與 Home/End、切換後價格／現貨／SKU／主圖同步 | component | `npx vitest run src/components/VariantSelector.test.tsx src/components/ProductDetailView.test.tsx` | ❌ |
| PROD-10 | 無價顯示價格請來電 + 說明；有價顯示 priceText + 含稅；無變體視為無價；CTA 保留 | component | `npx vitest run src/components/PriceBlock.test.tsx` | ❌ |
| PROD-11 | 主圖 button 開啟 dialog「商品大圖」；無圖時為 `img` 暫無圖片，沒有 button | component | `npx vitest run src/components/ProductDetailView.test.tsx` | ❌ |
| PROD-12 | 麵包屑 href；直接開網址時備援 Link 指向分類 path；站內進入時按鈕 navigate(-1) | component | `npx vitest run src/components/ProductDetailView.test.tsx` | ❌ |
| PROD-12 | findCategoryPage 對應與退回 | unit | `npx vitest run src/config/categoryPage.test.ts` | ❌ |
| PROD-13 | notFound 顯示商品版 NotFoundState；非 UUID 不發請求；error 時 role=alert + retry 被呼叫；429 文案 | component | `npx vitest run src/pages/ProductDetailPage.test.tsx src/components/NotFoundState.test.tsx` | ❌ |
| PROD-14 | 複製文字格式（有／無型號）、成功→已複製→2 秒還原、失敗文案、卸載清除計時器 | unit + component | `npx vitest run src/pages/productDetailText.test.ts src/hooks/useCopyInquiry.test.tsx src/components/DetailCta.test.tsx src/components/DetailMobileBar.test.tsx` | ❌ |
| PROD-15 | 標題／description 正確，卸載後回到 KRD；notFound 標題；全域標題 | component | `npx vitest run src/components/ProductDetailView.test.tsx src/pages/ProductDetailPage.test.tsx src/pages/NotFoundPage.test.tsx` | ❌ |
| PROD-16 | 未知路徑、`/products` 顯示「找不到這一頁」；舊路由不受影響 | component | `npx vitest run src/App.test.tsx` | ✅ 擴充 |
| D-11 | Layout 預設單鈕列，傳入 slot 時取代 | component | `npx vitest run src/components/Layout.test.tsx` | ✅ 擴充 |
| D-12 | 詳情頁不呼叫 fetchProducts；不使用 innerHTML | component + 原始碼掃描 | App.test 斷言 `fetchProducts` 未被呼叫；可選：比照 noAirtable.test 用 `import.meta.glob` 掃描 `ProductDetailPage.tsx` 不含 `dangerouslySetInnerHTML` | 部分 |
| D-13 | token 規則 | unit | `npx vitest run src/designTokens.test.ts` | ✅ |

## 取樣頻率
- **每個 task commit：** 跑該檔的 `npx vitest run <file>`，再跑 `npm test && npm run lint && npm run build`（D-13 規定每個 commit 都要全綠）
- **每個 wave 結束：** 完整套件 + `npx vitest list | wc -l`
- **Phase gate：** 完整套件全綠 + 09-UAT.md 完成

## Wave 0 缺口
無。框架、setup、user-event、jest-dom 都已具備。新測試檔隨各 plan 的 TDD RED 一起建立。

## 瀏覽器 UAT 步驟（D-14，給收尾 plan）
1. `npm run dev -- --port 5173 --strictPort`（Vite proxy → production API）。
2. 真實 id：`6d660a71-98b6-4b18-95ee-a2175aeab9c8`（BB1，取自 07-API-SAMPLES：model null、description null、warranty null、單一變體、價格 null、`in_stock=false`）。可預期：沒有 radiogroup、顯示「價格請來電」、顯示「洽詢交期」、沒有說明區、規格表只有 SKU、標題 `BB1 | KRD`、description `MICGO 喇叭`、麵包屑「擴大機 / 喇叭」→ `/trumpet`、有主圖可開燈箱。若 id 已失效，開 `/all-products` 後從 devtools network 的 `/api/v1/public/products?limit=100` 回應取一個 id（只會產生頁面本來就會發的那次請求）。
3. 320／768／1440 各截圖一次：320 有雙鈕固定列、沒有行內 CTA；768 與 1440 有行內 CTA、沒有固定列；1440 為兩欄 5fr/6fr；320 寬時 `scrollWidth === 320`；固定列不遮住頁尾。
4. 燈箱：點主圖 → dialog 開啟、焦點在關閉鈕；Esc 關閉後焦點回到主圖。
5. 複製：localhost 下點「複製詢價訊息」→ 按鈕變「已複製」，約 2 秒後還原；用 `navigator.clipboard.readText()` 驗證內容格式（可能需要權限，不行就標 human-needed）。
6. 返回：(a) 新分頁直接開詳情 → 顯示「← 回到擴大機 / 喇叭」連結；(b) 從 `/trumpet` 在網址列以 SPA 方式導航進入（Phase 10 前沒有卡片連結，可以用 `history.pushState` + `popstate`，或在 devtools evaluate 中觸發 router 導航）→ 顯示「← 回上一頁」，點擊回到 `/trumpet`。站內進入若無法自動化，標 human-needed。
7. `/products/00000000-0000-4000-8000-000000000001` → 「找不到這個商品」、標題 `找不到商品 | KRD`、按鈕連到 `/all-products`。
8. `/products/not-a-uuid` → 同上，且 network 中**沒有**詳情請求。
9. `/whatever-404` → 「找不到這一頁」、標題 `找不到頁面 | KRD`、按鈕連到 `/`、有單鈕固定列。
10. 離開詳情頁（點 Logo 回首頁）→ 分頁標題回到「KRD」。
11. 變體切換、有價格版面：production 沒有資料時標 human-needed。
12. 鍵盤：Tab 進入 radiogroup 時確認焦點環可見（陷阱 4；只有在有多變體商品時才能驗證）。


## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 真實瀏覽器詳情頁各狀態、RWD、複製、燈箱、返回 | PROD-08~16 | 需真實瀏覽器 | 主 session 以 chrome-devtools MCP 於 320/768/1440 實測，寫 09-UAT.md |
| 多變體、有價商品 | PROD-09/10 | production 目前無此資料 | 若無資料列 human-needed，由元件測試涵蓋 |

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true`

**Approval:** pending
