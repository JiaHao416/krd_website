import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { CONTACT } from "../config/contact";

/** 以真實 Layout 渲染全域 NotFound 頁 */
const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/whatever-404"]}>
      <NotFoundPage />
    </MemoryRouter>
  );

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

describe("NotFoundPage", () => {
  it("顯示找不到頁面的標題、說明與回到首頁連結", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "找不到這一頁" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("這個網址沒有東西，回到首頁重新逛逛吧。")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "回到首頁" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("分頁標題為找不到頁面，卸載後回到站名", () => {
    const { unmount } = renderPage();
    expect(document.title).toBe("找不到頁面 | KRD");
    unmount();
    expect(document.title).toBe("KRD");
  });

  it("頁尾為地址版", () => {
    renderPage();
    expect(
      screen.getByText(`© KRD・${CONTACT.address}・${CONTACT.businessHours}`)
    ).toBeInTheDocument();
  });
});
