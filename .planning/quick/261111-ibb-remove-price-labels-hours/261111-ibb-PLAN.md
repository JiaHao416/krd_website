---
phase: quick-261111-ibb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/config/contact.ts
  - src/config/contact.test.ts
  - src/components/ContactBlock.tsx
  - src/components/ContactBlock.test.tsx
  - src/components/Footer.test.tsx
  - src/components/Layout.test.tsx
  - src/components/price.ts
  - src/components/PriceTag.tsx
  - src/components/PriceTag.test.tsx
  - src/components/PriceBlock.tsx
  - src/components/PriceBlock.test.tsx
  - src/components/ProductCard.tsx
  - src/components/ProductCard.test.tsx
  - src/components/FeaturedCarousel.tsx
  - src/components/FeaturedCarousel.test.tsx
  - src/components/VariantSelector.tsx
  - src/components/VariantSelector.test.tsx
  - src/components/ProductDetailView.tsx
  - src/components/ProductDetailView.test.tsx
  - src/pages/HomePage.test.tsx
  - src/pages/ProductPageTemplate.test.tsx
autonomous: true
requirements: [QUICK-261111-ibb]

must_haves:
  truths:
    - "首頁聯絡區、關於我們、頁尾與首頁營業中戳章都顯示「週一至週五 09:00 - 17:30」與「見紅休（週六、週日及國定假日）」，不再出現「週一至週六」或「週日及國定假日休息」"
    - "聯絡區休息備註不出現雙層括號（不會顯示「（見紅休（…））」）"
    - "全站（商品卡 grid/list、熱銷便條卡、詳情頁變體選項與現貨區）不再出現「洽詢交期」文字"
    - "全站不再出現「價格請來電」：有價商品照常顯示 priceText；無價商品不渲染任何價格元素（無空 tag、無空標籤列）"
    - "詳情頁選中變體無價（或沒有變體）時，整個價格區塊（標題與「這個商品沒有標價…」說明）都不渲染；「複製詢價訊息」「打電話問問」CTA 仍在"
    - "無價商品卡的連結 accessible name 只有商品名稱（aria-labelledby 只指向名稱 id），且不再有指向洽詢交期的 aria-describedby"
    - "npm test、npm run lint、npm run build 全過；測試數不低於 541"
  artifacts:
    - path: "src/config/contact.ts"
      provides: "新營業時間與休息備註"
      contains: "週一至週五 09:00 - 17:30"
    - path: "src/components/price.ts"
      provides: "hasListedPrice 共用判斷（priceMin、priceMax 任一非 null 才算有價）"
      exports: ["hasListedPrice"]
    - path: "src/components/PriceTag.tsx"
      provides: "無價時回傳 null"
    - path: "src/components/PriceBlock.tsx"
      provides: "priceText 為 null 時回傳 null"
  key_links:
    - from: "src/components/ProductCard.tsx"
      to: "src/components/price.ts"
      via: "hasListedPrice 決定是否渲染標籤列與 aria-labelledby 是否含 priceId"
      pattern: "hasListedPrice"
    - from: "src/pages/HomePage.tsx"
      to: "src/config/contact.ts"
      via: "splitBusinessHours(CONTACT.businessHours) 產生戳章兩行（不需改 HomePage.tsx）"
      pattern: "splitBusinessHours"
---

<objective>
三項使用者已核准的文案／呈現調整：
1. 營業時間改為「週一至週五 09:00 - 17:30」，休息備註改為「見紅休（週六、週日及國定假日）」。
2. 全站移除「洽詢交期」標籤。
3. 全站移除「價格請來電」：有價照常顯示 priceText，無價不渲染任何價格元素；詳情頁無價時整個價格區塊不渲染。

