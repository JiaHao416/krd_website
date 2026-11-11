/**
 * 後端公開 API 的原始型別。
 * 欄位與後端 OpenAPI 同名（snake_case），不做改名。
 */

/** 排序方式：依名稱或依最新上架 */
export type ProductSort = "name" | "newest";

/** 熱銷商品分組 */
export type FeaturedGroup = 1 | 2;

/** 後端回傳的單一商品；價格為含稅整數「分」 */
export interface PublicProductApi {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  warranty_period_months: number | null;
  published_at: string | null;
  featured_group: number | null;
  /** 最低價，含稅整數「分」 */
  price_min: number | null;
  /** 最高價，含稅整數「分」 */
  price_max: number | null;
  in_stock: boolean;
}

/** 分頁資訊 */
export interface PublicPagination {
  offset: number;
  limit: number;
  total: number;
}

/** 商品列表回應 */
export interface PublicProductListResponse {
  success: true;
  data: {
    items: PublicProductApi[];
    pagination: PublicPagination;
  };
}

/** 商品查詢參數（屬性順序固定：brand、category、featured、sort、limit） */
export interface ProductQueryParams {
  brand?: string;
  category?: string;
  featured?: "1" | "2";
  sort?: ProductSort;
  limit: number;
}

/** 詳情回應中的商品變體（欄位以實測樣本為準，07-API-SAMPLES.md） */
export interface PublicVariantApi {
  id: string;
  sku: string;
  attributes: Record<string, string | number | boolean>;
  image_url: string | null;
  is_default: boolean;
  in_stock: boolean;
  /** 含稅價格，整數「分」；未公開價格時為 null */
  price_incl_tax: number | null;
}

/** 商品詳情（不含列表專用的 featured_group、price_min、price_max） */
export interface PublicProductDetailApi {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  warranty_period_months: number | null;
  published_at: string | null;
  in_stock: boolean;
  variants: PublicVariantApi[];
}

/** 商品詳情回應（data 直接是商品，不是 items） */
export interface PublicProductDetailResponse {
  success: true;
  data: PublicProductDetailApi;
}
