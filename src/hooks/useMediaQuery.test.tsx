import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

const QUERY = "(max-width: 767px)";

/** 建立可手動觸發 change 事件的 MediaQueryList 假物件 */
function stubMatchMedia(initial: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | null = null;
  const mql = {
    matches: initial,
    media: QUERY,
    onchange: null,
    addEventListener: vi.fn((_type: string, cb: (event: MediaQueryListEvent) => void) => {
      listener = cb;
    }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
  return {
    mql,
    emit: (matches: boolean) => listener?.({ matches } as MediaQueryListEvent),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("初值同步讀取 matchMedia 結果", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery(QUERY));
    expect(result.current).toBe(true);
  });

  it("change 事件後更新值", () => {
    const { emit } = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery(QUERY));
    act(() => emit(true));
    expect(result.current).toBe(true);
  });

  it("環境沒有 matchMedia 時回傳 false 不崩潰", () => {
    const { result } = renderHook(() => useMediaQuery(QUERY));
    expect(result.current).toBe(false);
  });

  it("unmount 時移除 change 監聽", () => {
    const { mql } = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery(QUERY));
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
