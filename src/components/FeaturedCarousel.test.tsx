import { describe, it, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
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
    <FeaturedCarousel result={result} intervalMs={intervalMs} />
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** md+ 視窗內第一張卡（指示點不在 ul 內，不會混進 listitem） */
const firstCard = () => screen.getAllByRole("listitem")[0];

/** 模擬 matchMedia；只回應減少動態與 base 斷點兩個查詢，其餘一律 false（jsdom 視為桌機） */
function mockMatchMedia({ reducedMotion = false, base = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches:
        query === "(prefers-reduced-motion: reduce)"
          ? reducedMotion
          : query === "(max-width: 767px)"
            ? base
            : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

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
    expect(firstCard()).toHaveTextContent("商品2");
  });
});

describe("FeaturedCarousel 圖片載入失敗", () => {
  it("圖片載入失敗時改顯示佔位圖，不留破圖", () => {
    renderCarousel(makeResult({ items: makeItems(1) }));
    fireEvent.error(screen.getByRole("img", { name: "商品1" }));
    expect(screen.queryByRole("img", { name: "商品1" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "暫無圖片" })).toBeInTheDocument();
  });
});

describe("FeaturedCarousel 自動播放", () => {
  it("成功且多筆時依 intervalMs 切換下一筆", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(2) }), 5000);
    expect(firstCard()).toHaveTextContent("商品1");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
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

