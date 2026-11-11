import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { ApiError } from "./errors";
import { classifyDetailError, isUuid } from "./productDetail";

/** 測試用假 UUID（手寫，非真實資料） */
const ID_1 = "00000000-0000-4000-8000-000000000001";

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
