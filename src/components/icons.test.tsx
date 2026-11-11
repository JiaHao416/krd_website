import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  PhoneIcon,
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertIcon,
  WiredMicIcon,
  WirelessMicIcon,
  SpeakerIcon,
  AccessoryIcon,
} from "./icons";

const ICONS = [
  ["PhoneIcon", PhoneIcon],
  ["MenuIcon", MenuIcon],
  ["CloseIcon", CloseIcon],
  ["ChevronLeftIcon", ChevronLeftIcon],
  ["ChevronRightIcon", ChevronRightIcon],
  ["AlertIcon", AlertIcon],
  ["WiredMicIcon", WiredMicIcon],
  ["WirelessMicIcon", WirelessMicIcon],
  ["SpeakerIcon", SpeakerIcon],
  ["AccessoryIcon", AccessoryIcon],
] as const;

describe("icons", () => {
  // 圖示純裝飾：對輔助科技隱藏、顏色跟隨文字、接受外部 className
  it.each(ICONS)("%s 為裝飾用 svg 且顏色跟隨 currentColor", (_name, Icon) => {
    const { container } = render(<Icon className="h-6 w-6" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveClass("h-6", "w-6");
  });
});
