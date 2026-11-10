import { describe, it, expect } from "vitest";
import {
  PRODUCT_LIMIT,
  PRODUCT_PAGES,
  HOME_FEATURED_QUERIES,
  buildProductParams,
} from "./catalog";
import type { ProductPageQuery } from "./catalog";
import { createApiClient } from "./client";
import type { ProductSort } from "./apiTypes";

const client = createApiClient("/api/v1/public");

// 將查詢條件序列化為最終 URL 字串
function toUrl(query: ProductPageQuery, userSort?: ProductSort): string {
  return client.getUri({
    url: "/products",
    params: buildProductParams(query, userSort),
  });
}

// 依頁面路徑取得設定並序列化；找不到設定就丟錯，避免靜默通過
function toQueryUrl(path: string, userSort?: ProductSort): string {
  const page = PRODUCT_PAGES.find((p) => p.path === path);
  if (!page) throw new Error(`找不到頁面設定：${path}`);
  return toUrl(page.query, userSort);
}

const BASE = "/api/v1/public/products";

describe("PRODUCT_PAGES 設定", () => {
  it("8 個商品頁路徑順序即導覽順序", () => {
    expect(PRODUCT_PAGES.map((p) => p.path)).toEqual([
      "/all-products",
      "/new-products",
      "/krd-products",
      "/micgo-products",
      "/wireless-micphone",
      "/wired-micphone",
      "/trumpet",
      "/accessories",
    ]);
  });

  it("PRODUCT_LIMIT 為 100", () => {
    expect(PRODUCT_LIMIT).toBe(100);
  });
});

describe("頁面 → 查詢字串", () => {
  it("全部商品無使用者排序只送 limit", () => {
    expect(toQueryUrl("/all-products")).toBe(`${BASE}?limit=100`);
  });

  it("全部商品使用者選名稱排序會送 sort=name", () => {
    expect(toQueryUrl("/all-products", "name")).toBe(`${BASE}?sort=name&limit=100`);
  });

  it("新品頁鎖定 newest，使用者排序不覆蓋", () => {
    expect(toQueryUrl("/new-products", "name")).toBe(`${BASE}?sort=newest&limit=100`);
  });

  it("MICGO 品牌頁送 brand=MICGO", () => {
    expect(toQueryUrl("/micgo-products")).toBe(`${BASE}?brand=MICGO&limit=100`);
  });

  it("KRD 品牌頁搭配使用者排序 newest", () => {
    expect(toQueryUrl("/krd-products", "newest")).toBe(
      `${BASE}?brand=KRD&sort=newest&limit=100`
    );
  });

  it("有線麥克風分類的中文會被 percent-encode", () => {
    expect(toQueryUrl("/wired-micphone")).toBe(
      `${BASE}?category=%E6%9C%89%E7%B7%9A%E9%BA%A5%E5%85%8B%E9%A2%A8&limit=100`
    );
  });

  it("無線麥克風分類的中文會被 percent-encode", () => {
    expect(toQueryUrl("/wireless-micphone")).toBe(
      `${BASE}?category=%E7%84%A1%E7%B7%9A%E9%BA%A5%E5%85%8B%E9%A2%A8&limit=100`
    );
  });

  it("喇叭分類的中文會被 percent-encode", () => {
    expect(toQueryUrl("/trumpet")).toBe(`${BASE}?category=%E5%96%87%E5%8F%AD&limit=100`);
  });

  it("配件分類的中文會被 percent-encode", () => {
    expect(toQueryUrl("/accessories")).toBe(`${BASE}?category=%E9%85%8D%E4%BB%B6&limit=100`);
  });
});

describe("首頁熱銷查詢", () => {
  it("熱銷 1 有 featured 時不送 sort", () => {
    expect(toUrl(HOME_FEATURED_QUERIES[0], "newest")).toBe(`${BASE}?featured=1&limit=100`);
  });

  it("熱銷 2 只送 featured 與 limit", () => {
    expect(toUrl(HOME_FEATURED_QUERIES[1])).toBe(`${BASE}?featured=2&limit=100`);
  });
});

describe("buildProductParams", () => {
  it("空字串的 brand 與 category 不會送出", () => {
    expect(buildProductParams({ brand: "", category: "" })).toEqual({ limit: 100 });
  });
});
