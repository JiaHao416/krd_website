import { describe, it, expect } from "vitest";
import { PRICE_ON_REQUEST, formatPrice, formatPriceRange } from "./format";

describe("formatPrice", () => {
  it("整數價格顯示千分位且無小數", () => {
    expect(formatPrice(120000)).toBe("NT$1,200");
  });

  it("有小數時最多顯示 2 位", () => {
    expect(formatPrice(123456)).toBe("NT$1,234.56");
  });

  it("小數不補零", () => {
    expect(formatPrice(120050)).toBe("NT$1,200.5");
  });

  it("0 元顯示 NT$0", () => {
    expect(formatPrice(0)).toBe("NT$0");
  });
});

describe("formatPriceRange", () => {
  it("最低與最高不同時顯示區間（en dash）", () => {
    expect(formatPriceRange(120000, 150000)).toBe("NT$1,200 – NT$1,500");
  });

  it("最低與最高相同時只顯示一個價格", () => {
    expect(formatPriceRange(120000, 120000)).toBe("NT$1,200");
  });

  it("只有最低價時顯示最低價", () => {
    expect(formatPriceRange(120000, null)).toBe("NT$1,200");
  });

  it("只有最高價時顯示最高價", () => {
    expect(formatPriceRange(null, 150000)).toBe("NT$1,500");
  });

  it("兩邊皆 null 時顯示價格洽詢", () => {
    expect(formatPriceRange(null, null)).toBe(PRICE_ON_REQUEST);
  });

  it("PRICE_ON_REQUEST 文案為「價格洽詢」", () => {
    expect(PRICE_ON_REQUEST).toBe("價格洽詢");
  });
});
