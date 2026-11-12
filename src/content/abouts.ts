/** 關於我們頁服務圖卡的資料結構 */
export interface AboutService {
  name: string;
  image: string;
}

/** 關於我們頁服務圖卡；圖片存放於 public/abouts/，順序即顯示順序；圖片為 512x512 WebP，自帶 surface 深色底 */
export const ABOUT_SERVICES: readonly AboutService[] = [
  { name: "卡拉OK", image: "/abouts/karaoke.webp" },
  { name: "KTV", image: "/abouts/ktv.webp" },
  { name: "酒店", image: "/abouts/hotel.webp" },
  { name: "PUB", image: "/abouts/pub.webp" },
  { name: "遊覽車", image: "/abouts/bus.webp" },
  { name: "維修", image: "/abouts/repair.webp" },
];
