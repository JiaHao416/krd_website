import type { ReactElement } from "react";
import { describe, it, expect } from "vitest";
import {
  render as rtlRender,
  screen,
  fireEvent,
} from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { formatPriceRange, PRICE_ON_REQUEST } from "../services/format";
import type { Product } from "../services/transform";

/** 卡片含 Link，需包在 Router 內；rerender 也沿用同一 wrapper */
function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { wrapper: MemoryRouter, ...options });
}

/** 詳情頁探針：顯示路由參數，用來斷言導向路徑 */
const DetailProbe = () => {
  const { id } = useParams();
  return <p>詳情頁 {id}</p>;
};

/** 以首頁＋詳情探針路由渲染卡片，可斷言點擊後的路徑 */
function renderWithDetailRoute(ui: ReactElement) {
  return rtlRender(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/products/:id" element={<DetailProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

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
  it("grid 有價：priceText 只顯示一次，不出現價格洽詢", () => {
    const product = makeProduct();
    render(
      <ProductCard product={product} variant="grid" />
    );
    expect(screen.getAllByText(product.priceText)).toHaveLength(1);
    expect(screen.queryByText(PRICE_ON_REQUEST)).not.toBeInTheDocument();
  });

  it("grid 區間價：價格行為 formatPriceRange 的輸出", () => {
    const product = makeProduct({
      priceMin: 120000,
      priceMax: 150000,
      priceText: formatPriceRange(120000, 150000),
    });
    render(
      <ProductCard product={product} variant="grid" />
    );
    expect(screen.getAllByText(formatPriceRange(120000, 150000))).toHaveLength(
      1
    );
  });

  it("只有 priceMax 有值時 grid 仍顯示價格文字", () => {
    const product = makeProduct({
      priceMin: null,
      priceMax: 150000,
      priceText: formatPriceRange(null, 150000),
    });
    render(<ProductCard product={product} variant="grid" />);
    expect(screen.getAllByText("NT$1,500")).toHaveLength(1);
  });

  it("grid 無價：顯示價格請來電，不出現價格洽詢", () => {
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="grid"
      />
    );
    expect(screen.getByText("價格請來電")).toBeInTheDocument();
    expect(screen.queryByText(PRICE_ON_REQUEST)).toBeNull();
  });

  it("list 有價：只顯示一次 priceText 且沒有徽章", () => {
    const product = makeProduct();
    const { container } = render(
      <ProductCard product={product} variant="list" />
    );
    expect(screen.getAllByText(product.priceText)).toHaveLength(1);
    expect(container.querySelector(".product-badge")).toBeNull();
  });

  it("list 無價：顯示價格請來電", () => {
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="list"
      />
    );
    expect(screen.getByText("價格請來電")).toBeInTheDocument();
  });

  it("價格請來電 tag 使用 block-2 底而非 accent", () => {
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="grid"
      />
    );
    const tag = screen.getByText("價格請來電");
    expect(tag).toHaveClass("bg-block-2");
    expect(tag).not.toHaveClass("bg-accent");
  });

  it("無價判斷看 priceMin/priceMax 皆 null（priceText 不是 PRICE_ON_REQUEST 也一樣）", () => {
    render(
      <ProductCard
        product={makeNoPrice({ priceText: "" })}
        variant="grid"
      />
    );
    expect(screen.getByText("價格請來電")).toBeInTheDocument();
  });
});

