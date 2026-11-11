import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import App from "./App";
import { fetchProducts } from "./services/products";
import { fetchProductDetail } from "./services/productDetail";
import type { ProductDetail } from "./services/transform";
import { PRODUCT_PAGES, buildProductParams } from "./services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./config/productPageViews";

// 以假元件取代 Layout，專注測商品路由
vi.mock("./components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("./services/products");
// partial mock：只替換 fetchProductDetail，UUID 判斷等用真實實作
vi.mock("./services/productDetail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./services/productDetail")>()),
  fetchProductDetail: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProducts);
const mockDetail = vi.mocked(fetchProductDetail);

const DETAIL_ID = "00000000-0000-4000-8000-000000000001";

/** 詳情路由測試用商品 */
const DETAIL: ProductDetail = {
  id: DETAIL_ID,
  name: "UHF 雙頻無線手持麥克風組",
  brand: "MICGO",
  model: "MG-U200",
  category: "無線麥克風",
  description: null,
  imageUrl: null,
  warrantyMonths: null,
  inStock: true,
  defaultVariantId: null,
  variants: [],
};

const LEGACY_PATHS = [
  "/all-products",
  "/new-products",
  "/micgo-products",
  "/krd-products",
  "/wired-micphone",
  "/wireless-micphone",
  "/trumpet",
  "/accessories",
];

/** 測試用導覽按鈕：在同一個 MemoryRouter 內切換路徑 */
const GoTrumpet = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate("/trumpet")}>
      前往喇叭
    </button>
  );
};

beforeEach(() => {
  vi.resetAllMocks();
  mockFetch.mockResolvedValue({ items: [], total: 0, truncated: false });
});

describe("App 商品路由", () => {
  it("PRODUCT_PAGES 的路徑集合與舊網址完全相同", () => {
    expect([...PRODUCT_PAGES.map((p) => p.path)].sort()).toEqual(
      [...LEGACY_PATHS].sort()
    );
  });

  it("每個路徑都有非空 title 的 UI 設定", () => {
    for (const page of PRODUCT_PAGES) {
      expect(PRODUCT_PAGE_VIEWS[page.path]?.title).toBeTruthy();
    }
  });

  it.each(PRODUCT_PAGES.map((p) => [p.path, p] as const))(
    "%s 顯示頁面標題並以對應查詢呼叫後端",
    async (path, page) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      );
      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: PRODUCT_PAGE_VIEWS[path].title,
        })
      ).toBeInTheDocument();
      expect(mockFetch.mock.calls[0][0]).toEqual(
        buildProductParams(page.query, page.query.sort ? undefined : "name")
      );
    }
  );

  it("從一個商品頁切到另一個商品頁時排序回到 name", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/wired-micphone"]}>
        <GoTrumpet />
        <App />
      </MemoryRouter>
    );
    await user.selectOptions(await screen.findByRole("combobox"), "newest");
    await user.click(screen.getByRole("button", { name: "前往喇叭" }));

    expect(await screen.findByRole("combobox")).toHaveValue("name");
    const lastParams = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
    expect(lastParams).toMatchObject({ category: "喇叭", sort: "name" });
  });

  it("未知路徑顯示全域 NotFound", async () => {
    render(
      <MemoryRouter initialEntries={["/whatever-404"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "找不到這一頁" })
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("/products（沒有 id）也顯示全域 NotFound", async () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "找不到這一頁" })
    ).toBeInTheDocument();
  });

  it("/products/:uuid 顯示詳情且不呼叫商品列表 API", async () => {
    mockDetail.mockResolvedValue(DETAIL);
    render(
      <MemoryRouter initialEntries={[`/products/${DETAIL_ID}`]}>
        <App />
      </MemoryRouter>
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: DETAIL.name })
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockDetail.mock.calls[0][0]).toBe(DETAIL_ID);
  });

  it("/products/not-a-uuid 顯示找不到商品且不發詳情請求", async () => {
    render(
      <MemoryRouter initialEntries={["/products/not-a-uuid"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "找不到這個商品" })
    ).toBeInTheDocument();
    expect(mockDetail).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
