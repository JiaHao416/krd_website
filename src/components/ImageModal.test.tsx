import { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageModal from "./ImageModal";

/** 模擬商品卡：點擊後開啟燈箱，供驗證焦點還原 */
const Harness = () => {
  const [show, setShow] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setShow(true)}>
        商品卡
      </button>
      <ImageModal show={show} onHide={() => setShow(false)} img="/a.png" />
      {/* 燈箱後方仍可聚焦的元素（如手機撥號列） */}
      <button type="button">撥號列</button>
    </>
  );
};

describe("ImageModal 對話框語意與焦點", () => {
  it("開啟時為具名稱的 modal 對話框", async () => {
    render(<Harness />);
    await userEvent.setup().click(screen.getByRole("button", { name: "商品卡" }));
    const dialog = screen.getByRole("dialog", { name: "商品大圖" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("開啟後焦點移到關閉圖片按鈕", async () => {
    render(<Harness />);
    await userEvent.setup().click(screen.getByRole("button", { name: "商品卡" }));
    expect(screen.getByRole("button", { name: "關閉圖片" })).toHaveFocus();
  });

  it("按 Tab 焦點不會離開燈箱", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "商品卡" }));
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "關閉圖片" })).toHaveFocus();
  });

  it("按 Esc 關閉後焦點回到觸發的商品卡", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "商品卡" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