Purpose: 店家營業時間更新；缺貨與無價的提示改由「打電話問問」「複製詢價訊息」CTA 承擔，不再在卡片與詳情頁另外標示。
Output: 修改後的 config、元件與對應測試（舊斷言改寫為新語意，不刪除）。
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/config/contact.ts
@src/components/ContactBlock.tsx
@src/components/PriceTag.tsx
@src/components/PriceBlock.tsx
@src/components/ProductCard.tsx
@src/components/ProductDetailView.tsx
@src/components/VariantSelector.tsx

只作參考、不要修改：`.planning/phases/06-design-lock/06-UI-SPEC.md` 的 Copywriting 段（原本定義了「價格請來電」「洽詢交期」tag，本次使用者已核准移除，以本計畫為準）。

<executor_constraints>
- TDD：每個 task 先改測試看到紅燈，再改實作轉綠。RED 只記錄在 SUMMARY（貼失敗的測試名稱與數量），不要另外做 RED commit（每個 commit 都必須全綠）。
- 每個 commit 前必須通過：`npm test`、`npm run lint`、`npm run build`。
- 測試數（`npx vitest list | wc -l`，目前 541）不得減少。編碼「價格請來電」「洽詢交期」的斷言一律改寫成新語意，不准刪除；在 SUMMARY 逐條列出「舊斷言 → 新斷言」。
- 不得修改 `src/services/` 與 `src/hooks/`（`PRICE_ON_REQUEST` 等維持原狀）。
- 停留在 `redesign` 分支；不切換分支、不 push。
- 絕對不要 stage `.planning/config.json`（只用 `--files` 明列本 task 的檔案）。
- commit 訊息用繁體中文、不加任何 AI 署名，一律透過 `gsd-sdk query commit "<訊息>" --files <檔案...>`。
- 程式註解用繁體中文；沿用雙引號、分號、2 空格縮排、尾逗號；不使用 any。
- `src/designTokens.test.ts` 必須持續通過（只用既有語意 token，不新增 Tailwind 預設色票 class）。
- 完成後跑 `grep -rn "價格請來電\|洽詢交期\|週一至週六\|週日及國定假日休息" src`，非測試檔必須 0 筆；測試檔只允許出現在「不應出現」的否定斷言（queryByText(...)).toBeNull() / not.toContain 等）中。
</executor_constraints>

<interfaces>
現況（從程式碼擷取）：

src/config/contact.ts
- `CONTACT.businessHours = "週一至週六 09:00 - 17:30"`、`CONTACT.closedNote = "週日及國定假日休息"`
- `splitBusinessHours(hours)`：以第一個空白拆兩行（HomePage 營業中戳章使用；新字串會拆成「週一至週五」「09:00 - 17:30」，HomePage.tsx 不需改）

src/components/ContactBlock.tsx（約第 44–49 行）
- 渲染 `{info.businessHours}` 後接 `<span className="block text-label text-ink-muted md:inline md:text-body md:text-ink">（{info.closedNote}）</span>` —— 外層全形括號會與新備註本身的括號形成「（見紅休（…））」

src/components/PriceTag.tsx
- props: `{ product: Pick<Product, "priceMin" | "priceMax" | "priceText">; id?: string }`
- 無價（priceMin、priceMax 皆 null）時渲染 block-2 pill「價格請來電」，否則渲染 priceText

src/components/PriceBlock.tsx
- props: `{ priceText: string | null }`；null 時渲染「價格請來電」＋「這個商品沒有標價，打個電話問，我們直接報給你。」，否則 priceText＋「含稅」，外層 `rounded-block bg-block-2` 色塊

src/components/ProductCard.tsx
- `nameId`、`priceId`、`leadTimeId`、`descId` 皆 useId；`aria-labelledby: \`${nameId} ${priceId}\``；缺貨時 leadTimeId 進 aria-describedby
- `tagRow`：`<div className="mt-2 flex flex-wrap items-center gap-2">` 內含 PriceTag 與缺貨「洽詢交期」（`LEAD_TIME_TAG_CLASS`）

