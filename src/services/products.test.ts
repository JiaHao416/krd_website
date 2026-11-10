import { describe, it, expect, vi, afterEach } from "vitest";
import { AxiosError, CanceledError } from "axios";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { createApiClient } from "./client";
import { fetchProducts } from "./products";
import { ApiError } from "./errors";
import { HOME_FEATURED_QUERIES, PRODUCT_PAGES, buildProductParams } from "./catalog";

/** 建立測試用 adapter，並把收到的請求設定存到 captured.config */
function createMockAdapter(data: unknown, status = 200) {
  const captured: { config?: InternalAxiosRequestConfig; calls: number } = {
    calls: 0,
  };
  const adapter: AxiosAdapter = async (config) => {
    captured.config = config;
    captured.calls += 1;
    if (status >= 400) {
      // 自訂 adapter 不經 validateStatus，非 2xx 需自行拋出 AxiosError
      throw new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        null,
        { data, status, statusText: "", headers: {}, config }
      );
    }
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

/** 建立一律拋出網路錯誤的 adapter */
function createNetworkErrorAdapter(): AxiosAdapter {
  return async (config) => {
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
  };
}

/** 以指定回應建立 client 與 adapter 記錄 */
function setup(data: unknown, status = 200) {
  const { adapter, captured } = createMockAdapter(data, status);
  return { client: createApiClient("/api/v1/public", adapter), captured };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchProducts", () => {
  it("回傳轉換後的商品列表", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items).toHaveLength(2);
  });

  it("回傳後端的商品總數", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.total).toBe(2);
  });

  it("價格皆為 null 的商品顯示價格洽詢", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items[1].priceText).toBe("價格洽詢");
  });

  it("商品已轉成 camelCase 的 Product", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items[0].priceText).toBe("NT$1,000 – NT$1,200");
  });

  it("缺圖商品的 imageUrl 為 null", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items[0].imageUrl).toBeNull();
  });

  it("查無商品時回傳空結果而不拋錯", async () => {
    const { client } = setup({
      success: true,
      data: { items: [], pagination: { offset: 0, limit: 100, total: 0 } },
    });
    await expect(fetchProducts({ limit: 100 }, client)).resolves.toEqual({
      items: [],
      total: 0,
      truncated: false,
    });
  });

  it("請求打到 /products 並帶上查詢參數", async () => {
    const { client, captured } = setup(sampleResponse);
    await fetchProducts({ limit: 100 }, client);
    expect(client.getUri(captured.config)).toBe(
      "/api/v1/public/products?limit=100"
    );
  });

  it("串接 buildProductParams 後中文分類正確 encode", async () => {
    const page = PRODUCT_PAGES.find((p) => p.path === "/wired-micphone");
    if (!page) throw new Error("找不到 /wired-micphone 頁面設定");
    const { client, captured } = setup(sampleResponse);
    await fetchProducts(buildProductParams(page.query), client);
    expect(client.getUri(captured.config)).toBe(
      "/api/v1/public/products?category=%E6%9C%89%E7%B7%9A%E9%BA%A5%E5%85%8B%E9%A2%A8&limit=100"
    );
  });

  it("串接首頁熱銷查詢帶上 featured=2", async () => {
    const { client, captured } = setup(sampleResponse);
    await fetchProducts(buildProductParams(HOME_FEATURED_QUERIES[1]), client);
    expect(client.getUri(captured.config)).toBe(
      "/api/v1/public/products?featured=2&limit=100"
    );
  });

  it("HTTP 429 拋出 rate_limited", async () => {
    const { client } = setup({ success: false }, 429);
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "rate_limited",
    });
  });

  it("HTTP 500 拋出 http 並帶 status", async () => {
    const { client } = setup({ success: false }, 500);
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "http",
      status: 500,
    });
  });

  it("失敗時拋出 ApiError 實例", async () => {
    const { client } = setup({ success: false }, 500);
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toBeInstanceOf(
      ApiError
    );
  });

  it("網路錯誤拋出 network", async () => {
    const client = createApiClient("/api/v1/public", createNetworkErrorAdapter());
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "network",
    });
  });

  it("請求被取消時拋出 canceled", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new CanceledError(undefined, undefined, config);
    };
    const client = createApiClient("/api/v1/public", adapter);
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "canceled",
    });
  });

  it("200 但 success:false 拋出 invalid_response", async () => {
    const { client } = setup({
      success: false,
      error: { code: "X", message: "y" },
    });
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "invalid_response",
    });
  });

  it("200 但回傳 HTML（SPA fallback）拋出 invalid_response", async () => {
    const { client } = setup("<!doctype html><html></html>");
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "invalid_response",
    });
  });

  it("200 但 items 不是陣列拋出 invalid_response", async () => {
    const { client } = setup({ success: true, data: { items: "oops" } });
    await expect(fetchProducts({ limit: 100 }, client)).rejects.toMatchObject({
      kind: "invalid_response",
    });
  });

  it("name 為 null 的商品被略過，其餘商品照常回傳", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const [first, second] = sampleResponse.data.items;
    const { client } = setup({
      ...sampleResponse,
      data: { ...sampleResponse.data, items: [{ ...first, name: null }, second] },
    });
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items.map((p) => p.id)).toEqual(["b2"]);
  });

  it("元素為 null 時被略過而不拋出 TypeError", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const [first] = sampleResponse.data.items;
    const { client } = setup({
      ...sampleResponse,
      data: { ...sampleResponse.data, items: [null, first] },
    });
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items.map((p) => p.id)).toEqual(["a1"]);
  });

  it("in_stock 不是布林值的商品被略過", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const [first, second] = sampleResponse.data.items;
    const { client } = setup({
      ...sampleResponse,
      data: { ...sampleResponse.data, items: [first, { ...second, in_stock: "yes" }] },
    });
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.items.map((p) => p.id)).toEqual(["a1"]);
  });

  it("略過格式不符的商品時 console.warn 一次", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const [first, second] = sampleResponse.data.items;
    const { client } = setup({
      ...sampleResponse,
      data: { ...sampleResponse.data, items: [{ ...first, id: 1 }, second] },
    });
    await fetchProducts({ limit: 100 }, client);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("HTTP 500 時只發出一次請求（不自動重試）", async () => {
    const { client, captured } = setup({ success: false }, 500);
    await fetchProducts({ limit: 100 }, client).catch(() => undefined);
    expect(captured.calls).toBe(1);
  });

  it("total 大於取得筆數時 console.warn 一次", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = setup({
      ...sampleResponse,
      data: {
        ...sampleResponse.data,
        pagination: { offset: 0, limit: 100, total: 150 },
      },
    });
    await fetchProducts({ limit: 100 }, client);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("total 大於取得筆數時 truncated 為 true", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = setup({
      ...sampleResponse,
      data: {
        ...sampleResponse.data,
        pagination: { offset: 0, limit: 100, total: 150 },
      },
    });
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.truncated).toBe(true);
  });

  it("total 等於筆數時 truncated 為 false", async () => {
    const { client } = setup(sampleResponse);
    const result = await fetchProducts({ limit: 100 }, client);
    expect(result.truncated).toBe(false);
  });

  it("total 等於筆數時不 console.warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = setup(sampleResponse);
    await fetchProducts({ limit: 100 }, client);
    expect(warn).not.toHaveBeenCalled();
  });
});
