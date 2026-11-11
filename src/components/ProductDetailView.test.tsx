import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetailView from "./ProductDetailView";
import { CONTACT } from "../config/contact";
import type { CopyStatus } from "../hooks/useCopyInquiry";
import type { ProductDetail, ProductVariant } from "../services/transform";

const PRODUCT_IMAGE = "https://img.example.com/product.jpg";
const VARIANT_IMAGE = "https://img.example.com/variant-hs.jpg";

/** 建立測試用變體 */
const makeVariant = (overrides: Partial<ProductVariant>): ProductVariant => ({
  id: "v",
  sku: "SKU",
  attributes: [],
  imageUrl: null,
  isDefault: false,
  inStock: true,
  priceInclTax: null,
  priceText: null,
  ...overrides,
});

/** 多變體商品 */
const MULTI: ProductDetail = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "UHF 雙頻無線手持麥克風組",
  brand: "MICGO",
  model: "MG-U200",
  category: "無線麥克風",
  description: "第一行\n第二行",
  imageUrl: PRODUCT_IMAGE,
  warrantyMonths: 12,
  inStock: true,
  defaultVariantId: "v1",
  variants: [
    makeVariant({
      id: "v1",
      sku: "MG-U200-BK",
      attributes: [{ key: "顏色", value: "黑色" }],
      isDefault: true,
    }),
    makeVariant({
      id: "v2",
      sku: "MG-U200-HS",
      attributes: [{ key: "顏色", value: "手持" }],
      priceInclTax: 12345,
      priceText: "NT$12,345",
      imageUrl: VARIANT_IMAGE,
    }),
    makeVariant({
      id: "v3",
      sku: "MG-U200-SV",
      attributes: [{ key: "顏色", value: "銀色" }],
      inStock: false,
    }),
  ],
};

/** 單變體商品（無型號、無說明、無保固） */
const SINGLE: ProductDetail = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "BB1",
  brand: "MICGO",
  model: null,
  category: "喇叭",
  description: null,
  imageUrl: PRODUCT_IMAGE,
  warrantyMonths: null,
  inStock: false,
  defaultVariantId: "s1",
  variants: [makeVariant({ id: "s1", sku: "BB1-STD", inStock: false, isDefault: true })],
};

interface RenderOptions {
  entries?: string[];
  copyStatus?: CopyStatus;
  onCopy?: () => void;
}

/** 以 MemoryRouter 渲染詳情成功態；預設為直接開網址（只有一筆歷史） */
const renderView = (product: ProductDetail, options: RenderOptions = {}) => {
  const {
    entries = [`/products/${product.id}`],
    copyStatus = "idle",
    onCopy = vi.fn(),
  } = options;
  return render(
    <MemoryRouter initialEntries={entries}>
      <Routes>
        <Route
          path="/products/:id"
          element={<ProductDetailView product={product} copyStatus={copyStatus} onCopy={onCopy} />}
        />
        <Route path="/trumpet" element={<p>喇叭列表</p>} />
      </Routes>
    </MemoryRouter>
  );
};

/** 規格表的 dt 文字 */
const specTerms = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("dt")).map((el) => el.textContent);

/** 規格表中某個名稱對應的值 */
const specValue = (container: HTMLElement, label: string) => {
  const term = Array.from(container.querySelectorAll("dt")).find((el) => el.textContent === label);
  return term?.nextElementSibling?.textContent ?? null;
};

// 模擬 index.html 的站名 title，驗證離開頁面後還原
beforeEach(() => {
  const title = document.createElement("title");
  title.textContent = "KRD";
  document.head.appendChild(title);
});

afterEach(() => {
  // 先卸載 React 樹（讓 React 自行移除它插入的 title），再清掉模擬的站名 title
  cleanup();
  document.head.querySelectorAll("title").forEach((title) => title.remove());
});

describe("ProductDetailView 基本資訊", () => {
  it("顯示名稱、品牌型號行與連到分類頁的分類標籤", () => {
    renderView(MULTI);
    expect(
      screen.getByRole("heading", { level: 1, name: "UHF 雙頻無線手持麥克風組" })
    ).toBeInTheDocument();
    expect(screen.getByText("MICGO · 型號 MG-U200")).toBeInTheDocument();
    const tag = screen.getByTestId("category-tag");
    expect(tag).toHaveTextContent("無線麥克風");
    expect(tag).toHaveAttribute("href", "/wireless-micphone");
  });

  it("說明以保留換行的純文字呈現", () => {
    renderView(MULTI);
    expect(screen.getByRole("heading", { name: "商品說明" })).toBeInTheDocument();
    const paragraph = screen.getByText(/第一行/);
    expect(paragraph).toHaveClass("whitespace-pre-line");
    expect(paragraph.textContent).toContain("\n");
  });

  it("說明含 HTML 字樣時以字面文字呈現，不產生元素", () => {
    const { container } = renderView({ ...MULTI, description: "<b>粗體</b>" });
    expect(screen.getByText("<b>粗體</b>")).toBeInTheDocument();
    expect(container.querySelector("b")).toBeNull();
  });

  it("沒有說明時不顯示說明區", () => {
    renderView(SINGLE);
    expect(screen.queryByText("商品說明")).not.toBeInTheDocument();
  });

  it("有保固時規格表顯示保固，沒有保固時不顯示", () => {
    const { container, unmount } = renderView(MULTI);
    expect(specValue(container, "保固")).toBe("1 年");
    unmount();
    const single = renderView(SINGLE);
    expect(specTerms(single.container)).not.toContain("保固");
  });
});

