# Feature Landscape

**Domain:** B2B／盤商型音響麥克風品牌型錄網站（無購物車，洽詢為轉換）
**Milestone:** v1.1 UI 重新設計與商品詳情頁
**Researched:** 2026-11-10
**整體信心：** MEDIUM。以下依 B2B 型錄站與電商 PDP 的通用慣例、API 欄位與專案限制推導，未逐站驗證競品，沒有 Context7 或官方文件可查（此主題不適用）。標示 LOW 者需在 UI phase 驗證。

## 領域慣例摘要

這類網站的訪客是「已有採購意圖、要確認規格與聯絡方式」的零售店、工程商與個人客戶。慣例如下：

- 型錄站的轉換是「詢價／聯絡」，不是結帳。詳情頁的任務是讓人確認「是不是我要的東西」，並讓「怎麼聯絡」在一個動作內可達。
- 價格為「洽詢」時，業界做法是把它當成明確的 CTA 狀態（「詢價」「聯絡業務」），而不是空白或「N/A」。空白會被讀成資料壞掉。
- 庫存只顯示二元狀態（有現貨／預購或洽詢），不顯示數量。這與 API 只回 `in_stock` 一致。
- 列表頁卡片要能「整張可點」進詳情；燈箱放大圖片與進入詳情是兩個不同動作，要避免衝突。
- 詳情頁需有穩定、可分享、可直接開啟的 URL，並且有麵包屑與返回列表的路徑。

## Table Stakes

缺少會讓網站顯得不完整或不可信。

| Feature | Why Expected | Complexity | 對現有程式的依賴／備註 |
|---------|--------------|------------|------------------------|
| 詳情頁 `/products/:id`：大圖、名稱、品牌、型號、分類、說明 | 型錄站最基本單位 | Med | 新增 route 於 `App.tsx`；新增 `getProductById` 於 `src/services/products.ts`，沿用 `apiClient`、`transform`、`ApiError`；需新增詳情型別（含 `variants`）到 `apiTypes.ts` |
| 列表卡片與熱銷輪播可點入詳情 | 沒有入口就沒有詳情頁 | Low–Med | 改 `ProductPageTemplate` 的 grid／list 卡片與 `HomePage` 輪播。需處理「點圖開燈箱」與「點卡片進詳情」的分工（建議：圖旁放放大鈕，其餘整卡為 Link）；輪播點擊需不破壞 WCAG 2.2.2 暫停行為與既有指標事件序列 |
| 價格「洽詢」狀態（`price_min/price_max` 為 null） | 全部商品目前都是 null | Low | 抽成單一格式化函式（含單價、區間、null 三種）；之後後端開放價格時自動顯示，不需改版 |
| 聯絡 CTA（詳情頁主要按鈕） | 無購物車時這就是轉換 | Low–Med | 聯絡管道（電話／LINE／Email）目前專案內沒有定義，需向 Owner 確認並放進靜態設定檔（如 `src/config/contact.ts`）。CTA 可帶商品名稱（例如 `mailto:` 主旨或 LINE 預填文字） |
| 庫存狀態標籤（有現貨／洽詢交期） | 採購者關心能不能拿到貨 | Low | 只用 `in_stock` 布林，不可顯示數量。`false` 的文案用「洽詢交期」，避免「缺貨」造成誤解 |
| 保固資訊（`warranty_period_months`） | 音響器材採購常問保固 | Low | 為 0 或 null 時整列隱藏，不顯示「0 個月」；月數可轉年（12 個月顯示為「1 年」） |
| Variants 顯示（`variants` 清單） | API 已提供，詳情的核心差異 | Med | 結構未在規劃文件中定義，**需先實測 API 回應確認欄位**（疑為顏色、規格、SKU）。建議以「規格表／選項清單」呈現，不做會改變價格或庫存的互動選擇器（無購物車）。若 variant 有自己的圖與庫存，才考慮切換主圖 |
| 詳情頁載入／失敗／找不到（404）狀態 | 既有頁面已有 loading/error/empty，詳情要一致 | Low–Med | 重用 v1.0 的狀態畫面元件。需區分「id 不存在（404，顯示找不到商品並導回列表）」「被限流」「網路錯誤」。ApiError 需帶 status 才能分辨 |
| 麵包屑與返回列表 | 從分類進來的人要能回去 | Low | 簡單版：首頁／全部商品／分類／商品名。分類頁路徑可由 `PRODUCT_PAGES` 反查 category 對應路由；從不同列表進入時，「返回」用 `navigate(-1)` 保留篩選與排序更自然（LOW，需驗證直接開啟連結時的 fallback） |
| 直接開啟詳情網址可用、頁面標題隨商品變化 | 分享連結給客戶是主要情境 | Low | Cloudflare Pages 已預設 SPA fallback（已實測）。以 `document.title` 設定即可，不需引入 helmet |
| 圖片缺失／載入失敗的占位圖 | R2 圖片可能缺漏 | Low | 目前 20 筆都有圖，但詳情與列表都應有 onError 占位，避免版面跳動 |
| 圖片預留長寬比（避免 layout shift）與 `loading="lazy"` | 重設計的基本品質 | Low | 列表用 `aspect-ratio` 容器；詳情主圖不 lazy（首屏） |
| 共用骨架：NavBar、SideMenu、Footer 響應式重設計，修 WR-04 | 里程碑已定案 | Med | 1024px 導覽擠壓需用斷點策略（例如 lg 以下收合為選單、xl 才展開）；導覽仍來自 `NAV_ITEMS`，保留所有舊路徑 |
| Footer 放聯絡資訊（電話、地址、營業時間、信箱） | B2B 訪客常直接翻到頁尾找聯絡方式 | Low | 與 CTA 共用同一份 `contact` 設定，避免兩處不一致 |
| 無障礙基本面（對比、焦點樣式、鍵盤可達、`alt`） | 專案已有 WCAG 2.2.2 實作，不應在重設計退步 | Low–Med | 輪播行為與測試必須保留；新卡片連結要可鍵盤操作 |
| 保留 8 個分類路徑、grid/list 切換、名稱排序、燈箱 | 相容性約束 | Med | 視覺換新但行為不變；現有 215 項 Vitest 是回歸保護網 |

