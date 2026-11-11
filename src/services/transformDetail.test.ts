import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicProductDetailApi, PublicVariantApi } from "./apiTypes";
import { UNNAMED_PRODUCT, toProductDetail } from "./transform";

const PRODUCT_ID = "00000000-0000-4000-8000-000000000001";
const VARIANT_ID_1 = "00000000-0000-4000-8000-000000000002";
const VARIANT_ID_2 = "00000000-0000-4000-8000-000000000003";

// 形狀取自實測樣本（價格 null、attributes 為空物件），id 與圖片網址為手寫假值
function makeVariant(
  overrides: Partial<PublicVariantApi> = {}
): PublicVariantApi {
  return {
    id: VARIANT_ID_1,
    sku: "AT-TEST-0001",
    attributes: {},
    image_url: "https://img.krd.com.tw/test-1.jpg",
    is_default: true,
    in_stock: false,
    price_incl_tax: null,
    ...overrides,
  };
}

function makeDetail(
  overrides: Partial<PublicProductDetailApi> = {}
): PublicProductDetailApi {
  return {
    id: PRODUCT_ID,
    name: "BB1",
    brand: "MICGO",
    model: null,
    category: "喇叭",
    description: null,
    image_url: "https://img.krd.com.tw/test-1.jpg",
    warranty_period_months: null,
    published_at: "2026-11-10T01:55:23.622Z",
    in_stock: false,
    variants: [makeVariant()],
    ...overrides,
  };
}

// 測試壞資料時刻意塞入型別不符的值
function asVariant(value: unknown): PublicVariantApi {
  return value as PublicVariantApi;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toProductDetail 實測形狀", () => {
  it("價格與選填欄位皆為 null 時對應為 null 或空陣列，且不含 NaN", () => {
    const result = toProductDetail(makeDetail());
    expect(result.model).toBeNull();
    expect(result.description).toBeNull();
    expect(result.warrantyMonths).toBeNull();
    expect(result.variants[0].priceInclTax).toBeNull();
    expect(result.variants[0].priceText).toBeNull();
    expect(result.variants[0].attributes).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("NaN");
  });

  it("基本欄位改為 camelCase", () => {
    const result = toProductDetail(makeDetail());
    expect(result.id).toBe(PRODUCT_ID);
    expect(result.brand).toBe("MICGO");
    expect(result.category).toBe("喇叭");
    expect(result.imageUrl).toBe("https://img.krd.com.tw/test-1.jpg");
    expect(result.inStock).toBe(false);
    expect(result.variants[0]).toMatchObject({
      id: VARIANT_ID_1,
      sku: "AT-TEST-0001",
      imageUrl: "https://img.krd.com.tw/test-1.jpg",
      isDefault: true,
      inStock: false,
    });
  });
});

describe("toProductDetail 價格（依契約手寫，非實測）", () => {
  it("price_incl_tax 120000 對應為 NT$1,200", () => {
    const result = toProductDetail(
      makeDetail({ variants: [makeVariant({ price_incl_tax: 120000 })] })
    );
    expect(result.variants[0].priceInclTax).toBe(120000);
    expect(result.variants[0].priceText).toBe("NT$1,200");
  });

  it.each([
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["字串", "1200"],
    ["undefined", undefined],
  ])("price_incl_tax 為 %s 時價格與文字皆為 null", (_label, value) => {
    const result = toProductDetail(
      makeDetail({
        variants: [asVariant({ ...makeVariant(), price_incl_tax: value })],
      })
    );
    expect(result.variants[0].priceInclTax).toBeNull();
    expect(result.variants[0].priceText).toBeNull();
    expect(JSON.stringify(result)).not.toContain("NaN");
  });
});

describe("toProductDetail 保固（依契約手寫，非實測）", () => {
  it.each([
    [0, null],
    [12, 12],
    [null, null],
    [-3, null],
  ])("warranty_period_months %s 對應為 %s", (input, expected) => {
    const result = toProductDetail(
      makeDetail({ warranty_period_months: input })
    );
    expect(result.warrantyMonths).toBe(expected);
  });
});

describe("toProductDetail 變體與預設變體", () => {
  it("variants 為空陣列時 defaultVariantId 為 null", () => {
    const result = toProductDetail(makeDetail({ variants: [] }));
    expect(result.variants).toEqual([]);
    expect(result.defaultVariantId).toBeNull();
  });

  it("第二個變體為預設時取其 id，且順序不重排", () => {
    const result = toProductDetail(
      makeDetail({
        variants: [
          makeVariant({ id: VARIANT_ID_1, sku: "AT-TEST-0001", is_default: false }),
          makeVariant({ id: VARIANT_ID_2, sku: "AT-TEST-0002", is_default: true }),
        ],
      })
    );
    expect(result.defaultVariantId).toBe(VARIANT_ID_2);
    expect(result.variants.map((v) => v.id)).toEqual([VARIANT_ID_1, VARIANT_ID_2]);
  });

  it("沒有任何預設變體時取第一個", () => {
    const result = toProductDetail(
      makeDetail({
        variants: [
          makeVariant({ id: VARIANT_ID_1, is_default: false }),
          makeVariant({ id: VARIANT_ID_2, sku: "AT-TEST-0002", is_default: false }),
        ],
      })
    );
    expect(result.defaultVariantId).toBe(VARIANT_ID_1);
  });

  it("variants 不是陣列時視為空陣列", () => {
    const result = toProductDetail(
      makeDetail({ variants: null as unknown as PublicVariantApi[] })
    );
    expect(result.variants).toEqual([]);
    expect(result.defaultVariantId).toBeNull();
  });
});

