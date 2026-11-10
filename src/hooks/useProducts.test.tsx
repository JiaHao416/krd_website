import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProducts } from "./useProducts";
import { fetchProducts } from "../services/products";
import type { ProductListResult } from "../services/products";
import { ApiError } from "../services/errors";
import { buildProductParams } from "../services/catalog";
import type { ProductPageQuery } from "../services/catalog";
import type { ProductSort } from "../services/apiTypes";
import type { Product } from "../services/transform";

vi.mock("../services/products");

const mockFetch = vi.mocked(fetchProducts);

/** 建立測試用商品（只填必要欄位，其餘以型別斷言略過） */
function makeProduct(id: string): Product {
  return { id, name: `商品 ${id}` } as Product;
}

/** 建立成功結果 */
function makeResult(count: number, truncated = false): ProductListResult {
  const items = Array.from({ length: count }, (_, i) => makeProduct(`p${i}`));
  return { items, total: count, truncated };
}

interface HookProps {
  query: ProductPageQuery;
  sort?: ProductSort;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useProducts", () => {
  it("請求進行中 status 為 loading", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProducts({}));
    expect(result.current.status).toBe("loading");
  });

  it("成功時回傳商品與 truncated", async () => {
    mockFetch.mockResolvedValue(makeResult(2, true));
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.truncated).toBe(true);
  });

  it("失敗時 status 為 error 並保留 ApiError", async () => {
    const apiError = new ApiError("http", "x", 500);
    mockFetch.mockRejectedValue(apiError);
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe(apiError);
  });

  it("空結果仍是 success 且 items 為空", async () => {
    mockFetch.mockResolvedValue({ items: [], total: 0, truncated: false });
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(0);
  });

  it("retry 會再次呼叫 fetchProducts 並回到 loading", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("http", "x", 500));
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.status).toBe("error"));

    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    act(() => result.current.retry());
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.status).toBe("loading"));
  });

  it("retry 後第二次成功會變成 success", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("http", "x", 500));
    mockFetch.mockResolvedValueOnce(makeResult(1));
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("canceled 錯誤不會讓 status 變成 error", async () => {
    mockFetch.mockRejectedValue(new ApiError("canceled", "x"));
    const { result } = renderHook(() => useProducts({}));
    // 讓 rejected promise 的處理有機會執行
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe("loading");
  });

  it("參數改變時重新抓取，等待期間保留舊 items", async () => {
    mockFetch.mockResolvedValueOnce(makeResult(2));
    const { result, rerender } = renderHook(
      ({ query, sort }: HookProps) => useProducts(query, sort),
      { initialProps: { query: {} } as HookProps }
    );
    await waitFor(() => expect(result.current.status).toBe("success"));

    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    rerender({ query: {}, sort: "newest" });
    await waitFor(() => expect(result.current.status).toBe("loading"));
    expect(mockFetch.mock.calls[1][0].sort).toBe("newest");
    expect(result.current.items).toHaveLength(2);
  });

  it("unmount 後前一次請求的 signal 已 abort", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderHook(() => useProducts({}));
    unmount();
    expect(mockFetch.mock.calls[0][2]?.signal?.aborted).toBe(true);
  });

  it("以 buildProductParams 的結果呼叫 fetchProducts 且不傳 client", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const query: ProductPageQuery = { brand: "KRD" };
    renderHook(() => useProducts(query, "name"));
    expect(mockFetch.mock.calls[0][0]).toEqual(buildProductParams(query, "name"));
    expect(mockFetch.mock.calls[0][1]).toBeUndefined();
  });

  it("不快取：同參數重新掛載會再抓一次", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderHook(() => useProducts({})).unmount();
    renderHook(() => useProducts({}));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("每次 render 傳入內容相同的新 query 物件不會重抓", async () => {
    mockFetch.mockResolvedValue(makeResult(1));
    const { result, rerender } = renderHook(
      ({ query }: HookProps) => useProducts(query),
      { initialProps: { query: { brand: "KRD" } } as HookProps }
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    rerender({ query: { brand: "KRD" } });
    rerender({ query: { brand: "KRD" } });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("StrictMode 下最終為 success，且第一次請求已被 abort", async () => {
    mockFetch.mockResolvedValue(makeResult(1));
    const { result } = renderHook(() => useProducts({}), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetch.mock.calls[0][2]?.signal?.aborted).toBe(true);
  });
});
