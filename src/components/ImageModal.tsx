import { useEffect } from "react";

interface ImageModalProps {
  show: boolean;
  onHide: () => void;
  img: string;
}

const ImageModal = ({ show, onHide, img }: ImageModalProps) => {
  // 防止背景滾動和處理 ESC 鍵
  useEffect(() => {
    if (show) {
      // 防止背景滾動
      document.body.style.overflow = "hidden";

      // ESC 鍵關閉
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onHide();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [show, onHide]);

  if (!show) return null;

  // 處理背景點擊，防止事件冒泡
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  // 處理關閉按鈕點擊
  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHide();
  };

  // 防止圖片點擊冒泡
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      {/* 圖片容器 */}
      <div
        className="relative max-w-full max-h-full"
        onClick={handleImageClick}
      >
        {/* 關閉按鈕 */}
        <button
          onClick={handleCloseClick}
          className="absolute -top-6 -right-6 z-20 w-14 h-14 bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xl group"
          aria-label="關閉圖片"
          type="button"
        >
          <svg
            className="w-7 h-7 transition-transform group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 圖片 */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <img
            src={img}
            alt="產品詳細圖片"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* 圖片邊框效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
