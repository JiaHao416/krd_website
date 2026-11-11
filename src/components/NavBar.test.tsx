import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

/** 顯示目前路徑，供驗證導頁 */
const LocationDisplay = () => (
  <div data-testid="loc">{useLocation().pathname}</div>
);

const renderBar = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
      <LocationDisplay />
    </MemoryRouter>
  );

/** 取得 md+ 主選單 nav */
const getMainNav = () => screen.getByRole("navigation", { name: "主選單" });

/** 取得 base 選單鈕（名稱隨開關狀態改變） */
const getMenuButton = () =>
  screen.getByRole("button", { name: /開啟選單|關閉選單/ });

describe("NavBar Logo", () => {
  it("使用靜態 Logo 路徑與尺寸", () => {
    renderBar();
    const img = screen.getByAltText("KRD MICGO Logo");
    expect(img).toHaveAttribute("src", "/brand-logo.png");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "235");
  });

  it("載入失敗後改顯示文字並移除圖片", () => {
    renderBar();
    fireEvent.error(screen.getByAltText("KRD MICGO Logo"));
    expect(screen.getByText("KRD MICGO")).toBeInTheDocument();
    expect(screen.queryByAltText("KRD MICGO Logo")).toBeNull();
  });

  it("初次渲染不顯示文字備援", () => {
    renderBar();
    expect(screen.queryByText("KRD MICGO")).toBeNull();
  });

  it("Logo 連到 /", () => {
    renderBar("/abouts");
    expect(screen.getByRole("link", { name: "KRD MICGO Logo" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});

describe("NavBar 主選單", () => {
  it("主選單依序為逛商品、關於我們，右側為打電話問問", () => {
    renderBar();
    const names = within(getMainNav())
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names).toEqual(["逛商品", "關於我們"]);
    const phone = screen.getByRole("link", { name: "打電話問問" });
    expect(getMainNav()).not.toContainElement(phone);
  });

  it("關於我們連結指向 /abouts", () => {
    renderBar();
    expect(
      within(getMainNav()).getByRole("link", { name: "關於我們" })
    ).toHaveAttribute("href", "/abouts");
  });

  it("打電話問問 href 為 tel:04-22798787", () => {
    renderBar();
    expect(screen.getByRole("link", { name: "打電話問問" })).toHaveAttribute(
      "href",
      "tel:04-22798787"
    );
  });

  it("逛商品在 /all-products 有 aria-current=page", () => {
    renderBar("/all-products");
    expect(
      within(getMainNav()).getByRole("link", { name: "逛商品" })
    ).toHaveAttribute("aria-current", "page");
  });

  // 分類頁與詳情頁只是屬於「逛商品」區段，不是連結指向的頁面
  it.each(["/trumpet", "/products/abc"])(
    "逛商品在 %s 有 aria-current=true",
    (path) => {
      renderBar(path);
      expect(
        within(getMainNav()).getByRole("link", { name: "逛商品" })
      ).toHaveAttribute("aria-current", "true");
    }
  );

  it("關於我們在 /abouts 有 aria-current=page", () => {
    renderBar("/abouts");
    expect(
      within(getMainNav()).getByRole("link", { name: "關於我們" })
    ).toHaveAttribute("aria-current", "page");
  });
});

describe("NavBar 行動版選單", () => {
  it("選單鈕預設 aria-expanded=false 且名稱為開啟選單，點擊後為 true 且名稱為關閉選單，aria-controls 指向面板 id", async () => {
    renderBar();
    const button = screen.getByRole("button", { name: "開啟選單" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    const panelId = button.getAttribute("aria-controls");
    expect(panelId).toBe("mobile-menu");
    expect(document.getElementById(panelId ?? "")).not.toBeNull();
    await userEvent.setup().click(button);
    expect(screen.getByRole("button", { name: "關閉選單" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("Esc 關閉面板並把焦點還給選單鈕", async () => {
    renderBar();
    const user = userEvent.setup();
    await user.click(getMenuButton());
    await user.keyboard("{Escape}");
    const button = getMenuButton();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("點面板外側關閉", async () => {
    renderBar();
    await userEvent.setup().click(getMenuButton());
    fireEvent.pointerDown(document.body);
    expect(getMenuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("點面板內連結後關閉", async () => {
    renderBar();
    const user = userEvent.setup();
    await user.click(getMenuButton());
    const panel = screen.getByRole("navigation", { name: "行動版選單" });
    await user.click(within(panel).getByRole("link", { name: "關於我們" }));
    expect(getMenuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("loc")).toHaveTextContent("/abouts");
  });
});
