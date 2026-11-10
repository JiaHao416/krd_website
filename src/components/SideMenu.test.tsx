import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import SideMenu from "./SideMenu";

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

const renderMenu = () =>
  render(
    <MemoryRouter initialEntries={["/trumpet"]}>
      <SideMenu title="喇叭" />
      <LocationDisplay />
    </MemoryRouter>
  );

describe("SideMenu", () => {
  it("首屏依序顯示 8 個導覽項目", () => {
    renderMenu();
    const texts = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "")
      .filter((t) => TITLES.includes(t));
    expect(texts).toEqual(TITLES);
  });

  it("目前頁面按鈕有 active 樣式", () => {
    renderMenu();
    expect(
      screen.getByRole("button", { name: "擴大機 / 喇叭" }).className
    ).toContain("border-blue-500/30");
  });

  it("其他按鈕沒有 active 樣式", () => {
    renderMenu();
    expect(
      screen.getByRole("button", { name: "所有商品" }).className
    ).not.toContain("border-blue-500/30");
  });

  it("點擊 KRD 後導向 /krd-products", async () => {
    renderMenu();
    await userEvent.setup().click(screen.getByRole("button", { name: "KRD" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/krd-products");
  });

  it("沒有骨架載入元素", () => {
    const { container } = renderMenu();
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});
