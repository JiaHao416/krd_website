import { describe, it, expect, vi, afterEach } from "vitest";
import { AxiosError, AxiosHeaders, CanceledError } from "axios";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { createApiClient } from "./client";
import { ApiError } from "./errors";
import {
  classifyDetailError,
  fetchProductDetail,
  isUuid,
} from "./productDetail";

/** 測試用假 UUID（手寫，非真實資料） */
const ID_1 = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isUuid", () => {
  it("小寫 UUID 為 true", () => {
    expect(isUuid(ID_1)).toBe(true);
  });

  it("大寫 UUID 為 true", () => {
    expect(isUuid("00000000-0000-4000-8000-00000000000A")).toBe(true);
  });

  it.each([
    ["不是 UUID 的字串", "not-a-uuid"],
    ["空字串", ""],
    ["前置空白", " 00000000-0000-4000-8000-000000000001"],
    ["尾端多餘字元", "00000000-0000-4000-8000-000000000001x"],
    ["路徑穿越", "../products"],
    ["variant 位不合", "00000000-0000-4000-c000-000000000001"],
    ["undefined", undefined],
    ["null", null],
    ["數字", 123],
  ])("%s 為 false", (_name, value) => {
    expect(isUuid(value)).toBe(false);
  });
});

/** 建立最小的原生 AxiosError，可帶或不帶 response */
function makeAxiosError(status?: number): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  if (status === undefined) {
    return new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
  }
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    null,
    { data: {}, status, statusText: "", headers: {}, config }
  );
}

describe("classifyDetailError", () => {
  it("http 404 為 notFound", () => {
    expect(classifyDetailError(new ApiError("http", "x", 404))).toBe("notFound");
  });

  it("http 400 為 notFound", () => {
    expect(classifyDetailError(new ApiError("http", "x", 400))).toBe("notFound");
  });

  it("rate_limited 429 為 retryable", () => {
    expect(classifyDetailError(new ApiError("rate_limited", "x", 429))).toBe(
      "retryable"
    );
  });

  it.each([500, 502, 503])("http %i 為 retryable", (status) => {
    expect(classifyDetailError(new ApiError("http", "x", status))).toBe(
      "retryable"
    );
  });

  it("network 為 retryable", () => {
    expect(classifyDetailError(new ApiError("network", "x"))).toBe("retryable");
  });

  it("invalid_response 為 retryable", () => {
    expect(classifyDetailError(new ApiError("invalid_response", "x"))).toBe(
      "retryable"
    );
  });

  it("http 無 status 為 retryable", () => {
    expect(classifyDetailError(new ApiError("http", "x"))).toBe("retryable");
  });

  it("原生 AxiosError 404 先正規化後為 notFound", () => {
    expect(classifyDetailError(makeAxiosError(404))).toBe("notFound");
  });

  it("原生 AxiosError 無 response 為 retryable", () => {
    expect(classifyDetailError(makeAxiosError())).toBe("retryable");
  });

  it("一般 Error 為 retryable", () => {
    expect(classifyDetailError(new Error("boom"))).toBe("retryable");
  });
});

/** 建立測試用 adapter，並記錄收到的請求設定與呼叫次數 */
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

/** 以指定回應建立 client 與 adapter 記錄 */
function setup(data: unknown, status = 200) {
  const { adapter, captured } = createMockAdapter(data, status);
  return { client: createApiClient("/api/v1/public", adapter), captured };
}

/** 手寫的合法 variant（依契約手寫，非實測） */
const sampleVariant = {
  id: "00000000-0000-4000-8000-0000000000a1",
  sku: "TEST-SKU-001",
  attributes: { color: "黑" },
  image_url: "https://img.krd.com.tw/test-1.jpg",
  is_default: true,
  in_stock: true,
  price_incl_tax: 120000,
};

/** 產生詳情回應 body，可覆寫商品層欄位 */
function makeDetailBody(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      id: ID_1,
      name: "測試麥克風",
      brand: "TESTBRAND",
      model: "T-1",
      category: "有線麥克風",
      description: "說明",
      image_url: "https://img.krd.com.tw/test-1.jpg",
      warranty_period_months: 12,
      published_at: null,
      in_stock: true,
      variants: [sampleVariant],
      ...overrides,
    },
  };
}

