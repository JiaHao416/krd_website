import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundState from "./NotFoundState";

/** 以 MemoryRouter 包住 NotFoundState（主按鈕為 Link） */
const renderState = () =>
  render(
    <MemoryRouter>
      <NotFoundState
        title="測試標題"
        description="測試說明文字"
        actionLabel="前往測試頁"
        actionTo="/test-target"
      />
    </MemoryRouter>
  );

describe("NotFoundState", () => {
  it("以傳入標題渲染 h1", () => {
    renderState();
    expect(
      screen.getByRole("heading", { level: 1, name: "測試標題" })
    ).toBeInTheDocument();
  });

  it("顯示傳入的說明文字", () => {
    renderState();
    expect(screen.getByText("測試說明文字")).toBeInTheDocument();
  });

  it("主按鈕為連到 actionTo 的連結", () => {
    renderState();
    expect(screen.getByRole("link", { name: "前往測試頁" })).toHaveAttribute(
      "href",
      "/test-target"
    );
  });
});
