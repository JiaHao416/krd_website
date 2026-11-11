import type { Product } from "../services/transform";

/**
 * 商品是否有標價：最低價或最高價任一不為 null 即視為有價（D-01）
 * @param product - 只需 priceMin 與 priceMax
 * @returns 是否有標價
 */
export function hasListedPrice(product: Pick<Product, "priceMin" | "priceMax">): boolean {
  return product.priceMin !== null || product.priceMax !== null;
}
