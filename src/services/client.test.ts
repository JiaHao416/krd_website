import { describe, it, expect } from "vitest";
import { DEFAULT_BASE_URL, createApiClient, resolveBaseUrl } from "./client";

describe("resolveBaseUrl", () => {
  it("未設定環境變數時回傳 production 預設網址", () => {
    expect(resolveBaseUrl(undefined)).toBe(
      "https://api.krd.com.tw/api/v1/public"
    );
  });

  it("空字串視同未設定，回傳預設網址", () => {
    expect(resolveBaseUrl("")).toBe(DEFAULT_BASE_URL);
  });

  it("有設定時直接使用設定值", () => {
    expect(resolveBaseUrl("/api/v1/public")).toBe("/api/v1/public");
  });
});

describe("createApiClient", () => {
  it("使用傳入的 baseURL", () => {
    expect(createApiClient("/api/v1/public").defaults.baseURL).toBe(
      "/api/v1/public"
    );
  });

  it("timeout 為 10000 毫秒", () => {
    expect(createApiClient("/api/v1/public").defaults.timeout).toBe(10000);
  });

  it("新 client 不帶憑證 header", () => {
    const headers = createApiClient("/x").defaults.headers.common as Record<
      string,
      unknown
    >;
    expect(headers).not.toHaveProperty("Authorization");
  });
});
