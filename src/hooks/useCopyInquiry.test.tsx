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

describe("useCopyInquiry 切換文字", () => {
  const OTHER = "另一組｜https://www.krd.com.tw/products/y";

  it("文字改變時失敗狀態重置為初始", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const { result, rerender } = renderHook(
      ({ text }: { text: string | null }) => useCopyInquiry(text, writeText),
      { initialProps: { text: TEXT as string | null } }
    );
    await act(async () => {
      await result.current.copy();
    });
    expect(result.current.status).toBe("failed");
    rerender({ text: OTHER });
    expect(result.current.status).toBe("idle");
  });

  it("切換文字前發出的寫入完成後，不改動新文字的狀態", async () => {
    let resolveWrite: () => void = () => {};
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        })
    );
    const { result, rerender } = renderHook(
      ({ text }: { text: string | null }) => useCopyInquiry(text, writeText),
      { initialProps: { text: TEXT as string | null } }
    );
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.copy();
    });
    rerender({ text: OTHER });
    await act(async () => {
      resolveWrite();
      await pending;
    });
    expect(result.current.status).toBe("idle");
  });

  it("切換文字時清除舊的已複製還原計時器", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ text }: { text: string | null }) => useCopyInquiry(text, writeText),
      { initialProps: { text: TEXT as string | null } }
    );
    await act(async () => {
      await result.current.copy();
    });
    expect(result.current.status).toBe("copied");
    rerender({ text: OTHER });
    expect(result.current.status).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useCopyInquiry 重複嘗試", () => {
  it("連續兩次失敗之間先回到初始，讓即時區域重新朗讀", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const seen: string[] = [];
    const { result } = renderHook(() => {
      const value = useCopyInquiry(TEXT, writeText);
      seen.push(value.status);
      return value;
    });
    await act(async () => {
      await result.current.copy();
    });
    const afterFirst = seen.length;
    // 模擬點擊事件：同步階段先提交，寫入結果之後才回來
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.copy();
    });
    await act(async () => {
      await pending;
    });
    expect(seen.slice(afterFirst)).toContain("idle");
    expect(result.current.status).toBe("failed");
  });

  it("已複製期間再按一次，先回到初始再顯示已複製", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const seen: string[] = [];
    const { result } = renderHook(() => {
      const value = useCopyInquiry(TEXT, writeText);
      seen.push(value.status);
      return value;
    });
    await act(async () => {
      await result.current.copy();
    });
    const afterFirst = seen.length;
    // 模擬點擊事件：同步階段先提交，寫入結果之後才回來
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.copy();
    });
    await act(async () => {
      await pending;
    });
    expect(seen.slice(afterFirst)).toContain("idle");
    expect(result.current.status).toBe("copied");
  });
});
