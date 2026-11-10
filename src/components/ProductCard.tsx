import { useState } from "react";
import type { KeyboardEvent } from "react";
import ImagePlaceholder from "./ImagePlaceholder";
import { PRICE_ON_REQUEST } from "../services/format";
import type { Product } from "../services/transform";

interface ProductCardProps {
  product: Product;
  variant: "grid" | "list";
  onImageClick: (imageUrl: string) => void;
}

// 商品卡片：grid／list 兩種版型，只依 Product 型別，不含資料抓取
const ProductCard = ({ product, variant, onImageClick }: ProductCardProps) => {
  // 記錄載入失敗的網址；換成新網址時自動重新嘗試
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  // 與 formatPriceRange 語意一致：只要有顯示價格文字（含只有 priceMax）就算有價
  const hasPrice = product.priceText !== PRICE_ON_REQUEST;
  const showImage =
    product.imageUrl !== null && product.imageUrl !== failedImageUrl;

  const handleClick = () => {
    if (product.imageUrl !== null) onImageClick(product.imageUrl);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const handleImageError = () => setFailedImageUrl(product.imageUrl);

  // 有圖才可用滑鼠與鍵盤開燈箱
  const interactiveProps = showImage
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": `查看 ${product.name} 大圖`,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
      }
    : {};

  // 價格行間距：grid 卡片高度固定，縮為 mb-1；list 維持 mb-2
  const priceMarginClass = variant === "grid" ? "mb-1" : "mb-2";

  // 價格行：有價用 accent 色，無價低調灰色
  const priceLine = (
    <p
      className={`text-sm ${priceMarginClass} ${
        hasPrice ? "font-semibold text-blue-400" : "text-gray-500"
      }`}
    >
      {product.priceText}
    </p>
  );

  if (variant === "list") {
    return (
      <div
        {...interactiveProps}
        className={`glass-card overflow-hidden p-6 hover:border-blue-500/50 transition-all duration-300 group ${
          showImage ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex-shrink-0">
            {showImage ? (
              <img
                src={product.imageUrl as string}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                draggable={false}
              />
            ) : (
              <ImagePlaceholder size="sm" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            {priceLine}
            {product.description && (
              <p
                data-testid="product-description"
                className="text-gray-400 text-sm mb-3 line-clamp-2"
              >
                {product.description}
              </p>
            )}
          </div>
          {showImage && (
            <div className="flex items-center space-x-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm">查看大圖</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...interactiveProps}
      className={`group ${showImage ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* 固定高度的產品卡片 */}
      <div className="product-card-new h-96 flex flex-col">
        {/* 價格徽章：只在有價時顯示 */}
        {hasPrice && <div className="product-badge">{product.priceText}</div>}

        {/* 產品圖片 - 固定高度 */}
        <div className="product-image-container flex-shrink-0 h-64">
          {showImage ? (
            <img
              src={product.imageUrl as string}
              alt={product.name}
              onError={handleImageError}
              className="product-image"
              draggable={false}
            />
          ) : (
            <ImagePlaceholder />
          )}

          {/* 懸停遮罩和放大鏡（缺圖時不顯示） */}
          {showImage && (
            <div className="product-overlay">
              <div className="zoom-icon">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 產品信息 - 剩餘空間
            grid 卡片固定 h-96，縮小資訊區垂直內距、價格間距並把描述縮為一行，
            避免底部提示列被裁（02-UAT 第 3 項、02-UI-SPEC 縮減方案） */}
        <div className="product-info py-4 px-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="product-title text-base leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            {priceLine}
            {product.description && (
              <p
                data-testid="product-description"
                className="text-gray-400 text-xs line-clamp-1 leading-relaxed"
              >
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-xs text-gray-500">
              {showImage ? "點擊查看大圖" : ""}
            </div>
            <svg
              className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
