interface ProductCardSkeletonProps {
  variant: "grid" | "list";
}

// 骨架色塊共用 class：沙色底，使用者未要求減少動態時才閃爍
const BLOCK_CLASS = "bg-sand motion-safe:animate-pulse";

// 商品卡載入骨架：與 ProductCard 同尺寸，避免載入完成時版面跳動
const ProductCardSkeleton = ({ variant }: ProductCardSkeletonProps) => {
  if (variant === "list") {
    return (
      <div
        aria-hidden="true"
        data-testid="product-card-skeleton"
        className="flex items-center gap-4 rounded-card bg-surface-raised p-4"
      >
        <div
          className={`h-20 w-20 shrink-0 rounded-image md:h-24 md:w-24 ${BLOCK_CLASS}`}
        />
        <div className="min-w-0 flex-1">
          <div className={`h-4 w-3/4 rounded-pill ${BLOCK_CLASS}`} />
          <div className={`mt-2 h-4 w-1/2 rounded-pill ${BLOCK_CLASS}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-testid="product-card-skeleton"
      className="rounded-image bg-surface-raised p-2 md:rounded-card md:p-4"
    >
      <div className={`aspect-square rounded-image ${BLOCK_CLASS}`} />
      <div className={`mt-2 h-4 w-3/4 rounded-pill ${BLOCK_CLASS}`} />
      <div className={`mt-2 h-4 w-1/2 rounded-pill ${BLOCK_CLASS}`} />
    </div>
  );
};

export default ProductCardSkeleton;
