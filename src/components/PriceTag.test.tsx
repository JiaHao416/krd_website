import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PriceTag from "./PriceTag";

describe("PriceTag", () => {
  it("最低與最高價皆為 null 時不渲染任何元素", () => {
    const { container } = render(
      <PriceTag product={{ priceMin: null, priceMax: null, priceText: "價格洽詢" }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("有最低價時顯示 priceText", () => {
    render(<PriceTag product={{ priceMin: 1200, priceMax: null, priceText: "NT$ 1,200" }} />);
    expect([screen.queryByText("NT$ 1,200") !== null, screen.queryByText("價格請來電")]).toEqual([
      true,
      null,
    ]);
  });

  it("只有最高價時也顯示 priceText", () => {
    render(<PriceTag product={{ priceMin: null, priceMax: 3000, priceText: "NT$ 3,000" }} />);
    expect(screen.getByText("NT$ 3,000")).toBeInTheDocument();
  });
});