## Differentiators

不是必備，但在這類站上能明顯提升體驗。依價值／成本排序。

| Feature | Value Proposition | Complexity | 備註 |
|---------|-------------------|------------|------|
| 詳情頁「相關商品」（同分類或同品牌，排除自己） | 增加瀏覽深度，降低跳出 | Med | 以 `getProducts({category, limit})` 取同類後前端過濾；多一次 API 請求，需注意每 IP 每分鐘 60 次限流，建議延遲載入並失敗時整區靜默隱藏 |
| 一鍵複製「商品名稱＋型號＋網址」詢價訊息／LINE 分享 | 盤商客戶習慣把品項貼進 LINE 詢價，縮短詢價動作 | Low | 純前端 `navigator.clipboard`；高價值低成本，建議優先於其他差異化項目 |
| 列表頁品牌／分類篩選晶片（取自 `/public/categories`、`/public/brands`） | 8 個分類頁其實是預設篩選組合，篩選晶片能降低導覽負擔 | Med | 與現有「一路徑一查詢」架構有張力，可能需改成 query string 驅動；若範圍緊，延後 |
| 「新品」徽章（依 `published_at` 近 N 天） | 對應既有 `/new-products` 頁，提升辨識 | Low | N 天閾值需決定（LOW，建議 60–90 天，待 Owner 確認） |
| 商品圖 skeleton／漸進載入、頁面轉場微動畫 | 重設計質感 | Low–Med | 已有 Tailwind 自訂動畫；需尊重 `prefers-reduced-motion` |
| 結構化資料（JSON-LD `Product`，不含 offers 或以洽詢處理） | SEO 與搜尋結果豐富摘要 | Low–Med | SPA 靠爬蟲執行 JS 才能讀到，效益有限且不確定（LOW）；列為可選 |
| Open Graph 分享預覽（LINE／FB 貼連結出圖） | 客戶分享連結的主要情境 | High | 純 SPA 無法對社群爬蟲動態輸出 meta（爬蟲不執行 JS）。要做需 Cloudflare Pages Functions 或預渲染，超出本輪「技術棧不變」精神，建議標記為未來研究，不納入本輪 |
| 商品圖多張／縮圖切換 | 規格較完整的 PDP 慣例 | Med | API 目前只有單一 `image_url`；除非 variants 帶圖，否則無資料可用，**不要預先做** |
| 深淺色主題或品牌視覺系統化（design tokens） | 全站一致、之後好維護 | Med | 視覺方向待 UI phase 以 sketch／UI-SPEC 決定；建議在 Tailwind config 集中色彩與間距，不新增依賴 |

## Anti-Features