describe("ProductCard 圖片與連結", () => {
  it("有圖：img src 為 imageUrl，整張卡為 href=/products/p1 的連結", () => {
    const product = makeProduct();
    render(<ProductCard product={product} variant="grid" />);
    expect(screen.getByAltText(product.name)).toHaveAttribute(
      "src",
      product.imageUrl as string
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/p1");
  });

  it("鍵盤 Tab 聚焦卡片連結，Enter 導向 /products/p1", async () => {
    renderWithDetailRoute(<ProductCard product={makeProduct()} variant="grid" />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("詳情頁 p1")).toBeInTheDocument();
  });

  it("list：卡片為單一連結，沒有 role=button", () => {
    render(<ProductCard product={makeProduct()} variant="list" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/products/p1");
  });

  it("缺圖：顯示佔位、無 button、無放大提示，卡仍為連到 /products/p1 的連結", () => {
    render(
      <ProductCard product={makeProduct({ imageUrl: null })} variant="grid" />
    );
    expect(screen.getByRole("img", { name: "暫無圖片" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("點擊查看大圖")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/p1");
  });

  it("破圖：onError 後顯示佔位，卡仍為連到 /products/p1 的連結", () => {
    const product = makeProduct();
    render(<ProductCard product={product} variant="grid" />);
    fireEvent.error(screen.getByAltText(product.name));
    expect(screen.getByRole("img", { name: "暫無圖片" })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/p1");
  });

  it("grid 與 list 卡內只有一個互動元素：根連結", () => {
    const { unmount } = render(
      <ProductCard product={makeProduct()} variant="grid" />
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    unmount();
    render(<ProductCard product={makeProduct()} variant="list" />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("accessible name 由卡內文字組成：含商品名稱與價格文字，不含大圖", () => {
    render(<ProductCard product={makeProduct()} variant="grid" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(/商品一/);
    expect(link).toHaveAccessibleName(/NT\$1,200/);
    expect(link).not.toHaveAccessibleName(/大圖/);
    expect(
      screen.getByRole("heading", { level: 3, name: "商品一" })
    ).toBeInTheDocument();
  });

  it("破圖後換成新圖片網址會重新顯示 img", () => {
    const product = makeProduct();
    const { rerender } = render(
      <ProductCard product={product} variant="grid" />
    );
    fireEvent.error(screen.getByAltText(product.name));
    rerender(
      <ProductCard
        product={{ ...product, imageUrl: "https://img.krd.com.tw/b.jpg" }}
        variant="grid"
      />
    );
    expect(screen.getByAltText(product.name)).toHaveAttribute(
      "src",
      "https://img.krd.com.tw/b.jpg"
    );
  });
});

describe("ProductCard 描述與其他欄位", () => {
  it("描述為 null 時（grid 與 list）都不渲染描述段落", () => {
    const { unmount } = render(
      <ProductCard
        product={makeProduct({ description: null })}
        variant="grid"
      />
    );
    expect(screen.queryByTestId("product-description")).toBeNull();
    unmount();
    render(
      <ProductCard
        product={makeProduct({ description: null })}
        variant="list"
      />
    );
    expect(screen.queryByTestId("product-description")).toBeNull();
  });

  it("grid 不渲染說明段落", () => {
    render(
      <ProductCard
        product={makeProduct({ description: "這是描述" })}
        variant="grid"
      />
    );
    expect(screen.queryByTestId("product-description")).toBeNull();
    expect(screen.queryByText("這是描述")).toBeNull();
  });

  it("list 描述維持兩行（line-clamp-2）", () => {
    render(
      <ProductCard
        product={makeProduct({ description: "這是描述" })}
        variant="list"
      />
    );
    const description = screen.getByTestId("product-description");
    expect(description).toHaveClass("line-clamp-2");
    expect(description).not.toHaveClass("line-clamp-1");
  });

  it("grid 卡內距 p-2 md:p-4", () => {
    render(
      <ProductCard
        product={makeProduct()}
        variant="grid"
      />
    );
    expect(screen.getByRole("link")).toHaveClass("p-2", "md:p-4");
  });

  it("價格行位於標籤列（flex-wrap gap-2）：有價", () => {
    const product = makeProduct();
    const { unmount } = render(
      <ProductCard product={product} variant="grid" />
    );
    expect(screen.getByText(product.priceText).parentElement).toHaveClass(
      "flex-wrap",
      "gap-2"
    );
    unmount();
    render(
      <ProductCard product={product} variant="list" />
    );
    expect(screen.getByText(product.priceText).parentElement).toHaveClass(
      "flex-wrap",
      "gap-2"
    );
  });

  it("價格行位於標籤列（flex-wrap gap-2）：無價", () => {
    const { unmount } = render(
      <ProductCard
        product={makeNoPrice()}
        variant="grid"
      />
    );
    expect(screen.getByText("價格請來電").parentElement).toHaveClass(
      "flex-wrap",
      "gap-2"
    );
    unmount();
    render(
      <ProductCard
        product={makeNoPrice()}
        variant="list"
      />
    );
    expect(screen.getByText("價格請來電").parentElement).toHaveClass(
      "flex-wrap",
      "gap-2"
    );
  });

  it("圖片容器為 aspect-square 白底、名稱 line-clamp-2、無『點擊查看大圖』", () => {
    const product = makeProduct({
      name: "這是一個非常非常長的商品名稱需要佔滿兩行甚至更多行的空間來測試",
      description: "這是很長的描述".repeat(20),
    });
    const { container } = render(
      <ProductCard product={product} variant="grid" />
    );
    expect(screen.getByAltText(product.name).parentElement).toHaveClass(
      "aspect-square",
      "bg-white"
    );
    expect(container.querySelector("h3")).toHaveClass("line-clamp-2");
    expect(screen.queryByText("點擊查看大圖")).toBeNull();
  });

  it("有描述時顯示說明與品牌，不顯示型號；現貨商品不顯示洽詢交期", () => {
    render(
      <ProductCard
        product={makeProduct({ description: "這是描述" })}
        variant="list"
      />
    );
    expect(screen.getByTestId("product-description")).toHaveTextContent(
      "這是描述"
    );
    expect(screen.getByText("品牌甲")).toBeInTheDocument();
    expect(screen.queryByText("型號乙")).toBeNull();
    expect(screen.queryByText("洽詢交期")).toBeNull();
  });

  it("inStock=false 時 grid 顯示洽詢交期", () => {
    render(
      <ProductCard
        product={makeProduct({ inStock: false })}
        variant="grid"
      />
    );
    expect(screen.getByText("洽詢交期")).toHaveClass("bg-block-3");
  });

  it("list 也顯示洽詢交期", () => {
    render(
      <ProductCard
        product={makeProduct({ inStock: false })}
        variant="list"
      />
    );
    expect(screen.getByText("洽詢交期")).toBeInTheDocument();
  });

  it("img 有 loading=lazy 與 decoding=async", () => {
    const product = makeProduct();
    render(
      <ProductCard product={product} variant="grid" />
    );
    const img = screen.getByAltText(product.name);
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
  });
});