src/components/FeaturedCarousel.tsx（NoteCard 約第 64–70 行）
- 底列 `<div className="mt-2 flex items-center justify-between gap-2">` 內 PriceTag ＋ aria-hidden 的「查看詳情 →」提示

src/components/VariantSelector.tsx（約第 77 行）
- 缺貨選項在按鈕內附 `<span className={LEAD_TIME_TAG_CLASS}>洽詢交期</span>`

src/components/ProductDetailView.tsx
- `<PriceBlock priceText={priceText} />`（priceText = selected?.priceText ?? null）
- `<div data-testid="stock-status" className="flex">`：有貨顯示綠點「有現貨」，缺貨顯示 `LEAD_TIME_TAG_CLASS`「洽詢交期」
- `<DetailCta status={copyStatus} onCopy={onCopy} />`（CTA 不動）
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 營業時間改為週一至週五、見紅休</name>
  <files>src/config/contact.ts, src/config/contact.test.ts, src/components/ContactBlock.tsx, src/components/ContactBlock.test.tsx, src/components/Footer.test.tsx, src/components/Layout.test.tsx</files>
  <behavior>
    - contact.test.ts：CONTACT 快照比對改為 businessHours "週一至週五 09:00 - 17:30"、closedNote "見紅休（週六、週日及國定假日）"
    - contact.test.ts：splitBusinessHours 輸入改為 "週一至週五 09:00 - 17:30"，期望 ["週一至週五", "09:00 - 17:30"]（「全年無休」案例保留）
    - ContactBlock.test.tsx「顯示營業時間與休息備註」：改比對 /週一至週五 09:00 - 17:30/ 與 /見紅休（週六、週日及國定假日）/
    - ContactBlock.test.tsx 新增一則：休息備註不包雙層括號（container.textContent 不含「（見紅休」）
    - Footer.test.tsx、Layout.test.tsx：硬寫的「…・週一至週六 09:00 - 17:30」改為「…・週一至週五 09:00 - 17:30」
  </behavior>
  <action>
先改上述測試，跑 `npx vitest run src/config src/components/ContactBlock.test.tsx src/components/Footer.test.tsx src/components/Layout.test.tsx` 確認紅燈並記下失敗清單（只記在 SUMMARY）。

實作：
1. `src/config/contact.ts`：`businessHours` 改為 "週一至週五 09:00 - 17:30"，`closedNote` 改為 "見紅休（週六、週日及國定假日）"（字串完全照使用者核准版本，全形括號與頓號）。
2. `src/components/ContactBlock.tsx`：因新備註自帶括號，拿掉 span 內包住 `{info.closedNote}` 的外層全形「（」「）」，避免顯示成「（見紅休（…））」；md 以上 span 為 inline，加 `md:ml-2` 讓它與營業時間之間有間距（手機為 block 換行，不需間距）。加一行繁中註解說明「備註自帶括號，這裡不再外包」。
3. HomePage.tsx、Footer.tsx、AboutPage.tsx、NotFoundPage 皆由 CONTACT 動態取值，不需修改；AboutPage.test、NotFoundPage.test 本來就用 CONTACT 常數，應自然通過。

