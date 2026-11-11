import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import HomePage from "./HomePage";
import { fetchProducts } from "../services/products";
import type { ProductListResult } from "../services/products";
import type { Product } from "../services/transform";
import { buildProductParams } from "../services/catalog";
import { ApiError } from "../services/errors";

// 以假元件取代 Layout，專注測頁面本身
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

/** 以 role=group 的名稱找到該組輪播所在的區塊 */
function getSection(name: string): HTMLElement {
  return screen.getByRole("group", { name });
}

/** 詳情頁探針：顯示路由參數，用來斷言導向路徑 */
const DetailProbe = () => {
  const { id } = useParams();
  return <p>詳情頁 {id}</p>;
};

/** 以首頁＋詳情探針路由渲染，可斷言點便條卡後的路徑 */
function renderPageWithDetailRoute() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<DetailProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

/** 兩組熱銷各回一筆：featured=1 為熱銷一號（a）、featured=2 為熱銷二號（b） */
function mockTwoGroups() {
  mockFetch.mockImplementation(async (params) =>
    params.featured === "1"
      ? makeResult([makeProduct({ id: "a", name: "熱銷一號" })])
      : makeResult([makeProduct({ id: "b", name: "熱銷二號" })])
  );
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

  it("便條卡有價顯示 priceText、無價不顯示價格請來電，且不出現價格洽詢", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({ id: "a", priceMin: 100, priceText: "NT$ 9,999" }),
        makeProduct({ id: "b", name: "無價商品" }),
      ])
    );
    renderPage();
    await screen.findAllByText("商品一");
    expect(screen.getAllByText("NT$ 9,999").length).toBeGreaterThan(0);
    expect(screen.queryByText("價格請來電")).toBeNull();
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

describe("HomePage 兩組輪播互相獨立", () => {
  it("一組失敗時另一組仍顯示商品", async () => {
    mockFetch.mockImplementation(async (params) => {
      if (params.featured === "1") {
        throw new ApiError("http", "後端內部錯誤", 500);
      }
      return makeResult([makeProduct({ name: "頂級商品" })]);
    });
    renderPage();
    const hot = getSection("熱門推薦系列");
    const top = getSection("頂級精選系列");
    expect(await within(hot).findByRole("alert")).toBeInTheDocument();
    expect(await within(top).findByText("頂級商品")).toBeInTheDocument();
    expect(within(top).queryByRole("alert")).toBeNull();
  });

  it("兩組同時 429 時各自在自己的區塊顯示錯誤", async () => {
    mockFetch.mockRejectedValue(new ApiError("rate_limited", "太快", 429));
    renderPage();
    const hot = getSection("熱門推薦系列");
    const top = getSection("頂級精選系列");
    expect(await within(hot).findByRole("alert")).toBeInTheDocument();
    expect(await within(top).findByRole("alert")).toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("兩組都沒有商品時各自顯示空狀態", async () => {
    mockFetch.mockResolvedValue(makeResult([]));
    renderPage();
    expect(await screen.findAllByText("目前沒有精選商品")).toHaveLength(2);
    expect(
      screen.getByRole("group", { name: "熱門推薦系列" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "頂級精選系列" })
    ).toBeInTheDocument();
  });
});

describe("HomePage 版面", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(makeResult([]));
  });

  it("h1 含來問我們就對了", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    expect(
      screen.getByRole("heading", { level: 1, name: /來問我們就對了/ })
    ).toBeInTheDocument();
  });

  it("逛逛商品連到 /all-products", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    expect(screen.getByRole("link", { name: /逛逛商品/ })).toHaveAttribute(
      "href",
      "/all-products"
    );
  });

  it("hero 電話連結 href 為 tel:04-22798787", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    const hero = screen.getByRole("region", { name: /來問我們就對了/ });
    expect(
      within(hero).getByRole("link", { name: "(04) 2279-8787" })
    ).toHaveAttribute("href", "tel:04-22798787");
  });

  it("4 張分類貼紙卡 href 依序為 /wired-micphone、/wireless-micphone、/trumpet、/accessories", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    const categories = screen.getByRole("region", { name: "想找什麼？" });
    const hrefs = within(categories)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "/wired-micphone",
      "/wireless-micphone",
      "/trumpet",
      "/accessories",
    ]);
  });

  it("店面照片預留位 role=img 名稱為店面照片（待提供）", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    expect(
      screen.getByRole("img", { name: "店面照片（待提供）" })
    ).toBeInTheDocument();
  });

  it("聯絡區顯示 3 張店面照片與 Google 地圖", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    for (const alt of ["店面外觀", "正門與招牌", "門口屏風"]) {
      expect(screen.getByAltText(alt)).toBeInTheDocument();
    }
    expect(screen.getByTitle("羽程企業社 Google 地圖").tagName).toBe("IFRAME");
  });

  it("熱銷 h2 為這陣子大家都在問", async () => {
    renderPage();
    await screen.findAllByText("目前沒有精選商品");
    expect(
      screen.getByRole("heading", { level: 2, name: "這陣子大家都在問" })
    ).toBeInTheDocument();
  });
});

describe("HomePage 便條卡連到詳情頁", () => {
  it("兩組便條卡各自連到對應商品的 /products/{id}", async () => {
    mockTwoGroups();
    renderPage();
    const hot = getSection("熱門推薦系列");
    const top = getSection("頂級精選系列");
    expect(
      await within(hot).findByRole("link", { name: "查看 熱銷一號 詳情" })
    ).toHaveAttribute("href", "/products/a");
    expect(
      await within(top).findByRole("link", { name: "查看 熱銷二號 詳情" })
    ).toHaveAttribute("href", "/products/b");
    expect(
      within(hot).queryByRole("link", { name: "查看 熱銷二號 詳情" })
    ).toBeNull();
  });

  it("點便條卡導向詳情頁", async () => {
    const user = userEvent.setup();
    mockTwoGroups();
    renderPageWithDetailRoute();
    await user.click(
      await screen.findByRole("link", { name: "查看 熱銷一號 詳情" })
    );
    expect(await screen.findByText("詳情頁 a")).toBeInTheDocument();
  });
});
