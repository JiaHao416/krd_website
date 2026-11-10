import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "./ProductCard";
import { formatPriceRange, PRICE_ON_REQUEST } from "../services/format";
import type { Product } from "../services/transform";

/** 建立測試用完整商品（預設有價） */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "商品一",
    brand: "品牌甲",
    model: "型號乙",
    category: "有線麥克風",
    description: null,
    imageUrl: "https://img.krd.com.tw/a.jpg",
    warrantyPeriodMonths: null,
    publishedAt: null,
    featuredGroup: null,
    priceMin: 120000,
    priceMax: 120000,
    inStock: true,
    priceText: formatPriceRange(120000, 120000),
    ...overrides,
  };
}

/** 建立無價商品 */
function makeNoPrice(overrides: Partial<Product> = {}): Product {
  return makeProduct({
    priceMin: null,
    priceMax: null,
    priceText: PRICE_ON_REQUEST,
    ...overrides,
  });
}

describe("ProductCard 價格顯示", () => {
  it("grid 有價：徽章與價格行各顯示一次 priceText，不出現價格洽詢", () => {
    const product = makeProduct();
    render(
      <ProductCard product={product} variant="grid" onImageClick={vi.fn()} />
    );
    expect(screen.getAllByText(product.priceText)).toHaveLength(2);
    expect(screen.queryByText(PRICE_ON_REQUEST)).not.toBeInTheDocument();
  });

  it("grid 區間價：價格行為 formatPriceRange 的輸出", () => {
    const product = makeProduct({
      priceMin: 120000,
      priceMax: 150000,
      priceText: formatPriceRange(120000, 150000),
    });
    render(
      <ProductCard product={product} variant="grid" onImageClick={vi.fn()} />
    );
    expect(
      screen.getAllByText(formatPriceRange(120000, 150000))
    ).toHaveLength(2);
  });

  it("grid 無價：顯示價格洽詢且沒有徽章", () => {
    const { container } = render(
      <ProductCard
        product={makeNoPrice()}
        variant="grid"
        onImageClick={vi.fn()}
      />
    );
    expect(screen.getAllByText(PRICE_ON_REQUEST)).toHaveLength(1);
    expect(container.querySelector(".product-badge")).toBeNull();
  });

  it("list 有價：只顯示一次 priceText 且沒有徽章", () => {
    const product = makeProduct();
    const { container } = render(
      <ProductCard product={product} variant="list" onImageClick={vi.fn()} />
    );
    expect(screen.getAllByText(product.priceText)).toHaveLength(1);
    expect(container.querySelector(".product-badge")).toBeNull();
  });

  it("list 無價：顯示價格洽詢", () => {
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="list"
        onImageClick={vi.fn()}
      />
    );
    expect(screen.getByText(PRICE_ON_REQUEST)).toBeInTheDocument();
  });

  it("價格洽詢使用灰色而非 accent 色", () => {
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="grid"
        onImageClick={vi.fn()}
      />
    );
    expect(screen.getByText(PRICE_ON_REQUEST)).toHaveClass("text-gray-500");
  });
});

describe("ProductCard 圖片與燈箱", () => {
  it("有圖：img src 為 imageUrl，點擊呼叫 onImageClick 一次", async () => {
    const onImageClick = vi.fn();
    const product = makeProduct();
    render(
      <ProductCard
        product={product}
        variant="grid"
        onImageClick={onImageClick}
      />
    );
    expect(screen.getByAltText(product.name)).toHaveAttribute(
      "src",
      product.imageUrl as string
    );
    await userEvent.setup().click(screen.getByRole("button", { name: /查看/ }));
    expect(onImageClick).toHaveBeenCalledTimes(1);
    expect(onImageClick).toHaveBeenCalledWith(product.imageUrl);
  });

  it("鍵盤 Enter 開燈箱", async () => {
    const onImageClick = vi.fn();
    render(
      <ProductCard
        product={makeProduct()}
        variant="grid"
        onImageClick={onImageClick}
      />
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: /查看/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onImageClick).toHaveBeenCalledTimes(1);
  });

  it("鍵盤 Space 開燈箱", async () => {
    const onImageClick = vi.fn();
    render(
      <ProductCard
        product={makeProduct()}
        variant="list"
        onImageClick={onImageClick}
      />
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(" ");
    expect(onImageClick).toHaveBeenCalledTimes(1);
  });

  it("缺圖：顯示佔位、無按鈕、無放大提示，點擊不開燈箱", async () => {
    const onImageClick = vi.fn();
    render(
      <ProductCard
        product={makeProduct({ imageUrl: null })}
        variant="grid"
        onImageClick={onImageClick}
      />
    );
    const placeholder = screen.getByRole("img", { name: "暫無圖片" });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("點擊查看大圖")).not.toBeInTheDocument();
    await userEvent.setup().click(placeholder);
    expect(onImageClick).not.toHaveBeenCalled();
  });

  it("破圖：onError 後顯示佔位且點擊不開燈箱", async () => {
    const onImageClick = vi.fn();
    const product = makeProduct();
    render(
      <ProductCard
        product={product}
        variant="grid"
        onImageClick={onImageClick}
      />
    );
    fireEvent.error(screen.getByAltText(product.name));
    const placeholder = screen.getByRole("img", { name: "暫無圖片" });
    await userEvent.setup().click(placeholder);
    expect(onImageClick).not.toHaveBeenCalled();
  });

  it("破圖後換成新圖片網址會重新顯示 img", () => {
    const product = makeProduct();
    const { rerender } = render(
      <ProductCard product={product} variant="grid" onImageClick={vi.fn()} />
    );
    fireEvent.error(screen.getByAltText(product.name));
    rerender(
      <ProductCard
        product={{ ...product, imageUrl: "https://img.krd.com.tw/b.jpg" }}
        variant="grid"
        onImageClick={vi.fn()}
      />
    );
    expect(screen.getByAltText(product.name)).toHaveAttribute(
      "src",
      "https://img.krd.com.tw/b.jpg"
    );
  });
});

describe("ProductCard 描述與其他欄位", () => {
  it("描述為 null 時不渲染描述段落", () => {
    const { container } = render(
      <ProductCard
        product={makeProduct({ description: null })}
        variant="grid"
        onImageClick={vi.fn()}
      />
    );
    expect(container.querySelector("p.line-clamp-2")).toBeNull();
  });

  it("有描述時顯示，且不顯示品牌、型號、現貨", () => {
    render(
      <ProductCard
        product={makeProduct({ description: "這是描述" })}
        variant="list"
        onImageClick={vi.fn()}
      />
    );
    expect(screen.getByText("這是描述")).toBeInTheDocument();
    expect(screen.queryByText("品牌甲")).not.toBeInTheDocument();
    expect(screen.queryByText("型號乙")).not.toBeInTheDocument();
    expect(screen.queryByText(/現貨/)).not.toBeInTheDocument();
  });
});