describe("FeaturedCarousel 暫停自動播放", () => {
  it("系統偏好減少動態時不自動切換，手動仍可切換", () => {
    mockMatchMedia({ reducedMotion: true });
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品1");
    fireEvent.click(screen.getByRole("button", { name: "下一張" }));
    expect(firstCard()).toHaveTextContent("商品2");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
  });

  it("滑鼠移入時不自動切換，移出後恢復", () => {
    vi.useFakeTimers();
    const { container } = renderCarousel(
      makeResult({ items: makeItems(3) }),
      5000
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品1");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
  });

  it("觸控進入輪播時不暫停，仍會自動切換", () => {
    vi.useFakeTimers();
    const { container } = renderCarousel(
      makeResult({ items: makeItems(3) }),
      5000
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerEnter(root, { pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
  });

  it("焦點在輪播內時不自動切換，焦點離開後恢復", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    const next = screen.getByRole("button", { name: "下一張" });
    act(() => {
      next.focus();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品1");
    act(() => {
      next.blur();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
  });

  it("用滑鼠點擊按鈕取得焦點時不暫停，仍會自動切換", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    const next = screen.getByRole("button", { name: "下一張" });
    // 模擬滑鼠點擊順序：pointerdown -> focus -> pointerup -> click
    fireEvent.pointerDown(next, { pointerType: "mouse" });
    act(() => {
      next.focus();
    });
    fireEvent.pointerUp(next, { pointerType: "mouse" });
    fireEvent.click(next);
    expect(firstCard()).toHaveTextContent("商品2");
    expect(next).toHaveFocus();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品3");
  });

  /** 模擬觸控點擊按鈕的完整事件序列（焦點在 pointerup 之後才給） */
  function touchTap(el: HTMLElement) {
    fireEvent.pointerDown(el, { pointerType: "touch" });
    fireEvent.pointerUp(el, { pointerType: "touch" });
    act(() => {
      el.focus();
    });
    fireEvent.click(el);
  }

  it("觸控點擊按鈕取得焦點時不暫停，仍會自動切換", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    const next = screen.getByRole("button", { name: "下一張" });
    // Android Chrome 觸控順序：pointerdown -> pointerup -> (相容 mousedown) -> focus -> click，
    // 焦點在 pointerup 之後才給
    touchTap(next);
    expect(firstCard()).toHaveTextContent("商品2");
    expect(next).toHaveFocus();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品3");
  });

  it("觸控點擊後再以鍵盤讓焦點進入，仍會暫停", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    const next = screen.getByRole("button", { name: "下一張" });
    const prev = screen.getByRole("button", { name: "上一張" });
    // 先完整觸控點擊，再用無 pointer 事件的 focus 模擬 Tab
    touchTap(next);
    expect(firstCard()).toHaveTextContent("商品2");
    act(() => {
      next.blur();
    });
    act(() => {
      prev.focus();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
  });

  it("觸控被取消（pointercancel）後鍵盤焦點仍會暫停", () => {
    vi.useFakeTimers();
    const { container } = renderCarousel(
      makeResult({ items: makeItems(3) }),
      5000
    );
    const root = container.firstElementChild as HTMLElement;
    const next = screen.getByRole("button", { name: "下一張" });
    // 觸控按下後被捲動手勢取消：只有 pointerdown 與 pointercancel，沒有 click
    fireEvent.pointerDown(root, { pointerType: "touch" });
    fireEvent.pointerCancel(root, { pointerType: "touch" });
    act(() => {
      next.focus();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品1");
  });

  it("觸控點在非按鈕區域後鍵盤焦點仍會暫停", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    const next = screen.getByRole("button", { name: "下一張" });
    const title = screen.getByText("商品1");
    // 點在標題文字上：沒有任何元素取得焦點，click 冒泡到根 div
    fireEvent.pointerDown(title, { pointerType: "touch" });
    fireEvent.pointerUp(title, { pointerType: "touch" });
    fireEvent.click(title);
    act(() => {
      next.focus();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(firstCard()).toHaveTextContent("商品1");
  });

  it("手動切換後重新計時，不會在原排程時間被切走", () => {
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(screen.getByRole("button", { name: "下一張" }));
    expect(firstCard()).toHaveTextContent("商品2");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(firstCard()).toHaveTextContent("商品2");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(firstCard()).toHaveTextContent("商品3");
  });
});

describe("FeaturedCarousel 便條卡", () => {
  it("3 筆中第 2 張破圖時只有那張變佔位圖", () => {
    renderCarousel(makeResult({ items: makeItems(3) }));
    fireEvent.error(screen.getByRole("img", { name: "商品2" }));
    expect(screen.queryByRole("img", { name: "商品2" })).toBeNull();
    expect(screen.getByRole("img", { name: "商品1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "商品3" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "暫無圖片" })).toHaveLength(1);
  });

  it("md+ 只渲染 3 張且循環", () => {
    renderCarousel(makeResult({ items: makeItems(5) }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const next = screen.getByRole("button", { name: "下一張" });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("商品4");
    expect(cards[1]).toHaveTextContent("商品5");
    expect(cards[2]).toHaveTextContent("商品1");
  });

  it("筆數少於 3 時不重複渲染", () => {
    renderCarousel(makeResult({ items: makeItems(2) }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("便條卡無價顯示價格請來電、有價顯示 priceText", () => {
    renderCarousel(
      makeResult({
        items: [
          makeProduct({ id: "a", name: "有價商品", priceMin: 100, priceMax: 100, priceText: "NT$ 1,234" }),
          makeProduct({ id: "b", name: "無價商品" }),
        ],
      })
    );
    expect(screen.getByText("NT$ 1,234")).toBeInTheDocument();
    expect(screen.getByText("價格請來電")).toBeInTheDocument();
  });
});

describe("FeaturedCarousel base 寬度", () => {
  /** 攔截 scrollIntoView，記錄呼叫的元素與參數 */
  function spyScroll() {
    const calls: Array<{ el: Element; options: unknown }> = [];
    vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (
      this: Element,
      options?: boolean | ScrollIntoViewOptions
    ) {
      calls.push({ el: this, options });
    });
    return calls;
  }

  it("base 不自動播放，點下一張以 smooth 把第二張捲到起點", () => {
    mockMatchMedia({ base: true });
    const calls = spyScroll();
    vi.useFakeTimers();
    renderCarousel(makeResult({ items: makeItems(3) }), 5000);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // 不自動播放：目前位置仍是第 1 張
    expect(screen.getByRole("button", { name: "第 1 張" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    fireEvent.click(screen.getByRole("button", { name: "下一張" }));
    expect(calls).toHaveLength(1);
    expect(calls[0].el).toHaveTextContent("商品2");
    expect(calls[0].options).toEqual({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  });

  it("base 且減少動態時 behavior 為 auto", () => {
    mockMatchMedia({ base: true, reducedMotion: true });
    const calls = spyScroll();
    renderCarousel(makeResult({ items: makeItems(3) }));
    fireEvent.click(screen.getByRole("button", { name: "下一張" }));
    expect(calls).toHaveLength(1);
    expect(calls[0].options).toEqual({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
  });

  it("base 點第 3 張指示點捲到第 3 張", () => {
    mockMatchMedia({ base: true });
    const calls = spyScroll();
    renderCarousel(makeResult({ items: makeItems(3) }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "第 3 張" }));
    expect(calls).toHaveLength(1);
    expect(calls[0].el).toHaveTextContent("商品3");
    expect(screen.getByRole("button", { name: "第 3 張" })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });
});
