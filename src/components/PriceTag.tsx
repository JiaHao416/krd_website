import type { Product } from "../services/transform";

interface PriceTagProps {
  product: Pick<Product, "priceMin" | "priceMax" | "priceText">;
  /** 供外層以 aria-labelledby 參照價格文字（選填） */
  id?: string;
}

/**
 * 商品卡片與便條卡共用的價格呈現。
 * 最低、最高價皆為 null 才視為無價（D-01），改顯示「價格請來電」標籤。
 */
const PriceTag = ({ product, id }: PriceTagProps) => {
  const isPriceOnRequest = product.priceMin === null && product.priceMax === null;

  if (isPriceOnRequest) {
    return (
      <span
        id={id}
        className="inline-flex items-center rounded-pill bg-block-2 px-4 py-1 text-label text-ink">
        價格請來電
      </span>
    );
  }

  return (
    <span id={id} className="text-body font-semibold text-ink">
      {product.priceText}
    </span>
  );
};

export default PriceTag;
