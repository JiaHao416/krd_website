import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PriceBlock from "./PriceBlock";

describe("PriceBlock", () => {
  it("沒有標價時整個價格區塊不渲染", () => {
    const { container } = render(<PriceBlock priceText={null} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/這個商品沒有標價/)).not.toBeInTheDocument();
    expect(screen.queryByText("含稅")).not.toBeInTheDocument();
  });

  it("有標價時顯示價格與含稅，不顯示來電文案", () => {
    render(<PriceBlock priceText="NT$1,200" />);
    expect(screen.getByText("NT$1,200")).toBeInTheDocument();
    expect(screen.getByText("含稅")).toBeInTheDocument();
    expect(screen.queryByText("價格請來電")).not.toBeInTheDocument();
  });

  it("任何情況都不出現 NaN", () => {
    const { container, rerender } = render(<PriceBlock priceText={null} />);
    expect(container.textContent).not.toContain("NaN");
    rerender(<PriceBlock priceText="NT$1,200" />);
    expect(container.textContent).not.toContain("NaN");
  });
});
