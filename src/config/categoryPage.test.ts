import { describe, it, expect } from "vitest";
import { findCategoryPage } from "./categoryPage";

const ALL_PRODUCTS = { path: "/all-products", title: "所有商品" };

describe("findCategoryPage", () => {
  // 後端分類名稱反查分類頁路徑與標題
  it.each([
    ["喇叭", "/trumpet", "擴大機 / 喇叭"],
    ["有線麥克風", "/wired-micphone", "有線麥克風"],
    ["無線麥克風", "/wireless-micphone", "無線麥克風"],
    ["配件", "/accessories", "配件"],
  ])("「%s」對應 %s", (category, path, title) => {
    expect(findCategoryPage(category)).toEqual({ path, title });
  });

  it("未知分類退回所有商品", () => {
    expect(findCategoryPage("耳機")).toEqual(ALL_PRODUCTS);
  });

  it("品牌名不會比對到品牌頁，退回所有商品", () => {
    expect(findCategoryPage("MICGO")).toEqual(ALL_PRODUCTS);
  });

  it("空字串退回所有商品", () => {
    expect(findCategoryPage("")).toEqual(ALL_PRODUCTS);
  });
});
