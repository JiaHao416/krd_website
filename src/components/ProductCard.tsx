import { useId, useState } from "react";
import { Link } from "react-router-dom";
import ImagePlaceholder from "./ImagePlaceholder";
import PriceTag from "./PriceTag";
import { ChevronRightIcon } from "./icons";
import type { Product } from "../services/transform";

interface ProductCardProps {
  product: Product;
  variant: "grid" | "list";
  /** 在列表中的位置，只用來挑 grid 卡的傾斜角度 */
  index?: number;
}

// grid 卡依位置輪流傾斜（UI-SPEC ±0.4–0.8deg）；用靜態陣列讓 Tailwind 掃得到 class
const CARD_TILTS = [
  "-rotate-[0.8deg]",
  "rotate-[0.6deg]",
  "-rotate-[0.4deg]",
  "rotate-[0.8deg]",
] as const;

// 「洽詢交期」標籤：只在沒有現貨時顯示
const LEAD_TIME_TAG_CLASS =
  "inline-flex items-center rounded-pill bg-block-3 px-4 py-1 text-label text-ink";

// 商品卡片：grid／list 兩種版型，整張卡為連到詳情頁的單一連結；只依 Product 型別，不含資料抓取
const ProductCard = ({
  product,
  variant,
  index = 0,
}: ProductCardProps) => {
  // 記錄載入失敗的網址；換成新網址時自動重新嘗試
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const showImage =
    product.imageUrl !== null && product.imageUrl !== failedImageUrl;

  const handleImageError = () => setFailedImageUrl(product.imageUrl);

  // 連結名稱只取商品名稱與價格文字，避免圖片 alt、「暫無圖片」佔位與描述併入名稱（WR-01／WR-02）
  const nameId = useId();
  const priceId = useId();
  const leadTimeId = useId();
  const descId = useId();
  // 缺貨標籤與 list 描述改作補充說明（aria-describedby），讀屏仍可取得
  const descriptionIds: string[] = [];
  if (!product.inStock) descriptionIds.push(leadTimeId);
  if (variant === "list" && product.description) descriptionIds.push(descId);
  const describedBy =
    descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined;
  const linkA11yProps = {
    "aria-labelledby": `${nameId} ${priceId}`,
    "aria-describedby": describedBy,
  };

  // 圖片區：有圖顯示 img，缺圖或破圖顯示佔位
  const imageContent = showImage ? (
    <img
      src={product.imageUrl as string}
      alt={product.name}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain"
      draggable={false}
    />
  ) : (
    <ImagePlaceholder size={variant === "list" ? "sm" : "lg"} />
  );

  // 標籤列：價格（文字或「價格請來電」）＋缺貨時的「洽詢交期」
  const tagRow = (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <PriceTag product={product} id={priceId} />
      {!product.inStock && (
        <span id={leadTimeId} className={LEAD_TIME_TAG_CLASS}>
          洽詢交期
        </span>
      )}
    </div>
  );

  const brandLine = product.brand && (
    <p className="mt-1 text-label text-ink-muted">{product.brand}</p>
  );

  const detailPath = `/products/${product.id}`;

  if (variant === "list") {
    return (
      <Link
        to={detailPath}
        {...linkA11yProps}
        className="flex items-center gap-4 rounded-card bg-surface-raised p-4 shadow-card transition-colors duration-150 hover:ring-2 hover:ring-inset hover:ring-accent"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-image bg-white md:h-24 md:w-24">
          {imageContent}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            id={nameId}
            className="line-clamp-2 text-body font-semibold leading-card text-ink"
          >
            {product.name}
          </h3>
          {brandLine}
          {tagRow}
          {product.description && (
            <p
              id={descId}
              data-testid="product-description"
              className="mt-1 line-clamp-2 text-label text-ink-muted"
            >
              {product.description}
            </p>
          )}
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
      </Link>
    );
  }

  return (
    <Link
      to={detailPath}
      {...linkA11yProps}
      className={`block h-full rounded-image bg-surface-raised p-2 shadow-card-sm transition-colors duration-150 hover:ring-2 hover:ring-inset hover:ring-accent active:ring-2 active:ring-inset active:ring-accent md:rounded-card md:p-4 md:shadow-card ${
        CARD_TILTS[index % CARD_TILTS.length]
      }`}
    >
      {/* 正方形白底圖片容器，載入前後尺寸不變 */}
      <div className="aspect-square w-full overflow-hidden rounded-image bg-white">
        {imageContent}
      </div>
      {product.brand && (
        <p className="mt-2 text-label text-ink-muted">{product.brand}</p>
      )}
      <h3
        id={nameId}
        className="mt-1 line-clamp-2 min-h-[44px] text-body font-semibold leading-card text-ink md:min-h-[48px]">
        {product.name}
      </h3>
      {tagRow}
    </Link>
  );
};

export default ProductCard;