describe("toProductDetail attributes（依契約手寫，非實測）", () => {
  it("string、number、boolean 值字串化並保持順序", () => {
    const result = toProductDetail(
      makeDetail({
        variants: [
          makeVariant({ attributes: { 顏色: "黑", 頻道: 2, 防水: true } }),
        ],
      })
    );
    expect(result.variants[0].attributes).toEqual([
      { key: "顏色", value: "黑" },
      { key: "頻道", value: "2" },
      { key: "防水", value: "true" },
    ]);
  });

  it("值為 null 或物件的 key 被略過", () => {
    const result = toProductDetail(
      makeDetail({
        variants: [
          asVariant({
            ...makeVariant(),
            attributes: { 顏色: "黑", 空值: null, 巢狀: { a: 1 } },
          }),
        ],
      })
    );
    expect(result.variants[0].attributes).toEqual([{ key: "顏色", value: "黑" }]);
    const text = JSON.stringify(result);
    expect(text).not.toContain("[object Object]");
    expect(text).not.toContain('"null"');
  });

  it.each([
    ["null", null],
    ["陣列", ["a"]],
    ["字串", "abc"],
  ])("attributes 為%s 時退為空陣列", (_label, value) => {
    const result = toProductDetail(
      makeDetail({
        variants: [asVariant({ ...makeVariant(), attributes: value })],
      })
    );
    expect(result.variants[0].attributes).toEqual([]);
  });
});

describe("toProductDetail 壞變體", () => {
  it.each([
    ["缺 sku", { sku: undefined }],
    ["id 非字串", { id: 123 }],
    ["in_stock 非布林", { in_stock: "yes" }],
  ])("%s 的變體被略過並 console.warn，其餘保留", (_label, patch) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = toProductDetail(
      makeDetail({
        variants: [
          asVariant({ ...makeVariant({ id: VARIANT_ID_1 }), ...patch }),
          makeVariant({ id: VARIANT_ID_2, sku: "AT-TEST-0002", is_default: false }),
        ],
      })
    );
    expect(result.variants.map((v) => v.id)).toEqual([VARIANT_ID_2]);
    expect(warn).toHaveBeenCalled();
  });

  it("被略過的是預設變體時，defaultVariantId 退回剩餘第一個", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = toProductDetail(
      makeDetail({
        variants: [
          asVariant({ ...makeVariant({ id: VARIANT_ID_1 }), sku: undefined }),
          makeVariant({ id: VARIANT_ID_2, sku: "AT-TEST-0002", is_default: false }),
        ],
      })
    );
    expect(result.defaultVariantId).toBe(VARIANT_ID_2);
  });

  it("變體 image_url 為空字串或非字串時為 null", () => {
    const result = toProductDetail(
      makeDetail({
        variants: [
          makeVariant({ image_url: "" }),
          asVariant({ ...makeVariant({ id: VARIANT_ID_2, sku: "AT-TEST-0002" }), image_url: 5 }),
        ],
      })
    );
    expect(result.variants[0].imageUrl).toBeNull();
    expect(result.variants[1].imageUrl).toBeNull();
  });
});

describe("toProductDetail 商品層", () => {
  it("商品 image_url 為空字串時為 null", () => {
    expect(toProductDetail(makeDetail({ image_url: "" })).imageUrl).toBeNull();
  });

  it("name 前後空白被 trim", () => {
    expect(toProductDetail(makeDetail({ name: "  BB1  " })).name).toBe("BB1");
  });

  it("name 空白時退回 brand 加 model", () => {
    const result = toProductDetail(
      makeDetail({ name: "   ", brand: "KRD", model: "X1" })
    );
    expect(result.name).toBe("KRD X1");
  });

  it("name、brand、model 全缺時為 UNNAMED_PRODUCT", () => {
    const result = toProductDetail(
      makeDetail({ name: "", brand: null, model: null })
    );
    expect(result.name).toBe(UNNAMED_PRODUCT);
  });

  it("brand、model、description 非字串時為 null", () => {
    const result = toProductDetail(
      makeDetail({
        brand: 1 as unknown as string,
        model: 2 as unknown as string,
        description: 3 as unknown as string,
      })
    );
    expect(result.brand).toBeNull();
    expect(result.model).toBeNull();
    expect(result.description).toBeNull();
  });

  it("description 保留原文換行", () => {
    const result = toProductDetail(makeDetail({ description: "第一行\n第二行" }));
    expect(result.description).toBe("第一行\n第二行");
  });

  it("結果不含列表專用欄位", () => {
    const result = toProductDetail(makeDetail());
    expect(result).not.toHaveProperty("priceMin");
    expect(result).not.toHaveProperty("priceMax");
    expect(result).not.toHaveProperty("featuredGroup");
    expect(result).not.toHaveProperty("priceText");
  });
});
