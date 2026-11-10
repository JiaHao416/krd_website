import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

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

const renderBar = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <NavBar />
      <LocationDisplay />
    </MemoryRouter>
  );

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
});

describe("NavBar 選單", () => {
  it.each(TITLES)("%s 在桌機與手機各有一個按鈕", (title) => {
    renderBar();
    expect(screen.getAllByRole("button", { name: title })).toHaveLength(2);
  });

  it("桌機選單依序為 8 項加商店介紹", () => {
    renderBar();
    const names = [...TITLES, "商店介紹"];
    const texts = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "")
      .filter((t) => names.includes(t))
      .slice(0, 9);
    expect(texts).toEqual(names);
  });

  it("商店介紹按鈕存在", () => {
    renderBar();
    expect(
      screen.getAllByRole("button", { name: /商店介紹/ }).length
    ).toBeGreaterThan(0);
  });

  it("點擊無線麥克風後導向 /wireless-micphone", async () => {
    renderBar();
    await userEvent
      .setup()
      .click(screen.getAllByRole("button", { name: "無線麥克風" })[0]);
    expect(screen.getByTestId("loc")).toHaveTextContent("/wireless-micphone");
  });
});
