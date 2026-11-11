import { describe, it, expect } from "vitest";
import { CONTACT, hasText, splitBusinessHours } from "./contact";

describe("CONTACT", () => {
  it("必填欄位與 UI-SPEC 完全一致", () => {
    expect(CONTACT).toMatchObject({
      address: "411 台中市太平區永平路二段320之1號",
      phone: "(04) 2279-8787",
      phoneHref: "04-22798787",
      businessHours: "週一至週五 09:00 - 17:30",
      closedNote: "見紅休（週六、週日及國定假日）",
    });
  });

  it("LINE 與 Email 尚未設定", () => {
    expect([CONTACT.lineUrl, CONTACT.email]).toEqual([undefined, undefined]);
  });
});

describe("hasText", () => {
  it("undefined、空字串、純空白皆視為沒有值", () => {
    expect([hasText(undefined), hasText(""), hasText("   ")]).toEqual([false, false, false]);
  });

  it("有內容時為 true", () => {
    expect(hasText("x")).toBe(true);
  });
});

describe("splitBusinessHours", () => {
  it("以第一個空白拆成日與時段；拆不出來時整句放第一行", () => {
    expect([
      splitBusinessHours("週一至週五 09:00 - 17:30"),
      splitBusinessHours("全年無休"),
    ]).toEqual([
      ["週一至週五", "09:00 - 17:30"],
      ["全年無休", ""],
    ]);
  });
});
