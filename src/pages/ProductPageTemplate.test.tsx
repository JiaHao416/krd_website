import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import ProductPageTemplate from "./ProductPageTemplate";
import { fetchProducts } from "../services/products";
import type { ProductListResult } from "../services/products";
import type { Product } from "../services/transform";
import type { ProductPageQuery } from "../services/catalog";
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
function makeResult(items: Product[], truncated = false): ProductListResult {
  return { items, total: items.length, truncated };
}

/** 渲染商品頁（分類 chip 列需要 Router）；initialPath 決定目前頁 chip */
function renderPage(
  query: ProductPageQuery = {},
  initialPath = "/all-products"
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ProductPageTemplate
        title="測試分類"
        description="測試描述"
        query={query}
      />
    </MemoryRouter>
  );
}

/** 詳情頁探針：顯示路由參數，用來斷言導向路徑 */
const DetailProbe = () => {
  const { id } = useParams();
  return <p>詳情頁 {id}</p>;
};

/** 以分類頁＋詳情探針路由渲染，可斷言點卡片後的路徑 */
function renderPageWithDetailRoute(initialPath = "/all-products") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/all-products"
          element={<ProductPageTemplate title="測試分類" query={{}} />}
        />
        <Route path="/products/:id" element={<DetailProbe />} />
      </Routes>
    </MemoryRouter>
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

  it("點有圖卡片導向 /products/{id}，不出現 dialog", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          id: "a",
          name: "甲商品",
          imageUrl: "https://img.krd.com.tw/x.jpg",
        }),
      ])
    );
    renderPageWithDetailRoute();
    await user.click(await screen.findByText("甲商品"));
    expect(await screen.findByText("詳情頁 a")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("缺圖商品顯示「暫無圖片」佔位圖，點擊導向 /products/{id} 且不出現 dialog", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([makeProduct({ id: "n", name: "無圖商品", imageUrl: null })])
    );
    renderPageWithDetailRoute();
    const placeholder = await screen.findByRole("img", { name: "暫無圖片" });
    await user.click(placeholder);
    expect(await screen.findByText("詳情頁 n")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
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

describe("ProductPageTemplate 錯誤、空、淡化與截斷狀態", () => {
  it("rate_limited 顯示錯誤卡片與友善文案，不洩漏後端原文", async () => {
    mockFetch.mockRejectedValue(
      new ApiError("rate_limited", "後端原始訊息XYZ", 429)
    );
    renderPage();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("無法載入商品");
    expect(alert).toHaveTextContent("瀏覽太頻繁，請稍候一分鐘再重試");
    expect(screen.queryByText(/後端原始訊息XYZ/)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: "測試分類" })
    ).toBeInTheDocument();
  });

  it("點「重新載入」會再呼叫一次 API", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockRejectedValueOnce(new ApiError("network", "x"))
      .mockResolvedValueOnce(makeResult([]));
    renderPage();
    await user.click(await screen.findByRole("button", { name: "重新載入" }));
    expect(await screen.findByText("這裡還沒有商品")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("查詢成功但沒有商品顯示空狀態，不出現「請稍後再試」", async () => {
    mockFetch.mockResolvedValue(makeResult([]));
    renderPage();
    expect(await screen.findByText("這裡還沒有商品")).toBeInTheDocument();
    expect(
      screen.getByText(
        "這個分類暫時沒東西，過幾天再來看看，或直接打電話問我們。"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/請稍後再試/)).toBeNull();
  });

  it("切換排序時保留舊列表並淡化，不顯示整頁 spinner", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(makeResult([makeProduct({ name: "舊商品" })]))
      .mockReturnValueOnce(new Promise(() => {}));
    const { container } = renderPage();
    await screen.findByText("舊商品");
    await user.selectOptions(screen.getByRole("combobox"), "newest");
    expect(screen.getByText("舊商品")).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.queryByText("正在載入產品資訊...")).toBeNull();
  });

  it("切換排序後失敗顯示錯誤卡片", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(makeResult([makeProduct()]))
      .mockRejectedValueOnce(new ApiError("http", "boom", 500));
    renderPage();
    await screen.findByText("商品一");
    await user.selectOptions(screen.getByRole("combobox"), "newest");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("truncated 為 true 時顯示截斷提示，false 時不顯示", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()], true));
    const { unmount } = renderPage();
    expect(await screen.findByText("僅顯示前 100 項商品")).toBeInTheDocument();
    unmount();
    mockFetch.mockResolvedValue(makeResult([makeProduct()], false));
    renderPage();
    await screen.findByText("商品一");
    expect(screen.queryByText("僅顯示前 100 項商品")).toBeNull();
  });

  it("network 錯誤顯示連線文案", async () => {
    mockFetch.mockRejectedValue(new ApiError("network", "x"));
    renderPage();
    expect(
      await screen.findByText("無法連線，請檢查網路後重試")
    ).toBeInTheDocument();
  });
});