轉綠後跑完整 `npm test && npm run lint && npm run build`，並確認 `npx vitest list | wc -l` ≥ 541，再 commit：`gsd-sdk query commit "fix(quick-261111-ibb): 營業時間改為週一至週五，休息備註改為見紅休" --files <本 task 檔案>`。
  </action>
  <verify>
    <automated>npm test && npm run lint && npm run build && grep -rn "週一至週六\|週日及國定假日休息" src | wc -l</automated>
  </verify>
  <done>三個指令全過；grep 結果為 0；聯絡區不再出現雙層括號；測試數 ≥ 541；已 commit。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 全站移除「洽詢交期」標籤</name>
  <files>src/components/ProductCard.tsx, src/components/ProductCard.test.tsx, src/components/VariantSelector.tsx, src/components/VariantSelector.test.tsx, src/components/ProductDetailView.tsx, src/components/ProductDetailView.test.tsx</files>
  <behavior>
    - ProductCard「inStock=false 時 grid 顯示洽詢交期」→「缺貨時 grid 不顯示洽詢交期」（queryByText("洽詢交期") 為 null）
    - ProductCard「list 也顯示洽詢交期」→「缺貨時 list 也不顯示洽詢交期」
    - ProductCard「缺圖卡 accessible name…」中 `toHaveAccessibleDescription("洽詢交期")` → 缺貨卡連結沒有 aria-describedby（`not.toHaveAttribute("aria-describedby")`）；名稱與佔位斷言不變
    - ProductCard「有描述時…現貨商品不顯示洽詢交期」保持原樣（已是否定斷言）
    - VariantSelector「選項文字為屬性值組合，缺貨選項附洽詢交期」→「選項文字為屬性值組合，缺貨選項不附洽詢交期」（radios[2] 只含屬性值文字、not.toHaveTextContent("洽詢交期")）
    - ProductDetailView「切換到缺貨且無圖的變體時顯示洽詢交期並回到商品圖」→「切換到缺貨且無圖的變體時不顯示洽詢交期與有現貨，並回到商品圖」（queryByText("洽詢交期")、queryByText("有現貨") 皆為 null；主圖斷言不變）
    - ProductDetailView「有現貨時顯示有現貨」保持原樣
  </behavior>
  <action>
先改上述測試，跑 `npx vitest run src/components/ProductCard.test.tsx src/components/VariantSelector.test.tsx src/components/ProductDetailView.test.tsx` 記下紅燈。

實作：
1. `ProductCard.tsx`：刪除 `LEAD_TIME_TAG_CLASS` 常數與其註解、`leadTimeId`、缺貨時 push leadTimeId 的那行、tagRow 內的「洽詢交期」span；`descriptionIds` 只剩 list 描述。tagRow 上方註解改為只描述價格。（tagRow 的有無價處理留給 Task 3。）
2. `VariantSelector.tsx`：刪除按鈕內缺貨的「洽詢交期」span 與不再使用的 `LEAD_TIME_TAG_CLASS`（noUnusedLocals 會報錯）。若 `variant.inStock` 因此不再被使用也無妨（型別欄位仍在）。
3. `ProductDetailView.tsx`：刪除 `LEAD_TIME_TAG_CLASS` 常數；現貨區改為只在 `inStock` 為 true 時渲染整個 `data-testid="stock-status"` 區塊（含「有現貨」），缺貨時不渲染任何元素，避免 flex-col 中留下空 div 撐出間距。`inStock` 變數仍保留使用。

