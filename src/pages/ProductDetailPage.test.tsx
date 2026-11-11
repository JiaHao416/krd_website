import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetailPage from "./ProductDetailPage";
import { fetchProductDetail } from "../services/productDetail";
import { ApiError } from "../services/errors";
import type { ProductDetail } from "../services/transform";

// partial mock：只替換 fetchProductDetail，其餘用真實實作
vi.mock("../services/productDetail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/productDetail")>()),
  fetchProductDetail: vi.fn(),
}));

const mockDetail = vi.mocked(fetchProductDetail);

const ID = "00000000-0000-4000-8000-000000000001";

const PRODUCT: ProductDetail = {
  id: ID,
  name: "UHF 雙頻無線手持麥克風組",
  brand: "MICGO",
  model: "MG-U200",
  category: "無線麥克風",
  description: "雙頻無線麥克風",
  imageUrl: null,
  warrantyMonths: 12,
  inStock: true,
  defaultVariantId: "v1",
  variants: [
    {
      id: "v1",
      sku: "MG-U200-BK",
      attributes: [],
      imageUrl: null,
      isDefault: true,
      inStock: true,
      priceInclTax: null,
      priceText: null,
    },
  ],
};

/** 以真實 Layout 渲染詳情頁；預設為合法 UUID 的網址 */
const renderPage = (path = `/products/${ID}`) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

// 模擬 index.html 的站名 title，驗證離開頁面後還原
beforeEach(() => {
  vi.resetAllMocks();
  const title = document.createElement("title");
  title.textContent = "KRD";
  document.head.appendChild(title);
});

afterEach(() => {
  // 先卸載 React 樹（讓 React 自行移除它插入的 title），再清掉模擬的站名 title
  cleanup();
  document.head.querySelectorAll("title").forEach((title) => title.remove());
  vi.restoreAllMocks();
});

describe("ProductDetailPage 狀態", () => {
  it("載入中顯示忙碌骨架，不改標題也不顯示雙鈕列", () => {
    mockDetail.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(document.title).toBe("KRD");
    expect(screen.queryByTestId("detail-mobile-bar")).toBeNull();
  });

  it("成功時顯示商品、雙鈕固定列與商品標題", async () => {
    mockDetail.mockResolvedValue(PRODUCT);
    renderPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: PRODUCT.name })
    ).toBeInTheDocument();
    expect(screen.getByTestId("detail-mobile-bar")).toBeInTheDocument();
    expect(document.title).toBe(`${PRODUCT.name} | KRD`);
  });

  it.each([404, 400])("後端回 %i 時顯示找不到商品", async (status) => {
    mockDetail.mockRejectedValue(new ApiError("http", "找不到", status));
    renderPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "找不到這個商品" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("它可能已經下架，或是網址打錯了。回到所有商品逛逛吧。")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "回到所有商品" })).toHaveAttribute(
      "href",
      "/all-products"
    );
    expect(document.title).toBe("找不到商品 | KRD");
    expect(screen.queryByTestId("detail-mobile-bar")).toBeNull();
  });

  it("非 UUID 的網址直接顯示找不到商品，不發請求", () => {
    renderPage("/products/not-a-uuid");
    expect(
      screen.getByRole("heading", { level: 1, name: "找不到這個商品" })
    ).toBeInTheDocument();
    expect(mockDetail).not.toHaveBeenCalled();
  });

  it("網路錯誤時顯示可重試面板，重新載入會再請求一次", async () => {
    const user = userEvent.setup();
    mockDetail.mockRejectedValue(new ApiError("network", "網路錯誤"));
    renderPage();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("商品暫時載入不出來");
    expect(alert).toHaveTextContent("可能是網路不穩或我們這邊在忙，等一下再試試看。");
    expect(document.title).toBe("KRD");
    await user.click(within(alert).getByRole("button", { name: "重新載入" }));
    await waitFor(() => expect(mockDetail).toHaveBeenCalledTimes(2));
  });

  it("被限流時顯示請稍候的說明", async () => {
    mockDetail.mockRejectedValue(new ApiError("rate_limited", "太多請求", 429));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "現在逛的人有點多，等幾秒再試一次。"
    );
  });

  it("卸載後分頁標題回到站名", async () => {
    mockDetail.mockResolvedValue(PRODUCT);
    const { unmount } = renderPage();
    await screen.findByRole("heading", { level: 1, name: PRODUCT.name });
    unmount();
    expect(document.title).toBe("KRD");
  });
});

describe("ProductDetailPage 複製詢價", () => {
  it("複製成功時兩處按鈕同時顯示已複製", async () => {
    const user = userEvent.setup();
    // user-event 會掛上剪貼簿 stub，必須在 setup 之後才 spy
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    mockDetail.mockResolvedValue(PRODUCT);
    renderPage();
    const bar = within(await screen.findByTestId("detail-mobile-bar"));
    await user.click(bar.getByRole("button", { name: "複製詢價" }));
    expect(writeText).toHaveBeenCalledWith(
      `${PRODUCT.name}｜型號 ${PRODUCT.model}｜${window.location.href}`
    );
    expect(await screen.findAllByRole("button", { name: "已複製" })).toHaveLength(2);
  });

  it("剪貼簿不可用時兩處都顯示複製失敗", async () => {
    const user = userEvent.setup();
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    try {
      mockDetail.mockResolvedValue(PRODUCT);
      renderPage();
      const bar = within(await screen.findByTestId("detail-mobile-bar"));
      await user.click(bar.getByRole("button", { name: "複製詢價" }));
      expect(await screen.findAllByText("複製失敗，請手動選取網址")).toHaveLength(2);
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
    }
  });
});

describe("ProductDetailPage 重複複製失敗", () => {
  it("連續兩次失敗時重新插入失敗訊息，讓即時區域再次朗讀", async () => {
    const user = userEvent.setup();
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    try {
      mockDetail.mockResolvedValue(PRODUCT);
      renderPage();
      const barElement = await screen.findByTestId("detail-mobile-bar");
      const bar = within(barElement);
      await user.click(bar.getByRole("button", { name: "複製詢價" }));
      const first = await bar.findByText("複製失敗，請手動選取網址");
      await user.click(bar.getByRole("button", { name: "複製詢價" }));
      const second = await bar.findByText("複製失敗，請手動選取網址");
      expect(first.isConnected).toBe(false);
      expect(second).not.toBe(first);
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
    }
  });
});
