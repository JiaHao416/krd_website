import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyInquiry } from "./useCopyInquiry";

const TEXT = "UHF 組｜https://www.krd.com.tw/products/x";

afterEach(() => {
  vi.useRealTimers();
});

describe("useCopyInquiry", () => {
  it("複製成功時以傳入文字寫入剪貼簿並顯示已複製", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyInquiry(TEXT, writeText));
    await act(async () => {
      await result.current.copy();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(TEXT);
    expect(result.current.status).toBe("copied");
  });

  it("已複製狀態 2 秒後回到初始狀態", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyInquiry(TEXT, writeText));
    await act(async () => {
      await result.current.copy();
    });
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.status).toBe("copied");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.status).toBe("idle");
  });

  it("寫入被拒絕時顯示失敗", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyInquiry(TEXT, writeText));
    await act(async () => {
      await result.current.copy();
    });
    expect(result.current.status).toBe("failed");
  });

  it("瀏覽器沒有剪貼簿 API 時顯示失敗", async () => {
    // jsdom 預設沒有 navigator.clipboard，走預設寫入函式
    const { result } = renderHook(() => useCopyInquiry(TEXT));
    await act(async () => {
      await result.current.copy();
    });
    expect(result.current.status).toBe("failed");
  });

  it("沒有文字時不寫入，狀態維持初始", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyInquiry(null, writeText));
    await act(async () => {
      await result.current.copy();
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("重複複製會重新計時", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyInquiry(TEXT, writeText));
    await act(async () => {
      await result.current.copy();
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await act(async () => {
      await result.current.copy();
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.status).toBe("copied");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.status).toBe("idle");
  });

  it("卸載時清除還原計時器", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() =>
      useCopyInquiry(TEXT, writeText)
    );
    await act(async () => {
      await result.current.copy();
    });
    expect(result.current.status).toBe("copied");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