不動 services／hooks。轉綠後跑 `npm test && npm run lint && npm run build`、確認測試數 ≥ 541，commit：`gsd-sdk query commit "feat(quick-261111-ibb): 全站移除洽詢交期標籤" --files <本 task 檔案>`。
  </action>
  <verify>
    <automated>npm test && npm run lint && npm run build && grep -rn "洽詢交期" src --exclude=*.test.tsx | wc -l</automated>
  </verify>
  <done>非測試檔中「洽詢交期」0 筆；測試中只剩否定斷言；三個指令全過；測試數 ≥ 541；已 commit。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 全站移除「價格請來電」，無價不渲染價格元素</name>
  <files>src/components/price.ts, src/components/PriceTag.tsx, src/components/PriceTag.test.tsx, src/components/PriceBlock.tsx, src/components/PriceBlock.test.tsx, src/components/ProductCard.tsx, src/components/ProductCard.test.tsx, src/components/FeaturedCarousel.tsx, src/components/FeaturedCarousel.test.tsx, src/components/ProductDetailView.tsx, src/components/ProductDetailView.test.tsx, src/pages/HomePage.test.tsx, src/pages/ProductPageTemplate.test.tsx</files>
  <behavior>
    舊斷言 → 新斷言（全部改寫，不刪除）：
    - PriceTag「最低與最高價皆為 null 時顯示「價格請來電」標籤」→「最低與最高價皆為 null 時不渲染任何元素」（container 為空）
    - PriceTag「有最低價時顯示 priceText」：保留，否定部分改為不含「價格請來電」仍成立（可維持）
    - PriceBlock「沒有標價時顯示來電文案與說明，不顯示含稅」→「沒有標價時整個價格區塊不渲染」（container 為空、無「這個商品沒有標價…」、無「含稅」）
    - PriceBlock「有標價時顯示價格與含稅，不顯示來電文案」：保留語意
    - PriceBlock「任何情況都不出現 NaN」：保留
    - ProductCard「grid 無價：顯示價格請來電，不出現價格洽詢」→「grid 無價：不顯示任何價格元素（無價格請來電、無價格洽詢）」
    - ProductCard「list 無價：顯示價格請來電」→「list 無價：不顯示任何價格元素」
    - ProductCard「價格請來電 tag 使用 block-2 底而非 accent」→「無價時卡片內沒有 block-2 價格 tag」（container.querySelector(".bg-block-2") 為 null）
    - ProductCard「無價判斷看 priceMin/priceMax 皆 null（priceText 不是 PRICE_ON_REQUEST 也一樣）」→ 同名語意改為「priceText 有值但 priceMin/priceMax 皆 null 時仍不顯示價格」（以 makeNoPrice({ priceText: "NT$999" }) 斷言 queryByText("NT$999") 為 null）
    - ProductCard「grid 卡 accessible name 不因圖片 alt 重複念商品名稱」：期望名稱由「商品一 價格請來電」改為「商品一」
    - ProductCard「價格行位於標籤列（flex-wrap gap-2）：無價」→「無價時 grid 與 list 都不渲染空的標籤列」（container.querySelector(".flex-wrap.gap-2") 為 null）；有價版本的標籤列測試保持
    - ProductCard 新增：無價卡連結的 aria-labelledby 只含一個 id，且該 id 對應的元素存在（指向名稱 h3）
    - FeaturedCarousel「便條卡無價顯示價格請來電、有價顯示 priceText」→「便條卡有價顯示 priceText、無價不顯示價格元素」（queryByText("價格請來電") 為 null，「查看詳情 →」仍在）
    - HomePage「便條卡有價顯示 priceText、無價顯示價格請來電，且不出現價格洽詢」→「…無價不顯示價格請來電，且不出現價格洽詢」
    - ProductPageTemplate「同時顯示有價商品的 priceText 與無價商品的「價格請來電」」→「顯示有價商品的 priceText，無價商品不顯示價格元素」
    - ProductPageTemplate 連結名稱「甲商品 價格請來電」「乙商品 價格請來電」→「甲商品」「乙商品」（兩處測試，精確比對）
    - ProductDetailView「預設選中預設變體，顯示對應價格與 SKU」：「價格請來電」斷言改為預設變體無價時不顯示價格區塊（queryByText("含稅") 為 null、queryByText(/這個商品沒有標價/) 為 null），SKU 斷言不變
    - ProductDetailView「沒有變體時視為無價，規格表不含 SKU」：「價格請來電」斷言改為不顯示價格區塊；並斷言「複製詢價訊息」與「打電話問問」CTA 仍在（以 DetailCta 既有的可及名稱查詢）
    - ProductDetailView「切換到有價格與變體圖的變體時…」：保持（NT$12,345、含稅）
  </behavior>
  <action>
先改上述測試，跑相關測試檔記下紅燈。

