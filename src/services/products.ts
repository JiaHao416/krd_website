import type { AxiosInstance } from "axios";
import { apiClient } from "./client";
import type {
  ProductQueryParams,
  PublicProductApi,
  PublicProductListResponse,
} from "./apiTypes";

/**
 * 取得商品列表（最薄 happy path；錯誤處理與轉換見 Plan 01-04）
 * @param params - 查詢參數
 * @param client - axios instance，預設為共用 apiClient，測試時可注入
 * @returns 商品原始資料與總數
 */
export async function fetchProducts(
  params: ProductQueryParams,
  client: AxiosInstance = apiClient
): Promise<{ items: PublicProductApi[]; total: number }> {
  const response = await client.get<PublicProductListResponse>("/products", {
    params,
  });
  return {
    items: response.data.data.items,
    total: response.data.data.pagination.total,
  };
}