明確不做，附理由。

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 購物車、結帳、加入願望清單 | 非電商；沒有訂單後端，也沒有對應營運流程 | 以「聯絡詢價」CTA 取代 |
| 顯示庫存數量或「剩 N 件」 | API 不回傳，也不應暴露盤商庫存 | 只顯示 `in_stock` 二元標籤 |
| 價格欄位顯示 0、「—」、空白 | 會被誤讀為免費或資料錯誤 | 統一顯示「洽詢」並搭配 CTA |
| 站內搜尋框（本輪） | 20 筆商品，分類與列表已足夠；API 沒有搜尋端點，前端全載入又受限流與 `limit≤100` 限制 | 以分類／品牌導覽處理，商品增至百筆以上再評估 |
| 商品比較、評分評論、問答 | 沒有資料來源與管理後台，需要新後端 | 不做 |
| 會員登入、詢價表單後端 | 需要後端與資安處理；前端不得含憑證 | 使用 `tel:`、`mailto:`、LINE 連結等無後端方案；若必須有表單，另案由後端提供端點 |
| 在前端快取層引入 React Query／Redux | 20 筆資料與簡單頁面，專案刻意只用 `useState`；增加依賴與打包 | 沿用現有 service + useEffect；詳情頁只需取消請求（AbortController）與參數變更重取 |
| 無限捲動 | 20 筆、有 grid/list 與排序，分頁邏輯不需要；也影響頁尾可達性 | 一次載入（`limit` 取足夠大，注意上限 100） |
| 輪播自動播放且不可暫停、全螢幕視差等重動畫 | 會違反既有 WCAG 2.2.2 成果 | 保留暫停行為，動效尊重減少動態 |
| 改既有網址或移除舊路徑 | 相容性約束，舊連結不能失效 | 新路徑只新增 `/products/:id`；舊路徑全保留 |
| 改後端 CORS 或引入前端憑證以便預覽 | 約束與安全政策；本輪只在本機以 Vite proxy 預覽 | 沿用 proxy |
| 切換 Tailwind v4／清理依賴混裝 | 專案已列為 Out of Scope，可能影響樣式 | 另案處理 |

## Feature Dependencies

```
聯絡設定檔（contact config，需 Owner 提供）
  → 詳情頁聯絡 CTA
  → Footer 聯絡資訊
  → 複製詢價訊息（差異化）

詳情型別與 getProductById（service + transform + 測試）
  → 詳情頁（含 loading／error／404）
      → Variants 呈現（需先實測 API 回應結構）
      → 相關商品（差異化，依賴 getProducts 與限流考量）
      → 麵包屑（需 category → 路由 反查）

詳情頁路由 /products/:id
  → 列表卡片可點入（ProductPageTemplate）
  → 輪播可點入（HomePage，需保留 WCAG 2.2.2 行為）
  → 燈箱與進入詳情的互動分工

價格格式化函式（含 null → 洽詢）
  → 列表卡片、輪播、詳情頁共用

視覺方向／design tokens（UI phase 決定）
  → 共用骨架（NavBar、SideMenu、Footer、Layout，含 WR-04）
      → 首頁、分類頁、關於我們、詳情頁（皆套同一骨架）
```

建議順序：視覺方向與骨架 → 共用資料層（詳情 service、價格格式化、聯絡設定）→ 詳情頁 → 列表與輪播接入詳情連結 → 各頁重設計收尾。詳情頁依賴新骨架，但資料層可與視覺探索並行。

## MVP Recommendation

本輪優先（皆為 table stakes）：

1. 共用骨架重設計與 WR-04 修正（所有頁面的基礎）
2. 詳情頁 `/products/:id`：主圖、基本資訊、價格「洽詢」、庫存標籤、保固、variants、聯絡 CTA、完整的載入／錯誤／404 狀態
3. 列表卡片與輪播接入詳情連結，並維持燈箱、排序、grid/list、WCAG 2.2.2
4. Footer 聯絡資訊、麵包屑、圖片占位與長寬比

選一到兩個低成本差異化項目：

- 複製／分享詢價訊息（Low，對盤商客戶價值高）
- 新品徽章（Low）

延後：

- 相關商品：資料與限流已可行，若詳情頁完成後還有餘裕再加
- 篩選晶片與搜尋：需改變「一路徑一查詢」架構，且資料量小，延後
- Open Graph 與 JSON-LD：純 SPA 無法有效輸出，需預渲染或 Pages Functions，另案研究
- 多圖／縮圖：API 無資料

## 需要在規劃階段釐清（Gaps）

- **Variants 的實際欄位**：規劃文件只寫「含 variants」，未列結構。第一步應實測 `GET /public/products/:id`，決定顯示成規格表、選項列或帶圖切換。（影響詳情頁複雜度，目前評為 Med，可能升至 High）
- **聯絡管道**：電話、LINE、Email、地址、營業時間皆未在專案文件出現，需 Owner 提供。沒有這些，聯絡 CTA 無從實作。
- **description 格式**：是純文字、含換行，還是含 HTML 或 Markdown？若是 HTML 不可直接 `dangerouslySetInnerHTML`，需確認後決定處理方式（LOW）。
- **`in_stock=false` 與 `published_at` 的商業語意**：列表是否仍顯示缺貨商品、「新品」天數閾值。
- **限流預算**：詳情頁（1 次）加相關商品（1 次）加列表，每 IP 每分鐘 60 次，一般瀏覽足夠；但開發與測試頻繁重新載入時要留意。
- **返回列表行為**：從輪播、不同分類進入，與直接開啟連結的 fallback 策略（LOW，UI phase 決定）。

## Sources

- `.planning/PROJECT.md`、`.planning/BRIEF.md`（API 欄位、限制、Production 現況，HIGH）
- 專案 `CLAUDE.md` 的架構與約束段落（HIGH）
- B2B 型錄站與商品詳情頁（PDP）的通用慣例：依領域知識推導，未逐站查證（MEDIUM／LOW，標示於各項）