describe("fetchProductDetail", () => {
  it("回傳轉換後的商品詳情並請求正確路徑", async () => {
    const { client, captured } = setup(makeDetailBody());
    const result = await fetchProductDetail(ID_1, client);
    expect(result.id).toBe(ID_1);
    expect(result.name).toBe("測試麥克風");
    expect(captured.config?.url).toBe(`/products/${ID_1}`);
    expect(captured.calls).toBe(1);
  });

  it("options.signal 會傳到請求設定", async () => {
    const { client, captured } = setup(makeDetailBody());
    const controller = new AbortController();
    await fetchProductDetail(ID_1, client, { signal: controller.signal });
    expect(captured.config?.signal).toBe(controller.signal);
  });

  it("價格為 null 時 priceText 為 null", async () => {
    const body = makeDetailBody({
      variants: [{ ...sampleVariant, price_incl_tax: null }],
    });
    const { client } = setup(body);
    const result = await fetchProductDetail(ID_1, client);
    expect(result.variants[0].priceText).toBeNull();
  });

  it.each(["not-a-uuid", "", "../admin"])(
    "非 UUID「%s」不發請求並拋 http 400",
    async (badId) => {
      const { client, captured } = setup(makeDetailBody());
      const error = await fetchProductDetail(badId, client).catch(
        (e: unknown) => e
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).kind).toBe("http");
      expect((error as ApiError).status).toBe(400);
      expect(captured.calls).toBe(0);
      expect(classifyDetailError(error)).toBe("notFound");
    }
  );

  it("404 拋 http 404 並帶後端訊息", async () => {
    const { client } = setup(
      {
        success: false,
        error: { code: "PRODUCT_NOT_FOUND", message: "商品不存在" },
      },
      404
    );
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("http");
    expect(error.status).toBe(404);
    expect(error.message).toBe("商品不存在");
  });

  it("400 拋 http 400", async () => {
    const { client } = setup(
      {
        success: false,
        error: { code: "VALIDATION_FAILED", message: "輸入驗證失敗" },
      },
      400
    );
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("http");
    expect(error.status).toBe(400);
  });

  it("429 拋 rate_limited", async () => {
    const { client } = setup({ success: false }, 429);
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("rate_limited");
    expect(error.status).toBe(429);
  });

  it.each([500, 503])("%i 拋 http 且保留 status", async (status) => {
    const { client } = setup({ success: false }, status);
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("http");
    expect(error.status).toBe(status);
  });

  it("網路錯誤拋 network", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    };
    const client = createApiClient("/api/v1/public", adapter);
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("network");
  });

  it("請求被取消拋 canceled", async () => {
    const adapter: AxiosAdapter = async () => {
      throw new CanceledError("canceled");
    };
    const client = createApiClient("/api/v1/public", adapter);
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("canceled");
  });

  it.each([
    ["HTML 字串", "<!doctype html><html></html>"],
    ["success 為 false", { success: false }],
    ["data 為 null", { success: true, data: null }],
    ["data 是列表形狀", { success: true, data: { items: [] } }],
  ])("200 但回應為 %s 拋 invalid_response", async (_name, body) => {
    const { client } = setup(body);
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("invalid_response");
  });

  it.each([
    ["缺 id", { id: undefined }],
    ["name 非字串", { name: 123 }],
    ["缺 category", { category: undefined }],
    ["in_stock 為字串", { in_stock: "true" }],
    ["variants 非陣列", { variants: null }],
  ])("商品層 %s 拋 invalid_response", async (_name, overrides) => {
    const { client } = setup(makeDetailBody(overrides));
    const error = (await fetchProductDetail(ID_1, client).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(error.kind).toBe("invalid_response");
  });

  it("壞 variant 被略過並 console.warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const body = makeDetailBody({
      variants: [sampleVariant, { id: 5 }],
    });
    const { client } = setup(body);
    const result = await fetchProductDetail(ID_1, client);
    expect(result.variants).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
  });
});
