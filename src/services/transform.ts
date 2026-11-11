import type { PublicProductApi } from "./apiTypes";
import { formatPriceRange } from "./format";
import type { PublicProductDetailApi } from "./apiTypes";
import { formatPrice } from "./format";

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

/** name、brand、model 全部缺值時的保底商品名稱，避免卡片沒有標題、alt 為空 */
export const UNNAMED_PRODUCT = "未命名商品";

/**
 * 決定商品顯示名稱：trim 後的 name → brand 與 model 組合 → UNNAMED_PRODUCT
 * @param api - 後端公開 API 的商品
 * @returns 一定非空的顯示名稱
 */
function resolveName(api: PublicProductApi): string {
  const trimmedName = api.name.trim();
  if (trimmedName !== "") return trimmedName;
  const fallback = [api.brand, api.model]
    // 回應型別不可全信，非字串一律視為缺值
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part !== "")
    .join(" ");
  return fallback !== "" ? fallback : UNNAMED_PRODUCT;
}

/**
 * 將後端商品轉為畫面用 Product
 *
 * - 與後端一致為核心價值，故不過濾缺圖商品；空字串或 null 的圖片一律為 null，佔位圖於 Phase 2 處理（D-04）
 * - name 為空白時退回 `${brand} ${model}`，任一邊缺值不留 "null" 或多餘空白（D-04）；全部缺值時用 UNNAMED_PRODUCT
 * - 欄位改為 camelCase 並預先算好 priceText（D-03）
 *
 * @param api - 後端公開 API 的商品
 * @returns 畫面用商品
 */
export function toProduct(api: PublicProductApi): Product {
  return {
    id: api.id,
    name: resolveName(api),
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

/** 詳情頁的商品變體（priceInclTax 為含稅「分」，價格未公開時 priceInclTax 與 priceText 皆為 null） */
export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Array<{ key: string; value: string }>;
  imageUrl: string | null;
  isDefault: boolean;
  inStock: boolean;
  priceInclTax: number | null;
  priceText: string | null;
}

/** 詳情頁使用的商品資料（camelCase） */
export interface ProductDetail {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string | null;
  imageUrl: string | null;
  warrantyMonths: number | null;
  inStock: boolean;
  variants: ProductVariant[];
  defaultVariantId: string | null;
}

/** 有限數字才回傳，其餘（NaN、Infinity、字串、undefined）為 null */
function toFiniteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** 非字串或整段為空白時為 null；有內容時保留原字串（不 trim） */
function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** 詳情商品名稱：規則與列表 resolveName 相同，但型別獨立，不重用列表函式 */
function resolveDetailName(api: PublicProductDetailApi): string {
  const trimmedName = typeof api.name === "string" ? api.name.trim() : "";
  if (trimmedName !== "") return trimmedName;
  const fallback = [api.brand, api.model]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part !== "")
    .join(" ");
  return fallback !== "" ? fallback : UNNAMED_PRODUCT;
}

/** 保固月數：有限且大於 0 才有意義，0、負數、null 皆為 null */
function toWarrantyMonths(value: unknown): number | null {
  const months = toFiniteNumberOrNull(value);
  return months !== null && months > 0 ? months : null;
}

/** 規格欄位轉為 key/value 字串陣列，只收 string、有限 number、boolean，保持順序 */
function toVariantAttributes(
  value: unknown
): Array<{ key: string; value: string }> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [];
  }
  const result: Array<{ key: string; value: string }> = [];
  for (const [key, attrValue] of Object.entries(value)) {
    const isValid =
      typeof attrValue === "string" ||
      typeof attrValue === "boolean" ||
      (typeof attrValue === "number" && Number.isFinite(attrValue));
    if (isValid) result.push({ key, value: String(attrValue) });
  }
  return result;
}

/** 單一變體轉換；缺必要欄位時 console.warn 並回傳 null */
function toDetailVariant(value: unknown): ProductVariant | null {
  const v = (typeof value === "object" && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  if (
    typeof v.id !== "string" ||
    typeof v.sku !== "string" ||
    typeof v.in_stock !== "boolean"
  ) {
    console.warn("略過格式不符的商品變體:", value);
    return null;
  }
  const priceInclTax = toFiniteNumberOrNull(v.price_incl_tax);
  return {
    id: v.id,
    sku: v.sku,
    attributes: toVariantAttributes(v.attributes),
    imageUrl: toNullableString(v.image_url),
    isDefault: v.is_default === true,
    inStock: v.in_stock,
    priceInclTax,
    // 價格 null 時不產生任何文字，由畫面決定顯示什麼，避免出現 NT$NaN
    priceText: priceInclTax === null ? null : formatPrice(priceInclTax),
  };
}

/**
 * 將後端商品詳情轉為畫面用 ProductDetail
 *
 * - 不呼叫 toProduct：詳情沒有 featured_group、price_min、price_max，型別也不同
 * - 價格為 null 或非有限數字時 priceInclTax 與 priceText 皆為 null，不產生 NaN 文字
 * - 變體保持後端順序；預設變體為第一個 isDefault，否則第一個，沒有變體為 null
 *
 * @param api - 後端公開 API 的商品詳情
 * @returns 畫面用商品詳情
 */
export function toProductDetail(api: PublicProductDetailApi): ProductDetail {
  const rawVariants: unknown[] = Array.isArray(api.variants) ? api.variants : [];
  const variants = rawVariants
    .map(toDetailVariant)
    .filter((variant): variant is ProductVariant => variant !== null);
  return {
    id: api.id,
    name: resolveDetailName(api),
    brand: toNullableString(api.brand),
    model: toNullableString(api.model),
    category: api.category,
    description: toNullableString(api.description),
    imageUrl: toNullableString(api.image_url),
    warrantyMonths: toWarrantyMonths(api.warranty_period_months),
    inStock: api.in_stock,
    variants,
    defaultVariantId: (variants.find((v) => v.isDefault) ?? variants[0])?.id ?? null,
  };
}
