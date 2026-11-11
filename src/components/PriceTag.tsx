import type { Product } from "../services/transform";
import { hasListedPrice } from "./price";

interface PriceTagProps {
  product: Pick<Product, "priceMin" | "priceMax" | "priceText">;
  /** 供外層以 aria-labelledby 參照價格文字（選填） */
  id?: string;
}

/**
 * 商品卡片與便條卡共用的價格呈現。
 * 最低、最高價皆為 null 才視為無價（D-01），無價時不渲染任何元素。
 */
const PriceTag = ({ product, id }: PriceTagProps) => {
  if (!hasListedPrice(product)) return null;

  return (
    <span id={id} className="text-body font-semibold text-ink">
      {product.priceText}
    </span>
  );
};

export default PriceTag;
