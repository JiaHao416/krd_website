import { describe, it, expect } from "vitest";
import type { PublicProductApi } from "./apiTypes";
import { UNNAMED_PRODUCT, toProduct } from "./transform";
import { PRICE_ON_REQUEST } from "./format";

// 預設值為後端實際回應樣本
function makeApiProduct(
  overrides: Partial<PublicProductApi> = {}
): PublicProductApi {
  return {
    id: "p1",
    name: "BB1",
    brand: "MICGO",
    model: null,
    category: "喇叭",
    description: null,
    image_url: "https://img.krd.com.tw/x.jpg",
    warranty_period_months: null,
    published_at: "2026-11-10T01:55:23.622Z",
    featured_group: null,
    price_min: null,
    price_max: null,
    in_stock: false,
    ...overrides,
  };
}

describe("toProduct 欄位對應", () => {
  it("image_url 對應為 imageUrl", () => {
    expect(toProduct(makeApiProduct()).imageUrl).toBe(
      "https://img.krd.com.tw/x.jpg"
    );
  });

  it("published_at 對應為 publishedAt", () => {
    expect(toProduct(makeApiProduct()).publishedAt).toBe(
      "2026-11-10T01:55:23.622Z"
    );
  });

  it("featured_group 為 null 時 featuredGroup 為 null", () => {
    expect(toProduct(makeApiProduct()).featuredGroup).toBeNull();
  });

  it("featured_group 為 2 時對應為 featuredGroup", () => {
    expect(toProduct(makeApiProduct({ featured_group: 2 })).featuredGroup).toBe(
      2
    );
  });

  it("warranty_period_months 對應為 warrantyPeriodMonths", () => {
    expect(
      toProduct(makeApiProduct({ warranty_period_months: 12 }))
        .warrantyPeriodMonths
    ).toBe(12);
  });

  it("in_stock 對應為 inStock", () => {
    expect(toProduct(makeApiProduct()).inStock).toBe(false);
  });

  it("category 原樣保留", () => {
    expect(toProduct(makeApiProduct()).category).toBe("喇叭");
  });
});

describe("toProduct 價格", () => {
  it("價格皆為 null 時 priceText 為價格洽詢", () => {
    expect(toProduct(makeApiProduct()).priceText).toBe(PRICE_ON_REQUEST);
  });

  it("價格區間產生 priceText", () => {
    const p = toProduct(
      makeApiProduct({ price_min: 120000, price_max: 150000 })
    );
    expect(p.priceText).toBe("NT$1,200 – NT$1,500");
  });

  it("priceMin 保留後端原始分值", () => {
    const p = toProduct(
      makeApiProduct({ price_min: 120000, price_max: 150000 })
    );
    expect(p.priceMin).toBe(120000);
  });
});

describe("toProduct 缺圖與名稱 fallback", () => {
  it("image_url 為 null 時 imageUrl 為 null", () => {
    expect(toProduct(makeApiProduct({ image_url: null })).imageUrl).toBeNull();
  });

  it("image_url 為空字串時 imageUrl 為 null", () => {
    expect(toProduct(makeApiProduct({ image_url: "" })).imageUrl).toBeNull();
  });

  it("name 為空字串時退回 brand 與 model", () => {
    const p = toProduct(
      makeApiProduct({ name: "", brand: "KRD", model: "M-100" })
    );
    expect(p.name).toBe("KRD M-100");
  });

  it("name 只有空白且 model 為 null 時只用 brand", () => {
    const p = toProduct(
      makeApiProduct({ name: "   ", brand: "KRD", model: null })
    );
    expect(p.name).toBe("KRD");
  });

  it("有名稱時不使用 fallback", () => {
    expect(toProduct(makeApiProduct({ name: "BB1" })).name).toBe("BB1");
  });

  it("name 前後有空白時回傳 trim 後的名稱", () => {
    expect(toProduct(makeApiProduct({ name: "  BB1  " })).name).toBe("BB1");
  });

  it("name 空白且 brand 與 model 皆為 null 時使用保底文案", () => {
    const p = toProduct(makeApiProduct({ name: " ", brand: null, model: null }));
    expect(p.name).toBe(UNNAMED_PRODUCT);
  });

  it("name 空白且 brand 與 model 只有空白時使用保底文案", () => {
    const p = toProduct(makeApiProduct({ name: "", brand: " ", model: "  " }));
    expect(p.name).toBe(UNNAMED_PRODUCT);
  });
});
