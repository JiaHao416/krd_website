import type { PublicProductApi } from "./apiTypes";
import { formatPriceRange } from "./format";

/** 畫面使用的商品資料（camelCase，priceMin/priceMax 為後端原始「分」值，顯示請用 priceText） */
export interface Product {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string | null;
  imageUrl: string | null;
  warrantyPeriodMonths: number | null;
  publishedAt: string | null;
  featuredGroup: number | null;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  priceText: string;
}

/**
 * 將後端商品轉為畫面用 Product
 *
 * - 與後端一致為核心價值，故不過濾缺圖商品；空字串或 null 的圖片一律為 null，佔位圖於 Phase 2 處理（D-04）
 * - name 為空白時退回 `${brand} ${model}`，任一邊缺值不留 "null" 或多餘空白（D-04）
 * - 欄位改為 camelCase 並預先算好 priceText（D-03）
 *
 * @param api - 後端公開 API 的商品
 * @returns 畫面用商品
 */
export function toProduct(api: PublicProductApi): Product {
  const trimmedName = api.name.trim();
  const name =
    trimmedName !== ""
      ? api.name
      : [api.brand, api.model].filter((part) => part).join(" ");

  return {
    id: api.id,
    name,
    brand: api.brand,
    model: api.model,
    category: api.category,
    description: api.description,
    imageUrl: api.image_url || null,
    warrantyPeriodMonths: api.warranty_period_months,
    publishedAt: api.published_at,
    featuredGroup: api.featured_group,
    priceMin: api.price_min,
    priceMax: api.price_max,
    inStock: api.in_stock,
    priceText: formatPriceRange(api.price_min, api.price_max),
  };
}
