import type { AxiosInstance } from "axios";
import { apiClient } from "./client";
import { ApiError, normalizeError } from "./errors";
import { toProduct } from "./transform";
import type { Product } from "./transform";
import type {
  ProductQueryParams,
  PublicProductListResponse,
} from "./apiTypes";

/** 商品列表結果：轉換後的商品與後端回報的總數 */
export interface ProductListResult {
  items: Product[];
  total: number;
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
 * 取得商品列表
 * 失敗一律拋出 ApiError，不吞成空陣列；查無商品是成功的空結果。
 * 資料層不自動重試，重試交給 UI 的按鈕。
 * @param params - 查詢參數
 * @param client - axios instance，預設為共用 apiClient，測試時可注入
 * @returns 轉換後的商品與總數
 * @throws {ApiError} 網路、限流、HTTP 錯誤或回應格式不符
 */
export async function fetchProducts(
  params: ProductQueryParams,
  client: AxiosInstance = apiClient
): Promise<ProductListResult> {
  let body: unknown;
  try {
    const response = await client.get<unknown>("/products", { params });
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

  if (total > items.length) {
    console.warn(
      `商品總數 ${total} 超過單次上限 ${items.length} 筆，需實作分頁`
    );
  }

  return { items: items.map(toProduct), total };
}