describe("ProductDetailView 變體", () => {
  it("預設選中預設變體，顯示對應價格與 SKU", () => {
    const { container } = renderView(MULTI);
    expect(screen.getByRole("radiogroup", { name: "選擇規格" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")[0]).toBeChecked();
    // 預設變體無價：整個價格區塊不渲染
    expect(screen.queryByText("含稅")).toBeNull();
    expect(screen.queryByText(/這個商品沒有標價/)).toBeNull();
    expect(specValue(container, "SKU")).toBe("MG-U200-BK");
  });

  it("切換到有價格與變體圖的變體時同步更新價格、SKU 與主圖", async () => {
    const user = userEvent.setup();
    const { container } = renderView(MULTI);
    await user.click(screen.getAllByRole("radio")[1]);
    expect(screen.getByText("NT$12,345")).toBeInTheDocument();
    expect(screen.getByText("含稅")).toBeInTheDocument();
    expect(specValue(container, "SKU")).toBe("MG-U200-HS");
    expect(screen.getByRole("img", { name: MULTI.name })).toHaveAttribute("src", VARIANT_IMAGE);
  });

  it("切換到缺貨且無圖的變體時不顯示洽詢交期與有現貨，並回到商品圖", async () => {
    const user = userEvent.setup();
    renderView(MULTI);
    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getAllByRole("radio")[2]);
    expect(screen.queryByText("洽詢交期")).toBeNull();
    expect(screen.queryByText("有現貨")).toBeNull();
    expect(screen.getByRole("img", { name: MULTI.name })).toHaveAttribute("src", PRODUCT_IMAGE);
  });

  it("有現貨時顯示有現貨", () => {
    renderView(MULTI);
    expect(within(screen.getByTestId("stock-status")).getByText("有現貨")).toBeInTheDocument();
  });

  it("單一變體時不顯示選擇群組，規格表只有 SKU", () => {
    const { container } = renderView(SINGLE);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(specTerms(container)).toEqual(["SKU"]);
  });

  it("沒有變體時視為無價，規格表不含 SKU", () => {
    const { container } = renderView({ ...MULTI, variants: [], defaultVariantId: null });
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    // 無價時不顯示價格區塊，但詢價 CTA 仍在
    expect(screen.queryByText("含稅")).toBeNull();
    expect(screen.queryByText(/這個商品沒有標價/)).toBeNull();
    expect(screen.getByRole("button", { name: "複製詢價訊息" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `打電話問 ${CONTACT.phone}` })
    ).toBeInTheDocument();
    expect(specTerms(container)).not.toContain("SKU");
  });
});

describe("ProductDetailView 主圖與燈箱", () => {
  it("點主圖開啟燈箱，Esc 關閉後焦點回到主圖", async () => {
    const user = userEvent.setup();
    renderView(MULTI);
    const trigger = screen.getByRole("button", { name: `放大查看 ${MULTI.name} 圖片` });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "商品大圖" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("沒有任何圖片時顯示佔位圖，不是可點擊按鈕", () => {
    renderView({ ...SINGLE, imageUrl: null });
    expect(screen.getByRole("img", { name: "暫無圖片" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /放大查看/ })).not.toBeInTheDocument();
  });

  it("圖片載入失敗時改為佔位圖", () => {
    renderView(SINGLE);
    fireEvent.error(screen.getByRole("img", { name: SINGLE.name }));
    expect(screen.getByRole("img", { name: "暫無圖片" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /放大查看/ })).not.toBeInTheDocument();
  });
});

describe("ProductDetailView 導覽", () => {
  it("麵包屑依序連到首頁與分類頁，末項標示目前頁", () => {
    renderView(MULTI);
    const nav = within(screen.getByRole("navigation", { name: "麵包屑" }));
    expect(nav.getByRole("link", { name: "首頁" })).toHaveAttribute("href", "/");
    expect(nav.getByRole("link", { name: "無線麥克風" })).toHaveAttribute(
      "href",
      "/wireless-micphone"
    );
    expect(nav.getByText(MULTI.name)).toHaveAttribute("aria-current", "page");
  });

  it("直接開網址時返回連結指向所屬分類頁", () => {
    renderView(SINGLE);
    expect(screen.getByRole("link", { name: "← 回到擴大機 / 喇叭" })).toHaveAttribute(
      "href",
      "/trumpet"
    );
    expect(screen.queryByRole("button", { name: /回上一頁/ })).not.toBeInTheDocument();
  });

  it("站內進入時返回按鈕回到上一頁", async () => {
    const user = userEvent.setup();
    renderView(SINGLE, { entries: ["/trumpet", `/products/${SINGLE.id}`] });
    await user.click(screen.getByRole("button", { name: "← 回上一頁" }));
    expect(screen.getByText("喇叭列表")).toBeInTheDocument();
  });
});

describe("ProductDetailView 標題與複製", () => {
  it("分頁標題與 description 依商品設定，卸載後還原", () => {
    const { unmount } = renderView(MULTI);
    expect(document.title).toBe("UHF 雙頻無線手持麥克風組 | KRD");
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "第一行 第二行"
    );
    unmount();
    expect(document.title).toBe("KRD");
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });

  it("沒有說明時 description 以品牌與分類組成", () => {
    renderView(SINGLE);
    expect(document.title).toBe("BB1 | KRD");
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "MICGO 喇叭"
    );
  });

  it("行內複製按鈕轉接 onCopy 並反映複製狀態", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const { unmount } = renderView(MULTI, { onCopy });
    await user.click(screen.getByRole("button", { name: "複製詢價訊息" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    unmount();
    renderView(MULTI, { copyStatus: "copied" });
    expect(screen.getByRole("button", { name: "已複製" })).toBeInTheDocument();
  });
});
