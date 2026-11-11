import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactBlock from "./ContactBlock";
import { CONTACT } from "../config/contact";

describe("ContactBlock", () => {
  it("顯示標題「有空來店裡坐坐」、地址與地圖預留位", () => {
    render(<ContactBlock />);
    expect(
      screen.getByRole("heading", { level: 2, name: "有空來店裡坐坐" })
    ).toBeInTheDocument();
    expect(screen.getByText(CONTACT.address)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "地圖（待嵌入）" })
    ).toBeInTheDocument();
  });

  it("顯示營業時間與休息備註", () => {
    render(<ContactBlock />);
    expect(screen.getByText(/週一至週六 09:00 - 17:30/)).toBeInTheDocument();
    expect(screen.getByText(/週日及國定假日休息/)).toBeInTheDocument();
  });

  it("電話連結名稱為顯示電話、href 為 tel:", () => {
    render(<ContactBlock />);
    expect(
      screen.getByRole("link", { name: "(04) 2279-8787" })
    ).toHaveAttribute("href", "tel:04-22798787");
  });

  it("預設未設定 LINE 與 Email 時不渲染兩者連結", () => {
    const { container } = render(<ContactBlock />);
    expect(screen.queryByRole("link", { name: /LINE/ })).toBeNull();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("注入 LINE 與 Email 時渲染連結，LINE 開新分頁並防 tabnabbing", () => {
    render(
      <ContactBlock
        info={{
          ...CONTACT,
          lineUrl: "https://line.me/ti/p/test",
          email: "shop@example.com",
        }}
      />
    );
    const line = screen.getByRole("link", { name: "LINE" });
    expect(line).toHaveAttribute("href", "https://line.me/ti/p/test");
    expect(line).toHaveAttribute("target", "_blank");
    expect(line).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.getByRole("link", { name: "shop@example.com" })
    ).toHaveAttribute("href", "mailto:shop@example.com");
  });

  it("LINE 與 Email 為空字串或純空白時不渲染", () => {
    const { container } = render(
      <ContactBlock info={{ ...CONTACT, lineUrl: "", email: "   " }} />
    );
    expect(screen.queryByRole("link", { name: /LINE/ })).toBeNull();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
