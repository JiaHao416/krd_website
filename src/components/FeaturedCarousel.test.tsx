import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeaturedCarousel from "./FeaturedCarousel";
import type { UseProductsResult } from "../hooks/useProducts";
import type { Product } from "../services/transform";
import { ApiError } from "../services/errors";

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

/** 建立 useProducts 結果 */
function makeResult(
  overrides: Partial<UseProductsResult> = {}
): UseProductsResult {
  return {
    status: "success",
    items: [],
    truncated: false,
    error: null,
    retry: vi.fn(),
    ...overrides,
  };
}

/** 建立 n 筆商品 */
function makeItems(count: number): Product[] {
  return Array.from({ length: count }, (_, i) =>
    makeProduct({ id: `id-${i + 1}`, name: `商品${i + 1}` })
  );
}

function renderCarousel(result: UseProductsResult, intervalMs = 5000) {
  return render(
    <FeaturedCarousel result={result} accent="blue" intervalMs={intervalMs} />
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("FeaturedCarousel 狀態", () => {
  it("載入中顯示「載入產品中...」", () => {
    renderCarousel(makeResult({ status: "loading" }));
    expect(screen.getByText("載入產品中...")).toBeInTheDocument();
  });

  it("失敗時只顯示固定中文訊息，並可重新載入", async () => {
    const retry = vi.fn();
    renderCarousel(
      makeResult({
        status: "error",
        error: new ApiError("rate_limited", "後端原始訊息XYZ", 429),
        retry,
      })
    );
    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByText("瀏覽太頻繁，請稍候一分鐘再重試")
    ).toBeInTheDocument();
    expect(screen.queryByText(/後端原始訊息XYZ/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "重新載入" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("成功但沒有商品時顯示「目前沒有精選商品」", () => {
    renderCarousel(makeResult({ status: "success", items: [] }));
    expect(screen.getByText("目前沒有精選商品")).toBeInTheDocument();
  });
});

describe("FeaturedCarousel 操控", () => {
  it("只有一筆時不顯示箭頭與指示點", () => {
    renderCarousel(makeResult({ items: makeItems(1) }));
    expect(screen.getByText("商品1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "下一張" })).toBeNull();
    expect(screen.queryByRole("button", { name: "第 1 張" })).toBeNull();
  });

  it("三筆時有箭頭與指示點，點下一張顯示第二筆", async () => {
    renderCarousel(makeResult({ items: makeItems(3) }));
    expect(screen.getByRole("button", { name: "上一張" })).toBeInTheDocument();
    for (const n of [1, 2, 3]) {
      expect(
        screen.getByRole("button", { name: `第 ${n} 張` })
      ).toBeInTheDocument();
    }
    await userEvent.click(screen.getByRole("button", { name: "下一張" }));
    expect(screen.getByText("商品2")).toBeInTheDocument();
  });
});

describe("FeaturedCarousel 自動播放", () => {
  it("成功且多筆時依 intervalMs 切換下一筆", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(2) }), 5000);
    expect(screen.getByText("商品1")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("商品2")).toBeInTheDocument();
  });

  it("載入中推進時間不報錯也不切換", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ status: "loading", items: makeItems(2) }));
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText("載入產品中...")).toBeInTheDocument();
  });
});
