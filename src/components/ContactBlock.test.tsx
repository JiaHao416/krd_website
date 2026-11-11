import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactBlock from "./ContactBlock";
import { CONTACT } from "../config/contact";

describe("ContactBlock", () => {
  it("顯示標題「有空來店裡坐坐」、地址與 Google 地圖嵌入", () => {
    render(<ContactBlock />);
    expect(
      screen.getByRole("heading", { level: 2, name: "有空來店裡坐坐" })
    ).toBeInTheDocument();
    expect(screen.getByText(CONTACT.address)).toBeInTheDocument();
    const map = screen.getByTitle("羽程企業社 Google 地圖");
    expect(map.tagName).toBe("IFRAME");
    expect(map).toHaveAttribute("src", CONTACT.mapEmbedUrl);
    expect(map).toHaveAttribute("loading", "lazy");
    expect(map).toHaveAttribute("referrerpolicy", "no-referrer-when-downgrade");
    expect(screen.queryByRole("img", { name: "地圖（待嵌入）" })).toBeNull();
  });

  it("「在 Google 地圖開啟 →」連結指向 mapUrl，開新分頁並防 tabnabbing", () => {
    render(<ContactBlock />);
    const link = screen.getByRole("link", { name: "在 Google 地圖開啟 →" });
    expect(link).toHaveAttribute("href", CONTACT.mapUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("未設定 mapEmbedUrl 與 mapUrl 時退回地圖預留位，且不渲染 iframe 與開啟連結", () => {
    const { container } = render(
      <ContactBlock info={{ ...CONTACT, mapEmbedUrl: undefined, mapUrl: undefined }} />
    );
    expect(screen.getByRole("img", { name: "地圖（待嵌入）" })).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.queryByRole("link", { name: /在 Google 地圖開啟/ })).toBeNull();
  });

  it("mapEmbedUrl 為純空白時也退回地圖預留位", () => {
    const { container } = render(
      <ContactBlock info={{ ...CONTACT, mapEmbedUrl: "   " }} />
    );
    expect(screen.getByRole("img", { name: "地圖（待嵌入）" })).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("顯示營業時間與休息備註", () => {
    render(<ContactBlock />);
    expect(screen.getByText(/週一至週五 09:00 - 18:00/)).toBeInTheDocument();
    expect(screen.getByText(/見紅休（週六、週日及國定假日）/)).toBeInTheDocument();
  });

  it("休息備註自帶括號，不再外包一層（不出現雙層括號）", () => {
    const { container } = render(<ContactBlock />);
    expect(container.textContent).not.toContain("（見紅休");
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
