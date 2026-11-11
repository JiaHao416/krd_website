import { describe, it, expect } from "vitest";
import {
  buildInquiryText,
  buildMetaDescription,
  variantLabel,
  formatWarranty,
  buildBrandModelLine,
  buildSpecRows,
} from "./productDetailText";
import type { ProductVariant } from "../services/transform";

const PRODUCT_URL = "https://www.krd.com.tw/products/x";

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "v1",
    sku: "MG-U200-BK",
    attributes: [],
    imageUrl: null,
    isDefault: true,
    inStock: true,
    priceInclTax: null,
    priceText: null,
    ...overrides,
  };
}

describe("buildInquiryText", () => {
  it("有型號時為「名稱｜型號 X｜網址」", () => {
    expect(buildInquiryText("UHF 組", "MG-U200", PRODUCT_URL)).toBe(
      `UHF 組｜型號 MG-U200｜${PRODUCT_URL}`
    );
  });

  it("型號為 null 時省略中段", () => {
    expect(buildInquiryText("BB1", null, PRODUCT_URL)).toBe(`BB1｜${PRODUCT_URL}`);
  });

  it("型號只有空白時視同沒有型號", () => {
    expect(buildInquiryText("BB1", "  ", PRODUCT_URL)).toBe(`BB1｜${PRODUCT_URL}`);
  });
});

describe("buildMetaDescription", () => {
  const base = { brand: "MICGO", model: "MG-U200", category: "喇叭" };

  it("說明超過 80 字時只取前 80 個字元", () => {
    const description = "音".repeat(100);
    const result = buildMetaDescription({ ...base, description });
    expect(Array.from(result)).toHaveLength(80);
  });

  it("換行與連續空白壓成單一空白並去頭尾", () => {
    const description = "  第一行\n\n第二行   第三行  ";
    expect(buildMetaDescription({ ...base, description })).toBe(
      "第一行 第二行 第三行"
    );
  });

  it("沒有說明時以品牌、型號、分類組成", () => {
    expect(buildMetaDescription({ ...base, description: null })).toBe(
      "MICGO MG-U200 喇叭"
    );
  });

  it("說明只有空白且沒有型號時略過空值", () => {
    expect(
      buildMetaDescription({ ...base, description: "   ", model: null })
    ).toBe("MICGO 喇叭");
  });
});

describe("variantLabel", () => {
  it("以「 / 」串接各屬性值", () => {
    const variant = makeVariant({
      attributes: [
        { key: "顏色", value: "黑色" },
        { key: "組合", value: "手持 ×2" },
      ],
    });
    expect(variantLabel(variant)).toBe("黑色 / 手持 ×2");
  });

  it("沒有屬性時顯示 SKU", () => {
    expect(variantLabel(makeVariant())).toBe("MG-U200-BK");
  });
});

describe("formatWarranty", () => {
  it("整年以「N 年」顯示", () => {
    expect([formatWarranty(12), formatWarranty(24)]).toEqual(["1 年", "2 年"]);
  });

  it("非整年以「N 個月」顯示", () => {
    expect([formatWarranty(6), formatWarranty(18)]).toEqual([
      "6 個月",
      "18 個月",
    ]);
  });
});

describe("buildBrandModelLine", () => {
  it("品牌與型號以「 · 」串接，型號前加前綴", () => {
    expect(buildBrandModelLine("MICGO", "MG-U200")).toBe(
      "MICGO · 型號 MG-U200"
    );
  });

  it("只有其中一項時只顯示該項", () => {
    expect([
      buildBrandModelLine("MICGO", null),
      buildBrandModelLine(null, "MG-U200"),
    ]).toEqual(["MICGO", "型號 MG-U200"]);
  });

  it("兩者皆空時為 null", () => {
    expect(buildBrandModelLine(null, "  ")).toBeNull();
  });
});

describe("buildSpecRows", () => {
  it("依序列出 SKU、屬性與保固", () => {
    const variant = makeVariant({ attributes: [{ key: "頻段", value: "UHF" }] });
    expect(buildSpecRows(variant, 12)).toEqual([
      { label: "SKU", value: "MG-U200-BK" },
      { label: "頻段", value: "UHF" },
      { label: "保固", value: "1 年" },
    ]);
  });

  it("保固為 null 時不顯示保固列", () => {
    const rows = buildSpecRows(makeVariant(), null);
    expect(rows.map((row) => row.label)).not.toContain("保固");
  });

  it("沒有變體也沒有保固時為空陣列", () => {
    expect(buildSpecRows(null, null)).toEqual([]);
  });
});