describe("ProductPageTemplate 價格、檢視切換與鍵盤", () => {
  it("同時顯示有價商品的 priceText 與無價商品的「價格請來電」", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          id: "a",
          name: "有價商品",
          priceMin: 120000,
          priceMax: 120000,
          priceText: "NT$1,200",
        }),
        makeProduct({ id: "b", name: "無價商品", priceText: "價格洽詢" }),
      ])
    );
    renderPage();
    await screen.findByText("有價商品");
    expect(screen.getAllByText("NT$1,200").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("價格請來電")).toBeInTheDocument();
  });

  it("切換列表檢視後 aria-pressed 更新，且仍顯示價格行", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          priceMin: 120000,
          priceMax: 120000,
          priceText: "NT$1,200",
        }),
      ])
    );
    renderPage();
    await screen.findByText("商品一");
    const gridButton = screen.getByRole("button", { name: "格狀檢視" });
    const listButton = screen.getByRole("button", { name: "列表檢視" });
    expect(gridButton).toHaveAttribute("aria-pressed", "true");
    await user.click(listButton);
    expect(listButton).toHaveAttribute("aria-pressed", "true");
    expect(gridButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("NT$1,200")).toBeInTheDocument();
  });

  it("有圖卡片以 Enter 導向 /products/{id}", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({
          id: "a",
          name: "甲商品",
          imageUrl: "https://img.krd.com.tw/x.jpg",
        }),
      ])
    );
    renderPageWithDetailRoute();
    const card = await screen.findByRole("link", { name: /甲商品/ });
    card.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("詳情頁 a")).toBeInTheDocument();
  });
});

describe("ProductPageTemplate 改版版面", () => {
  it("h1 下方副行顯示共 N 項", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({ id: "a", name: "甲商品" }),
        makeProduct({ id: "b", name: "乙商品" }),
      ])
    );
    renderPage();
    expect(
      await screen.findByText("共 2 項。看到喜歡的，直接打電話問最快。")
    ).toBeInTheDocument();
  });

  // 截斷時 items.length 只是上限，不是實際總數；不顯示「共 N 項」以免與截斷提示矛盾
  it("truncated 為 true 時副行不顯示共 N 項，只留 UI-SPEC 後半句", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()], true));
    renderPage();
    expect(
      await screen.findByText("看到喜歡的，直接打電話問最快。")
    ).toBeInTheDocument();
    expect(screen.queryByText(/共 \d+ 項/)).toBeNull();
  });

  it("結尾「找不到想要的？」含電話連結", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()]));
    renderPage();
    expect(
      await screen.findByRole("heading", { name: "找不到想要的？" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "(04) 2279-8787" })
    ).toHaveAttribute("href", "tel:04-22798787");
  });

  it("chip 列存在且目前頁 chip 有 aria-current", async () => {
    mockFetch.mockResolvedValue(makeResult([makeProduct()]));
    renderPage({}, "/trumpet");
    await screen.findByText("商品一");
    const nav = screen.getByRole("navigation", { name: "商品分類" });
    expect(
      within(nav).getByRole("link", { name: "擴大機 / 喇叭" })
    ).toHaveAttribute("aria-current", "page");
  });

  it("載入中顯示 8 張 aria-hidden 的 skeleton", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = screen.getAllByTestId("product-card-skeleton");
    expect(skeletons).toHaveLength(8);
    expect(
      skeletons.every((el) => el.getAttribute("aria-hidden") === "true")
    ).toBe(true);
  });
});

describe("ProductPageTemplate 連到詳情頁", () => {
  it("列表檢視點卡片導向 /products/{id}，不出現 dialog", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({ id: "a", name: "甲商品" }),
        makeProduct({ id: "b", name: "乙商品" }),
      ])
    );
    renderPageWithDetailRoute();
    await screen.findByText("甲商品");
    await user.click(screen.getByRole("button", { name: "列表檢視" }));
    await user.click(screen.getByText("乙商品"));
    expect(await screen.findByText("詳情頁 b")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("每張卡的連結 href 對應各自的 id", async () => {
    mockFetch.mockResolvedValue(
      makeResult([
        makeProduct({ id: "a", name: "甲商品" }),
        makeProduct({ id: "b", name: "乙商品" }),
      ])
    );
    renderPage();
    await screen.findByText("甲商品");
    const links = screen.getAllByRole("link", { name: /甲商品|乙商品/ });
    expect(links.map((el) => el.getAttribute("href"))).toEqual([
      "/products/a",
      "/products/b",
    ]);
  });
});
