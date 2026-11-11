import { describe, it, expect } from "vitest";
import { CONTACT, hasText, splitBusinessHours } from "./contact";

describe("CONTACT", () => {
  it("必填欄位與 UI-SPEC 完全一致", () => {
    expect(CONTACT).toMatchObject({
      address: "411 台中市太平區永平路二段320之1號",
      phone: "(04) 2279-8787",
      phoneHref: "04-22798787",
      businessHours: "週一至週五 09:00 - 18:00",
      closedNote: "見紅休（週六、週日及國定假日）",
    });
  });

  it("mapEmbedUrl 為羽程企業社的免金鑰 Google 地圖嵌入網址", () => {
    expect(CONTACT.mapEmbedUrl).toBe(
      `https://maps.google.com/maps?q=${encodeURIComponent("羽程企業社 台中市太平區永平路二段320之1號")}&z=17&output=embed`
    );
  });

  it("mapUrl 為 Google 地圖店家頁連結", () => {
    expect(CONTACT.mapUrl).toBe("https://maps.google.com/?cid=17247239004730587373");
  });

  it("storePhotos 依序為店面外觀、正門與招牌、門口屏風", () => {
    expect(CONTACT.storePhotos).toEqual([
      { src: "/store/storefront.webp", alt: "店面外觀", width: 1200, height: 900 },
      { src: "/store/entrance.webp", alt: "正門與招牌", width: 1200, height: 939 },
      { src: "/store/screen.webp", alt: "門口屏風", width: 1200, height: 900 },
    ]);
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
      splitBusinessHours("週一至週五 09:00 - 18:00"),
      splitBusinessHours("全年無休"),
    ]).toEqual([
      ["週一至週五", "09:00 - 18:00"],
      ["全年無休", ""],
    ]);
  });
});
