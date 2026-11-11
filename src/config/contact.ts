// 聯絡資訊單一來源（首頁聯絡區、頂列、固定撥號列、頁尾、關於我們、Phase 9 詳情 CTA）
// 只放店家公開資訊，無任何憑證

/** 店面照片 */
export interface StorePhoto {
  /** 圖片路徑（public/ 下，如 /store/storefront.webp） */
  src: string;
  /** 替代文字（中文） */
  alt: string;
  /** 原檔寬度（像素），用於預留版位避免 CLS */
  width: number;
  /** 原檔高度（像素），用於預留版位避免 CLS */
  height: number;
}

/** 店家聯絡資訊 */
export interface ContactInfo {
  /** 地址（必填） */
  address: string;
  /** 顯示用電話（必填） */
  phone: string;
  /** tel: 連結用電話（必填，純數字與連字號） */
  phoneHref: string;
  /** 營業時間主行（必填） */
  businessHours: string;
  /** 休息日備註（必填） */
  closedNote: string;
  /** LINE 連結（選填，有值才顯示） */
  lineUrl?: string;
  /** Email（選填，有值才顯示） */
  email?: string;
  /** Google 地圖嵌入 iframe 網址（選填，免金鑰；有值才嵌入，否則顯示地圖預留位） */
  mapEmbedUrl?: string;
  /** 在 Google 地圖開啟店家頁的連結（選填，有值才顯示文字連結） */
  mapUrl?: string;
  /** 店面照片（選填，有內容才在聯絡區顯示） */
  storePhotos?: readonly StorePhoto[];
}

/**
 * KRD 聯絡資訊；LINE 與 Email 尚未提供，故不設定（D-15）
 * 地圖網址也在此單一來源組出（含地址），皆為免金鑰公開網址
 */
export const CONTACT: ContactInfo = {
  address: "411 台中市太平區永平路二段320之1號",
  phone: "(04) 2279-8787",
  phoneHref: "04-22798787",
  businessHours: "週一至週五 09:00 - 18:00",
  closedNote: "見紅休（週六、週日及國定假日）",
  mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent("羽程企業社 台中市太平區永平路二段320之1號")}&z=17&output=embed`,
  mapUrl: "https://maps.google.com/?cid=17247239004730587373",
  storePhotos: [
    { src: "/store/storefront.webp", alt: "店面外觀", width: 1200, height: 900 },
    { src: "/store/entrance.webp", alt: "正門與招牌", width: 1200, height: 939 },
    { src: "/store/screen.webp", alt: "門口屏風", width: 1200, height: 900 },
  ],
};

/**
 * 選填欄位是否有值（undefined、空字串、純空白都視為沒有）
 * @param value - 欄位值
 * @returns 是否為非空白字串
 */
export function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 營業中戳章用：以第一個空白拆成「日」與「時段」兩行；拆不出來時整句放第一行
 * @param hours - 營業時間主行
 * @returns [第一行, 第二行]
 */
export function splitBusinessHours(hours: string): [string, string] {
  const index = hours.indexOf(" ");
  return index === -1 ? [hours, ""] : [hours.slice(0, index), hours.slice(index + 1)];
}
