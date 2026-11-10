import type { FeaturedGroup, ProductQueryParams, ProductSort } from "./apiTypes";

/** 單一商品頁的查詢條件（不含 limit，由 buildProductParams 統一補上） */
export interface ProductPageQuery {
  brand?: string;
  category?: string;
  featured?: FeaturedGroup;
  /** 頁面鎖定的排序；有值時優先於使用者選擇 */
  sort?: ProductSort;
}

/** 商品頁設定：路徑對應查詢條件 */
export interface ProductPageConfig {
  path: string;
  query: ProductPageQuery;
}

/** API 上限；目前 production 僅 20 筆，不做多頁抓取 */
export const PRODUCT_LIMIT = 100;

/**
 * 8 個商品頁的「路徑 → 查詢條件」單一來源；陣列順序即導覽選單順序
 * （NavBar、SideMenu 由 src/config/navigation.ts 衍生），路由比對與順序無關。
 */
export const PRODUCT_PAGES: readonly ProductPageConfig[] = [
  { path: "/all-products", query: {} },
  { path: "/new-products", query: { sort: "newest" } },
  { path: "/krd-products", query: { brand: "KRD" } },
  { path: "/micgo-products", query: { brand: "MICGO" } },
  { path: "/wireless-micphone", query: { category: "無線麥克風" } },
  { path: "/wired-micphone", query: { category: "有線麥克風" } },
  { path: "/trumpet", query: { category: "喇叭" } },
  { path: "/accessories", query: { category: "配件" } },
];

/** 首頁熱銷輪播：依序對應 hot-products-1、hot-products-2 */
export const HOME_FEATURED_QUERIES: readonly ProductPageQuery[] = [
  { featured: 1 },
  { featured: 2 },
];

/**
 * 將頁面查詢條件與使用者排序轉成 API 參數。
 * 鍵順序固定為 brand、category、featured、sort、limit，且不送空字串或 undefined
 * （後端 query schema 為 strict）；序列化交給 axios params。
 * @param query - 頁面查詢條件
 * @param userSort - 使用者選擇的排序；頁面鎖定排序時以頁面為準，有 featured 時不送 sort
 * @returns 可直接傳給 axios params 的 ProductQueryParams
 */
export function buildProductParams(
  query: ProductPageQuery,
  userSort?: ProductSort
): ProductQueryParams {
  const params: ProductQueryParams = { limit: PRODUCT_LIMIT };
  const ordered: Omit<ProductQueryParams, "limit"> = {};

  if (query.brand) ordered.brand = query.brand;
  if (query.category) ordered.category = query.category;
  if (query.featured === 1) ordered.featured = "1";
  if (query.featured === 2) ordered.featured = "2";
  if (!query.featured) {
    const sort = query.sort ?? userSort;
    if (sort) ordered.sort = sort;
  }

  // limit 放最後，確保序列化順序
  return { ...ordered, limit: params.limit };
}
