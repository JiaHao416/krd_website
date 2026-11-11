import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";

/** chip 共用樣式：高 44、左右 16 */
const CHIP_BASE =
  "inline-flex h-11 items-center rounded-pill px-4 text-body transition-colors duration-150";
/** 目前頁 chip 樣式 */
const CHIP_ACTIVE = `${CHIP_BASE} bg-accent font-semibold text-accent-ink`;
/** 其他 chip 樣式 */
const CHIP_IDLE = `${CHIP_BASE} border border-dash bg-surface-raised text-ink hover:border-accent`;

/** 列表頁分類 chip 列：順序取自 NAV_ITEMS；base 單列橫捲出血，md 起換行 */
const CategoryChips = () => {
  const { pathname } = useLocation();

  return (
    <nav aria-label="商品分類">
      {/* py-2 讓焦點環不被 overflow-x-auto 裁切，也避免捲軸遮擋 chip */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto whitespace-nowrap px-4 py-2 md:mx-0 md:flex-wrap md:overflow-visible md:whitespace-normal md:px-0">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === pathname;
          return (
            <li key={item.path} className="shrink-0">
              <Link
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? CHIP_ACTIVE : CHIP_IDLE}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryChips;
