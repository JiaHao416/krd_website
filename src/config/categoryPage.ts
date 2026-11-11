import { PRODUCT_PAGES } from "../services/catalog";
import { PRODUCT_PAGE_VIEWS } from "./productPageViews";

/** 分類頁連結：路徑與顯示標題 */
export interface CategoryPageLink {
  path: string;
  title: string;
}

/** 找不到對應分類頁時的退回目標（所有商品） */
const FALLBACK: CategoryPageLink = {
  path: "/all-products",
  title: PRODUCT_PAGE_VIEWS["/all-products"].title,
};

/**
 * 由後端商品分類名稱反查站內分類頁，供麵包屑、分類標籤與返回連結使用。
 * 只比對商品頁設定中的分類條件（品牌頁沒有分類條件，不會被比對到）。
 * @param category - 後端回傳的商品分類名稱
 * @returns 對應分類頁的路徑與標題；找不到時為所有商品頁
 */
export function findCategoryPage(category: string): CategoryPageLink {
  const page = PRODUCT_PAGES.find((item) => item.query.category === category);
  if (!page) return FALLBACK;
  return { path: page.path, title: PRODUCT_PAGE_VIEWS[page.path].title };
}
