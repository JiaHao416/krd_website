import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import { fetchProducts } from "../services/products";

// 以假元件取代 Layout，專注測 hero 區
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../services/products");
// 模擬尚未設定店面照片的聯絡資訊
vi.mock("../config/contact", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/contact")>();
  return { ...actual, CONTACT: { ...actual.CONTACT, storePhotos: undefined } };
});

describe("HomePage hero 店面照片 fallback", () => {
  it("未設定 storePhotos 時 hero 退回店面照片預留位", async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ items: [], total: 0, truncated: false });
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await screen.findAllByText("目前沒有精選商品");
    expect(screen.getByRole("img", { name: "店面照片（待提供）" })).toBeInTheDocument();
  });
});
