import { PRODUCT_PAGES } from "../services/catalog";
import type { ProductPagePath } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

/** 導覽項目 */
export interface NavItem {
  path: ProductPagePath;
  title: string;
}

/**
 * 導覽選單清單：由商品頁設定衍生，不另外維護第二份。
 * 「商店介紹」(/abouts) 不在此清單，維持寫死在 NavBar（D-03）。
 */
export const NAV_ITEMS: readonly NavItem[] = PRODUCT_PAGES.map((page) => ({
  path: page.path,
  title: PRODUCT_PAGE_VIEWS[page.path].title,
}));
