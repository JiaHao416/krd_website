import type { ReactNode } from "react";
import type { ProductPagePath } from "../services/catalog";

/** 商品頁的 UI 設定（標題、描述、圖示） */
export interface ProductPageView {
  title: string;
  description: string;
  icon?: ReactNode;
}

// 麥克風圖示的 path，多個頁面共用
const MIC_PATH =
  "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z";

/** 建立頁首圖示 SVG（僅 path 不同） */
const makeIcon = (d: string) => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

/**
 * 路徑 → 頁面 UI 設定，key 與 services/catalog 的 PRODUCT_PAGES 以 path 對齊。
 * icon 是 JSX，所以放在 services 之外（services 不依賴 React）；Phase 3 導覽列會共用此份。
 * 型別為 Record<ProductPagePath, …>：PRODUCT_PAGES 新增路徑卻漏補設定時，tsc 直接報錯。
 */
export const PRODUCT_PAGE_VIEWS: Record<ProductPagePath, ProductPageView> = {
  "/all-products": {
    title: "所有商品",
    description: "瀏覽我們完整的產品系列，包含各種專業音響設備",
  },
  "/new-products": {
    title: "最新商品",
    description: "探索我們最新推出的音響產品，體驗最前沿的技術",
    icon: makeIcon(
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    ),
  },
  "/micgo-products": {
    title: "MICGO",
    description: "MICGO 系列專業麥克風，為您提供清晰純淨的音質體驗",
    icon: makeIcon(MIC_PATH),
  },
  "/krd-products": {
    title: "KRD",
    description: "KRD 系列音響設備，專業品質值得信賴",
    icon: makeIcon(MIC_PATH),
  },
  "/wired-micphone": {
    title: "有線麥克風",
    description: "專業有線麥克風系列，穩定可靠的音頻傳輸",
    icon: makeIcon(MIC_PATH),
  },
  "/wireless-micphone": {
    title: "無線麥克風",
    description: "自由無拘束的無線麥克風，讓您隨時隨地展現專業",
    icon: makeIcon(MIC_PATH),
  },
  "/trumpet": {
    title: "擴大機 / 喇叭",
    description: "高品質擴音設備，為您打造完美的音響體驗",
    icon: makeIcon(
      "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    ),
  },
  "/accessories": {
    title: "配件",
    description: "各種音響配件，完善您的專業音響系統",
    icon: makeIcon(
      "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    ),
  },
};
