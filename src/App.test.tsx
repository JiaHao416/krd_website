import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import App from "./App";
import { fetchProducts } from "./services/products";
import { PRODUCT_PAGES, buildProductParams } from "./services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./config/productPageViews";

// 以假元件取代 Layout，專注測商品路由
vi.mock("./components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("./services/products");

const mockFetch = vi.mocked(fetchProducts);

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
});
