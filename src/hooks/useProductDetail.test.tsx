import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProductDetail } from "./useProductDetail";
import { fetchProductDetail } from "../services/productDetail";
import { ApiError } from "../services/errors";
import type { ProductDetail } from "../services/transform";

// partial mock：只替換 fetchProductDetail，isUuid／classifyDetailError 用真實實作
vi.mock("../services/productDetail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/productDetail")>()),
  fetchProductDetail: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProductDetail);

const ID_A = "00000000-0000-4000-8000-000000000001";
const ID_B = "00000000-0000-4000-8000-000000000002";

/** 建立測試用詳情（只填必要欄位） */
function makeDetail(id: string): ProductDetail {
  return { id, name: "測試商品" } as ProductDetail;
}

/** 可手動決定結果的 promise */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useProductDetail", () => {
  it("請求進行中 status 為 loading", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProductDetail(ID_A));
    expect(result.current.status).toBe("loading");
  });

  it("成功時回傳 product", async () => {
    const detail = makeDetail(ID_A);
    mockFetch.mockResolvedValue(detail);
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toMatchObject({ status: "success", product: detail });
  });

  it("成功時 fetchProductDetail 只呼叫 1 次，參數含 signal", async () => {
    mockFetch.mockResolvedValue(makeDetail(ID_A));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(ID_A);
    expect(mockFetch.mock.calls[0][1]).toBeUndefined();
    expect(mockFetch.mock.calls[0][2]?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([undefined, "not-a-uuid", ""])(
    "id 為 %j 時直接 notFound 且不發請求",
    (badId) => {
      const { result } = renderHook(() => useProductDetail(badId));
      expect(result.current.status).toBe("notFound");
      expect(mockFetch).not.toHaveBeenCalled();
    }
  );

  it.each([404, 400])("HTTP %i 轉為 notFound", async (status) => {
    mockFetch.mockRejectedValue(new ApiError("http", "商品不存在", status));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("notFound"));
  });

  it("429 為 error 且 isRateLimited 為 true", async () => {
    const apiError = new ApiError("rate_limited", "x", 429);
    mockFetch.mockRejectedValue(apiError);
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({
      status: "error",
      error: apiError,
      isRateLimited: true,
    });
  });

  it("500 為 error 且 isRateLimited 為 false", async () => {
    mockFetch.mockRejectedValue(new ApiError("http", "x", 500));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ isRateLimited: false });
  });

  it("網路錯誤為 error 且 isRateLimited 為 false", async () => {
    mockFetch.mockRejectedValue(new ApiError("network", "x"));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ isRateLimited: false });
  });

  it("非 ApiError 的錯誤會被正規化為 invalid_response", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("error"));
    if (result.current.status !== "error") throw new Error("應為 error");
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error.kind).toBe("invalid_response");
  });

  it("canceled 錯誤不進入 error，維持 loading", async () => {
    mockFetch.mockRejectedValue(new ApiError("canceled", "x"));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe("loading");
  });

  it("切換 id 時 abort 前一個請求並立即回到 loading", async () => {
    const a = createDeferred<ProductDetail>();
    const b = createDeferred<ProductDetail>();
    mockFetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const { result, rerender } = renderHook(({ id }) => useProductDetail(id), {
      initialProps: { id: ID_A },
    });
    await act(async () => {
      a.resolve(makeDetail(ID_A));
    });
    expect(result.current.status).toBe("success");

    rerender({ id: ID_B });
    expect(result.current.status).toBe("loading");
    expect(mockFetch.mock.calls[0][2]?.signal?.aborted).toBe(true);

    await act(async () => {
      b.resolve(makeDetail(ID_B));
    });
    expect(result.current).toMatchObject({
      status: "success",
      product: { id: ID_B },
    });
  });

  it("舊 id 的結果晚到不會覆蓋新 id", async () => {
    const a = createDeferred<ProductDetail>();
    const b = createDeferred<ProductDetail>();
    mockFetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const { result, rerender } = renderHook(({ id }) => useProductDetail(id), {
      initialProps: { id: ID_A },
    });
    rerender({ id: ID_B });
    await act(async () => {
      b.resolve(makeDetail(ID_B));
    });
    await act(async () => {
      a.resolve(makeDetail(ID_A));
    });
    expect(result.current).toMatchObject({
      status: "success",
      product: { id: ID_B },
    });
  });

  it("卸載時 abort 請求，之後才 resolve 也不報錯", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const a = createDeferred<ProductDetail>();
    mockFetch.mockReturnValue(a.promise);
    const { unmount } = renderHook(() => useProductDetail(ID_A));
    unmount();
    expect(mockFetch.mock.calls[0][2]?.signal?.aborted).toBe(true);
    await act(async () => {
      a.resolve(makeDetail(ID_A));
    });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("error 後 retry 會回到 loading、重新請求並可成功", async () => {
    mockFetch
      .mockRejectedValueOnce(new ApiError("http", "x", 500))
      .mockResolvedValueOnce(makeDetail(ID_A));
    const { result } = renderHook(() => useProductDetail(ID_A));
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("StrictMode 下最終為 success 且只有一個有效請求", async () => {
    mockFetch.mockResolvedValue(makeDetail(ID_A));
    const { result } = renderHook(() => useProductDetail(ID_A), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    const active = mockFetch.mock.calls.filter(
      (call) => call[2]?.signal?.aborted === false
    );
    expect(active).toHaveLength(1);
  });
});
