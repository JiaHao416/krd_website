import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import type { ContactInfo } from "../config/contact";

/** 注入用假聯絡資訊 */
const FAKE_INFO: ContactInfo = {
  address: "測試地址",
  phone: "(02) 1234-5678",
  phoneHref: "02-12345678",
  businessHours: "每天 10:00",
  closedNote: "不休息",
};

describe("Footer", () => {
  it("thanks 變體顯示感謝文案", () => {
    render(<Footer variant="thanks" />);
    expect(screen.getByText("© KRD・謝謝你逛到這裡")).toBeInTheDocument();
  });

  it("address 變體預設顯示 CONTACT 的地址與營業時間", () => {
    render(<Footer variant="address" />);
    expect(
      screen.getByText(
        "© KRD・411 台中市太平區永平路二段320之1號・週一至週六 09:00 - 17:30"
      )
    ).toBeInTheDocument();
  });

  it("address 變體使用注入的聯絡資訊", () => {
    render(<Footer variant="address" info={FAKE_INFO} />);
    expect(
      screen.getByText("© KRD・測試地址・每天 10:00")
    ).toBeInTheDocument();
  });
});