實作：
1. 新增 `src/components/price.ts`，匯出 `hasListedPrice(product: Pick<Product, "priceMin" | "priceMax">): boolean`（priceMin 或 priceMax 任一不為 null 即為 true），附 `/** */` 繁中說明。放在獨立 .ts 而非 PriceTag.tsx，避免 react-refresh/only-export-components 警告；不放進 src/services/（禁止修改）。
2. `PriceTag.tsx`：無價時 `return null`；刪除「價格請來電」pill 分支；檔頭註解改為「無價時不渲染任何元素」。
3. `PriceBlock.tsx`：`priceText === null` 時 `return null`；只保留有價分支（priceText＋含稅）；註解更新。ProductDetailView 仍以 `<PriceBlock priceText={priceText} />` 呼叫，不需改呼叫端。
4. `ProductCard.tsx`：以 `hasListedPrice(product)` 得 `showPrice`；`aria-labelledby` 在 showPrice 時為 `${nameId} ${priceId}`，否則只有 `nameId`（不得參照不存在的 id）；tagRow 只在 showPrice 時渲染（無價時連空 div 都不出）。`priceId` 仍用 useId 產生（hook 不可條件呼叫）。
5. `FeaturedCarousel.tsx` NoteCard：PriceTag 回 null 後「查看詳情 →」會跑到左邊；在該提示 span 加 `ml-auto` 讓它維持靠右（UI-SPEC 底列右側），其餘不動。
6. `ProductDetailView.tsx`：不需改價格邏輯（PriceBlock 自行回 null）；確認 DetailCta 不受影響。若 Task 2 已改過現貨區，這裡只檢查無殘留。

完成後執行 `grep -rn "價格請來電\|洽詢交期\|週一至週六\|週日及國定假日休息" src`，非測試檔須 0 筆、測試檔只剩否定斷言。跑 `npm test && npm run lint && npm run build`、確認 `npx vitest list | wc -l` ≥ 541，commit：`gsd-sdk query commit "feat(quick-261111-ibb): 全站移除價格請來電，無價商品不顯示價格元素" --files <本 task 檔案>`。

最後寫 SUMMARY（`.planning/quick/261111-ibb-remove-price-labels-hours/261111-ibb-SUMMARY.md`），內容含：每個 task 的 RED 紀錄（失敗測試名稱與數量）、逐條「舊斷言 → 新斷言」對照、ContactBlock 拿掉外層括號的理由、最終測試數。
  </action>
  <verify>
    <automated>npm test && npm run lint && npm run build && grep -rn "價格請來電" src --exclude=*.test.tsx --exclude=*.test.ts | wc -l && npx vitest list | wc -l</automated>
  </verify>
  <done>非測試檔「價格請來電」0 筆；無價卡連結名稱只有商品名稱且無懸空 id；詳情頁無價時無價格區塊但 CTA 仍在；三個指令全過；測試數 ≥ 541；已 commit；SUMMARY 已寫。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| 後端公開 API → 前端渲染 | 商品價格欄位由 API 提供，本次只改「無價」時的呈現 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-ibb-01 | Information Disclosure | src/config/contact.ts | accept | 只放店家公開營業時間，無憑證；build 內建 dist 掃描持續把關 |
| T-quick-ibb-02 | Tampering | PriceTag/PriceBlock | accept | 純呈現邏輯，以 React 文字節點輸出 priceText，無 dangerouslySetInnerHTML |
</threat_model>

<verification>
- `npm test`、`npm run lint`、`npm run build` 全過
- `npx vitest list | wc -l` ≥ 541
- `grep -rn "價格請來電\|洽詢交期\|週一至週六\|週日及國定假日休息" src`：非測試檔 0 筆
- `git status` 中 `.planning/config.json` 仍為未 stage 的修改；分支仍為 redesign、未 push
</verification>

<success_criteria>
- 營業時間與休息備註全站更新，聯絡區無雙層括號
- 全站無「洽詢交期」「價格請來電」顯示；有價照常顯示 priceText
- 詳情頁無價時無價格區塊，CTA 保留
- 無價商品卡 accessible name 僅商品名稱，無懸空 aria 參照
- 3 個 commit，各自全綠
</success_criteria>

<output>
Create `.planning/quick/261111-ibb-remove-price-labels-hours/261111-ibb-SUMMARY.md` when done
</output>
