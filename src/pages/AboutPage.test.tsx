import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "./AboutPage";
import { CONTACT } from "../config/contact";

// Layout 內有導覽元件，測試一律以假元件取代
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const EXPECTED = [
  { name: "卡拉OK", src: "/abouts/karaoke.png" },
  { name: "KTV", src: "/abouts/ktv.png" },
  { name: "酒店", src: "/abouts/hotel.png" },
  { name: "PUB", src: "/abouts/pub.png" },
  { name: "遊覽車", src: "/abouts/bus.png" },
  { name: "維修", src: "/abouts/repair.png" },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );
}

describe("AboutPage 服務圖卡", () => {
  it("首屏同步顯示 6 張圖卡，圖片 src 為 /abouts/*.png 且順序正確", () => {
    renderPage();
    const sources = EXPECTED.map(({ name }) =>
      screen.getByAltText(name).getAttribute("src")
    );
    expect(sources).toEqual(EXPECTED.map(({ src }) => src));
  });

  it("圖卡標題 h3 依序為 卡拉OK／KTV／酒店／PUB／遊覽車／維修", () => {
    renderPage();
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((el) => el.textContent)
      .filter((text) => EXPECTED.some(({ name }) => name === text));
    expect(titles).toEqual(EXPECTED.map(({ name }) => name));
  });

  it("不再顯示載入骨架", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(0);
  });
});

describe("AboutPage 版面與聯絡資訊", () => {
  it("h1 為關於我們", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "關於我們" })
    ).toBeInTheDocument();
  });

  it("聯絡區顯示 CONTACT.address 與營業時間", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "有空來店裡坐坐" })
    ).toBeInTheDocument();
    expect(screen.getByText(CONTACT.address)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.businessHours, { exact: false })).toBeInTheDocument();
  });

  it("不含舊電話格式 (04) 22798787", () => {
    renderPage();
    expect(screen.queryByText(/\(04\) 22798787/)).toBeNull();
  });
});
