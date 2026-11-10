import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductPageTemplate from "./ProductPageTemplate";
import { fetchProducts } from "../services/products";
import type { ProductListResult } from "../services/products";
import type { Product } from "../services/transform";
import type { ProductPageQuery } from "../services/catalog";

// Layout 內的 NavBar／SideMenu 仍會呼叫 Airtable，測試一律以假元件取代
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../services/products");

const mockFetch = vi.mocked(fetchProducts);

/** 建立測試用完整商品 */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "商品一",
    brand: null,
    model: null,
    category: "有線麥克風",
    description: null,
    imageUrl: "https://img.krd.com.tw/a.jpg",
    warrantyPeriodMonths: null,
    publishedAt: null,
    featuredGroup: null,
    priceMin: null,
    priceMax: null,
    inStock: true,
    priceText: "",
    ...overrides,
  };
}

/** 建立成功結果 */
function makeResult(items: Product[], truncated = false): ProductListResult {
  return { items, total: items.length, truncated };
}

/** 渲染商品頁 */
function renderPage(query: ProductPageQuery = {}) {
  return render(
    <ProductPageTemplate
      title="測試分類"
      description="測試描述"
      query={query}
    />
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ProductPageTemplate 基本載入與卡片", () => {
  it("請求進行中顯示「正在載入產品資訊...」", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("正在載入產品資訊...")).toBeInTheDocument();
  });

  it("顯示兩筆商品名稱", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({ id: "a", name: "甲商品" }),
        makeProduct({ id: "b", name: "乙商品" }),
      ])
    );
    renderPage();
    expect(await screen.findByText("甲商品")).toBeInTheDocument();
    expect(screen.getByText("乙商品")).toBeInTheDocument();
  });

  it("有圖商品的 img alt 為商品名稱、src 為 imageUrl", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          name: "甲商品",
          imageUrl: "https://img.krd.com.tw/x.jpg",
        }),
      ])
    );
    renderPage();
    const img = await screen.findByRole("img", { name: "甲商品" });
    expect(img).toHaveAttribute("src", "https://img.krd.com.tw/x.jpg");
  });

  it("點有圖卡片會開燈箱顯示該圖", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          name: "甲商品",
          imageUrl: "https://img.krd.com.tw/x.jpg",
        }),
      ])
    );
    renderPage();
    await user.click(await screen.findByText("甲商品"));
    const imgs = screen
      .getAllByRole("img")
      .filter(
        (el) => el.getAttribute("src") === "https://img.krd.com.tw/x.jpg"
      );
    // 卡片一張、燈箱一張
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });

  it("缺圖商品顯示「暫無圖片」佔位圖，點擊不開燈箱", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([makeProduct({ name: "無圖商品", imageUrl: null })])
    );
    renderPage();
    const placeholder = await screen.findByRole("img", { name: "暫無圖片" });
    await user.click(placeholder);
    // 燈箱未開：頁面上仍只有佔位圖，沒有任何帶 src 的圖片
    expect(
      screen.getAllByRole("img").every((el) => !el.getAttribute("src"))
    ).toBe(true);
  });
});

describe("ProductPageTemplate 排序", () => {
  it("query 鎖定 newest 時不顯示排序下拉", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()]));
    renderPage({ sort: "newest" });
    await screen.findByText("商品一");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("一般頁面選「最新優先」會以 sort=newest 重新呼叫後端", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(makeResult([makeProduct()]));
    renderPage();
    await screen.findByText("商品一");
    await user.selectOptions(screen.getByRole("combobox"), "newest");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toMatchObject({ sort: "newest" });
  });
});
