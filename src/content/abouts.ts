/** 關於我們頁服務圖卡的資料結構 */
export interface AboutService {
  name: string;
  image: string;
}

/** 關於我們頁服務圖卡；圖片存放於 public/abouts/，順序即顯示順序 */
export const ABOUT_SERVICES: readonly AboutService[] = [
  { name: "卡拉OK", image: "/abouts/karaoke.png" },
  { name: "KTV", image: "/abouts/ktv.png" },
  { name: "酒店", image: "/abouts/hotel.png" },
  { name: "PUB", image: "/abouts/pub.png" },
  { name: "遊覽車", image: "/abouts/bus.png" },
  { name: "維修", image: "/abouts/repair.png" },
];
