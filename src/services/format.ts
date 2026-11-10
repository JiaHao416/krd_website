/** 後端 show_price=false 時價格為 null，集中定義此顯示文案 */
export const PRICE_ON_REQUEST = "價格洽詢";

// 模組層建立一次，避免每次呼叫都重新建立 formatter
const PRICE_FORMATTER = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 2,
});

/**
 * 將後端以「分」為單位的價格格式化為 `NT$1,200`
 * @param cents - 價格（分）
 * @returns 含千分位的價格文字，整數無小數、有小數最多 2 位
 */
export function formatPrice(cents: number): string {
  return "NT$" + PRICE_FORMATTER.format(cents / 100);
}

/**
 * 將價格區間格式化為顯示文字
 * @param minCents - 最低價（分），可為 null
 * @param maxCents - 最高價（分），可為 null
 * @returns 區間、單一價格，或兩邊皆 null 時的 PRICE_ON_REQUEST
 */
export function formatPriceRange(
  minCents: number | null,
  maxCents: number | null
): string {
  if (minCents === null && maxCents === null) {
    return PRICE_ON_REQUEST;
  }
  if (minCents === null) {
    return formatPrice(maxCents as number);
  }
  if (maxCents === null || minCents === maxCents) {
    return formatPrice(minCents);
  }
  // 後端保證 min ≤ max，不在此交換
  return `${formatPrice(minCents)} – ${formatPrice(maxCents)}`;
}
