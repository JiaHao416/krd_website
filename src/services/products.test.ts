import { describe, it, expect } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { createApiClient } from "./client";
import { fetchProducts } from "./products";

/** 建立測試用 adapter，並把收到的請求設定存到 captured.config */
function createMockAdapter(data: unknown, status = 200) {
  const captured: { config?: InternalAxiosRequestConfig } = {};
  const adapter: AxiosAdapter = async (config) => {
    captured.config = config;
    return { data, status, statusText: "", headers: {}, config };
  };
  return { adapter, captured };
}

/** 模擬後端實際回應形狀：2 筆商品 */
const sampleResponse = {
  success: true,
  data: {
    items: [
      {
        id: "a1",
        name: "麥克風 A",
        brand: "KRD",
        model: "A-1",
        category: "有線麥克風",
        description: null,
        image_url: null,
        warranty_period_months: 12,
        published_at: null,
        featured_group: null,
        price_min: 100000,
        price_max: 120000,
        in_stock: true,
      },
      {
        id: "b2",
        name: "麥克風 B",
        brand: "MICGO",
        model: null,
        category: "無線麥克風",
        description: null,
        image_url: null,
        warranty_period_months: null,
        published_at: null,
        featured_group: 1,
        price_min: null,
        price_max: null,
        in_stock: false,
      },
    ],
    pagination: { offset: 0, limit: 100, total: 2 },
  },
};

describe("fetchProducts", () => {
  it("回傳後端的商品列表", async () => {
    const { adapter } = createMockAdapter(sampleResponse);
    const client = createApiClient("/api/v1/public", adapter);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items).toHaveLength(2);
  });

  it("回傳後端的商品總數", async () => {
    const { adapter } = createMockAdapter(sampleResponse);
    const client = createApiClient("/api/v1/public", adapter);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.total).toBe(2);
  });

  it("請求打到 /products 並帶上查詢參數", async () => {
    const { adapter, captured } = createMockAdapter(sampleResponse);
    const client = createApiClient("/api/v1/public", adapter);
    await fetchProducts({ limit: 100 }, client);
    expect(client.getUri(captured.config)).toBe(
      "/api/v1/public/products?limit=100"
    );
  });
});
