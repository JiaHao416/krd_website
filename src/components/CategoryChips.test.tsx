import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import CategoryChips from "./CategoryChips";
import { NAV_ITEMS } from "../config/navigation";

const TITLES = [
  "所有商品",
  "最新商品",
  "KRD",
  "MICGO",
  "無線麥克風",
  "有線麥克風",
  "擴大機 / 喇叭",
  "配件",
];

/** 顯示目前路徑，供驗證導頁 */
const LocationDisplay = () => (
  <div data-testid="loc">{useLocation().pathname}</div>
);

const renderChips = (path = "/trumpet") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CategoryChips />
      <LocationDisplay />
    </MemoryRouter>
  );

describe("CategoryChips（舊側邊選單同語意）", () => {
  it("首屏依序顯示 8 個導覽項目", () => {
    renderChips();
    const nav = screen.getByRole("navigation", { name: "商品分類" });
    const texts = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent ?? "");
    expect(texts).toEqual(TITLES);
  });

  it("目前頁 chip 有 aria-current=page", () => {
    renderChips("/trumpet");
    expect(
      screen.getByRole("link", { name: "擴大機 / 喇叭" })
    ).toHaveAttribute("aria-current", "page");
  });

  it("其他 chip 沒有 aria-current", () => {
    renderChips("/trumpet");
    expect(
      screen.getByRole("link", { name: "所有商品" })
    ).not.toHaveAttribute("aria-current");
  });

  it("點擊 KRD 後導向 /krd-products", async () => {
    renderChips("/trumpet");
    await userEvent.setup().click(screen.getByRole("link", { name: "KRD" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/krd-products");
  });

  it("沒有骨架載入元素", () => {
    const { container } = renderChips();
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});

describe("CategoryChips（自 NavBar 移入）", () => {
  it.each(NAV_ITEMS)("$title chip 為連結且 href 為對應路徑", ({ title, path }) => {
    renderChips("/all-products");
    expect(screen.getByRole("link", { name: title })).toHaveAttribute(
      "href",
      path
    );
  });

  it("點擊無線麥克風後導向 /wireless-micphone", async () => {
    renderChips("/all-products");
    await userEvent
      .setup()
      .click(screen.getByRole("link", { name: "無線麥克風" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/wireless-micphone");
  });
});

describe("CategoryChips 無障礙", () => {
  it("nav 的 aria-label 為商品分類", () => {
    renderChips();
    expect(
      screen.getByRole("navigation", { name: "商品分類" })
    ).toBeInTheDocument();
  });
});
