import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VariantSelector from "./VariantSelector";
import type { ProductVariant } from "../services/transform";

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

const VARIANTS: ProductVariant[] = [
  makeVariant({
    id: "v1",
    sku: "MG-U200-BK",
    attributes: [
      { key: "顏色", value: "黑色" },
      { key: "組合", value: "手持 ×2" },
    ],
    isDefault: true,
  }),
  makeVariant({ id: "v2", sku: "MG-U200-WH", attributes: [{ key: "顏色", value: "白色" }] }),
  makeVariant({
    id: "v3",
    sku: "MG-U200-RD",
    attributes: [{ key: "顏色", value: "紅色" }],
    inStock: false,
  }),
];

/** 受控 harness：以 state 持有選中的變體 */
const Harness = ({ variants }: { variants: ProductVariant[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(variants[0]?.id ?? null);
  return <VariantSelector variants={variants} selectedId={selectedId} onSelect={setSelectedId} />;
};

describe("VariantSelector", () => {
  it("0 個變體時不渲染任何東西", () => {
    const { container } = render(<Harness variants={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("1 個變體時不渲染選擇群組", () => {
    render(<Harness variants={[VARIANTS[0]]} />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("2 個以上變體時渲染群組、標題與對應數量的選項", () => {
    render(<Harness variants={VARIANTS} />);
    expect(screen.getByRole("radiogroup", { name: "選擇規格" })).toBeInTheDocument();
    expect(screen.getByText("選規格")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("預設選中者可 Tab 進入，其餘不在 Tab 順序內", () => {
    render(<Harness variants={VARIANTS} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  it("點擊第 2 個選項時切換選中", async () => {
    const user = userEvent.setup();
    render(<Harness variants={VARIANTS} />);
    await user.click(screen.getAllByRole("radio")[1]);
    expect(screen.getAllByRole("radio")[1]).toBeChecked();
  });

  it("向右與向下鍵選中下一個並移動焦點", async () => {
    const user = userEvent.setup();
    render(<Harness variants={VARIANTS} />);
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(radios[1]).toBeChecked();
    expect(radios[1]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(radios[2]).toBeChecked();
    expect(radios[2]).toHaveFocus();
  });

  it("向左與向上鍵在第一個時循環到最後一個", async () => {
    const user = userEvent.setup();
    render(<Harness variants={VARIANTS} />);
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(radios[2]).toBeChecked();
    expect(radios[2]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(radios[1]).toBeChecked();
    expect(radios[1]).toHaveFocus();
  });

  it("End 跳到最後一個、Home 跳回第一個", async () => {
    const user = userEvent.setup();
    render(<Harness variants={VARIANTS} />);
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.keyboard("{End}");
    expect(radios[2]).toBeChecked();
    expect(radios[2]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(radios[0]).toBeChecked();
    expect(radios[0]).toHaveFocus();
  });

  it("選項文字為屬性值組合，缺貨選項附洽詢交期", () => {
    render(<Harness variants={VARIANTS} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveTextContent("黑色 / 手持 ×2");
    expect(radios[0]).not.toHaveTextContent("洽詢交期");
    expect(radios[2]).toHaveTextContent("洽詢交期");
  });
});
