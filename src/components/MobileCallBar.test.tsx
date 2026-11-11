import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MobileCallBar from "./MobileCallBar";
import { CONTACT } from "../config/contact";

describe("MobileCallBar", () => {
  it("顯示打電話問問連結，只在 base 固定於底部", () => {
    render(<MobileCallBar />);
    const link = screen.getByRole("link", { name: "打電話問問" });
    expect(link).toHaveAttribute("href", "tel:04-22798787");
    expect(link.parentElement).toHaveClass("md:hidden");
    expect(link.parentElement).toHaveClass("fixed");
  });

  it("使用注入的電話組成 tel 連結", () => {
    render(<MobileCallBar info={{ ...CONTACT, phoneHref: "02-12345678" }} />);
    expect(
      screen.getByRole("link", { name: "打電話問問" })
    ).toHaveAttribute("href", "tel:02-12345678");
  });
});
