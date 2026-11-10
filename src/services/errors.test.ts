import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { ApiError, getErrorMessage, normalizeError } from "./errors";

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

/** 建立帶 response 的 AxiosError */
function createHttpError(status: number, data: unknown = null) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    null,
    { data, status, statusText: "", headers: {}, config }
  );
}

describe("normalizeError", () => {
  it("無 response 的網路錯誤歸類為 network", () => {
    const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    expect(normalizeError(error).kind).toBe("network");
  });

  it("無 response 的 timeout 歸類為 network", () => {
    const error = new AxiosError("timeout", AxiosError.ECONNABORTED, config);
    expect(normalizeError(error).kind).toBe("network");
  });

  it("429 歸類為 rate_limited", () => {
    expect(normalizeError(createHttpError(429)).kind).toBe("rate_limited");
  });

  it("429 保留 status", () => {
    expect(normalizeError(createHttpError(429)).status).toBe(429);
  });

  it("500 歸類為 http 並保留 status", () => {
    const result = normalizeError(createHttpError(500));
    expect([result.kind, result.status]).toEqual(["http", 500]);
  });

  it("404 歸類為 http 並保留 status", () => {
    const result = normalizeError(createHttpError(404));
    expect([result.kind, result.status]).toEqual(["http", 404]);
  });

  it("優先採用後端 error.message 作為 ApiError.message", () => {
    const body = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "系統錯誤" },
    };
    expect(normalizeError(createHttpError(500, body)).message).toBe("系統錯誤");
  });

  it("既有 ApiError 回傳同一個實例", () => {
    const original = new ApiError("invalid_response", "x");
    expect(normalizeError(original)).toBe(original);
  });

  it("一般 Error 歸類為 invalid_response", () => {
    expect(normalizeError(new Error("boom")).kind).toBe("invalid_response");
  });

  it("字串歸類為 invalid_response", () => {
    expect(normalizeError("oops").kind).toBe("invalid_response");
  });

  it("任意值也會回傳 ApiError 且為 Error 實例", () => {
    const result = normalizeError("oops");
    expect([result instanceof ApiError, result instanceof Error]).toEqual([
      true,
      true,
    ]);
  });
});

describe("getErrorMessage", () => {
  it("rate_limited 回傳限流訊息", () => {
    expect(getErrorMessage(new ApiError("rate_limited", "", 429))).toBe(
      "瀏覽太頻繁，請稍候一分鐘再重試"
    );
  });

  it("network 回傳連線訊息", () => {
    expect(getErrorMessage(new ApiError("network", ""))).toBe(
      "無法連線，請檢查網路後重試"
    );
  });

  it("http 回傳通用訊息", () => {
    expect(getErrorMessage(new ApiError("http", "", 500))).toBe(
      "商品資料暫時無法載入，請稍後再試"
    );
  });

  it("invalid_response 回傳通用訊息", () => {
    expect(getErrorMessage(new ApiError("invalid_response", ""))).toBe(
      "商品資料暫時無法載入，請稍後再試"
    );
  });

  it("原始 429 AxiosError 也能轉成限流訊息", () => {
    expect(getErrorMessage(createHttpError(429))).toBe(
      "瀏覽太頻繁，請稍候一分鐘再重試"
    );
  });
});
