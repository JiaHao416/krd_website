import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";

/** 以 MemoryRouter 包住 Layout（NavBar 需要 Router） */
const renderLayout = (footer: "thanks" | "address" = "thanks") =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Layout footer={footer}>
        <p>頁面內容</p>
      </Layout>
    </MemoryRouter>
  );

describe("Layout", () => {
  it("第一個 tab stop 是跳到主要內容連結", async () => {
    renderLayout();
    await userEvent.setup().tab();
    expect(
      screen.getByRole("link", { name: "跳到主要內容" })
    ).toHaveFocus();
  });

  it("跳到主要內容指向可聚焦的 main#main", () => {
    const { container } = renderLayout();
    expect(
      screen.getByRole("link", { name: "跳到主要內容" })
    ).toHaveAttribute("href", "#main");
    const main = container.querySelector("main#main");
    expect(main).not.toBeNull();
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("children 位於 main 內", () => {
    renderLayout();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("頁面內容")
    );
  });

  it("footer=thanks 顯示感謝頁尾", () => {
    renderLayout("thanks");
    expect(screen.getByText("© KRD・謝謝你逛到這裡")).toBeInTheDocument();
  });

  it("footer=address 顯示地址頁尾", () => {
    renderLayout("address");
    expect(
      screen.getByText(
        "© KRD・411 台中市太平區永平路二段320之1號・週一至週五 09:00 - 18:00"
      )
    ).toBeInTheDocument();
  });

  it("未傳 mobileBar 時顯示預設單鈕撥號列", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout footer="thanks">
          <p>頁面內容</p>
        </Layout>
      </MemoryRouter>
    );
    const callLinks = screen.getAllByRole("link", { name: "打電話問問" });
    expect(callLinks.some((link) => link.closest(".fixed") !== null)).toBe(
      true
    );
  });

  it("傳入 mobileBar 時取代預設列", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout
          footer="thanks"
          mobileBar={<div data-testid="custom-bar">自訂列</div>}
        >
          <p>頁面內容</p>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByTestId("custom-bar")).toBeInTheDocument();
    const callLinks = screen.queryAllByRole("link", { name: "打電話問問" });
    expect(callLinks.every((link) => link.closest(".fixed") === null)).toBe(
      true
    );
  });
});
