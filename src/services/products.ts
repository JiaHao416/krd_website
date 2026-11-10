import type { AxiosInstance } from "axios";
import { apiClient } from "./client";
import { ApiError, normalizeError } from "./errors";
import { toProduct } from "./transform";
import type { Product } from "./transform";
import type {
  ProductQueryParams,
  PublicProductApi,
  PublicProductListResponse,
} from "./apiTypes";

/** 商品列表結果：轉換後的商品與後端回報的總數 */
export interface ProductListResult {
  items: Product[];
  total: number;
  /** 後端總數大於本次取得筆數（超過單次 limit），UI 應提示資料未完整顯示 */
  truncated: boolean;
}

/** fetchProducts 的選項 */
export interface FetchProductsOptions {
  /** 用於取消請求；abort 後會拋出 kind 為 canceled 的 ApiError */
  signal?: AbortSignal;
}

/**
 * 型別守衛：驗證回應為 { success: true, data: { items: [...] } }
 * 涵蓋 success:false 與 SPA fallback 回傳 HTML 字串的情況。
 */
function isProductListResponse(
  value: unknown
): value is PublicProductListResponse {
  if (typeof value !== "object" || value === null) return false;
  if (!("success" in value) || value.success !== true) return false;
  if (!("data" in value)) return false;
  const data = value.data;
  if (typeof data !== "object" || data === null) return false;
  return "items" in data && Array.isArray(data.items);
}

/**
 * 型別守衛：驗證單筆商品的必要欄位（id、name、category 為字串，in_stock 為布林）
 * 不信任回應型別，避免 toProduct 對 null 或缺欄位拋出原生 TypeError。
 */
function isPublicProduct(value: unknown): value is PublicProductApi {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    typeof v.in_stock === "boolean"
  );
}

/** 價格欄位只接受有限數字，其餘（undefined、字串、NaN）一律視為 null */
function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * 將價格與圖片欄位校正為合法值（fail safe）
 * 壞資料退回「價格洽詢」與佔位圖，不讓整筆商品消失或顯示 "NT$NaN"。
 */
function sanitizeProduct(product: PublicProductApi): PublicProductApi {
  const imageUrl: unknown = product.image_url;
  return {
    ...product,
    price_min: toNullableNumber(product.price_min),
    price_max: toNullableNumber(product.price_max),
    image_url: typeof imageUrl === "string" ? imageUrl : null,
  };
}

/**
 * 取得商品列表
 * 失敗一律拋出 ApiError，不吞成空陣列；查無商品是成功的空結果。
 * 資料層不自動重試，重試交給 UI 的按鈕。
 * 格式不符的單筆商品會被略過並 console.warn，不讓一筆壞資料拖垮整頁。
 * @param params - 查詢參數
 * @param client - axios instance，預設為共用 apiClient，測試時可注入
 * @param options - 額外選項，目前支援 signal 用於取消請求
 * @returns 轉換後的商品、總數與是否被截斷
 * @throws {ApiError} 網路、限流、HTTP 錯誤、回應格式不符，或請求被取消（kind 為 canceled）
 */
export async function fetchProducts(
  params: ProductQueryParams,
  client: AxiosInstance = apiClient,
  options: FetchProductsOptions = {}
): Promise<ProductListResult> {
  let body: unknown;
  try {
    const response = await client.get<unknown>("/products", {
      params,
      signal: options.signal,
    });
    body = response.data;
  } catch (error: unknown) {
    throw normalizeError(error);
  }

  if (!isProductListResponse(body)) {
    throw new ApiError("invalid_response", "商品 API 回應格式不符");
  }

  const { items, pagination } = body.data;
  // pagination 缺漏時以筆數代替，不視為錯誤，因 items 已可用
  const total =
    typeof pagination?.total === "number" ? pagination.total : items.length;

  // 以後端實際回傳筆數比較，被略過的格式不符商品不算截斷
  const truncated = total > items.length;
  if (truncated) {
    console.warn(
      `商品總數 ${total}，僅取得 ${items.length} 筆，需實作分頁`
    );
  }

  // items 已是 unknown 來源，逐筆驗證後才轉換
  const rawItems: unknown[] = items;
  const validItems = rawItems.filter(isPublicProduct);
  if (validItems.length !== rawItems.length) {
    console.warn(
      `略過 ${rawItems.length - validItems.length} 筆格式不符的商品`
    );
  }

  return { items: validItems.map(sanitizeProduct).map(toProduct), total, truncated };
}
