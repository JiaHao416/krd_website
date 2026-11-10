import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import { fetchProducts } from "../services/products";
import type { ProductListResult } from "../services/products";
import type { Product } from "../services/transform";
import { buildProductParams } from "../services/catalog";

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
function makeResult(items: Product[]): ProductListResult {
  return { items, total: items.length, truncated: false };
}

/** 渲染首頁 */
function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

/** 以標題文字找到該組輪播所在的區塊 */
function getSection(title: string): HTMLElement {
  const section = screen.getByText(title).closest("div.space-y-8");
  if (!section) throw new Error(`找不到區塊：${title}`);
  return section as HTMLElement;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("HomePage 熱銷輪播資料來源", () => {
  it("分別以 featured=1 與 featured=2 呼叫 fetchProducts", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()]));
    renderPage();
    await screen.findAllByText("商品一");
    const firstArgs = mockFetch.mock.calls.map((call) => call[0]);
    expect(firstArgs).toContainEqual(buildProductParams({ featured: 1 }));
    expect(firstArgs).toContainEqual(buildProductParams({ featured: 2 }));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("兩組區塊各自顯示對應 featured 的商品", async () => {
    mockFetch.mockImplementation(async (params) =>
      params.featured === "1"
        ? makeResult([makeProduct({ id: "a", name: "熱銷一號" })])
        : makeResult([makeProduct({ id: "b", name: "熱銷二號" })])
    );
    renderPage();
    const hot = getSection("熱門推薦系列");
    const top = getSection("頂級精選系列");
    expect(await within(hot).findByText("熱銷一號")).toBeInTheDocument();
    expect(await within(top).findByText("熱銷二號")).toBeInTheDocument();
    expect(within(hot).queryByText("熱銷二號")).toBeNull();
  });

  it("首頁不顯示價格與價格洽詢", async () => {
    mockFetch.mockResolvedValue(
      makeResult([makeProduct({ priceMin: 100, priceText: "NT$ 9,999" })])
    );
    renderPage();
    await screen.findAllByText("商品一");
    expect(screen.queryByText(/9,999/)).toBeNull();
    expect(screen.queryByText("價格洽詢")).toBeNull();
  });

  it("沒有圖片的熱銷商品顯示暫無圖片佔位", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct({ imageUrl: null })]));
    renderPage();
    const placeholders = await screen.findAllByRole("img", {
      name: "暫無圖片",
    });
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
