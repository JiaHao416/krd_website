import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SpecTable from "./SpecTable";

describe("SpecTable", () => {
  it("依序渲染每一列的名稱與值", () => {
    const { container } = render(
      <SpecTable
        rows={[
          { label: "SKU", value: "MG-U200-BK" },
          { label: "頻段", value: "UHF" },
          { label: "保固", value: "1 年" },
        ]}
      />
    );
    const terms = Array.from(container.querySelectorAll("dt")).map((el) => el.textContent);
    const details = Array.from(container.querySelectorAll("dd")).map((el) => el.textContent);
    expect(terms).toEqual(["SKU", "頻段", "保固"]);
    expect(details).toEqual(["MG-U200-BK", "UHF", "1 年"]);
  });

  it("沒有任何列時整區不渲染", () => {
    const { container } = render(<SpecTable rows={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("很長的 SKU 仍完整出現在值欄", () => {
    const longSku = "A1B2C3D4E5".repeat(6);
    const { container } = render(<SpecTable rows={[{ label: "SKU", value: longSku }]} />);
    expect(container.querySelector("dd")).toHaveTextContent(longSku);
  });
});
