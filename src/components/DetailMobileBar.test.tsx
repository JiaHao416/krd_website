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

describe("DetailMobileBar 預留高度", () => {
  it("顯示失敗訊息時在文件流加一段補高，讓頁尾能捲出固定列", () => {
    render(<DetailMobileBar status="failed" onCopy={vi.fn()} />);
    const spacer = screen.getByTestId("detail-mobile-bar-spacer");
    // 失敗訊息一行（15px × 1.6）加間距 8px 約 32px，補高 40px 留餘裕
    expect(spacer).toHaveClass("h-10", "md:hidden");
    expect(spacer).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("detail-mobile-bar")).not.toContainElement(spacer);
  });

  it.each(["idle", "copied"] as const)("狀態為 %s 時不加補高", (status) => {
    render(<DetailMobileBar status={status} onCopy={vi.fn()} />);
    expect(screen.queryByTestId("detail-mobile-bar-spacer")).toBeNull();
  });
});
