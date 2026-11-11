import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailCta from "./DetailCta";
import { CONTACT } from "../config/contact";

describe("DetailCta", () => {
  it("主按鈕撥打店家電話", () => {
    render(<DetailCta status="idle" onCopy={vi.fn()} />);
    expect(
      screen.getByRole("link", { name: `打電話問 ${CONTACT.phone}` })
    ).toHaveAttribute("href", `tel:${CONTACT.phoneHref}`);
  });

  it("閒置時顯示複製詢價訊息，點擊呼叫 onCopy 一次", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<DetailCta status="idle" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "複製詢價訊息" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("複製成功時按鈕顯示已複製", () => {
    render(<DetailCta status="copied" onCopy={vi.fn()} />);
    expect(screen.getByRole("button", { name: "已複製" })).toBeInTheDocument();
  });

  it("複製失敗時顯示危險色提示", () => {
    render(<DetailCta status="failed" onCopy={vi.fn()} />);
    expect(screen.getByText("複製失敗，請手動選取網址")).toHaveClass("text-danger");
  });

  it("閒置時已有 polite 即時區域包住複製按鈕", () => {
    const { container } = render(<DetailCta status="idle" onCopy={vi.fn()} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toContainElement(screen.getByRole("button", { name: "複製詢價訊息" }));
  });

  it("沒有 LINE 連結時不顯示 LINE 按鈕", () => {
    render(<DetailCta status="idle" onCopy={vi.fn()} />);
    expect(screen.queryByRole("link", { name: "LINE 問問" })).not.toBeInTheDocument();
  });

  it("有 LINE 連結時以新分頁安全開啟", () => {
    render(
      <DetailCta
        status="idle"
        onCopy={vi.fn()}
        info={{ ...CONTACT, lineUrl: "https://line.me/ti/p/test" }}
      />
    );
    const link = screen.getByRole("link", { name: "LINE 問問" });
    expect(link).toHaveAttribute("href", "https://line.me/ti/p/test");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
