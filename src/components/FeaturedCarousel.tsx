import { useEffect, useState } from "react";
import type { UseProductsResult } from "../hooks/useProducts";
import ImagePlaceholder from "./ImagePlaceholder";

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
  const { items, status } = result;

  // 只有成功且多於一筆時才自動播放
  useEffect(() => {
    if (status !== "success" || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [status, items.length, intervalMs]);

  if (!(status === "success" && items.length > 0)) {
    return (
      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
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
    <div className="relative group">
      {/* 主要輪播區域 */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="aspect-video relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
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
