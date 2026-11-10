import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "./AboutPage";

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

  it("圖卡標題 h4 依序為 卡拉OK／KTV／酒店／PUB／遊覽車／維修", () => {
    renderPage();
    const titles = screen
      .getAllByRole("heading", { level: 4 })
      .map((el) => el.textContent)
      .filter((text) => EXPECTED.some(({ name }) => name === text));
    expect(titles).toEqual(EXPECTED.map(({ name }) => name));
  });

  it("不再顯示載入骨架", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll(".glass-card.animate-pulse")).toHaveLength(0);
  });
});
