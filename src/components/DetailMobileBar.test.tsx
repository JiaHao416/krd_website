import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailMobileBar from "./DetailMobileBar";
import { CONTACT } from "../config/contact";

describe("DetailMobileBar", () => {
  it("顯示複製詢價按鈕與撥號連結", () => {
    render(<DetailMobileBar status="idle" onCopy={vi.fn()} />);
    expect(screen.getByRole("button", { name: "複製詢價" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "打電話問問" })).toHaveAttribute(
      "href",
      `tel:${CONTACT.phoneHref}`
    );
  });

  it("點擊複製詢價呼叫 onCopy 一次", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<DetailMobileBar status="idle" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "複製詢價" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("複製成功時按鈕顯示已複製", () => {
    render(<DetailMobileBar status="copied" onCopy={vi.fn()} />);
    expect(screen.getByRole("button", { name: "已複製" })).toBeInTheDocument();
  });

  it("複製失敗時提示顯示在固定列內", () => {
    render(<DetailMobileBar status="failed" onCopy={vi.fn()} />);
    expect(
      within(screen.getByTestId("detail-mobile-bar")).getByText("複製失敗，請手動選取網址")
    ).toBeInTheDocument();
  });

  it("只在 base 固定於底部，雙欄比例 2:3", () => {
    render(<DetailMobileBar status="idle" onCopy={vi.fn()} />);
    expect(screen.getByTestId("detail-mobile-bar")).toHaveClass(
      "fixed",
      "bottom-0",
      "md:hidden",
      "shadow-float",
      "grid-cols-[2fr_3fr]"
    );
  });

  it("根元素為 polite 即時區域", () => {
    render(<DetailMobileBar status="idle" onCopy={vi.fn()} />);
    expect(screen.getByTestId("detail-mobile-bar")).toHaveAttribute("aria-live", "polite");
  });
});
