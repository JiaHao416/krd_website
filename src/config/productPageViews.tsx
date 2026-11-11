import type { ProductPagePath } from "../services/catalog";

/** 商品頁的 UI 設定（標題、描述） */
export interface ProductPageView {
  title: string;
  description: string;
}

/**
 * 路徑 → 頁面 UI 設定，key 與 services/catalog 的 PRODUCT_PAGES 以 path 對齊。
 * 呈現用文案放在 services 之外，導覽列（NAV_ITEMS）共用此份。
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
  },
  "/micgo-products": {
    title: "MICGO",
    description: "MICGO 系列專業麥克風，為您提供清晰純淨的音質體驗",
  },
  "/krd-products": {
    title: "KRD",
    description: "KRD 系列音響設備，專業品質值得信賴",
  },
  "/wired-micphone": {
    title: "有線麥克風",
    description: "專業有線麥克風系列，穩定可靠的音頻傳輸",
  },
  "/wireless-micphone": {
    title: "無線麥克風",
    description: "自由無拘束的無線麥克風，讓您隨時隨地展現專業",
  },
  "/trumpet": {
    title: "擴大機 / 喇叭",
    description: "高品質擴音設備，為您打造完美的音響體驗",
  },
  "/accessories": {
    title: "配件",
    description: "各種音響配件，完善您的專業音響系統",
  },
};
