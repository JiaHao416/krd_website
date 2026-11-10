import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "./navigation";
import { PRODUCT_PAGES } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

describe("NAV_ITEMS", () => {
  it("路徑等於 PRODUCT_PAGES", () => {
    expect(NAV_ITEMS.map((i) => i.path)).toEqual(
      PRODUCT_PAGES.map((p) => p.path)
    );
  });

  it("標題等於 PRODUCT_PAGE_VIEWS", () => {
    for (const item of NAV_ITEMS) {
      expect(item.title).toBe(PRODUCT_PAGE_VIEWS[item.path].title);
    }
  });

  it("順序符合現行選單", () => {
    expect(NAV_ITEMS.map((i) => i.title)).toEqual([
      "所有商品",
      "最新商品",
      "KRD",
      "MICGO",
      "無線麥克風",
      "有線麥克風",
      "擴大機 / 喇叭",
      "配件",
    ]);
  });

  it("不含商店介紹", () => {
    expect(NAV_ITEMS.map((i) => i.path)).not.toContain("/abouts");
  });
});
