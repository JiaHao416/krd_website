import { useEffect, useRef, useState } from "react";
import type { UseProductsResult } from "../hooks/useProducts";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import ImagePlaceholder from "./ImagePlaceholder";
import { getErrorMessage } from "../services/errors";

interface FeaturedCarouselProps {
  result: UseProductsResult;
  accent: "blue" | "purple";
  intervalMs: number;
}

// accent 對應的完整 class 字串，必須寫成靜態字串才不會被 Tailwind purge
const ACCENT_CLASSES = {
  blue: {
    overlay: "from-blue-500/30",
    dot: "from-blue-500",
    icon: "text-blue-400",
  },
  purple: {
    overlay: "from-purple-500/30",
    dot: "from-purple-500",
    icon: "text-purple-400",
  },
} as const;

// 單組熱銷輪播：自行管理目前投影片與自動播放
const FeaturedCarousel = ({
  result,
  accent,
  intervalMs,
}: FeaturedCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // 記錄載入失敗的圖片網址；換成其他網址時自動重新嘗試（比照 ProductCard）
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const { items, status } = result;

  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  // 記錄指標（滑鼠／觸控）按下中；此期間的 focus 來自點擊而非鍵盤，不應暫停，
  // 否則點完箭頭後焦點留在按鈕上，自動播放會一直停住
  const isPointerDownRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  // 減少動態偏好、滑鼠停留、焦點在輪播內時都不自動切換（WCAG 2.2.2）
  const isPaused = prefersReducedMotion || isHovered || hasFocusWithin;

  // 只有成功、多於一筆且未暫停時才自動播放；
  // 每次切換（自動或手動）都會因 currentSlide 改變而重新計時
  useEffect(() => {
    if (status !== "success" || items.length <= 1 || isPaused) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [status, items.length, intervalMs, isPaused, currentSlide]);

  // 非成功輪播的狀態共用同一個框，尺寸與成功狀態一致，避免兩組左右失衡
  const stateBoxClass =
    "aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center";

  if (status === "error") {
    return (
      <div className={stateBoxClass}>
        <div role="alert" className="text-center px-6">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-300 text-base">
            {getErrorMessage(result.error)}
          </p>
          <button
            type="button"
            onClick={result.retry}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-6 py-2 min-h-[44px] rounded-full transition-colors focus-visible:ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (status === "success" && items.length === 0) {
    return (
      <div className={stateBoxClass}>
        <div className="text-center">
          <svg
            className={`w-12 h-12 mx-auto mb-3 ${ACCENT_CLASSES[accent].icon}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-400 text-base">目前沒有精選商品</p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className={stateBoxClass}>
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-white/10 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">載入產品中...</p>
        </div>
      </div>
    );
  }

  // 商品數變少時避免索引越界
  const activeIndex = currentSlide % items.length;
  const product = items[activeIndex];
  const accentClasses = ACCENT_CLASSES[accent];
  const showControls = items.length > 1;

  const goPrev = () =>
    setCurrentSlide((activeIndex - 1 + items.length) % items.length);
  const goNext = () => setCurrentSlide((activeIndex + 1) % items.length);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={() => {
        isPointerDownRef.current = true;
      }}
      onPointerUp={() => {
        isPointerDownRef.current = false;
      }}
      onFocus={() => {
        // 只有鍵盤等非指標操作帶來的焦點才暫停
        if (!isPointerDownRef.current) setHasFocusWithin(true);
        isPointerDownRef.current = false;
      }}
      onBlur={(event) => {
        // 焦點在輪播內部移動時不算離開
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}
    >
      {/* 主要輪播區域 */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="aspect-video relative">
          {product.imageUrl && product.imageUrl !== failedImageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setFailedImageUrl(product.imageUrl)}
              className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
            />
          ) : (
            <ImagePlaceholder />
          )}

          {/* 漸變遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div
            className={`absolute inset-0 bg-gradient-to-tr ${accentClasses.overlay} via-transparent to-purple-500/20`}
          ></div>

          {/* 產品信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-md">
              <h3 className="text-3xl font-bold text-white mb-3 text-shadow-lg">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-gray-200 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {showControls && (
            <>
              {/* 大型導航箭頭 - 左 */}
              <button
                type="button"
                aria-label="上一張"
                onClick={goPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20"
              >
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-white ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* 大型導航箭頭 - 右 */}
              <button
                type="button"
                aria-label="下一張"
                onClick={goNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20"
              >
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-white mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 指示器 */}
      {showControls && (
        <div className="flex justify-center space-x-3 mt-8">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`第 ${index + 1} 張`}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 hover:scale-110 ${
                index === activeIndex
                  ? `w-10 h-4 bg-gradient-to-r ${accentClasses.dot} to-purple-500 rounded-full shadow-lg`
                  : "w-4 h-4 bg-gray-500 hover:bg-gray-400 rounded-full"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;
